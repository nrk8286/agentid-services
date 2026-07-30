CREATE TABLE IF NOT EXISTS metrics (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  leads_total INTEGER NOT NULL DEFAULT 0,
  agent_runs_total INTEGER NOT NULL DEFAULT 0,
  lead_spider_runs_total INTEGER NOT NULL DEFAULT 0,
  prospects_total INTEGER NOT NULL DEFAULT 0,
  hot_prospects_total INTEGER NOT NULL DEFAULT 0,
  revenue_cents_total INTEGER NOT NULL DEFAULT 0,
  paid_checkouts_total INTEGER NOT NULL DEFAULT 0,
  latest_paid_checkout_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT,
  email TEXT NOT NULL,
  business TEXT,
  goal TEXT,
  budget TEXT,
  intent TEXT,
  source TEXT,
  score INTEGER NOT NULL DEFAULT 0,
  stage TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lead_tasks (
  lead_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  source TEXT,
  url TEXT,
  cta_url TEXT,
  created_at TEXT NOT NULL,
  owner TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS revenue_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  session_id TEXT,
  created_at TEXT NOT NULL,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT,
  customer_email TEXT,
  payment_status TEXT,
  source TEXT,
  build_id TEXT,
  package_id TEXT,
  delivery TEXT,
  mode TEXT
);
