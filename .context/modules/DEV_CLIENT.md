# Dev Client Context

<!-- AUTO_START -->
[auto] Pending context-mapping build.
<!-- AUTO_END -->

<!-- MANUAL_START -->
## [manual] Design Decisions

The dev client is a temporary browser-based control surface for validating Gateway Core before Tauri is introduced.

It must use the same public Gateway HTTP API that future UI and ZeroClaw clients use. It is not allowed to read SQLite or local audio paths directly.

The UI is intentionally plain static HTML/CSS/JavaScript served by Gateway. This avoids adding a frontend build system before the Gateway contract stabilizes.

## [manual] Invariants & Constraints

The dev client must not become the product UI.

The dev client must not introduce client-side access to local file paths, SQLite, Vbee credentials, browser CDP, or private environment values.

Audio playback must use `/api/audio/:filename`.

Queue creation must use `POST /api/queue`.

## [manual] Test Strategy

Test through the browser and through `scripts/smoke-gateway.sh`:

- load `/`
- confirm `/health` values are visible
- submit a queue job
- wait for fake worker
- confirm asset appears
- confirm audio element points to `/api/audio/:filename`

## [manual] Behavior chưa implement (TODO)

Chunk splitting is not implemented here.

Voice catalog management is not implemented here.

Sound Editor timeline is not implemented here.

Tauri lifecycle behavior is not implemented here.
<!-- MANUAL_END -->
