#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  source "$HOME/.nvm/nvm.sh"
  nvm use 24 >/dev/null
fi

rm -f data/tts.db data/tts.db-shm data/tts.db-wal
rm -f data/audio/*

npm run dev >/tmp/zc-vbee-gateway.log 2>&1 &
pid=$!
trap 'kill "$pid" >/dev/null 2>&1 || true' EXIT

for _ in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3000/health >/tmp/zc-health.json 2>/dev/null; then
    break
  fi
  sleep 0.5
done

echo "HEALTH"
cat /tmp/zc-health.json

echo "QUEUE"
curl -fsS -X POST http://127.0.0.1:3000/api/queue \
  -H "Content-Type: application/json" \
  -d '{"content":"Xin chao","voice_code":"fake_voice","incognito":1}'

sleep 2

echo "ASSETS"
curl -fsS http://127.0.0.1:3000/api/assets | tee /tmp/zc-assets.json

asset_filename="$(python3 - <<'PY'
import json
from pathlib import Path
data = json.loads(Path('/tmp/zc-assets.json').read_text())
assets = data.get('assets') or []
print(assets[0]['filename'] if assets else '')
PY
)"

if [ -n "$asset_filename" ]; then
  echo "AUDIO"
  curl -fsS "http://127.0.0.1:3000/api/audio/$asset_filename" -o /tmp/zc-audio-smoke.wav
  ls -l /tmp/zc-audio-smoke.wav
fi

echo "FILES"
find data -maxdepth 3 -type f -printf "%p %s bytes\n"

echo "LOG"
cat /tmp/zc-vbee-gateway.log
