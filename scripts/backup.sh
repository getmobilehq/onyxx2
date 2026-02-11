#!/usr/bin/env bash
set -euo pipefail

# Onyx Report — PostgreSQL Backup with Retention
#
# Usage:
#   ./scripts/backup.sh
#
# Environment:
#   BACKUP_DIR             Backup destination (default: ./backups)
#   BACKUP_RETENTION_DAYS  Days to keep backups (default: 30)
#   COMPOSE_FILE           Docker Compose file (default: docker-compose.prod.yml)
#   DB_USER                PostgreSQL user (default: onyx)
#   DB_NAME                PostgreSQL database (default: onyx)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_ROOT/docker-compose.prod.yml}"
DB_USER="${DB_USER:-onyx}"
DB_NAME="${DB_NAME:-onyx}"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="onyx_${TIMESTAMP}.dump"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Step 1: Verify postgres container is running
log "Checking PostgreSQL container health..."
if ! docker compose -f "$COMPOSE_FILE" ps postgres --format '{{.Status}}' 2>/dev/null | grep -q "healthy\|Up"; then
  error "PostgreSQL container is not running or unhealthy"
  exit 1
fi

# Step 2: Create compressed dump
log "Starting backup: $BACKUP_FILE"
if ! docker compose -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U "$DB_USER" -Fc "$DB_NAME" > "$BACKUP_PATH" 2>/dev/null; then
  error "pg_dump failed"
  rm -f "$BACKUP_PATH"
  exit 1
fi

# Step 3: Verify dump is non-zero size
FILESIZE=$(stat -f%z "$BACKUP_PATH" 2>/dev/null || stat --printf="%s" "$BACKUP_PATH" 2>/dev/null)
if [ "$FILESIZE" -eq 0 ]; then
  error "Backup file is empty"
  rm -f "$BACKUP_PATH"
  exit 1
fi

# Step 4: Verify dump is valid using pg_restore --list
log "Verifying backup integrity..."
if ! pg_restore --list "$BACKUP_PATH" > /dev/null 2>&1; then
  # Try inside the container if pg_restore isn't available locally
  if ! docker compose -f "$COMPOSE_FILE" exec -T postgres \
    pg_restore --list /dev/stdin < "$BACKUP_PATH" > /dev/null 2>&1; then
    error "Backup verification failed — dump appears corrupt"
    rm -f "$BACKUP_PATH"
    exit 1
  fi
fi

log "Backup created successfully: $BACKUP_PATH ($(du -h "$BACKUP_PATH" | cut -f1))"

# Step 5: Delete backups older than retention period
log "Cleaning up backups older than $BACKUP_RETENTION_DAYS days..."
DELETED_COUNT=0
while IFS= read -r old_backup; do
  rm -f "$old_backup"
  log "  Deleted: $(basename "$old_backup")"
  DELETED_COUNT=$((DELETED_COUNT + 1))
done < <(find "$BACKUP_DIR" -name "onyx_*.dump" -type f -mtime +"$BACKUP_RETENTION_DAYS" 2>/dev/null)

if [ "$DELETED_COUNT" -gt 0 ]; then
  log "Removed $DELETED_COUNT old backup(s)"
else
  log "No old backups to remove"
fi

# Summary
TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "onyx_*.dump" -type f | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
log "Backup complete. $TOTAL_BACKUPS backup(s) in $BACKUP_DIR ($TOTAL_SIZE total)"
