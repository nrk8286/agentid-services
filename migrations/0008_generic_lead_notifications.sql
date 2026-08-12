ALTER TABLE leads ADD COLUMN contact_consent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN notification_status TEXT NOT NULL DEFAULT 'not_requested';
ALTER TABLE leads ADD COLUMN notification_updated_at TEXT;
