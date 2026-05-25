# Milestones

Current: M0 - Gateway Core Fake End-to-End

## Current: M0 - Gateway Core Fake End-to-End

Goal: turn the project from architecture documents into a runnable local Gateway skeleton.

Acceptance:

- [x] `GET /health` returns Gateway, DB, worker, and degraded status.
- [x] `POST /api/queue` creates a pending job.
- [x] Fake worker processes pending job into an audio asset.
- [x] `GET /api/assets` lists finalized assets only.
- [x] `GET /api/audio/:filename` serves finalized audio.
- [x] Context-mapping protocol is present in `AGENTS.md` and `.context/`.
- [x] Static dev client can add a queue job and play assets through Gateway HTTP.
- [x] Implemented M0 work is documented in `docs/milestones/M0_*.md`.

Out of scope:

- Real Vbee BrowserSessionAdapter.
- Official Vbee API adapter.
- Tauri packaging.
- Podman as default runtime.
- Sound Editor timeline.

## Next: M1 - Tauri Gateway Lifecycle

Goal: Tauri starts/checks/polls Gateway and shows degraded runtime state.

## Next: M2 - Browser CDP and Vbee Preview

Goal: Browser CDP health and first real Vbee preview/incognito flow.
