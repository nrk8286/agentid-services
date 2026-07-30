CREATE TABLE IF NOT EXISTS agent_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  latest_plan TEXT,
  latest_state TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS agent_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner TEXT NOT NULL,
  title TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
