# ZEROCLAW x VBEE TTS - MVP Architecture

Phiên bản: 2026-05-25  
Mục tiêu: vẽ rõ kiến trúc phần mềm để phát triển nhanh MVP có thể chạy end-to-end.

## 1. MVP cần đạt

MVP không cần đầy đủ Sound Editor nâng cao ngay. MVP cần chứng minh được 5 việc:

1. Mở browser thật với profile riêng và CDP port `9222`.
2. Client View thêm text vào queue.
3. Gateway worker lấy job, delay theo số từ/phút, gọi Vbee qua browser/API.
4. Tải audio về `.tmp`, rename thành `.mp3`, cập nhật SQLite.
5. UI nhìn thấy job hoàn tất và phát được file audio.

## 2. Kiến trúc tổng thể

```mermaid
flowchart LR
  User["User"] --> UI["Tauri Client View\nVue UI"]
  UI -->|HTTP localhost:3000| Gateway["Gateway API\nNode.js + Express"]
  UI -->|Optional invoke| TauriRust["Tauri Rust Backend"]
  TauriRust -->|Start/healthcheck| Browser["Brave/Chromium Headed\nCDP :9222"]
  TauriRust -->|Start/healthcheck| Gateway

  ZeroClaw["ZeroClaw\nSkill-only Task Runner"] -->|HTTP POST /api/queue| Gateway

  Gateway --> DB[("SQLite WAL\ntts.db")]
  Gateway --> Worker["TTS Worker\nPlaywright Adapter"]
  Worker -->|connectOverCDP| Browser
  Browser -->|client context| Vbee["Vbee Studio / Vbee API"]
  Vbee -->|audio_link / request_id| Worker
  Worker --> Files["Audio Files\n.tmp -> .mp3"]
  Files --> UI
  DB --> UI
```

Quyết định quan trọng:

- UI và ZeroClaw đều chỉ gọi Gateway.
- Browser automation không nằm trong ZeroClaw.
- Worker được thiết kế dạng adapter để thay Brave CDP bằng Chromium CDP, Camoufox hoặc Patchright sau này.

## 3. Boundary của từng module

```mermaid
flowchart TB
  subgraph Client["Client Layer"]
    UI["Vue UI"]
    TextPrep["Text Pre-processor"]
    QueuePanel["Queue Panel"]
    AudioPreview["Audio Preview"]
  end

  subgraph Desktop["Desktop Shell"]
    Tauri["Tauri Rust"]
    StartBrowser["start_browser()"]
    StartGateway["start_gateway()"]
    Healthcheck["healthcheck()"]
  end

  subgraph Orchestration["Orchestration"]
    ZeroClaw["ZeroClaw Skills"]
  end

  subgraph GatewayLayer["Gateway Layer"]
    Api["Express API"]
    Queue["Queue Service"]
    DbService["DB Service"]
    WorkerLoop["Worker Loop"]
    BrowserAdapter["Browser Adapter"]
    FileService["File Service"]
  end

  subgraph Runtime["Runtime Dependencies"]
    Browser["Brave/Chromium"]
    DB[("SQLite")]
    AudioDir["data/audio"]
    Vbee["Vbee"]
  end

  UI --> TextPrep --> Api
  QueuePanel --> Api
  AudioPreview --> AudioDir
  Tauri --> StartBrowser --> Browser
  Tauri --> StartGateway --> Api
  ZeroClaw --> Api
  Api --> Queue --> DbService --> DB
  WorkerLoop --> DbService
  WorkerLoop --> BrowserAdapter --> Browser --> Vbee
  WorkerLoop --> FileService --> AudioDir
```

## 4. MVP package layout

```text
zeroclaw-vbee-tts/
  desktop/
    src/
      App.vue
      components/
        TextInputPanel.vue
        QueuePanel.vue
        AudioPreview.vue
    src-tauri/
      src/main.rs
      tauri.conf.json

  gateway/
    package.json
    server.js
    src/
      db.js
      schema.sql
      queue.js
      worker-loop.js
      browser/
        index.js
        playwright-cdp.js
        camoufox.js              # later
        patchright.js            # later
      services/
        file-service.js
        delay.js
        vbee-client.js

  zeroclaw/
    config.toml
    workspace/
      skills/
        vbee-hear-test/SKILL.toml
        vbee-change-sound/SKILL.toml

  data/
    brave-profile/
    audio/
    tts.db

  scripts/
    start-brave.bat
    start-gateway.bat
```

MVP tối giản có thể bỏ `desktop/` trong ngày đầu, test bằng curl/Gateway trước. Sau khi worker chạy được mới gắn UI.

## 5. Luồng khởi động

```mermaid
sequenceDiagram
  autonumber
  participant User
  participant Tauri as Tauri App
  participant Browser as Brave/Chromium
  participant Gateway as Gateway API
  participant DB as SQLite

  User->>Tauri: Open app
  Tauri->>Browser: Check CDP :9222
  alt Browser not running
    Tauri->>Browser: Start with --remote-debugging-port=9222
  end
  Tauri->>Gateway: Check localhost:3000/health
  alt Gateway not running
    Tauri->>Gateway: Start gateway process/container
  end
  Gateway->>DB: Open tts.db + PRAGMA WAL
  Gateway->>Gateway: Start worker loops
  Tauri->>User: Show ready state
```

MVP command healthcheck:

```text
GET http://localhost:3000/health
GET http://localhost:9222/json/version
```

## 6. Luồng thêm job từ Client View

```mermaid
sequenceDiagram
  autonumber
  participant User
  participant UI as Client View
  participant Prep as Text Pre-processor
  participant API as Gateway API
  participant DB as SQLite

  User->>UI: Paste text, choose voice/speed/project
  UI->>Prep: Split text into chunks
  Prep-->>UI: Chunk cards
  User->>UI: Add selected chunks to queue
  loop each chunk
    UI->>API: POST /api/queue
    API->>DB: INSERT tts_queue pending
    API-->>UI: { ok, id }
  end
  UI->>API: GET /api/queue
  API-->>UI: queue rows
```

MVP UI chỉ cần:

- Textarea.
- Nút split.
- List chunk cards.
- Select voice.
- Slider speed.
- Checkbox incognito.
- Nút add to queue.
- Queue table.

## 7. Luồng ZeroClaw skill

```mermaid
sequenceDiagram
  autonumber
  participant User
  participant ZC as ZeroClaw
  participant Skill as SKILL.toml
  participant API as Gateway API
  participant DB as SQLite

  User->>ZC: "nghe thử đoạn này bằng giọng X"
  ZC->>Skill: Resolve vbee-hear-test
  Skill->>API: POST /api/queue incognito=1
  API->>DB: INSERT pending job
  API-->>Skill: { ok, id }
  Skill-->>ZC: job id
  ZC-->>User: Job added
```

ZeroClaw MVP không cần browser tool, không cần shell tool.

## 8. Worker loop

```mermaid
flowchart TD
  Start["Worker loop tick"] --> Pick["Pick pending job\nORDER BY priority, created_at"]
  Pick --> HasJob{"Has job?"}
  HasJob -->|No| SleepIdle["Sleep short idle delay"]
  SleepIdle --> Start

  HasJob -->|Yes| Mark["DB transaction\nstatus=processing"]
  Mark --> Delay["Human delay\nword_count / WPM - 1s\n+ clamp + jitter"]
  Delay --> Route{"incognito?"}

  Route -->|1| Preview["Preview worker\nWS demo/client preview"]
  Route -->|0| Convert["Convert worker\nOfficial API/client convert"]

  Preview --> GotAudio{"audio URL?"}
  Convert --> GotAudio

  GotAudio -->|No| Retry["retry_count++\nstatus=pending/failed"]
  Retry --> Start

  GotAudio -->|Yes| Download["Download to .tmp"]
  Download --> Rename["Atomic rename\n.tmp -> .mp3"]
  Rename --> Done["DB update\ndownload_complete=1\nstatus=done"]
  Done --> Log["Insert tts_log"]
  Log --> Start
```

## 9. Browser adapter design

```mermaid
classDiagram
  class BrowserAdapter {
    <<interface>>
    connect()
    newJobPage()
    runPreview(job)
    runConvert(job)
    closeJobPage(page)
  }

  class PlaywrightCdpAdapter {
    cdpUrl
    browserInstance
    connect()
    runPreview(job)
    runConvert(job)
  }

  class CamoufoxAdapter {
    connect()
    runPreview(job)
    runConvert(job)
  }

  class PatchrightAdapter {
    connect()
    runPreview(job)
    runConvert(job)
  }

  BrowserAdapter <|.. PlaywrightCdpAdapter
  BrowserAdapter <|.. CamoufoxAdapter
  BrowserAdapter <|.. PatchrightAdapter
```

MVP chỉ implement `PlaywrightCdpAdapter`.

Interface ý tưởng:

```js
class BrowserAdapter {
  async connect() {}
  async runPreview(job) {}
  async runConvert(job) {}
}
```

`runPreview()` và `runConvert()` trả về:

```js
{
  audioUrl: 'https://...',
  requestId: null,
  metadata: {}
}
```

## 10. Delay service

```mermaid
flowchart LR
  Text["job.content"] --> Count["countWords()"]
  Count --> Formula["(wordCount / WPM) * 60 - 1"]
  Formula --> Clamp["clamp min/max"]
  Clamp --> Jitter["x random 0.85..1.15"]
  Jitter --> DelayMs["delayMs"]
```

Code:

```js
function countWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function estimateTypingDelayMs(text, wpm = 180, minSeconds = 2, maxSeconds = 90) {
  const wordCount = countWords(text);
  const seconds = (wordCount / wpm) * 60 - 1;
  const clamped = Math.max(minSeconds, Math.min(seconds, maxSeconds));
  const jitter = 0.85 + Math.random() * 0.3;
  return Math.round(clamped * jitter * 1000);
}
```

MVP nên dùng delay này thay vì random 10s-3min.

## 11. Database MVP ERD

```mermaid
erDiagram
  PROJECTS ||--o{ TTS_QUEUE : has
  PROJECTS ||--o{ TTS_LOG : has
  PROJECTS ||--o{ TEXT_CHUNKS : has
  PROJECTS ||--o{ SOUND_TIMELINE : has
  PROJECTS ||--|| PROJECT_SEQUENCE : tracks

  PROJECTS {
    integer id PK
    text name
    text folder
    datetime created_at
  }

  TTS_QUEUE {
    text id PK
    text content
    text voice_code
    real speed
    integer incognito
    integer project_id FK
    text status
    integer retry_count
    text request_id
    integer download_complete
    text relative_path
    text file_path
  }

  TTS_LOG {
    integer id PK
    text filename
    text content
    text voice_code
    integer project_id FK
    integer seq_number
    integer download_complete
    text file_path
    integer duration_ms
  }

  TEXT_CHUNKS {
    integer id PK
    text session_id
    integer project_id FK
    integer seq
    text content
    text status
  }

  SOUND_TIMELINE {
    integer id PK
    integer project_id FK
    text name
    text tracks
  }

  PROJECT_SEQUENCE {
    integer project_id PK
    integer last_seq
  }
```

## 12. File state machine

```mermaid
stateDiagram-v2
  [*] --> Pending
  Pending --> Processing: worker picks job
  Processing --> TempFile: audio URL available
  TempFile --> Done: fs.rename succeeds
  TempFile --> Pending: download fails and retry remains
  Processing --> Pending: browser/API transient error
  Processing --> Failed: retry limit reached
  Done --> [*]
  Failed --> [*]
```

Rules:

- UI chỉ đọc file ở trạng thái `Done`.
- `Done` bắt buộc có `download_complete=1`.
- File `.tmp` không bao giờ hiển thị.
- File final chỉ được ghi bằng `rename`.

## 13. API surface cho MVP

```mermaid
flowchart TB
  API["Gateway API"] --> Health["GET /health"]
  API --> QueuePost["POST /api/queue"]
  API --> QueueList["GET /api/queue"]
  API --> QueueOne["GET /api/queue/:id"]
  API --> Retry["POST /api/jobs/:id/retry"]
  API --> Cancel["POST /api/jobs/:id/cancel"]
  API --> Audio["GET /api/audio/:filename"]
```

Response health:

```json
{
  "ok": true,
  "db": "ok",
  "browserCdp": "ok",
  "worker": "running"
}
```

POST queue:

```json
{
  "content": "Xin chao",
  "voice_code": "sg_female_tuongvy_call_44k-fhg",
  "speed": 1.05,
  "incognito": 1,
  "project_id": 1
}
```

## 14. MVP development order

```mermaid
gantt
  title MVP Build Order
  dateFormat  YYYY-MM-DD
  section Foundation
  Project folders + scripts        :a1, 2026-05-25, 1d
  Gateway skeleton + health        :a2, after a1, 1d
  SQLite schema + queue API        :a3, after a2, 1d
  section Browser
  Start browser CDP script         :b1, after a1, 1d
  Playwright CDP adapter           :b2, after a3, 1d
  section Worker
  Delay service                    :c1, after b2, 1d
  Preview worker                   :c2, after c1, 2d
  File finalize + retry            :c3, after c2, 1d
  section Client
  Minimal Vue UI                   :d1, after a3, 2d
  Queue polling + audio preview    :d2, after c3, 1d
  section ZeroClaw
  Skill-only config                :e1, after a3, 1d
  End-to-end skill test            :e2, after c3, 1d
```

Practical order:

1. Gateway `/health`.
2. SQLite + `/api/queue`.
3. Browser CDP healthcheck.
4. Worker that marks fake jobs done.
5. Real Playwright preview worker.
6. File download/finalize.
7. Minimal UI.
8. ZeroClaw skills.
9. Convert official worker.
10. Sound Editor minimal.

## 15. MVP acceptance tests

### Test 1 - Browser ready

```bat
scripts\start-brave.bat
curl http://localhost:9222/json/version
```

Pass if response has browser/version JSON.

### Test 2 - Gateway ready

```bat
curl http://localhost:3000/health
```

Pass if `ok=true`.

### Test 3 - Add queue

```bat
curl -X POST http://localhost:3000/api/queue ^
  -H "Content-Type: application/json" ^
  -d "{\"content\":\"Xin chao\",\"voice_code\":\"sg_female_tuongvy_call_44k-fhg\",\"incognito\":1}"
```

Pass if response has job id and DB row exists.

### Test 4 - Worker finalizes file

Pass if:

- `data/audio/*.mp3` exists.
- No `.tmp` remains for completed job.
- `tts_queue.download_complete=1`.
- `tts_queue.status='done'`.

### Test 5 - UI sees audio

Pass if:

- Queue table shows `done`.
- Audio preview can play file.

## 16. What to defer after MVP

Do not build these first:

- Full multi-track Sound Editor.
- Camoufox/Patchright adapter.
- Proxy management.
- Auto JWT refresh.
- Installer packaging.
- Multi-user SaaS.
- Complex voice cache UI.

Build after MVP:

- Official convert worker.
- Text chunk reorder.
- Project sequence naming.
- GC maintenance worker.
- ffmpeg export timeline.
- Tauri sidecar packaging.

