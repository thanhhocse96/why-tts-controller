import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const schema = `
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  folder TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tts_queue (
  id TEXT PRIMARY KEY,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  content TEXT NOT NULL,
  voice_code TEXT NOT NULL,
  speed REAL DEFAULT 1.05,
  incognito INTEGER DEFAULT 0,
  project_id INTEGER REFERENCES projects(id),
  group_id TEXT,
  status TEXT DEFAULT 'pending',
  priority INTEGER DEFAULT 5,
  retry_count INTEGER DEFAULT 0,
  request_id TEXT,
  download_complete INTEGER DEFAULT 0,
  processed_at TEXT,
  relative_path TEXT,
  file_path TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS tts_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  voice_code TEXT NOT NULL,
  speed REAL,
  incognito INTEGER DEFAULT 0,
  project_id INTEGER REFERENCES projects(id),
  group_id TEXT,
  seq_number INTEGER,
  download_complete INTEGER DEFAULT 0,
  file_path TEXT,
  duration_ms INTEGER,
  status TEXT DEFAULT 'ok'
);

CREATE TABLE IF NOT EXISTS audio_assets (
  id TEXT PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  source_job_id TEXT UNIQUE REFERENCES tts_queue(id),
  filename TEXT NOT NULL,
  relative_path TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content TEXT,
  voice_code TEXT,
  speed REAL,
  duration_ms INTEGER,
  sample_rate INTEGER,
  channels INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tts_queue_status_priority
ON tts_queue(status, priority, created_at);
`;

export function openDatabase(dbPath) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec(schema);
  return db;
}
