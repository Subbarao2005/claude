#!/bin/bash
set -e

API_URL="${API_BASE_URL:-https://melcho-api.onrender.com}"
APP_URL="${E2E_BASE_URL:-https://melcho.vercel.app}"

PASS=0
FAIL=0
SKIP=0
ERRORS=()
START_TIME=$(date +%s)

log() { echo "[$(date '+%H:%M:%S')] $1"; }
pass() { echo "  ✅ PASSED: $1"; ((PASS++)); }
fail() { echo "  ❌ FAILED: $1"; ((FAIL++)); ERRORS+=("$1"); }
skip() { echo "  ⏭  SKIPPED: $1 (depends on failed test)"; ((SKIP++)); }

log "Checking connectivity..."
if ! curl -sf "$API_URL/health" > /dev/null; then
  echo "FATAL: Backend $API_URL is not reachable. Aborting."
  exit 1
fi
if ! curl -sf "$APP_URL" > /dev/null; then
  echo "FATAL: Frontend $APP_URL is not reachable. Aborting."
  exit 1
fi
log "Both URLs reachable. Starting test run."

log "Stage 1 — Smoke tests (critical)"
if npm run --prefix tests test:smoke; then
  pass "Smoke tests"
else
  fail "Smoke tests"
  echo ""
  echo "CRITICAL: Smoke tests failed. Deployment is broken."
  echo "Skipping all further tests."
  exit 1
fi

log "Stage 2 — Deployment tests"
if npm run --prefix tests test:deploy; then
  pass "Deployment tests"
else
  fail "Deployment tests"
fi

log "Stage 3 — Security tests"
if npm run --prefix tests test:security; then
  pass "Security tests"
else
  fail "Security tests"
fi

log "Stage 4 — E2E: Customer flows"
if npm run --prefix tests test:e2e:customer; then
  pass "E2E customer flows"
else
  fail "E2E customer flows"
fi

log "Stage 4 — E2E: Admin flows"
if npm run --prefix tests test:e2e:admin; then
  pass "E2E admin flows"
else
  fail "E2E admin flows"
fi

log "Stage 4 — E2E: Mobile"
if npm run --prefix tests test:e2e:mobile; then
  pass "E2E mobile"
else
  fail "E2E mobile"
fi

log "Stage 5 — Performance tests (non-blocking)"
if npm run --prefix tests test:performance; then
  pass "Performance tests"
else
  fail "Performance tests (non-blocking)"
fi

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║        MELCHO PHASE 4 TEST REPORT        ║"
echo "╠══════════════════════════════════════════╣"
echo "║  Environment : $APP_URL"
echo "║  Duration    : ${DURATION}s"
echo "║  ✅ Passed   : $PASS"
echo "║  ❌ Failed   : $FAIL"
echo "║  ⏭  Skipped  : $SKIP"
echo "╠══════════════════════════════════════════╣"
if [ ${#ERRORS[@]} -gt 0 ]; then
  echo "║  Failed groups:"
  for err in "${ERRORS[@]}"; do
    echo "║    - $err"
  done
fi
 echo "╚══════════════════════════════════════════╝"

if [ $FAIL -eq 0 ]; then
  echo ""
  echo "🎉 All tests passed. Melcho is production ready!"
  exit 0
else
  echo ""
  echo "⚠️  $FAIL test group(s) failed. Fix before going live."
  if command -v node >/dev/null 2>&1; then
    node tests/notify.js "${ERRORS[*]}"
  fi
  exit 1
fi
