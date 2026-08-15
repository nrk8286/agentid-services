ALTER TABLE sponsor_cpc_campaigns ADD COLUMN approval_reference TEXT;
ALTER TABLE sponsor_cpc_campaigns ADD COLUMN approved_at TEXT;
ALTER TABLE sponsor_cpc_campaigns ADD COLUMN approved_by TEXT;
ALTER TABLE sponsor_cpc_campaigns ADD COLUMN advertiser_access_token_hash TEXT;
ALTER TABLE sponsor_cpc_campaigns ADD COLUMN advertiser_access_expires_at TEXT;
ALTER TABLE sponsor_cpc_campaigns ADD COLUMN advertiser_access_revoked_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sponsor_cpc_campaigns_access_token
  ON sponsor_cpc_campaigns(advertiser_access_token_hash)
  WHERE advertiser_access_token_hash IS NOT NULL;
