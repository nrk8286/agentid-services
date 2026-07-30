CREATE TABLE IF NOT EXISTS playbooks (
  id TEXT PRIMARY KEY,
  generated_at TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  traffic TEXT NOT NULL,
  ads TEXT NOT NULL,
  sales TEXT NOT NULL,
  plan_trigger TEXT,
  plan_ref TEXT
);
