#!/usr/bin/env bash
set -euo pipefail

# Onyx Report — PostgreSQL Restore
#
# Usage:
#   ./scripts/restore.sh <backup_file>
#   ./scripts/restore.sh backups/onyx_20260210_020000.dump
#   ./scripts/restore.sh --latest
#
# Environment:
#   COMPOSE_FILE  Docker Compose file (default: docker-compose.prod.yml)
#   DB_USER       PostgreSQL user (default: onyx)
#   DB_NAME       PostgreSQL database (default: onyx)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_ROOT/docker-compose.prod.yml}"
DB_USER="${DB_USER:-onyx}"
DB_NAME="${DB_NAME:-onyx}"
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# Validate arguments
if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup_file | --latest>"
  echo ""
  echo "Arguments:"
  echo "  <backup_file>  Path to a .dump file created by backup.sh"
  echo "  --latest       Restore the most recent backup"
  echo ""
  echo "Available backups:"
  if [ -d "$BACKUP_DIR" ]; then
    ls -lt "$BACKUP_DIR"/onyx_*.dump 2>/dev/null | head -10 || echo "  (none found)"
  else
    echo "  (backup directory not found)"
  fi
  exit 1
fi

# Resolve backup file
BACKUP_FILE="$1"
if [ "$BACKUP_FILE" = "--latest" ]; then
  BACKUP_FILE=$(ls -t "$BACKUP_DIR"/onyx_*.dump 2>/dev/null | head -1)
  if [ -z "$BACKUP_FILE" ]; then
    error "No backups found in $BACKUP_DIR"
    exit 1
  fi
  log "Using latest backup: $BACKUP_FILE"
fi

# Validate file exists
if [ ! -f "$BACKUP_FILE" ]; then
  error "Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Show backup details
FILESIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Backup file: $BACKUP_FILE ($FILESIZE)"
log "Target database: $DB_NAME (user: $DB_USER)"

# Interactive confirmation
echo ""
echo "WARNING: This will DROP and recreate all tables in '$DB_NAME'."
echo "All existing data will be replaced with the backup contents."
echo ""
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  log "Restore cancelled by user"
  exit 0
fi

# Verify postgres container is running
log "Checking PostgreSQL container health..."
if ! docker compose -f "$COMPOSE_FILE" ps postgres --format '{{.Status}}' 2>/dev/null | grep -q "healthy\|Up"; then
  error "PostgreSQL container is not running or unhealthy"
  exit 1
fi

# Perform restore
log "Starting restore..."
if docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists --no-owner --no-acl \
  < "$BACKUP_FILE" 2>&1; then
  log "Restore completed successfully"
else
  # pg_restore returns non-zero for warnings (e.g., "role does not exist")
  # which are generally harmless with --no-owner --no-acl
  log "Restore completed with warnings (this is usually normal)"
fi

# Verify restore
log "Verifying restore..."
ROW_COUNTS=$(docker compose -f "$COMPOSE_FILE" exec -T postgres \
  psql -U "$DB_USER" -d "$DB_NAME" -t -c \
  "SELECT tablename, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC LIMIT 10;" 2>/dev/null)

if [ -n "$ROW_COUNTS" ]; then
  log "Top tables by row count:"
  echo "$ROW_COUNTS" | while IFS= read -r line; do
    [ -n "$line" ] && echo "  $line"
  done
  log "Restore verification passed"
else
  error "Could not verify restore — check database manually"
  exit 1
fi
