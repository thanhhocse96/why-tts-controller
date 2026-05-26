<!-- AUTO_START -->
# Global Context

> **[auto-generated — không sửa tay phần này]**

## [auto] Tech Stack

- Tauri v2
- Rust (backend)

## [auto] Module Index

Load file context của module cụ thể khi làm việc với nó:

- [`src-tauri`](.context/src-tauri.md)
- [`src-tauri/src`](.context/src-tauri_src.md)

## [auto] Rust Dependencies (Cargo.toml)

```
serde
serde_json
tauri
```

<!-- AUTO_END -->

# VoiceFactory - Global Context

## Project Role

VoiceFactory is a local-first TTS production app. The first real milestone is not a full product; it is a Gateway Core MVP that proves queue -> worker -> audio asset -> HTTP playback.

The product scope is broader than Vbee. Vbee is the first real provider target, but the architecture must allow paid TTS tools and other providers to be added through provider adapters.

## Source Of Truth

- Human architecture memory lives in `docs/`.
- Agent operating memory lives in `.context/`.
- Machine-local setup lives in `.local/ENVIRONMENT.md` and must not be committed.
- Implemented milestone evidence lives in `docs/milestones/`.
- Design source documents live in `docs/design/`.

## Active Architecture

```text
Tauri/Vue UI later
  -> Gateway Core API
      -> Queue Service
      -> Job Runner
      -> TTS Provider Adapter
      -> File Service
      -> SQLite WAL

ZeroClaw optional client later
Podman optional runtime later
```

## Global Invariants

- Gateway Core is the only SQLite writer.
- UI and ZeroClaw must not read or write SQLite directly.
- Audio playback goes through Gateway HTTP, never through UI local file paths.
- Browser CDP and Vbee session failures must degrade health, not crash Gateway.
- Fake adapter must remain available for development and integration tests.
- TTS providers must be added behind adapter contracts, not hard-coded into job runner or UI.
- Real provider jobs may carry an execution mode, such as Vbee preview download or Vbee official download; JobRunner routes by adapter contract, not provider-specific branches.
- Presigned Vbee URLs, when implemented, must be downloaded immediately in the same job execution chain.
- `.tmp` files must never be exposed through `/api/assets`.

## Context-Mapping Workflow

Before editing a module, read the corresponding `.context/modules/*.md` file. If a module context does not exist, create it with manual decisions before making broad changes.

When a new conflict appears, write it to `.context/TENSIONS_OPEN.md`.

## Documentation Workflow

When a task completes a meaningful implementation slice, the agent must update docs:

```text
1. Read .context/MILESTONES.md to identify the current milestone code.
2. Create or update docs/milestones/<milestone>_<sequence>_<name>.md.
3. Put the workflow diagram first.
4. Explain implemented behavior, files changed, design patterns, verification, and known limits.
5. Update docs/README.md index.
```

Milestone docs are evidence of what works, not aspirational plans.

## Manual Browser Test Protocol

When the human asks to turn the app on for manual testing, agents should provide WSL foreground instructions instead of starting a hidden Windows/background process:

```bash
cd /mnt/d/Github/ZeroClaw-Vbee-Automate
source ~/.nvm/nvm.sh
nvm use 24
HOST=0.0.0.0 npm run dev
```

The human keeps that WSL terminal open and tests:

```text
http://127.0.0.1:3000/
```

If Windows cannot reach `127.0.0.1`, ask the human to run `hostname -I` in WSL and open `http://<WSL_IP>:3000/`.
