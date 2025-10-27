-- =====================================================
-- Email Configuration and Domain Management
-- =====================================================

-- Email Domains Configuration
CREATE TABLE IF NOT EXISTS email_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Domain Info
  subdomain TEXT NOT NULL UNIQUE, -- 'mail', 'notify', 'news', etc.
  domain TEXT NOT NULL DEFAULT 'poultryco.net',
  full_domain TEXT GENERATED ALWAYS AS (subdomain || '.' || domain) STORED,
  
  -- Purpose
  purpose TEXT NOT NULL CHECK (purpose IN (
    'transactional',  -- noreply@mail.poultryco.net
    'notification',   -- updates@notify.poultryco.net  
    'marketing',      -- newsletter@news.poultryco.net
    'support',        -- help@support.poultryco.net
    'system'          -- system@app.poultryco.net
  )),
  
  -- Email Types (which categories use this domain)
  allowed_categories TEXT[] NOT NULL,
  
  -- SES Configuration
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  dkim_tokens TEXT[],
  
  -- Reputation
  reputation_score INTEGER DEFAULT 100,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  complaint_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Senders Configuration
CREATE TABLE IF NOT EXISTS email_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Sender Identity
  domain_id UUID NOT NULL REFERENCES email_domains(id),
  sender_name TEXT NOT NULL, -- 'PoultryCo Team', 'PoultryCo Support'
  sender_email TEXT NOT NULL, -- 'team', 'support', 'noreply'
  full_email TEXT, -- Will be populated by trigger
  
  -- Usage
  email_categories TEXT[] NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  -- Reply-to Settings
  reply_to_email TEXT,
  reply_to_name TEXT,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  UNIQUE(domain_id, sender_email)
);

-- Trigger to automatically set full_email
CREATE OR REPLACE FUNCTION set_sender_full_email()
RETURNS TRIGGER AS $$
BEGIN
  SELECT NEW.sender_email || '@' || full_domain 
  INTO NEW.full_email
  FROM email_domains 
  WHERE id = NEW.domain_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_sender_full_email
  BEFORE INSERT OR UPDATE OF domain_id, sender_email ON email_senders
  FOR EACH ROW
  EXECUTE FUNCTION set_sender_full_email();

-- AWS SES Configuration (encrypted)
CREATE TABLE IF NOT EXISTS email_provider_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Provider
  provider TEXT NOT NULL DEFAULT 'aws_ses' CHECK (provider IN ('aws_ses', 'sendgrid', 'mailgun')),
  
  -- Environment
  environment TEXT NOT NULL CHECK (environment IN ('development', 'staging', 'production')),
  
  -- Encrypted Credentials (will be encrypted using Supabase Vault)
  credentials_encrypted TEXT NOT NULL, -- Stores encrypted JSON with access_key, secret_key, region
  
  -- Configuration
  region TEXT NOT NULL DEFAULT 'ap-south-1', -- Mumbai region for India
  configuration_set TEXT, -- For SES event tracking
  
  -- Rate Limits
  max_send_rate INTEGER DEFAULT 14, -- emails per second
  max_daily_quota INTEGER DEFAULT 50000,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_verified_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(provider, environment)
);

-- Enhanced User Email Preferences
CREATE TABLE IF NOT EXISTS user_email_preferences_v2 (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Master Switch
  all_emails_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Transactional (always enabled for security)
  security_alerts BOOLEAN NOT NULL DEFAULT true, -- Cannot be disabled
  account_updates BOOLEAN NOT NULL DEFAULT true, -- Cannot be disabled
  
  -- Notifications
  connection_requests BOOLEAN NOT NULL DEFAULT true,
  messages BOOLEAN NOT NULL DEFAULT true,
  mentions BOOLEAN NOT NULL DEFAULT true,
  
  -- Engagement
  activity_updates BOOLEAN NOT NULL DEFAULT true,
  milestone_achievements BOOLEAN NOT NULL DEFAULT true,
  content_suggestions BOOLEAN NOT NULL DEFAULT true,
  
  -- Marketing
  product_updates BOOLEAN NOT NULL DEFAULT true,
  newsletter BOOLEAN NOT NULL DEFAULT true,
  event_invitations BOOLEAN NOT NULL DEFAULT true,
  promotional_offers BOOLEAN NOT NULL DEFAULT false,
  
  -- Digest Preferences
  digest_frequency TEXT CHECK (digest_frequency IN ('never', 'daily', 'weekly', 'monthly')) DEFAULT 'weekly',
  digest_day INTEGER CHECK (digest_day >= 0 AND digest_day <= 6), -- 0 = Sunday
  digest_time TIME DEFAULT '09:00:00',
  
  -- Advanced Settings
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  language TEXT NOT NULL DEFAULT 'en',
  
  -- Frequency Limits
  max_emails_per_day INTEGER NOT NULL DEFAULT 3,
  max_emails_per_week INTEGER NOT NULL DEFAULT 10,
  
  -- Quiet Hours
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  
  -- Channel Preferences
  prefer_in_app BOOLEAN NOT NULL DEFAULT false,
  prefer_sms BOOLEAN NOT NULL DEFAULT false,
  prefer_whatsapp BOOLEAN NOT NULL DEFAULT false,
  
  -- Unsubscribe
  unsubscribe_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  unsubscribed_all BOOLEAN NOT NULL DEFAULT false,
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Bounce and Complaint Handling
CREATE TABLE IF NOT EXISTS email_suppressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  
  -- Suppression Type
  suppression_type TEXT NOT NULL CHECK (suppression_type IN (
    'bounce',         -- Hard bounce
    'complaint',      -- Spam complaint
    'unsubscribe',    -- User unsubscribed
    'invalid',        -- Invalid email
    'manual'          -- Manually suppressed
  )),
  
  -- Details
  reason TEXT,
  source TEXT, -- 'ses', 'manual', 'import'
  
  -- AWS SES Message ID (for tracking)
  ses_message_id TEXT,
  ses_feedback_id TEXT,
  
  -- Status
  is_permanent BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ, -- For temporary suppressions
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(email, suppression_type)
);

-- Email Template Versions (for A/B testing)
CREATE TABLE IF NOT EXISTS email_template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
  
  -- Version Info
  version_name TEXT NOT NULL,
  is_control BOOLEAN NOT NULL DEFAULT false,
  
  -- Content
  subject TEXT NOT NULL,
  preheader TEXT, -- Preview text
  html_body TEXT NOT NULL,
  text_body TEXT NOT NULL,
  
  -- Performance Metrics
  send_count INTEGER NOT NULL DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0,
  click_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_winner BOOLEAN DEFAULT NULL,
  
  -- Test Settings
  traffic_percentage INTEGER DEFAULT 50 CHECK (traffic_percentage > 0 AND traffic_percentage <= 100),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SES Event Tracking
CREATE TABLE IF NOT EXISTS ses_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- SES Event Data
  message_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'send',
    'bounce',
    'complaint',
    'delivery',
    'reject',
    'open',
    'click',
    'rendering_failure'
  )),
  
  -- Email Reference
  email_queue_id UUID REFERENCES email_queue(id),
  recipient_email TEXT NOT NULL,
  
  -- Event Details
  timestamp TIMESTAMPTZ NOT NULL,
  raw_event JSONB NOT NULL, -- Full SES event for debugging
  
  -- Bounce/Complaint Details
  bounce_type TEXT,
  bounce_sub_type TEXT,
  complaint_feedback_type TEXT,
  
  -- Additional Data
  user_agent TEXT,
  ip_address INET,
  link_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default Email Domains
INSERT INTO email_domains (subdomain, purpose, allowed_categories) VALUES
  ('mail', 'transactional', ARRAY['welcome', 'onboarding', 'system']),
  ('notify', 'notification', ARRAY['engagement', 'network', 'achievement']),
  ('news', 'marketing', ARRAY['digest', 'promotional', 'event']),
  ('support', 'support', ARRAY['retention', 'educational'])
ON CONFLICT (subdomain) DO NOTHING;

-- Default Email Senders
INSERT INTO email_senders (domain_id, sender_name, sender_email, email_categories, is_default) VALUES
  ((SELECT id FROM email_domains WHERE subdomain = 'mail'), 'PoultryCo', 'noreply', ARRAY['welcome', 'onboarding', 'system'], true),
  ((SELECT id FROM email_domains WHERE subdomain = 'notify'), 'PoultryCo Updates', 'updates', ARRAY['engagement', 'network'], true),
  ((SELECT id FROM email_domains WHERE subdomain = 'news'), 'PoultryCo News', 'newsletter', ARRAY['digest', 'promotional'], true),
  ((SELECT id FROM email_domains WHERE subdomain = 'support'), 'PoultryCo Support', 'help', ARRAY['retention', 'educational'], false)
ON CONFLICT (domain_id, sender_email) DO NOTHING;

-- Indexes
CREATE INDEX idx_email_domains_purpose ON email_domains(purpose);
CREATE INDEX idx_email_senders_categories ON email_senders USING GIN(email_categories);
CREATE INDEX idx_email_suppressions_email ON email_suppressions(email);
CREATE INDEX idx_ses_events_message_id ON ses_events(message_id);
CREATE INDEX idx_ses_events_type ON ses_events(event_type);
CREATE INDEX idx_ses_events_timestamp ON ses_events(timestamp DESC);

-- Functions for secure credential storage
CREATE OR REPLACE FUNCTION store_email_credentials(
  p_provider TEXT,
  p_environment TEXT,
  p_access_key TEXT,
  p_secret_key TEXT,
  p_region TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credentials JSONB;
  v_encrypted TEXT;
BEGIN
  -- Create credentials JSON
  v_credentials = jsonb_build_object(
    'access_key', p_access_key,
    'secret_key', p_secret_key,
    'region', p_region
  );
  
  -- Encrypt using Supabase Vault (you'll need to enable pgsodium extension)
  v_encrypted = encode(pgsodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    v_credentials::text::bytea,
    pgsodium.crypto_aead_xchacha20poly1305_ietf_noncegen(),
    1::bigint,
    current_setting('app.settings.encryption_key')::bytea
  ), 'base64');
  
  -- Store encrypted credentials
  INSERT INTO email_provider_config (
    provider, environment, credentials_encrypted, region
  ) VALUES (
    p_provider, p_environment, v_encrypted, p_region
  )
  ON CONFLICT (provider, environment) 
  DO UPDATE SET 
    credentials_encrypted = v_encrypted,
    region = p_region,
    updated_at = NOW();
END;
$$;

-- Function to get decrypted credentials (admin only)
CREATE OR REPLACE FUNCTION get_email_credentials(
  p_provider TEXT,
  p_environment TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_encrypted TEXT;
  v_decrypted TEXT;
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND email IN ('admin@poultryco.in', 'vjanagaran@gmail.com')
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Get encrypted credentials
  SELECT credentials_encrypted INTO v_encrypted
  FROM email_provider_config
  WHERE provider = p_provider
  AND environment = p_environment
  AND is_active = true;
  
  IF v_encrypted IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Decrypt (you'll need to implement this based on your encryption method)
  -- This is a placeholder - actual implementation depends on pgsodium setup
  v_decrypted = v_encrypted; -- Replace with actual decryption
  
  RETURN v_decrypted::jsonb;
END;
$$;
