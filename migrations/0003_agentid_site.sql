CREATE TABLE IF NOT EXISTS agentid_leads (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  source_page TEXT NOT NULL,
  conversation_id TEXT,
  crm_stage TEXT NOT NULL,
  lead_status TEXT NOT NULL,
  lead_score INTEGER NOT NULL DEFAULT 0,
  name TEXT,
  email TEXT,
  phone TEXT,
  business_name TEXT,
  website TEXT,
  business_type TEXT,
  pain_point TEXT,
  desired_automation TEXT,
  automation_theme TEXT,
  current_tools TEXT,
  common_objection TEXT,
  recommended_agent_type TEXT,
  recommended_package TEXT,
  budget_range TEXT,
  timeline TEXT,
  preferred_contact_method TEXT,
  best_time_to_contact TEXT,
  transcript_summary TEXT,
  full_transcript TEXT,
  next_action TEXT,
  assigned_to TEXT,
  follow_up_status TEXT,
  contact_consent INTEGER NOT NULL DEFAULT 0,
  marketing_consent INTEGER NOT NULL DEFAULT 0,
  booked_call INTEGER NOT NULL DEFAULT 0,
  quote_requested INTEGER NOT NULL DEFAULT 0,
  purchase_intent TEXT,
  purchase_id TEXT,
  onboarding_id TEXT,
  dashboard_token TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_agentid_leads_conversation_id ON agentid_leads(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agentid_leads_dashboard_token ON agentid_leads(dashboard_token);
CREATE INDEX IF NOT EXISTS idx_agentid_leads_status ON agentid_leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_agentid_leads_created_at ON agentid_leads(created_at);

CREATE TABLE IF NOT EXISTS agentid_onboarding (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  lead_id TEXT,
  purchase_id TEXT,
  package_tier TEXT,
  business_name TEXT,
  website_url TEXT,
  business_type TEXT,
  main_service TEXT,
  target_customers TEXT,
  main_problem TEXT,
  current_lead_process TEXT,
  current_followup_process TEXT,
  common_questions TEXT,
  services_offered TEXT,
  pricing_information TEXT,
  business_hours TEXT,
  service_area TEXT,
  contact_methods TEXT,
  booking_process TEXT,
  tools_used TEXT,
  staff_alerts TEXT,
  tone TEXT,
  allowed_to_say TEXT,
  never_to_say TEXT,
  escalation_rules TEXT,
  compliance_concerns TEXT,
  training_files TEXT,
  desired_launch_date TEXT,
  build_status_stage TEXT NOT NULL,
  build_status_index INTEGER NOT NULL DEFAULT 0,
  recommended_agent_name TEXT,
  recommended_agent_type TEXT,
  customer_blueprint_html TEXT,
  internal_blueprint_json TEXT,
  agent_blueprint_json TEXT,
  system_prompt_text TEXT,
  integration_plan_json TEXT,
  dashboard_token TEXT,
  launch_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_agentid_onboarding_token ON agentid_onboarding(dashboard_token);
CREATE INDEX IF NOT EXISTS idx_agentid_onboarding_purchase ON agentid_onboarding(purchase_id);
CREATE INDEX IF NOT EXISTS idx_agentid_onboarding_lead ON agentid_onboarding(lead_id);
CREATE INDEX IF NOT EXISTS idx_agentid_onboarding_stage ON agentid_onboarding(build_status_stage);
CREATE INDEX IF NOT EXISTS idx_agentid_onboarding_created_at ON agentid_onboarding(created_at);

CREATE TABLE IF NOT EXISTS agentid_purchases (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  package_id TEXT,
  package_name TEXT,
  package_tier TEXT,
  checkout_type TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  customer_email TEXT,
  source_page TEXT,
  lead_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  dashboard_token TEXT,
  onboarding_url TEXT,
  metadata_json TEXT,
  consent_marketing INTEGER NOT NULL DEFAULT 0,
  fulfillment_status TEXT NOT NULL DEFAULT 'purchase_received',
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_agentid_purchases_session ON agentid_purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_agentid_purchases_token ON agentid_purchases(dashboard_token);
CREATE INDEX IF NOT EXISTS idx_agentid_purchases_status ON agentid_purchases(status);
CREATE INDEX IF NOT EXISTS idx_agentid_purchases_created_at ON agentid_purchases(created_at);

CREATE TABLE IF NOT EXISTS agentid_events (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  event_name TEXT NOT NULL,
  source_page TEXT,
  conversation_id TEXT,
  lead_id TEXT,
  session_id TEXT,
  properties_json TEXT,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_agentid_events_name ON agentid_events(event_name);
CREATE INDEX IF NOT EXISTS idx_agentid_events_created_at ON agentid_events(created_at);
CREATE INDEX IF NOT EXISTS idx_agentid_events_lead ON agentid_events(lead_id);

CREATE TABLE IF NOT EXISTS agentid_followups (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  send_after_hours INTEGER NOT NULL,
  consent_required INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_agentid_followups_lead ON agentid_followups(lead_id);
CREATE INDEX IF NOT EXISTS idx_agentid_followups_status ON agentid_followups(status);
