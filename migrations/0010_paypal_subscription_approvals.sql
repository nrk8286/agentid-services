CREATE TABLE IF NOT EXISTS paypal_subscription_approvals (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  package_id TEXT NOT NULL,
  package_name TEXT NOT NULL,
  paypal_plan_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  price_label TEXT NOT NULL,
  advertiser_email TEXT NOT NULL,
  business_name TEXT NOT NULL,
  approval_reference TEXT NOT NULL,
  approved_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved',
  approved_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  paypal_request_id TEXT NOT NULL UNIQUE,
  paypal_subscription_id TEXT,
  paypal_approval_url TEXT,
  provisioning_started_at TEXT,
  issued_at TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error_code TEXT,
  webhook_event_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_paypal_subscription_approvals_status_expires
  ON paypal_subscription_approvals(status, expires_at);

CREATE INDEX IF NOT EXISTS idx_paypal_subscription_approvals_subscription
  ON paypal_subscription_approvals(paypal_subscription_id);
