# TTS Provider Adapters Context

<!-- AUTO_START -->
[auto] Manual context only. Provider adapter contract is being designed before multiple real providers exist.
<!-- AUTO_END -->

<!-- MANUAL_START -->
## [manual] Design Decisions

VoiceFactory must support multiple TTS providers over time. Vbee is only the first target provider, not the product boundary.

Every paid or external TTS tool must be integrated through a provider adapter. The job runner should depend on a provider contract, not on provider-specific browser/API details.

Providers may be implemented through different mechanisms:

```text
official API
browser session
local CLI/tool
manual-authenticated desktop/browser flow
```

All providers must return a normalized result that the File Service can finalize into `audio_assets`.

## [manual] Invariants & Constraints

Provider-specific credentials, browser session logic, API endpoints, and protocol details must not leak into UI, QueueService, or JobRunner.

Provider adapters must not write SQLite directly.

Provider adapters must not finalize files directly. They return enough information for FileService or orchestration to download/finalize.

If a provider returns a presigned/temporary URL, download must happen immediately in the same job execution chain.

Fake provider must remain available for development, tests, and UI work.

Each new paid provider must document:

```text
auth method
input limits
voice selection model
rate limits or human-delay policy
output format
download/finalization flow
known ToS/account constraints
test mode or mock strategy
```

## [manual] Test Strategy

Each provider adapter needs:

```text
contract test with fake job input
failure mapping test
download/finalization integration test with FileService
manual live test report for paid provider behavior
```

Live tests must not be the only test path. A fake or recorded provider response should exist where practical.

## [manual] Behavior chưa implement (TODO)

Provider registry is not implemented yet.

Provider selection in queue payload is not implemented yet.

Official Vbee adapter is not implemented yet.

BrowserSession Vbee adapter is not implemented yet.

No paid provider beyond Vbee has been implemented yet.
<!-- MANUAL_END -->
