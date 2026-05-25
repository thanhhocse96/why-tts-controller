#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  source "$HOME/.nvm/nvm.sh"
  nvm use default >/dev/null 2>&1 || true
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not available in this WSL environment." >&2
  echo "Install Node.js 24+ after approval, then rerun: npm run dev" >&2
  exit 127
fi

NODE_MAJOR="$(node -p "Number(process.versions.node.split('.')[0])")"
if [ "$NODE_MAJOR" -lt 24 ]; then
  echo "Node.js $(node -v) is available, but Gateway MVP requires Node.js 24+ for node:sqlite." >&2
  echo "Install/use Node.js 24+ with nvm, then rerun: npm run dev" >&2
  exit 127
fi

npm run dev
