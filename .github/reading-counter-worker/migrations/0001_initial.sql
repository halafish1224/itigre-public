CREATE TABLE IF NOT EXISTS page_counts (
  page_key TEXT PRIMARY KEY NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0 CHECK(view_count >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS page_sessions (
  page_key TEXT NOT NULL,
  session_id TEXT NOT NULL,
  seen_at INTEGER NOT NULL,
  PRIMARY KEY (page_key, session_id),
  FOREIGN KEY (page_key) REFERENCES page_counts(page_key) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_page_sessions_seen_at
  ON page_sessions (seen_at);
