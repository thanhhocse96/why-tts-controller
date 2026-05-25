# VoiceFactory Provider Adapter Contract

## Purpose

VoiceFactory is not limited to Vbee. Vbee is the first provider target, while the product architecture must allow additional paid TTS services to be added later.

The core rule:

```text
New TTS provider = new provider adapter, not new job runner logic.
```

## Workflow

```mermaid
flowchart LR
  UI["Queue / Assets / Edit UI"] --> Gateway["Gateway API"]
  Gateway --> Queue["QueueService"]
  Queue --> Runner["JobRunner"]
  Runner --> Registry["Provider Registry"]
  Registry --> Fake["Fake Provider"]
  Registry --> Vbee["Vbee Provider"]
  Registry --> Paid["Future Paid Provider"]
  Fake --> Result["Normalized synthesis result"]
  Vbee --> Result
  Paid --> Result
  Result --> FileService["FileService"]
  FileService --> Assets["audio_assets"]
  Assets --> UI
```

## Adapter Boundary

Provider adapters own external TTS details:

```text
auth
voice mapping
provider-specific request payload
browser session or API call
polling/protocol handling
provider errors
temporary audio URL discovery
```

Provider adapters must not own:

```text
SQLite writes
asset insertion
timeline editing
UI behavior
final file naming
direct audio serving
```

## Proposed Contract

```js
class TtsProviderAdapter {
  async synthesize(job, context) {
    return {
      provider: 'provider-name',
      requestId: 'provider-request-id',
      audioUrl: 'https://...',
      localAudioPath: null,
      metadata: {
        voiceCode: job.voice_code,
        format: 'mp3',
        protocolWarnings: []
      }
    };
  }
}
```

For fake/local providers, `audioUrl` may be omitted if the orchestration uses a local generated fixture. Real paid providers should prefer returning a downloadable URL or stream handle that FileService finalizes.

## Provider Documentation Template

Each new provider must include a docs file:

```text
docs/providers/<provider-name>.md
```

Template:

```markdown
# Provider: <Name>

## Auth Method

## Input Limits

## Voice Selection Model

## Rate Limits / Delay Policy

## Output Format

## Download And Finalization Flow

## Error Mapping

## Test Strategy

## Known Account / ToS Constraints
```

## Initial Providers

```text
fake      -> development and tests
vbee      -> first real provider target
future-*  -> paid providers added by adapter contract
```

## Non-Negotiable Rules

- JobRunner must call provider contracts, not provider-specific browser/API code.
- UI must not contain provider credentials or protocol logic.
- Provider adapters must not write SQLite.
- Audio playback must still go through Gateway `/api/audio/:filename`.
- Temporary URLs must be downloaded immediately in the same job execution chain.

