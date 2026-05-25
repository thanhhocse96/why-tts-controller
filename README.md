# ZeroClaw Vbee Automate

Local-first Gateway Core for ZeroClaw x Vbee TTS automation.

The project is currently in **M0 - Gateway Core Fake End-to-End**. The goal is to make the local queue, fake worker, asset registry, and HTTP audio serving work before integrating real Vbee browser automation.

## Runtime Direction

```text
Tauri/Vue UI later
  -> Gateway Core API
      -> Queue Service
      -> Fake Vbee Adapter for M0
      -> File Service
      -> SQLite WAL
```

ZeroClaw and Podman are optional clients/runtimes, not the default path for M0.

## Agent Context

This repo uses `../context-mapping` as the agent control layer.

Read [AGENTS.md](AGENTS.md) before changing code.

Useful commands from WSL Debian:

```bash
cd /mnt/d/Github/ZeroClaw-Vbee-Automate
~/.venvs/context-mapping/bin/python ../context-mapping/cli.py check-consistency .
~/.venvs/context-mapping/bin/python ../context-mapping/cli.py build . --quiet
```

The current Gateway source is JavaScript, while `context-mapping` currently parses TypeScript/Rust/PHP/PowerShell. Manual context is still active in `.context/`; auto context will become richer after the Gateway is moved to TypeScript or a JS parser is added.

## Gateway

Node.js 24+ is required because M0 uses `node:sqlite`.

```bash
./scripts/start-gateway-local.sh
```

After the Gateway starts:

```bash
curl http://127.0.0.1:3000/health
curl -X POST http://127.0.0.1:3000/api/queue \
  -H "Content-Type: application/json" \
  -d '{"content":"Xin chao","voice_code":"fake_voice","incognito":1}'
curl http://127.0.0.1:3000/api/queue
curl http://127.0.0.1:3000/api/assets
```

