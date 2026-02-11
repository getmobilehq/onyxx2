#!/usr/bin/env bash
set -euo pipefail

# Onyx Report — Rollback to Previous Version
#
# Usage:
#   ./scripts/rollback.sh <git-ref>   # Rollback to a specific commit/tag
#   ./scripts/rollback.sh latest       # Rollback to the previous commit (HEAD~1)
#
# Environment:
#   COMPOSE_FILE     Docker Compose file (default: docker-compose.prod.yml)
#   HEALTH_TIMEOUT   Seconds to wait for health check (default: 60)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_ROOT/docker-compose.prod.yml}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-60}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

if [ $# -lt 1 ]; then
  echo "Usage: $0 <git-ref | latest>"
  echo ""
  echo "Arguments:"
  echo "  <git-ref>  A commit SHA, branch name, or tag to roll back to"
  echo "  latest     Roll back to the previous commit (HEAD~1)"
  echo ""
  echo "Recent commits:"
  cd "$PROJECT_ROOT"
  git log --oneline -10
  exit 1
fi

TARGET="$1"
cd "$PROJECT_ROOT"

# Resolve "latest" to HEAD~1
if [ "$TARGET" = "latest" ]; then
  TARGET="HEAD~1"
fi

CURRENT_SHA=$(git rev-parse --short HEAD)
TARGET_SHA=$(git rev-parse --short "$TARGET" 2>/dev/null || { error "Invalid git ref: $TARGET"; exit 1; })

log "Current version: $CURRENT_SHA ($(git log -1 --format='%s' "$CURRENT_SHA"))"
log "Rolling back to: $TARGET_SHA ($(git log -1 --format='%s' "$TARGET_SHA"))"

# Checkout target version
log "Checking out $TARGET_SHA..."
git checkout "$TARGET_SHA"

# Rebuild and deploy
log "Rebuilding images..."
docker compose -f "$COMPOSE_FILE" build --no-cache 2>&1 | while IFS= read -r line; do
  echo "  [build] $line"
done

log "Deploying rolled-back containers..."
docker compose -f "$COMPOSE_FILE" up -d

# Health check
log "Verifying health (timeout: ${HEALTH_TIMEOUT}s)..."
ELAPSED=0
while [ $ELAPSED -lt "$HEALTH_TIMEOUT" ]; do
  HTTP_STATUS=$(docker compose -f "$COMPOSE_FILE" exec -T api \
    wget --no-verbose --tries=1 --spider -S http://localhost:3001/health 2>&1 | grep "HTTP/" | awk '{print $2}' || echo "000")

  if [ "$HTTP_STATUS" = "200" ]; then
    log "Health check passed"
    break
  fi

  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

if [ $ELAPSED -ge "$HEALTH_TIMEOUT" ]; then
  error "Health check failed after rollback. Manual intervention required."
  error "Current ref: $TARGET_SHA, previous ref: $CURRENT_SHA"
  exit 1
fi

log "Rollback complete!"
log "  Running version: $TARGET_SHA"
log "  API: $(docker compose -f "$COMPOSE_FILE" ps api --format '{{.Status}}')"
log "  Web: $(docker compose -f "$COMPOSE_FILE" ps web --format '{{.Status}}')"
echo ""
log "To return to the latest code, run: git checkout main"
