# Onyx Report

> B2B SaaS Platform for Facility Condition Assessment

## Overview

Onyx Report is a facility condition assessment platform for commercial real estate organizations. Property managers, field assessors, and executives can assess, manage, and report on building conditions across distributed portfolios — online or offline.

### Key Features

- **Multi-tenant architecture** — Organization-scoped data isolation with branch-level management
- **Offline-first PWA** — Field assessments without connectivity, with background sync
- **Uniformat II standard** — Industry-compliant building element classification
- **Automated FCI/RUL** — Real-time Facility Condition Index and Remaining Useful Life calculations
- **Role-based workflows** — Org Admin, Branch Manager, Field Assessor, Executive Viewer
- **PDF & Excel export** — Portfolio, assessment, deficiency, and forecast reports
- **Photo management** — Upload, resize, thumbnail generation with gallery viewer
- **Production-ready** — Docker deployment, rate limiting, audit logging, WCAG 2.1 AA accessibility

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5, Vite 5, TailwindCSS 3 |
| State | TanStack Query v5 (server), Zustand 4 (client) |
| Forms | React Hook Form + Zod validation |
| Charts | Recharts |
| Backend | Node.js 20, Express 4, TypeScript 5 |
| Database | PostgreSQL 15, Prisma 5 ORM |
| Cache | Redis 7 (rate limiting) |
| Auth | JWT (jose) + bcrypt |
| PWA | Workbox, Dexie (IndexedDB) |
| Infra | pnpm workspaces, Turborepo, Docker |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd onyxx

# Install dependencies
pnpm install

# Start database services
docker compose up -d

# Setup environment variables
cp .env.example apps/api/.env
# Edit apps/api/.env with your configuration (see Environment Variables below)

# Run database migrations and seed
pnpm db:migrate
pnpm db:seed

# Start development servers
pnpm dev
```

The web app runs at `http://localhost:5173` and the API at `http://localhost:3001`. The Vite dev server proxies `/api` requests to the API automatically.

### Default Seed Users

| Email | Password | Role |
|-------|----------|------|
| admin@acme.com | password123 | Org Admin |
| manager@acme.com | password123 | Branch Manager |
| assessor@acme.com | password123 | Field Assessor |

## Project Structure

```
onyxx/
├── apps/
│   ├── web/                      # React frontend (Vite + PWA)
│   │   ├── src/
│   │   │   ├── components/       # Shared UI components
│   │   │   │   ├── layouts/      # AppLayout, Header, Sidebar
│   │   │   │   └── ui/           # DataTable, FormField, dialogs, etc.
│   │   │   ├── features/         # Feature modules
│   │   │   │   ├── auth/         # Login, accept-invite
│   │   │   │   ├── assessments/  # Assessment list, conduct, detail
│   │   │   │   ├── buildings/    # Building CRUD
│   │   │   │   ├── branches/     # Branch management
│   │   │   │   ├── deficiencies/ # Deficiency tracking
│   │   │   │   ├── reports/      # Portfolio/assessment/forecast reports
│   │   │   │   └── users/        # User management
│   │   │   ├── hooks/            # Custom hooks (useFocusTrap, useOfflineMutation, etc.)
│   │   │   ├── lib/              # API client, exports, query keys, offline DB
│   │   │   ├── pages/            # Dashboard, Settings, Profile
│   │   │   └── stores/           # Zustand stores (auth, network, UI)
│   │   ├── public/               # PWA icons, manifest assets
│   │   ├── Dockerfile            # Production multi-stage (Nginx)
│   │   └── nginx.conf            # SPA routing + API proxy
│   │
│   └── api/                      # Express backend
│       ├── src/
│       │   ├── controllers/      # Route handlers
│       │   ├── services/         # Business logic
│       │   ├── middleware/       # Auth, RBAC, rate limiting, audit
│       │   ├── routes/           # Express route definitions
│       │   ├── config/           # Zod-validated env config
│       │   ├── lib/              # Redis, Prisma client
│       │   └── utils/            # Logger, errors, helpers
│       ├── prisma/
│       │   ├── schema.prisma     # Database schema
│       │   ├── seed/             # Seed scripts
│       │   └── migrations/       # Migration history
│       └── Dockerfile            # Production multi-stage (pnpm deploy)
│
├── packages/
│   └── database/                 # Shared Prisma client
│
├── docs/                         # Documentation
├── docker-compose.yml            # Local dev (Postgres + Redis)
├── docker-compose.prod.yml       # Production stack
├── turbo.json                    # Turborepo pipeline
├── pnpm-workspace.yaml           # Workspace config
└── .dockerignore                 # Docker build exclusions
```

## Available Scripts

### Development

```bash
pnpm dev              # Start all apps (web + api) via Turbo
pnpm dev:web          # Start frontend only (http://localhost:5173)
pnpm dev:api          # Start backend only (http://localhost:3001)
```

### Build & Quality

```bash
pnpm build            # Build all apps
pnpm typecheck        # Type check all apps
pnpm lint             # Lint all apps
```

### Database

```bash
pnpm db:migrate       # Run Prisma migrations
pnpm db:seed          # Seed database with demo data
pnpm db:studio        # Open Prisma Studio GUI
```

### Testing

```bash
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests only
pnpm test:e2e         # Run E2E tests
```

## Environment Variables

### API (`apps/api/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Environment mode |
| `PORT` | No | `3001` | API server port |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret (min 32 chars) |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection (falls back to in-memory) |
| `WEB_URL` | No | `http://localhost:5173` | Frontend URL (for CORS) |
| `API_URL` | No | `http://localhost:3001` | API URL |
| `SENDGRID_API_KEY` | No | — | SendGrid API key for emails |
| `FROM_EMAIL` | No | — | Sender email address |
| `SUPABASE_URL` | No | — | Supabase project URL (photo storage) |
| `SUPABASE_ANON_KEY` | No | — | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | — | Supabase service role key |
| `SUPABASE_STORAGE_BUCKET` | No | `onyx-photos` | Storage bucket name |

### Web (`apps/web/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | `/api` | API base URL |

## Architecture

### Entity Hierarchy

```
Organization (Tenant)
  └── Branches (Regions/Portfolios)
      └── Buildings
          └── Assessments (Point-in-time evaluations)
              └── Assessment Elements (Building systems via Uniformat II)
                  ├── Deficiencies (Issues found)
                  └── Photos (Evidence)
```

### User Roles & Permissions

| Role | Scope | Capabilities |
|------|-------|-------------|
| **Org Admin** | Organization-wide | Full CRUD, user management, settings |
| **Branch Manager** | Assigned branches | Manage buildings, assign assessments, review & approve |
| **Field Assessor** | Assigned assessments | Conduct assessments, log deficiencies, upload photos |
| **Executive Viewer** | Organization-wide | Read-only dashboards and reports |

### API Design

- **Base URL:** `/api/v1`
- **Auth:** Bearer JWT in `Authorization` header
- **Response envelope:** `{ success: boolean, data: T, meta?: { page, pageSize, total } }`
- **Rate limits:** Auth 10/15min, API 100/min, Upload 20/min (Redis-backed with in-memory fallback)

### API Routes

| Prefix | Description |
|--------|-------------|
| `/api/v1/auth` | Login, register, password reset, refresh token |
| `/api/v1/organizations` | Organization CRUD |
| `/api/v1/branches` | Branch CRUD |
| `/api/v1/buildings` | Building CRUD |
| `/api/v1/users` | User management, invitations |
| `/api/v1/assessments` | Assessment CRUD, workflow (submit/approve/reject) |
| `/api/v1/uniformat` | Uniformat II element categories |
| `/api/v1/assessments/:id/deficiencies` | Deficiency CRUD |
| `/api/v1/assessments/:id/photos` | Photo upload/management |
| `/api/v1/reports` | Portfolio, assessment, deficiency, forecast reports |
| `/api/v1/audit-logs` | Audit log queries |
| `/api/v1/sync` | Offline sync queue processing |
| `/health` | Unauthenticated health check |

### Frontend Architecture

- **Code splitting:** All 19 route pages lazy-loaded via `React.lazy` + `Suspense`
- **Vendor chunks:** react, query, forms, charts, export, UI split into separate bundles
- **Export libraries:** jsPDF + xlsx loaded on-demand only when user exports
- **Initial bundle:** ~151KB (down from 1.9MB before optimization)
- **PWA:** Service worker with Workbox, IndexedDB sync queue via Dexie
- **Offline:** StaleWhileRevalidate for API data, CacheFirst for photos

## Key Domain Concepts

### FCI (Facility Condition Index)

```
FCI = (Total Deferred Maintenance / Current Replacement Value) x 100

0-5%    = Good      (green)
5-10%   = Fair      (yellow)
10-30%  = Poor      (orange)
30%+    = Critical  (red)
```

### RUL (Remaining Useful Life)

```
RUL = (Year Installed + Expected Lifetime) - Current Year
```

### Assessment Workflow

```
Draft → In Progress → Submitted → Under Review → Approved / Rejected
```

## Production Deployment

See [Admin Runbook](docs/ADMIN_RUNBOOK.md) for full deployment and operations guide.

### Quick Start (Docker)

```bash
# Create production env file
cp .env.example .env
# Edit .env with production values (strong JWT_SECRET, DB_PASSWORD, etc.)

# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations inside the API container
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Seed initial data (optional)
docker compose -f docker-compose.prod.yml exec api node -e "import('./prisma/seed/index.ts')"
```

The web app serves on port 80, proxying `/api/` requests to the API container.

## Development Phases

- [x] Phase 1 — Foundation (monorepo, Prisma, auth middleware, seeds)
- [x] Phase 2 — Core API (organizations, branches, users, buildings, assessments)
- [x] Phase 3 — Assessment Data & Photos (elements, deficiencies, FCI, photos)
- [x] Phase 4 — Frontend Core (auth UI, layouts, building management)
- [x] Phase 5 — Assessment UI (creation wizard, element forms, field interface)
- [x] Phase 6 — Review & Reports (dashboards, charts, PDF/Excel export)
- [x] Phase 7 — PWA & Offline (service worker, IndexedDB, sync queue)
- [x] Phase 8 — Polish & Launch (code splitting, accessibility, Docker, bundle optimization)

## Documentation

- [Admin Runbook](docs/ADMIN_RUNBOOK.md) — Deployment, operations, and troubleshooting
- [Platform Specification](docs/ONYX-CLAUDE-CODE-PROMPT-COMPLETE.md) — Full technical spec
- [Frontend Plan](docs/FRONTEND_PLAN.md) — Frontend architecture decisions

## License

Proprietary — All rights reserved.

---

**Version:** 1.0.0
**Last Updated:** February 2026
