-- Lead Capture & Follow-Up Agent v1: tenant-scoped app configuration and leads.
CREATE TABLE IF NOT EXISTS customer_apps (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  public_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  public_config_json TEXT NOT NULL DEFAULT '{}',
  private_config_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_apps_tenant_updated
  ON customer_apps(tenant_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_apps_status
  ON customer_apps(status);

-- Tokens are stored only as hashes. A dashboard token can be granted access to
-- more than one app, while each grant remains independently revocable.
CREATE TABLE IF NOT EXISTS customer_app_dashboard_access (
  app_id TEXT NOT NULL,
  dashboard_token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT,
  PRIMARY KEY (app_id, dashboard_token_hash),
  FOREIGN KEY (app_id) REFERENCES customer_apps(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_customer_app_dashboard_access_token
  ON customer_app_dashboard_access(dashboard_token_hash, revoked_at);

CREATE TABLE IF NOT EXISTS customer_app_leads (
  id TEXT PRIMARY KEY,
  app_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  service TEXT,
  message TEXT,
  source TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  contact_consent INTEGER NOT NULL DEFAULT 0 CHECK (contact_consent IN (0, 1)),
  follow_up_status TEXT NOT NULL DEFAULT 'not_queued' CHECK (follow_up_status IN ('not_queued', 'queued', 'in_progress', 'completed', 'suppressed')),
  FOREIGN KEY (app_id) REFERENCES customer_apps(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_customer_app_leads_app_created
  ON customer_app_leads(app_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_app_leads_follow_up
  ON customer_app_leads(app_id, follow_up_status, created_at DESC);
