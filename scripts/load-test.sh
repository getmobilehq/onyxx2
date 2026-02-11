#!/usr/bin/env bash
set -euo pipefail

# Onyx Report — Load Test Runner
#
# Usage:
#   ./scripts/load-test.sh                  # Run smoke test (default)
#   ./scripts/load-test.sh --smoke          # Run smoke test
#   ./scripts/load-test.sh --average        # Run average load test
#   ./scripts/load-test.sh --stress         # Run stress test
#
# Environment:
#   BASE_URL    Target API URL (default: http://localhost:3001)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

BASE_URL="${BASE_URL:-http://localhost:3001}"
RESULTS_DIR="$PROJECT_ROOT/tests/load/results"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

SCENARIO="smoke"

# Parse arguments
for arg in "$@"; do
  case $arg in
    --smoke)   SCENARIO="smoke" ;;
    --average) SCENARIO="average" ;;
    --stress)  SCENARIO="stress" ;;
    *)
      echo "Unknown argument: $arg"
      echo "Usage: $0 [--smoke | --average | --stress]"
      exit 1
      ;;
  esac
done

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# Check k6 is installed
if ! command -v k6 &> /dev/null; then
  error "k6 is not installed."
  echo ""
  echo "Install k6:"
  echo "  macOS:  brew install k6"
  echo "  Linux:  sudo snap install k6"
  echo "  Docker: docker run --rm -i grafana/k6 run - <test.js"
  echo ""
  echo "See: https://k6.io/docs/getting-started/installation/"
  exit 1
fi

# Verify target is reachable
log "Checking target: $BASE_URL..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" 2>/dev/null || echo "000")
if [ "$HTTP_STATUS" != "200" ]; then
  error "Target is not reachable: $BASE_URL/health (got HTTP $HTTP_STATUS)"
  echo "Make sure the API is running and accessible."
  exit 1
fi
log "Target is healthy"

# Create results directory
mkdir -p "$RESULTS_DIR"

RESULT_FILE="$RESULTS_DIR/${SCENARIO}_${TIMESTAMP}.json"
TEST_FILE="$PROJECT_ROOT/tests/load/${SCENARIO}.js"

if [ ! -f "$TEST_FILE" ]; then
  error "Test file not found: $TEST_FILE"
  exit 1
fi

log "Running $SCENARIO test against $BASE_URL..."
log "Results will be saved to: $RESULT_FILE"
echo ""

# Run k6
k6 run \
  --env BASE_URL="$BASE_URL" \
  --summary-export="$RESULT_FILE" \
  "$TEST_FILE"

echo ""
log "Test complete. Results saved to: $RESULT_FILE"
