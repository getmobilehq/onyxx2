# Onyx Report — Admin Runbook

Operations guide for deploying, maintaining, and troubleshooting the Onyx Report platform.

---

## Table of Contents

1. [Infrastructure Overview](#1-infrastructure-overview)
2. [Initial Deployment](#2-initial-deployment)
3. [Environment Configuration](#3-environment-configuration)
4. [Database Operations](#4-database-operations)
5. [User Management](#5-user-management)
6. [Monitoring & Health Checks](#6-monitoring--health-checks)
7. [Backup & Restore](#7-backup--restore)
8. [Scaling](#8-scaling)
9. [Troubleshooting](#9-troubleshooting)
10. [Security Operations](#10-security-operations)
11. [Routine Maintenance](#11-routine-maintenance)

---

## 1. Infrastructure Overview

### Service Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────>│   API       │────>│  PostgreSQL  │
│   (Web)     │     │  (Express)  │     │   15-alpine  │
│   :80       │     │   :3001     │     │   :5432      │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │    Redis    │
                    │  7-alpine   │
                    │   :6379     │
                    └─────────────┘
```

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| **web** | nginx:1.25-alpine | 80 | SPA static files + API reverse proxy |
| **api** | node:20-alpine | 3001 | Express API server |
| **postgres** | postgres:15-alpine | 5432 | Primary database |
| **redis** | redis:7-alpine | 6379 | Rate limiting storage |

### Request Flow

1. Browser hits Nginx on port 80
2. Static assets served directly from `/usr/share/nginx/html`
3. `/api/*` requests proxied to `http://api:3001`
4. API authenticates JWT, checks rate limits (Redis), queries database (Postgres)

---

## 2. Initial Deployment

### Prerequisites

- Docker Engine 24+ and Docker Compose v2
- At least 2GB RAM, 10GB disk
- Domain name with DNS configured (for HTTPS)

### Step-by-Step

```bash
# 1. Clone repository
git clone <repo-url>
cd onyxx

# 2. Create production environment file
cp .env.example .env
```

Edit `.env` with production values (see Section 3).

```bash
# 3. Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# 4. Verify services are healthy
docker compose -f docker-compose.prod.yml ps

# 5. Run database migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# 6. Seed initial data (first deployment only)
docker compose -f docker-compose.prod.yml exec api npx tsx prisma/seed/index.ts

# 7. Verify health endpoints
curl http://localhost/health          # Should return {"status":"healthy"}
curl http://localhost/api/v1/health   # Should return {"success":true,...}
```

### HTTPS with a Reverse Proxy

For production, place an external reverse proxy (Caddy, Traefik, or Nginx) in front that handles TLS termination. Example with Caddy:

```
# Caddyfile
yourdomain.com {
    reverse_proxy localhost:80
}
```

Or modify the web service in `docker-compose.prod.yml` to bind to an internal port and add a Caddy/Traefik service.

---

## 3. Environment Configuration

### Required Variables

```bash
# .env (production)

# Database
DB_USER=onyx
DB_PASSWORD=<strong-random-password>
DB_NAME=onyx_production

# Security — MUST be unique, random, 32+ characters
JWT_SECRET=<generate-with: openssl rand -base64 48>

# URLs
WEB_URL=https://yourdomain.com
VITE_API_URL=/api
```

### Optional Variables

```bash
# Redis (included in docker-compose, only change if external)
REDIS_URL=redis://redis:6379

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@yourdomain.com

# Photo Storage (Supabase)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
SUPABASE_STORAGE_BUCKET=onyx-photos
```

### Generating Secrets

```bash
# JWT Secret (48 random bytes, base64 encoded)
openssl rand -base64 48

# Database Password
openssl rand -base64 32
```

---

## 4. Database Operations

### Running Migrations

```bash
# Apply pending migrations to production
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Check migration status
docker compose -f docker-compose.prod.yml exec api npx prisma migrate status
```

### Connecting to the Database

```bash
# Interactive psql shell
docker compose -f docker-compose.prod.yml exec postgres psql -U onyx -d onyx_production

# One-off query
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U onyx -d onyx_production -c "SELECT count(*) FROM users;"
```

### Prisma Studio (Development Only)

```bash
# Not available in production containers. Run locally against prod DB:
DATABASE_URL="postgresql://onyx:<password>@<host>:5432/onyx_production" npx prisma studio
```

### Schema Overview

Key tables and their relationships:

| Table | Description | Key Indexes |
|-------|-------------|-------------|
| `organizations` | Tenant root | `slug` (unique) |
| `users` | All user accounts | `email` (unique per org), `organization_id`, `is_active` |
| `branches` | Regional groupings | `organization_id` |
| `buildings` | Physical buildings | `organization_id`, `branch_id` |
| `assessments` | Point-in-time evaluations | `building_id`, `status`, `branch_id`, `created_by_id` |
| `assessment_elements` | Building system evaluations | `assessment_id` |
| `deficiencies` | Issues found during assessment | `assessment_element_id`, `severity` |
| `photos` | Photo evidence | `assessment_element_id`, `deficiency_id` |
| `audit_logs` | All mutation records | `organization_id`, `created_at` |

---

## 5. User Management

### Creating the First Admin

The seed script creates demo users. For a fresh production deployment, create an admin via the API:

```bash
# Register first admin (this endpoint is only available when no users exist,
# or use the seed script)
docker compose -f docker-compose.prod.yml exec api npx tsx prisma/seed/index.ts
```

Default seed users:

| Email | Password | Role |
|-------|----------|------|
| admin@acme.com | password123 | org_admin |
| manager@acme.com | password123 | branch_manager |
| assessor@acme.com | password123 | assessor |

**Important:** Change all default passwords immediately after first login.

### User Roles

| Role | Access Level |
|------|-------------|
| `org_admin` | Full organization access: CRUD all entities, manage users, view audit logs |
| `branch_manager` | Branch-scoped: manage buildings, assign/review assessments |
| `assessor` | Assessment-scoped: conduct assessments, log deficiencies, upload photos |
| `executive_viewer` | Read-only: dashboards and reports |

### Inviting Users

Org Admins can invite users from the web UI (Settings > Users > Invite). The invitation flow:

1. Admin fills in email, role, branch assignment
2. System creates inactive user record and generates invite token
3. Email sent with accept-invite link (if SendGrid configured)
4. User clicks link, sets password, account becomes active

### Deactivating Users

From the web UI or directly in the database:

```sql
-- Deactivate a user (soft disable, preserves data)
UPDATE users SET is_active = false WHERE email = 'user@example.com';
```

### Password Reset

Users can request a password reset from the login page. Requires SendGrid to be configured for email delivery. Reset tokens expire after 1 hour.

---

## 6. Monitoring & Health Checks

### Health Endpoints

| Endpoint | Auth Required | Description |
|----------|--------------|-------------|
| `GET /health` | No | Root health check — returns status, uptime, environment |
| `GET /api/v1/health` | No | API router health check |

```bash
# Quick health check
curl -s http://localhost/health | jq .

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2026-02-10T...",
#   "uptime": 86400,
#   "environment": "production"
# }
```

### Docker Health Checks

All services have built-in Docker health checks:

```bash
# View health status of all services
docker compose -f docker-compose.prod.yml ps

# Check individual service health
docker inspect --format='{{.State.Health.Status}}' onyxx-api-1
```

| Service | Health Check | Interval |
|---------|-------------|----------|
| postgres | `pg_isready` | 10s |
| redis | `redis-cli ping` | 10s |
| api | `wget /health` | 30s |
| web | `wget /` | 30s |

### Viewing Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f postgres

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 api
```

### Log Format

The API uses [Pino](https://getpino.io/) structured JSON logging in production:

```json
{"level":30,"time":1707580000000,"msg":"Server started on port 3001"}
{"level":30,"time":1707580001000,"msg":"GET /api/v1/buildings","method":"GET","url":"/api/v1/buildings","statusCode":200,"responseTime":45}
```

Log levels: `10=trace`, `20=debug`, `30=info`, `40=warn`, `50=error`, `60=fatal`

### Audit Logs

All data mutations (POST, PATCH, PUT, DELETE) are automatically logged to the `audit_logs` table. Query via the API (Org Admin only):

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost/api/v1/audit-logs?limit=50"
```

Or directly in the database:

```sql
-- Recent audit entries
SELECT action, entity_type, entity_id, user_id, created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 20;

-- Filter by action
SELECT * FROM audit_logs
WHERE action = 'DELETE' AND created_at > now() - interval '24 hours';
```

---

## 7. Backup & Restore

### Automated Backups

The project includes `scripts/backup.sh` which creates compressed PostgreSQL dumps with automatic retention cleanup.

```bash
# Run a backup manually
./scripts/backup.sh

# Output: backups/onyx_20260210_020000.dump
```

The backup script:
- Creates compressed dumps using `pg_dump -Fc` (custom format)
- Names files with timestamp: `onyx_YYYYMMDD_HHMMSS.dump`
- Verifies dump integrity (non-zero size + `pg_restore --list`)
- Deletes backups older than the retention period
- Exits non-zero on failure (safe for cron)

### Retention Policy

| Variable | Default | Description |
|----------|---------|-------------|
| `BACKUP_RETENTION_DAYS` | `30` | Days to keep backup files |
| `BACKUP_DIR` | `./backups` | Backup destination directory |

### Automated Daily Backups (Cron)

```bash
# crontab -e
0 2 * * * cd /path/to/onyxx && ./scripts/backup.sh >> /var/log/onyx-backup.log 2>&1
```

### Restoring from Backup

Use `scripts/restore.sh` to restore a specific backup or the most recent one:

```bash
# Restore a specific backup
./scripts/restore.sh backups/onyx_20260210_020000.dump

# Restore the most recent backup
./scripts/restore.sh --latest
```

The restore script:
- Prompts for confirmation before proceeding
- Runs `pg_restore --clean` to replace existing data
- Verifies the restore by checking table row counts
- Shows top tables by row count after restore

### Manual Database Operations

```bash
# Manual compressed dump (without the backup script)
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U onyx -Fc onyx_production > backup.dump

# Manual restore
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_restore -U onyx -d onyx_production --clean --if-exists < backup.dump
```

### Redis Data

Redis stores rate limiting counters only — no persistent application data. It recovers automatically on restart. No backup needed.

### Volume Management

```bash
# List Docker volumes
docker volume ls | grep onyxx

# Inspect volume
docker volume inspect onyxx_postgres_data
```

---

## 8. Scaling

### Vertical Scaling

Increase container resources in `docker-compose.prod.yml`:

```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 256M
```

### Horizontal Scaling (API)

The API is stateless — scale by running multiple instances behind a load balancer:

```bash
# Scale API to 3 instances
docker compose -f docker-compose.prod.yml up -d --scale api=3
```

Update the Nginx config to load balance:

```nginx
upstream api_backend {
    server api_1:3001;
    server api_2:3001;
    server api_3:3001;
}

location /api/ {
    proxy_pass http://api_backend;
}
```

### Database Connection Pooling

For high-traffic deployments, add PgBouncer between the API and PostgreSQL:

```yaml
# Add to docker-compose.prod.yml
pgbouncer:
  image: edoburu/pgbouncer
  environment:
    DATABASE_URL: postgresql://onyx:${DB_PASSWORD}@postgres:5432/onyx_production
    POOL_MODE: transaction
    MAX_CLIENT_CONN: 200
    DEFAULT_POOL_SIZE: 20
```

---

## 9. Troubleshooting

### Service Won't Start

```bash
# Check container logs
docker compose -f docker-compose.prod.yml logs api

# Common issues:
# - "ECONNREFUSED postgres:5432" → postgres not ready yet, api retries
# - "JWT_SECRET must be at least 32 characters" → check .env
# - "prisma migrate" errors → run migrations first
```

### Database Connection Failed

```bash
# 1. Verify postgres is running
docker compose -f docker-compose.prod.yml ps postgres

# 2. Test connection
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U onyx

# 3. Check DATABASE_URL format
# Must be: postgresql://USER:PASSWORD@postgres:5432/DBNAME
# Note: hostname is "postgres" (the service name), not "localhost"
```

### Redis Connection Failed

Redis is optional — the API falls back to in-memory rate limiting if Redis is unavailable. Check logs for:

```
Redis connection failed — falling back to in-memory stores
```

If you need Redis:

```bash
docker compose -f docker-compose.prod.yml exec redis redis-cli ping
# Expected: PONG
```

### API Returns 429 (Rate Limited)

```bash
# Check rate limit headers in response
curl -I http://localhost/api/v1/buildings
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 0
# Retry-After: 45

# Clear Redis rate limit keys (emergency only)
docker compose -f docker-compose.prod.yml exec redis redis-cli KEYS "rl:*"
docker compose -f docker-compose.prod.yml exec redis redis-cli FLUSHDB
```

Rate limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth (`/api/v1/auth/*`) | 10 requests | 15 minutes |
| API (all other routes) | 100 requests | 1 minute |
| Upload (photo endpoints) | 20 requests | 1 minute |

### Frontend Shows Blank Page

1. Check browser console for errors
2. Verify the Nginx container is running: `docker compose -f docker-compose.prod.yml ps web`
3. Check if static files exist: `docker compose -f docker-compose.prod.yml exec web ls /usr/share/nginx/html/`
4. Check Nginx logs: `docker compose -f docker-compose.prod.yml logs web`

### Migration Fails

```bash
# Check migration status
docker compose -f docker-compose.prod.yml exec api npx prisma migrate status

# If a migration is stuck, check for locks
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U onyx -d onyx_production -c "SELECT * FROM _prisma_migrations ORDER BY started_at DESC LIMIT 5;"

# Reset a failed migration (use with caution)
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U onyx -d onyx_production -c "DELETE FROM _prisma_migrations WHERE migration_name = '<migration_name>' AND rolled_back_at IS NOT NULL;"
```

### PWA/Service Worker Issues

If users report stale content after a deployment:

1. The app includes an **Update Prompt** — users should see a "New version available" banner
2. If the banner doesn't appear, users can clear the service worker:
   - Chrome: DevTools > Application > Service Workers > Unregister
   - Or navigate to `chrome://serviceworker-internals/`
3. The service worker uses `prompt` registration — updates are not automatic

---

## 10. Security Operations

### Security Headers

The API applies these headers via Helmet:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 0` (modern CSP replaces this)
- `Strict-Transport-Security` (when behind HTTPS proxy)
- Content Security Policy (configured for the web URL)

### JWT Token Lifecycle

The system uses a dual-token strategy:

| Token | Lifetime | Storage | Purpose |
|-------|----------|---------|---------|
| **Access token** | 15 minutes | In-memory (JavaScript variable) | API authentication |
| **Refresh token** | 7 days | httpOnly cookie + hashed in database | Silent access token renewal |

**Refresh flow:**

1. Client makes an API request with an expired access token
2. API returns `401 Unauthorized`
3. Client automatically calls `POST /api/v1/auth/refresh` (browser sends httpOnly cookie)
4. API validates the refresh token hash against the database
5. API revokes the old refresh token and issues a new one (rotation)
6. API returns a new access token
7. Client retries the original request with the new access token

On page reload, the app attempts a silent refresh to restore the session.

### Rotating JWT Secret

If the JWT secret is compromised:

```bash
# 1. Generate new secret
openssl rand -base64 48

# 2. Update .env with new JWT_SECRET

# 3. Restart API (all existing access tokens are immediately invalidated)
docker compose -f docker-compose.prod.yml restart api

# Users' refresh tokens will still work — they'll get new access tokens
# automatically on their next API call.
```

### Force Logout All Users

To invalidate all sessions immediately:

```bash
# 1. Truncate the refresh_tokens table
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U onyx -d onyx_production -c "DELETE FROM refresh_tokens;"

# 2. Rotate the JWT secret (invalidates any in-flight access tokens)
# Update .env with a new JWT_SECRET, then:
docker compose -f docker-compose.prod.yml restart api

# All users will be redirected to the login page on their next request.
```

### Password Security

- Passwords hashed with bcrypt (12 rounds)
- Minimum 8 characters enforced at registration and password change
- Password reset tokens are SHA-256 hashed in the database, expire after 1 hour

### Audit Trail

All data mutations are logged with:
- User ID and organization ID
- Action type (CREATE, UPDATE, DELETE)
- Entity type and entity ID
- IP address and user agent
- Timestamp

Query the audit log to investigate security incidents:

```sql
-- All actions by a specific user in the last 24 hours
SELECT * FROM audit_logs
WHERE user_id = '<user-id>'
  AND created_at > now() - interval '24 hours'
ORDER BY created_at DESC;

-- All DELETE operations
SELECT * FROM audit_logs
WHERE action = 'DELETE'
ORDER BY created_at DESC
LIMIT 50;
```

---

## 11. Routine Maintenance

### Updating the Application

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# 3. Run any new migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# 4. Verify health
curl http://localhost/health
```

### Cleaning Up Docker Resources

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (careful — don't remove postgres_data!)
docker volume prune

# Full cleanup (stops everything first)
docker compose -f docker-compose.prod.yml down
docker system prune -a
```

### Database Maintenance

```bash
# Analyze and vacuum (improves query performance)
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U onyx -d onyx_production -c "VACUUM ANALYZE;"

# Check table sizes
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U onyx -d onyx_production -c "
    SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
    FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
  "

# Check index usage
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U onyx -d onyx_production -c "
    SELECT indexrelname, idx_scan, idx_tup_read
    FROM pg_stat_user_indexes ORDER BY idx_scan DESC;
  "
```

### Log Rotation

Docker manages log rotation. Configure in `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Monitoring Checklist (Daily)

- [ ] All 4 services healthy: `docker compose -f docker-compose.prod.yml ps`
- [ ] Health endpoint responding: `curl http://localhost/health`
- [ ] No error-level log entries: `docker compose -f docker-compose.prod.yml logs --since=24h api | grep '"level":50'`
- [ ] Disk space adequate: `df -h`
- [ ] Database backup completed: check `/backups/` directory

### Monitoring Checklist (Weekly)

- [ ] Review audit logs for unusual activity
- [ ] Run `VACUUM ANALYZE` on database
- [ ] Check Docker image updates: `docker compose -f docker-compose.prod.yml pull`
- [ ] Review rate limiting metrics (Redis keys)
- [ ] Verify backup restore works (test restore to a separate database)
