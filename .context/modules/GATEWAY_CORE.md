# Gateway Core Context

<!-- AUTO_START -->
[auto] Pending context-mapping build.
<!-- AUTO_END -->

<!-- MANUAL_START -->
## [manual] Design Decisions

Gateway Core is the local orchestration process. It owns queue state, job execution, file finalization, asset indexing, and the HTTP API used by UI and ZeroClaw.

M0 deliberately uses a fake Vbee adapter so the app can prove the end-to-end shape without depending on browser login, Vbee protocol stability, or official API credentials.

The first implementation prefers Node built-ins where practical. SQLite is still the intended persistent store because the MVP is local-first and single-user.

## [manual] Invariants & Constraints

Gateway Core must be the only SQLite writer.

JobRunner must not import Playwright, browser adapters, or raw filesystem write logic directly. It must call application services.

Queue state and audio asset state must stay separate. `tts_queue` tracks work; `audio_assets` tracks playable outputs.

File finalization must use `.tmp` first and publish only finalized files.

Fake adapter behavior must stay deterministic enough for tests and fast enough for development.

## [manual] Test Strategy

M0 should be tested through HTTP integration:

- health returns even when browser/Vbee are unavailable
- queue insert creates a pending job
- fake worker finalizes an asset
- assets endpoint hides temporary files
- audio endpoint serves only files inside the configured audio directory

Unit tests should cover delay policy and file path safety once those modules grow.

## [manual] Behavior chưa implement (TODO)

Real Vbee browser session automation is not implemented in M0.

Tauri lifecycle supervision is not implemented in M0.

Official Vbee API integration is not implemented in M0.

Remote Gateway auth is not implemented in M0.
<!-- MANUAL_END -->
