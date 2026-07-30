CREATE TABLE IF NOT EXISTS agent_spend_ledger (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  day_key TEXT NOT NULL,
  month_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('reserved', 'released', 'spent')),
  action_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_spend_day_status
  ON agent_spend_ledger(day_key, status);

CREATE INDEX IF NOT EXISTS idx_agent_spend_month_status
  ON agent_spend_ledger(month_key, status);

CREATE TABLE IF NOT EXISTS agent_actions (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  action_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  campaign TEXT NOT NULL,
  estimated_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK (estimated_cost_cents >= 0),
  status TEXT NOT NULL,
  result_json TEXT,
  published_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agent_actions_status_created
  ON agent_actions(status, created_at);
