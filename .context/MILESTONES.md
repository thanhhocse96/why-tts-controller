# Milestones

Current: M0 - Gateway Core Fake End-to-End

## Current: M0 - Gateway Core Fake End-to-End

Goal: turn the project from architecture documents into a runnable local Gateway skeleton.

Acceptance:

- [ ] `GET /health` returns Gateway, DB, worker, and degraded status.
- [ ] `POST /api/queue` creates a pending job.
- [ ] Fake worker processes pending job into an audio asset.
- [ ] `GET /api/assets` lists finalized assets only.
- [ ] `GET /api/audio/:filename` serves finalized audio.
- [ ] Context-mapping protocol is present in `AGENTS.md` and `.context/`.

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
