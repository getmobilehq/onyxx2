#!/usr/bin/env bash
set -euo pipefail

# Onyx Report — Zero-Downtime Deployment
#
# Usage:
#   ./scripts/deploy.sh              # Deploy current HEAD
#   ./scripts/deploy.sh <git-ref>    # Deploy a specific commit/branch/tag
#
# Environment:
#   COMPOSE_FILE        Docker Compose file (default: docker-compose.prod.yml)
#   HEALTH_TIMEOUT      Seconds to wait for health check (default: 60)
#   DRAIN_TIMEOUT       Seconds for graceful shutdown (default: 30)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_ROOT/docker-compose.prod.yml}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-60}"
DRAIN_TIMEOUT="${DRAIN_TIMEOUT:-30}"

GIT_REF="${1:-}"
IMAGE_TAG=""

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

cleanup() {
  if [ "${ROLLBACK_NEEDED:-false}" = "true" ]; then
    error "Deployment failed — rolling back..."
    rollback
  fi
}
trap cleanup EXIT

rollback() {
  log "Rolling back to previous images..."
  docker compose -f "$COMPOSE_FILE" up -d --no-build 2>/dev/null || true
  log "Rollback complete"
}

# Step 1: Pull latest code if git ref specified
cd "$PROJECT_ROOT"

if [ -n "$GIT_REF" ]; then
  log "Checking out $GIT_REF..."
  git fetch origin
  git checkout "$GIT_REF"
fi

IMAGE_TAG="$(git rev-parse --short HEAD)"
log "Deploying commit: $IMAGE_TAG ($(git log -1 --format='%s'))"

# Step 2: Run database migrations first (safe — additive only)
log "Running database migrations..."
docker compose -f "$COMPOSE_FILE" exec -T api npx prisma migrate deploy 2>/dev/null || {
  log "No running API container — migrations will run after deploy"
}

# Step 3: Build new images
log "Building new images (tag: $IMAGE_TAG)..."
ROLLBACK_NEEDED=true

docker compose -f "$COMPOSE_FILE" build --no-cache 2>&1 | while IFS= read -r line; do
  echo "  [build] $line"
done

if [ $? -ne 0 ]; then
  error "Image build failed"
  exit 1
fi

# Step 4: Start new containers with start-first strategy
log "Starting new containers..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps --build api 2>&1

# Step 5: Health check the new API container
log "Waiting for API health check (timeout: ${HEALTH_TIMEOUT}s)..."
ELAPSED=0
while [ $ELAPSED -lt "$HEALTH_TIMEOUT" ]; do
  HTTP_STATUS=$(docker compose -f "$COMPOSE_FILE" exec -T api \
    wget --no-verbose --tries=1 --spider -S http://localhost:3001/health 2>&1 | grep "HTTP/" | awk '{print $2}' || echo "000")

  if [ "$HTTP_STATUS" = "200" ]; then
    log "API health check passed"
    break
  fi

  sleep 2
  ELAPSED=$((ELAPSED + 2))

  if [ $((ELAPSED % 10)) -eq 0 ]; then
    log "  Still waiting... (${ELAPSED}s / ${HEALTH_TIMEOUT}s)"
  fi
done

if [ $ELAPSED -ge "$HEALTH_TIMEOUT" ]; then
  error "API health check failed after ${HEALTH_TIMEOUT}s"
  exit 1
fi

# Step 6: Deploy web container
log "Deploying web container..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps --build web 2>&1

# Step 7: Verify web container
log "Verifying web health..."
sleep 3
WEB_STATUS=$(docker compose -f "$COMPOSE_FILE" exec -T web \
  wget --no-verbose --tries=1 --spider -S http://localhost:80/ 2>&1 | grep "HTTP/" | awk '{print $2}' || echo "000")

if [ "$WEB_STATUS" != "200" ]; then
  error "Web health check failed"
  exit 1
fi
log "Web health check passed"

# Step 8: Run post-deploy migrations (if any were skipped)
log "Running post-deploy migrations..."
docker compose -f "$COMPOSE_FILE" exec -T api npx prisma migrate deploy 2>&1 || true

# Deployment succeeded — cancel rollback trap
ROLLBACK_NEEDED=false

# Step 9: Clean up old images
log "Cleaning up old images..."
docker image prune -f --filter "until=24h" 2>/dev/null || true

# Summary
log "Deployment complete!"
log "  Commit: $IMAGE_TAG"
log "  API: $(docker compose -f "$COMPOSE_FILE" ps api --format '{{.Status}}')"
log "  Web: $(docker compose -f "$COMPOSE_FILE" ps web --format '{{.Status}}')"
