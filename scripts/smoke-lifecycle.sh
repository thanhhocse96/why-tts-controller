#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  source "$HOME/.nvm/nvm.sh"
  nvm use 24 >/dev/null
fi

npm run gateway:stop >/tmp/zc-life-stop-initial.log 2>&1 || true
pkill -f "node --experimental-sqlite server.js" >/dev/null 2>&1 || true

echo "STATUS_OFF"
npm run gateway:status

echo "START_MANAGED"
npm run gateway:start

echo "STOP_MANAGED"
npm run gateway:stop

echo "STATUS_AFTER_STOP"
npm run gateway:status

echo "EXTERNAL_RUNNING"
npm run online >/tmp/zc-life-online.log
npm run gateway:start
npm run gateway:stop
curl -fsS http://127.0.0.1:3000/health >/tmp/zc-life-health-after-refuse.json
cat /tmp/zc-life-health-after-refuse.json
npm run offline >/tmp/zc-life-offline.log
npm run gateway:status

echo "PORT_CONFLICT"
node scripts/test-port-occupier.mjs >/tmp/zc-life-port-occupier.log 2>&1 &
occupier_pid=$!
sleep 1
set +e
npm run gateway:start >/tmp/zc-life-conflict.out 2>&1
conflict_code=$?
set -e
kill "$occupier_pid" >/dev/null 2>&1 || true
cat /tmp/zc-life-conflict.out
if [ "$conflict_code" -ne 3 ]; then
  echo "Expected conflict exit code 3, got $conflict_code" >&2
  exit 1
fi

echo "LIFECYCLE_SMOKE_OK"
