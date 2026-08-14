-- Durable sales-task lifecycle. Generated agent plans stay in agent_state;
-- only a specific lead or public prospect becomes an actionable task here.
CREATE TABLE IF NOT EXISTS sales_tasks (
  id TEXT PRIMARY KEY,
  task_type TEXT NOT NULL CHECK (task_type IN ('inbound_lead', 'public_prospect', 'paid_fulfillment')),
  source_key TEXT NOT NULL UNIQUE,
  owner TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  priority INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'completed', 'blocked', 'discarded')),
  lead_id TEXT,
  prospect_url TEXT,
  cta_url TEXT,
  created_at TEXT NOT NULL,
  claimed_by TEXT,
  claimed_at TEXT,
  completed_at TEXT,
  outcome_code TEXT,
  outcome_note TEXT,
  next_due_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_sales_tasks_queue
  ON sales_tasks(status, priority DESC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_sales_tasks_owner
  ON sales_tasks(owner, status, priority DESC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_sales_tasks_lead
  ON sales_tasks(lead_id);

CREATE INDEX IF NOT EXISTS idx_sales_tasks_type
  ON sales_tasks(task_type, status, created_at DESC);
