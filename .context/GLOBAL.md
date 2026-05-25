# ZeroClaw Vbee Automate - Global Context

## Project Role

This project is a local-first Vbee TTS automation app. The first real milestone is not a full product; it is a Gateway Core MVP that proves queue -> worker -> audio asset -> HTTP playback.

## Source Of Truth

- Human architecture memory lives in `docs/`.
- Agent operating memory lives in `.context/`.
- Machine-local setup lives in `.local/ENVIRONMENT.md` and must not be committed.

## Active Architecture

```text
Tauri/Vue UI later
  -> Gateway Core API
      -> Queue Service
      -> Job Runner
      -> Vbee Adapter
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
- Presigned Vbee URLs, when implemented, must be downloaded immediately in the same job execution chain.
- `.tmp` files must never be exposed through `/api/assets`.

## Context-Mapping Workflow

Before editing a module, read the corresponding `.context/modules/*.md` file. If a module context does not exist, create it with manual decisions before making broad changes.

When a new conflict appears, write it to `.context/TENSIONS_OPEN.md`.

