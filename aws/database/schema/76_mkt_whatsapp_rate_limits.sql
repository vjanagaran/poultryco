-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 76_mkt_whatsapp_rate_limits.sql
-- Description: Marketing module - WhatsApp Rate Limits & Safety Controls
-- Version: 1.0
-- Date: 2025-12-30
-- Dependencies: 74_mkt_whatsapp.sql
-- =====================================================

-- =====================================================
-- SECTION 1: RATE LIMIT CONFIGURATION
-- =====================================================

-- Add rate limit configuration to accounts table
ALTER TABLE mkt_wap_accounts 
ADD COLUMN IF NOT EXISTS rate_limit_config JSONB DEFAULT '{
  "messages_per_minute": 20,
  "messages_per_hour": 200,
  "messages_per_day": 1000,
  "groups_per_day": 50,
  "contacts_per_day": 100,
  "cooldown_after_error": 300
}'::jsonb;

-- =====================================================
-- SECTION 2: RATE LIMIT TRACKING
-- =====================================================

-- Rate limit tracking per account and time window
CREATE TABLE IF NOT EXISTS mkt_wap_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Account reference
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  
  -- Window tracking
  window_type TEXT NOT NULL CHECK (window_type IN ('minute', 'hour', 'day')),
  window_start TIMESTAMPTZ NOT NULL,
  
  -- Usage counters
  message_count INTEGER NOT NULL DEFAULT 0,
  group_count INTEGER NOT NULL DEFAULT 0,
  contact_count INTEGER NOT NULL DEFAULT 0,
  
  -- Error tracking
  last_error_at TIMESTAMPTZ,
  cooldown_until TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(account_id, window_type, window_start)
);

-- Indexes
CREATE INDEX idx_mkt_wap_rate_limits_account ON mkt_wap_rate_limits(account_id);
CREATE INDEX idx_mkt_wap_rate_limits_window ON mkt_wap_rate_limits(account_id, window_type, window_start);
CREATE INDEX idx_mkt_wap_rate_limits_cooldown ON mkt_wap_rate_limits(account_id, cooldown_until) WHERE cooldown_until IS NOT NULL;

-- =====================================================
-- SECTION 3: SAFETY CONTROLS
-- =====================================================

-- Safety controls per account
CREATE TABLE IF NOT EXISTS mkt_wap_safety_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Account reference
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  
  -- Message controls
  max_message_length INTEGER NOT NULL DEFAULT 4096,
  allowed_media_types TEXT[] DEFAULT ARRAY['image', 'video', 'document', 'audio'],
  
  -- Contact controls
  block_unknown_numbers BOOLEAN NOT NULL DEFAULT false,
  require_opt_in BOOLEAN NOT NULL DEFAULT false,
  
  -- Spam detection
  spam_detection_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Error handling
  auto_pause_on_error BOOLEAN NOT NULL DEFAULT true,
  error_threshold INTEGER NOT NULL DEFAULT 5, -- Pause after N errors
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(account_id)
);

-- Index
CREATE INDEX idx_mkt_wap_safety_controls_account ON mkt_wap_safety_controls(account_id);

-- =====================================================
-- SECTION 4: ERROR TRACKING
-- =====================================================

-- Error log for rate limit and safety violations
CREATE TABLE IF NOT EXISTS mkt_wap_error_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Account reference
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  
  -- Error details
  error_type TEXT NOT NULL CHECK (error_type IN ('rate_limit', 'safety_violation', 'spam_detected', 'unknown_number', 'message_too_long', 'invalid_media', 'other')),
  error_message TEXT NOT NULL,
  error_details JSONB,
  
  -- Context
  action_type TEXT, -- 'message', 'group', 'contact', 'broadcast'
  target_id TEXT, -- Phone number, group ID, etc.
  
  -- Timestamps
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_wap_error_log_account ON mkt_wap_error_log(account_id);
CREATE INDEX idx_mkt_wap_error_log_type ON mkt_wap_error_log(error_type);
CREATE INDEX idx_mkt_wap_error_log_date ON mkt_wap_error_log(occurred_at);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE mkt_wap_rate_limits IS 'Tracks rate limit usage per account and time window';
COMMENT ON TABLE mkt_wap_safety_controls IS 'Safety control settings per WhatsApp account';
COMMENT ON TABLE mkt_wap_error_log IS 'Logs all rate limit and safety control violations';

COMMENT ON COLUMN mkt_wap_rate_limits.window_type IS 'Time window type: minute, hour, or day';
COMMENT ON COLUMN mkt_wap_rate_limits.window_start IS 'Start timestamp of the time window';
COMMENT ON COLUMN mkt_wap_safety_controls.max_message_length IS 'Maximum message length in characters';
COMMENT ON COLUMN mkt_wap_safety_controls.allowed_media_types IS 'Array of allowed media types';
COMMENT ON COLUMN mkt_wap_safety_controls.error_threshold IS 'Number of errors before auto-pausing account';

