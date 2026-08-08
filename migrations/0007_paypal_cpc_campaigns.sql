CREATE TABLE IF NOT EXISTS sponsor_cpc_campaigns (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  advertiser_email TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_copy TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved_pending_invoice',
  cpc_cents INTEGER NOT NULL CHECK (cpc_cents >= 50),
  click_cap INTEGER NOT NULL CHECK (click_cap >= 1),
  validated_clicks INTEGER NOT NULL DEFAULT 0 CHECK (validated_clicks >= 0),
  budget_cents INTEGER NOT NULL CHECK (budget_cents > 0),
  duration_days INTEGER NOT NULL DEFAULT 30 CHECK (duration_days BETWEEN 1 AND 90),
  invoice_id TEXT UNIQUE,
  invoice_status TEXT,
  paypal_mode TEXT NOT NULL,
  starts_at TEXT,
  ends_at TEXT,
  paid_at TEXT,
  refunded_at TEXT,
  terms_version TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sponsor_cpc_campaigns_delivery
  ON sponsor_cpc_campaigns(status, starts_at, ends_at, validated_clicks, click_cap);
CREATE INDEX IF NOT EXISTS idx_sponsor_cpc_campaigns_invoice
  ON sponsor_cpc_campaigns(invoice_id);

CREATE TABLE IF NOT EXISTS sponsor_cpc_clicks (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  clicked_at TEXT NOT NULL,
  day_bucket TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  source_page TEXT,
  country TEXT,
  user_agent TEXT,
  billable INTEGER NOT NULL DEFAULT 0 CHECK (billable IN (0, 1)),
  reason TEXT NOT NULL,
  FOREIGN KEY (campaign_id) REFERENCES sponsor_cpc_campaigns(id),
  UNIQUE (campaign_id, day_bucket, visitor_hash)
);

CREATE INDEX IF NOT EXISTS idx_sponsor_cpc_clicks_campaign
  ON sponsor_cpc_clicks(campaign_id, clicked_at);
CREATE INDEX IF NOT EXISTS idx_sponsor_cpc_clicks_billable
  ON sponsor_cpc_clicks(campaign_id, billable, clicked_at);
