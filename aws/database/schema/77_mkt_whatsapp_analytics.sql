-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 77_mkt_whatsapp_analytics.sql
-- Description: Marketing module - WhatsApp Analytics & Metrics
-- Version: 1.0
-- Date: 2025-12-30
-- Dependencies: 74_mkt_whatsapp.sql, 70_mkt_common.sql
-- =====================================================

-- =====================================================
-- SECTION 1: MESSAGE ANALYTICS
-- =====================================================

-- Message analytics tracking
CREATE TABLE IF NOT EXISTS mkt_wap_message_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Message reference
  message_id UUID NOT NULL REFERENCES mkt_wap_messages(id) ON DELETE CASCADE,
  
  -- Campaign reference (optional)
  campaign_id UUID REFERENCES mkt_campaigns(id) ON DELETE SET NULL,
  
  -- Delivery tracking
  sent_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- Engagement tracking
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  forwarded_count INTEGER NOT NULL DEFAULT 0,
  
  -- Error tracking
  error_count INTEGER NOT NULL DEFAULT 0,
  last_error_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_wap_message_analytics_message ON mkt_wap_message_analytics(message_id);
CREATE INDEX idx_mkt_wap_message_analytics_campaign ON mkt_wap_message_analytics(campaign_id);
CREATE INDEX idx_mkt_wap_message_analytics_sent ON mkt_wap_message_analytics(sent_at);

-- =====================================================
-- SECTION 2: GROUP ANALYTICS
-- =====================================================

-- Group analytics per day
CREATE TABLE IF NOT EXISTS mkt_wap_group_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Group reference
  group_id UUID NOT NULL REFERENCES mkt_wap_groups(id) ON DELETE CASCADE,
  
  -- Date tracking
  date DATE NOT NULL,
  
  -- Message metrics
  messages_sent INTEGER NOT NULL DEFAULT 0,
  messages_received INTEGER NOT NULL DEFAULT 0,
  
  -- Member metrics
  members_added INTEGER NOT NULL DEFAULT 0,
  members_removed INTEGER NOT NULL DEFAULT 0,
  member_count INTEGER NOT NULL DEFAULT 0,
  
  -- Engagement metrics
  engagement_score DECIMAL(5,2) NOT NULL DEFAULT 0, -- 0-100
  response_rate DECIMAL(5,2) NOT NULL DEFAULT 0, -- Percentage
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(group_id, date)
);

-- Indexes
CREATE INDEX idx_mkt_wap_group_analytics_group ON mkt_wap_group_analytics(group_id);
CREATE INDEX idx_mkt_wap_group_analytics_date ON mkt_wap_group_analytics(date);

-- =====================================================
-- SECTION 3: ACCOUNT HEALTH TRACKING
-- =====================================================

-- Account health metrics per day
CREATE TABLE IF NOT EXISTS mkt_wap_account_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Account reference
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  
  -- Date tracking
  date DATE NOT NULL,
  
  -- Connection metrics
  uptime_percentage DECIMAL(5,2) NOT NULL DEFAULT 0, -- 0-100
  connection_count INTEGER NOT NULL DEFAULT 0,
  disconnection_count INTEGER NOT NULL DEFAULT 0,
  
  -- Message metrics
  messages_sent INTEGER NOT NULL DEFAULT 0,
  messages_delivered INTEGER NOT NULL DEFAULT 0,
  messages_read INTEGER NOT NULL DEFAULT 0,
  messages_failed INTEGER NOT NULL DEFAULT 0,
  
  -- Error metrics
  errors_count INTEGER NOT NULL DEFAULT 0,
  rate_limit_hits INTEGER NOT NULL DEFAULT 0,
  
  -- Health score
  health_score INTEGER NOT NULL DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(account_id, date)
);

-- Indexes
CREATE INDEX idx_mkt_wap_account_health_account ON mkt_wap_account_health(account_id);
CREATE INDEX idx_mkt_wap_account_health_date ON mkt_wap_account_health(date);
CREATE INDEX idx_mkt_wap_account_health_score ON mkt_wap_account_health(account_id, health_score);

-- =====================================================
-- SECTION 4: CAMPAIGN ANALYTICS
-- =====================================================

-- Campaign performance via WhatsApp
CREATE TABLE IF NOT EXISTS mkt_wap_campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign reference
  campaign_id UUID NOT NULL REFERENCES mkt_campaigns(id) ON DELETE CASCADE,
  
  -- Account reference
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  
  -- Date tracking
  date DATE NOT NULL,
  
  -- Reach metrics
  messages_sent INTEGER NOT NULL DEFAULT 0,
  unique_recipients INTEGER NOT NULL DEFAULT 0,
  groups_reached INTEGER NOT NULL DEFAULT 0,
  
  -- Engagement metrics
  messages_delivered INTEGER NOT NULL DEFAULT 0,
  messages_read INTEGER NOT NULL DEFAULT 0,
  messages_clicked INTEGER NOT NULL DEFAULT 0,
  messages_replied INTEGER NOT NULL DEFAULT 0,
  messages_forwarded INTEGER NOT NULL DEFAULT 0,
  
  -- Performance metrics
  delivery_rate DECIMAL(5,2) NOT NULL DEFAULT 0, -- Percentage
  read_rate DECIMAL(5,2) NOT NULL DEFAULT 0, -- Percentage
  engagement_rate DECIMAL(5,2) NOT NULL DEFAULT 0, -- Percentage
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(campaign_id, account_id, date)
);

-- Indexes
CREATE INDEX idx_mkt_wap_campaign_analytics_campaign ON mkt_wap_campaign_analytics(campaign_id);
CREATE INDEX idx_mkt_wap_campaign_analytics_account ON mkt_wap_campaign_analytics(account_id);
CREATE INDEX idx_mkt_wap_campaign_analytics_date ON mkt_wap_campaign_analytics(date);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE mkt_wap_message_analytics IS 'Tracks analytics for individual WhatsApp messages';
COMMENT ON TABLE mkt_wap_group_analytics IS 'Daily analytics per WhatsApp group';
COMMENT ON TABLE mkt_wap_account_health IS 'Daily health metrics per WhatsApp account';
COMMENT ON TABLE mkt_wap_campaign_analytics IS 'Campaign performance metrics via WhatsApp';

COMMENT ON COLUMN mkt_wap_group_analytics.engagement_score IS 'Engagement score from 0-100 based on activity';
COMMENT ON COLUMN mkt_wap_account_health.uptime_percentage IS 'Percentage of time account was connected (0-100)';
COMMENT ON COLUMN mkt_wap_campaign_analytics.engagement_rate IS 'Overall engagement rate (clicks + replies + forwards)';

