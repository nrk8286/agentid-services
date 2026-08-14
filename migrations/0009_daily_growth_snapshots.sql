CREATE TABLE IF NOT EXISTS growth_snapshots (
  day_key TEXT PRIMARY KEY,
  captured_at TEXT NOT NULL,
  trigger TEXT NOT NULL,
  metric_json TEXT NOT NULL,
  sponsor_status_json TEXT NOT NULL,
  data_quality_json TEXT NOT NULL,
  changed_fields_json TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  alert_status TEXT NOT NULL,
  alert_updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_growth_snapshots_captured_at
  ON growth_snapshots(captured_at DESC);

CREATE TABLE IF NOT EXISTS growth_sponsor_threads (
  campaign_id TEXT PRIMARY KEY,
  sponsor_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  eligible_at TEXT,
  initial_status TEXT NOT NULL DEFAULT 'no_reply',
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

INSERT OR IGNORE INTO growth_sponsor_threads
  (campaign_id, sponsor_name, recipient_email, sent_at, eligible_at, initial_status, active)
VALUES
  ('founding_sponsor_avairai', 'AvairAI', 'partners@avair.ai', '2026-08-07T05:00:00Z', '2026-08-14T14:00:00Z', 'no_reply', 1),
  ('founding_sponsor_firstcall', 'Firstcall', 'hello@heyfirstcall.com', '2026-08-07T05:00:00Z', '2026-08-14T14:00:00Z', 'no_reply', 1),
  ('founding_sponsor_brandtalkai', 'BrandTalk AI', 'hello@brandtalkai.com', '2026-08-07T05:00:00Z', '2026-08-14T14:00:00Z', 'no_reply', 1),
  ('founding_sponsor_receply', 'Receply', 'support@receply.net', '2026-08-07T05:05:08Z', '2026-08-14T14:00:00Z', 'no_reply', 1),
  ('founding_sponsor_withconnect', 'WithConnect AI', 'hello@withconnect.ai', '2026-08-07T05:18:08Z', NULL, 'bounced', 0),
  ('founding_sponsor_rexpt', 'Rexpt', 'support@rxpt.us', '2026-08-07T05:18:08Z', '2026-08-14T14:00:00Z', 'no_reply', 1),
  ('founding_sponsor_voxtell', 'Voxtell AI', 'founders@voxtell.ai', '2026-08-07T05:28:20Z', '2026-08-14T14:00:00Z', 'no_reply', 1);
