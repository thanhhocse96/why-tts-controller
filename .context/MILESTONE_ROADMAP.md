# VoiceFactory Milestone Roadmap

This file is the detailed milestone backlog. `.context/MILESTONES.md` remains the active milestone pointer and should only load the current milestone in full.

When starting a new milestone, promote exactly one milestone from this roadmap into `.context/MILESTONES.md` as `Current`, then update `AGENTS.md` if the current milestone name changes.

## How To Use This File

1. Read `.context/MILESTONES.md` first.
2. If the current milestone is already defined there, use that as the active checklist.
3. Use this roadmap only to understand upcoming work or promote the next milestone.
4. Before promotion, re-read the listed source docs and module contexts.
5. If source docs conflict, stop and ask the human which source wins.
6. If acceptance cannot be made concrete, ask the human before coding.

## Source Priority

Use this order when extracting milestone truth:

```text
1. Human's latest explicit instruction
2. .context/MILESTONES.md current milestone
3. .context/MILESTONE_ROADMAP.md promoted milestone
4. .context/modules/*.md manual sections
5. docs/design/*.md architecture decisions
6. docs/milestones/*.md implemented evidence
7. code reality
```

Docs can explain intent, but implemented behavior and tests prove what already works.

## Completed Milestones

### M0 - Gateway Core Fake End-to-End

Status: completed.

Goal: create a runnable local Gateway skeleton proving queue -> worker -> fake audio asset -> HTTP playback.

Source docs:

```text
.context/MILESTONES.md
docs/milestones/M0_001_gateway-core-fake-end-to-end.md
docs/milestones/M0_002_dev-client-gateway-validation.md
docs/milestones/M0_003_dev-runtime-scripts.md
```

Acceptance:

- [x] `GET /health` reports Gateway, DB, worker, and degraded status.
- [x] `POST /api/queue` creates a pending job.
- [x] Fake worker processes pending job into an audio asset.
- [x] `GET /api/assets` lists finalized assets.
- [x] `GET /api/audio/:filename` serves finalized audio.
- [x] Static dev client can queue and play fake assets through Gateway HTTP.

### M1 - Tauri Gateway Lifecycle

Status: implementation acceptance complete; manual desktop window run remains useful.

Goal: Tauri starts/checks/polls Gateway and shows degraded runtime state.

Source docs:

```text
.context/MILESTONES.md
.context/modules/GATEWAY_LIFECYCLE.md
.context/modules/TAURI_SHELL.md
docs/design/04_migration-plan-to-gateway-core.md
docs/milestones/M1_001_gateway-lifecycle-cli.md
docs/milestones/M1_005_tauri-gateway-lifecycle-shell.md
docs/milestones/M1_006_tauri-gateway-lifecycle-test-report.md
```

Acceptance:

- [x] Lifecycle command reports Gateway status.
- [x] Lifecycle command starts Gateway when absent.
- [x] Healthy existing Gateway is reused without duplicate spawn.
- [x] Lifecycle refuses to stop a Gateway it did not start.
- [x] Occupied non-Gateway port is reported as conflict.
- [x] Tauri shell calls lifecycle behavior.
- [x] Tauri unit tests cover runtime ownership mapping.
- [x] M1 docs and test report exist.

## Backlog Milestones

### M2 - Browser CDP Health And Vbee Preview Harness

Goal: add a BrowserService boundary, CDP health reporting, and a Vbee preview protocol harness without making real Vbee mandatory for dev/test.

Primary sources:

```text
docs/design/04_migration-plan-to-gateway-core.md#phase-4b
docs/design/04_migration-plan-to-gateway-core.md#phase-4c
docs/design/07_vbee-dual-execution-workflows.md
.context/modules/TTS_PROVIDER_ADAPTERS.md
```

Acceptance:

- [ ] `BrowserService` exists behind an adapter contract.
- [ ] `PlaywrightCdpAdapter` or equivalent CDP adapter can healthcheck configured CDP URL.
- [ ] `/health` reports Browser CDP available/unavailable without crashing Gateway.
- [ ] JobRunner does not import browser automation directly.
- [ ] Vbee preview protocol recorder/harness exists for debug/test mode.
- [ ] Recorder can represent expected preview sequence, including `GET_REMAINING_PREVIEW`.
- [ ] Fake provider remains the default test path.
- [ ] M2 milestone doc and test report are created.

Out of scope:

- Full official Vbee download flow.
- Provider account credential storage.
- Replacing fake adapter.
- Sound editor timeline.

Ask human before coding if:

- The expected browser target is unclear.
- The recorder must touch a live authenticated Vbee session.
- CDP adapter requires installing browsers or Playwright packages.

### M3 - Provider Registry And Execution Mode Routing

Goal: persist provider/execution mode choices and route jobs through provider contracts instead of JobRunner branches.

Primary sources:

```text
docs/design/06_voicefactory-provider-adapter-contract.md
docs/design/07_vbee-dual-execution-workflows.md
.context/modules/TTS_PROVIDER_ADAPTERS.md
```

Acceptance:

- [ ] Queue payload accepts normalized `provider` and `executionMode`.
- [ ] DB schema or job metadata persists provider and execution mode.
- [ ] `ProviderRegistry` maps provider/mode to an adapter or handler.
- [ ] JobRunner calls provider contract only.
- [ ] Fake provider remains available through the same registry.
- [ ] UI/dev client can submit at least fake mode and planned Vbee modes without provider secrets.
- [ ] Tests cover unknown provider/mode error mapping.
- [ ] M3 milestone doc and test report are created.

Out of scope:

- Live Vbee protocol completion.
- Multiple provider account management.
- Paid provider onboarding beyond contract shape.

Ask human before coding if:

- Queue schema change requires migration of existing DB data.
- Provider/mode naming conflicts with human workflow terms.

### M4 - Vbee Dual Workflow MVP

Goal: implement Vbee adapter handlers for `vbee_preview_download` and `vbee_official_download` behind one normalized provider contract.

Primary sources:

```text
docs/design/07_vbee-dual-execution-workflows.md
docs/design/06_voicefactory-provider-adapter-contract.md
docs/design/04_migration-plan-to-gateway-core.md#phase-6
```

Acceptance:

- [ ] `VbeeAdapter` contains preview and official execution handlers.
- [ ] Both handlers return normalized synthesis result shape.
- [ ] Temporary/presigned URLs are downloaded immediately in the same job chain.
- [ ] Vbee-specific auth/session/protocol logic stays inside adapter code.
- [ ] JobRunner remains provider-agnostic.
- [ ] Fake/recorded Vbee tests cover handler routing and failure mapping.
- [ ] M4 milestone doc and test report are created.

Out of scope:

- Broad paid-provider marketplace.
- Full UI workflow polish.
- Packaging.

Ask human before coding if:

- Live Vbee credentials/session are required.
- Vbee ToS/account constraints affect automation behavior.
- Exact DOM selectors or network extraction method are unknown.

### M5 - Human Pace Scheduler And Delay Policy

Goal: replace fixed worker delay with configurable human-like pacing shared across provider account/session lanes.

Primary sources:

```text
docs/design/04_migration-plan-to-gateway-core.md#phase-5
docs/design/07_vbee-dual-execution-workflows.md#human-pace-scheduler
```

Acceptance:

- [ ] Delay policy service exists outside JobRunner core logic.
- [ ] Policies include `none`, `fixed`, and human/word-count based pacing.
- [ ] Vbee preview and official modes can use different min/max/action defaults.
- [ ] Account/session throttle prevents unsafe overlapping browser actions.
- [ ] Job status exposes delay state such as `typing_delay`.
- [ ] Tests cover deterministic delay calculation with seeded or fixed inputs.
- [ ] M5 milestone doc and test report are created.

Out of scope:

- ML/adaptive pacing.
- Multi-account scheduler unless explicitly approved.

Ask human before coding if:

- Human pace ranges should differ from the design doc.
- Concurrency rules for one Vbee account are unclear.

### M6 - File Service Hardening

Goal: make every audio output pass through one safe FileService pipeline.

Primary sources:

```text
docs/design/04_migration-plan-to-gateway-core.md#phase-7
.context/GLOBAL.md
```

Acceptance:

- [ ] FileService downloads to `.tmp` first.
- [ ] `.tmp` files are never exposed through `/api/assets`.
- [ ] Finalization uses atomic rename where possible.
- [ ] Windows `EPERM`/`EBUSY` rename errors retry with backoff.
- [ ] Asset insert and job update happen in a SQLite transaction.
- [ ] Duplicate asset creation on retry is prevented.
- [ ] Tests cover failed download, failed rename, retry, and finalized asset listing.
- [ ] M6 milestone doc and test report are created.

Out of scope:

- Large legacy DB migration.
- Audio waveform/timeline editing.

Ask human before coding if:

- Old files must be migrated or only new files are affected.
- Disk cleanup policy could delete human-created files.

### M7 - Database Migration Backup And Audit

Goal: formalize backup, dry-run, and disk-vs-DB audit before any real DB migration.

Primary sources:

```text
docs/design/04_migration-plan-to-gateway-core.md#phase-3
.context/GLOBAL.md
```

Acceptance:

- [ ] Migration command has dry-run mode.
- [ ] Backup includes DB, WAL, and SHM files when present.
- [ ] Audit reports complete rows, suspicious rows, suspicious disk files, and old `.tmp` files.
- [ ] Migration can populate `audio_assets` from compatible legacy rows.
- [ ] Gateway is stopped or locked before real migration.
- [ ] Test report includes dry-run evidence and rollback notes.
- [ ] M7 milestone doc and test report are created.

Out of scope:

- Destructive schema cleanup.
- Removing legacy columns.

Ask human before coding if:

- Suspicious rows are found.
- Real user data migration is required.
- A high-risk data operation would run outside a copy.

### M8 - Desktop Product UI Migration

Goal: move from static dev client toward a real desktop UI while keeping Gateway API as the only data boundary.

Primary sources:

```text
.context/modules/DEV_CLIENT.md
docs/milestones/M1_003_desktop-ui-tabs-and-theme-direction.md
docs/design/04_migration-plan-to-gateway-core.md#phase-8
```

Acceptance:

- [ ] UI starts from Tauri shell runtime state.
- [ ] Queue UI uses Gateway API only.
- [ ] Assets UI uses `/api/assets` and `/api/audio/:filename`.
- [ ] Edit tab has a first real timeline data model or explicitly documented placeholder boundary.
- [ ] UI displays degraded runtime state clearly.
- [ ] No UI code reads SQLite, local audio paths, provider credentials, or browser details.
- [ ] M8 milestone doc and test report are created.

Out of scope:

- Full DAW-quality editor.
- Provider credential management.

Ask human before coding if:

- The UI framework choice is not approved.
- Edit timeline scope expands beyond current placeholder direction.

### M9 - ZeroClaw Optional Client

Goal: keep ZeroClaw as an optional automation client that talks to Gateway API only.

Primary sources:

```text
docs/design/04_migration-plan-to-gateway-core.md#phase-9
.context/GLOBAL.md
```

Acceptance:

- [ ] ZeroClaw can submit jobs through Gateway API.
- [ ] VoiceFactory works end-to-end without ZeroClaw running.
- [ ] ZeroClaw does not read/write SQLite.
- [ ] ZeroClaw does not control browser automation directly.
- [ ] Docs explain ZeroClaw as optional client.
- [ ] M9 milestone doc and test report are created.

Out of scope:

- Making ZeroClaw required for normal desktop use.

Ask human before coding if:

- ZeroClaw skill/plugin shape is not present in repo.
- The client contract changes queue payload semantics.

### M10 - Packaging And Runtime Hardening

Goal: make local sidecar/runtime behavior reliable enough for packaged desktop use, while keeping Podman optional.

Primary sources:

```text
docs/design/04_migration-plan-to-gateway-core.md#phase-10
.context/modules/GATEWAY_LIFECYCLE.md
.context/modules/TAURI_SHELL.md
```

Acceptance:

- [ ] Runtime default is local sidecar or approved bundled runtime, not Podman.
- [ ] Packaged desktop path is documented.
- [ ] Gateway restart-on-crash policy is implemented or explicitly deferred.
- [ ] Port conflict remains actionable.
- [ ] Shell still refuses to stop Gateway it does not own.
- [ ] Podman remains optional advanced runtime only.
- [ ] M10 milestone doc and test report are created.

Out of scope:

- Cloud deployment.
- Requiring Podman for MVP.

Ask human before coding if:

- Bundling Node or compiling Gateway into a binary is required.
- Packaging target OS changes.

## MVP Cut Line

The new MVP is complete when:

```text
Tauri UI opens
Gateway local runtime starts or reuses correctly
Browser CDP health degrades safely
Queue creates jobs
At least one provider path processes a job
FileService finalizes an audio asset
audio_assets has a row
UI plays audio through Gateway HTTP
ZeroClaw is optional
Podman is optional
```

## Promotion Checklist

Before moving to the next milestone:

- [ ] Current acceptance is fully checked or explicitly deferred by the human.
- [ ] Current milestone has docs under `docs/milestones/`.
- [ ] Current milestone has a test report.
- [ ] Context consistency check passes.
- [ ] `.context/MILESTONES.md` is updated with the new current milestone.
- [ ] `AGENTS.md` current milestone line is updated.
- [ ] Any new module context is created before broad code edits.
