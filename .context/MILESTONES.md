# Milestones

Current: M1 - Tauri Gateway Lifecycle

## Completed: M0 - Gateway Core Fake End-to-End

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

## Current: M1 - Tauri Gateway Lifecycle

Goal: Tauri starts/checks/polls Gateway and shows degraded runtime state.

Acceptance:

- [x] Lifecycle command can report Gateway status.
- [x] Lifecycle command starts Gateway if it is not running.
- [x] Lifecycle command detects a healthy existing Gateway without spawning a duplicate.
- [x] Lifecycle command refuses to own/stop a Gateway it did not start.
- [x] Port occupied but `/health` unavailable is reported as actionable conflict.
- [x] M1 lifecycle CLI work is documented in `docs/milestones/M1_*.md`.
- [x] M1 lifecycle CLI has a module test report.
- [x] Desktop UI direction documents Queue/Assets/Edit tabs and light/dark mode.
- [x] Product name and provider-extension scope are documented as VoiceFactory.
- [x] Tauri shell calls or ports the lifecycle behavior.

## Next: M2 - Browser CDP and Vbee Preview

Goal: Browser CDP health and first real Vbee preview/incognito flow.
