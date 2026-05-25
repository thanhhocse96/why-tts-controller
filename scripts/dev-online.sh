#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  source "$HOME/.nvm/nvm.sh"
  nvm use 24 >/dev/null
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not available in this WSL environment." >&2
  exit 127
fi

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$NODE_MAJOR" -lt 24 ]; then
  echo "Node.js $(node -v) is available, but Gateway requires Node.js 24+." >&2
  exit 127
fi

if pgrep -f "node --experimental-sqlite server.js" >/dev/null; then
  echo "Gateway already running."
else
  nohup npm run dev >/tmp/zc-vbee-gateway-live.log 2>&1 &
  echo "$!" >/tmp/zc-vbee-gateway-live.pid
  echo "Gateway starting..."
fi

for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3000/health >/tmp/zc-vbee-gateway-live-health.json 2>/dev/null; then
    echo "Gateway online: http://127.0.0.1:3000/"
    cat /tmp/zc-vbee-gateway-live-health.json
    echo
    exit 0
  fi
  sleep 0.5
done

echo "Gateway did not become ready. Log follows:" >&2
cat /tmp/zc-vbee-gateway-live.log >&2
exit 1
