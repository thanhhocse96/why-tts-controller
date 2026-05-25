#!/usr/bin/env bash
set -euo pipefail

if pgrep -f "node --experimental-sqlite server.js" >/dev/null; then
  pkill -f "node --experimental-sqlite server.js"
  echo "Gateway stopped."
else
  echo "Gateway is not running."
fi
