-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 70_mkt_common.sql
-- Description: Marketing module - Common tables (Campaigns, Channels, Segments, KPIs)
-- Version: 2.1
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql
-- Note: Foreign keys to mkt_ndp_topics, mkt_con_pillars, and mkt_con_content
--       are added conditionally after those tables are created.
--       Execute in order: 70_mkt_common.sql → 71_mkt_ndp.sql → 72_mkt_content.sql
-- =====================================================

-- =====================================================
-- SECTION 1: STAKEHOLDER SEGMENTS
-- =====================================================

-- Stakeholder Segments (Target Audiences for Content)
CREATE TABLE IF NOT EXISTS mkt_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Segment Info
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Classification
  segment_type TEXT NOT NULL DEFAULT 'primary' CHECK (segment_type IN ('primary', 'secondary', 'niche')),
  
  -- Characteristics
  pain_points TEXT[],
  goals TEXT[],
  preferred_channels TEXT[],
  
  -- Market Sizing
  estimated_market_size INTEGER,
  current_reach INTEGER NOT NULL DEFAULT 0,
  target_reach INTEGER,
  
  -- Priority
  priority_score INTEGER NOT NULL DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  icon TEXT,
  color TEXT,
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_segments_active ON mkt_segments(is_active);
CREATE INDEX idx_mkt_segments_priority ON mkt_segments(priority_score DESC);
CREATE INDEX idx_mkt_segments_slug ON mkt_segments(slug);

-- Trigger
CREATE TRIGGER update_mkt_segments_updated_at
  BEFORE UPDATE ON mkt_segments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_segments IS 'Target audience segments (11 stakeholder types) for content marketing';
COMMENT ON COLUMN mkt_segments.preferred_channels IS 'Strategy reference only - does NOT limit where marketers can publish';

-- =====================================================
-- SECTION 2: MARKETING CHANNELS
-- =====================================================

-- Marketing Channels (Social Media Accounts)
CREATE TABLE IF NOT EXISTS mkt_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Platform
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram', 'twitter', 'youtube', 'whatsapp', 'website', 'email', 'telegram', 'other')),
  channel_type TEXT NOT NULL CHECK (channel_type IN ('page', 'profile', 'group', 'newsletter', 'channel', 'business_account', 'blog', 'list', 'other')),
  
  -- Details
  name TEXT NOT NULL,
  handle TEXT,
  url TEXT,
  description TEXT,
  
  -- Configuration (for future API integration)
  api_credentials JSONB,
  is_api_connected BOOLEAN NOT NULL DEFAULT false,
  
  -- Settings
  is_active BOOLEAN NOT NULL DEFAULT true,
  posting_schedule TEXT,
  default_hashtags TEXT[],
  
  -- Content Guidelines
  character_limit INTEGER,
  image_specs JSONB,
  best_posting_times TEXT[],
  
  -- Performance Targets (weekly)
  target_posts_per_week INTEGER NOT NULL DEFAULT 5,
  target_engagement_rate DECIMAL(5,4) NOT NULL DEFAULT 0.05,
  
  -- Current Stats
  current_followers INTEGER NOT NULL DEFAULT 0,
  current_subscribers INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_channels_platform ON mkt_channels(platform);
CREATE INDEX idx_mkt_channels_active ON mkt_channels(is_active);

-- Trigger
CREATE TRIGGER update_mkt_channels_updated_at
  BEFORE UPDATE ON mkt_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: CAMPAIGNS (Top-Level Marketing Strategy)
-- =====================================================

-- Marketing Campaigns (Top-Level Strategy)
CREATE TABLE IF NOT EXISTS mkt_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- Campaign Details
  campaign_type TEXT CHECK (campaign_type IN ('product_launch', 'awareness', 'engagement', 'conversion', 'retention', 'other')),
  start_date DATE,
  end_date DATE,
  
  -- Goals
  primary_goal TEXT,
  target_metrics JSONB,
  budget DECIMAL(10,2),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'planning', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Performance Tracking
  total_reach INTEGER NOT NULL DEFAULT 0,
  total_engagement INTEGER NOT NULL DEFAULT 0,
  total_conversions INTEGER NOT NULL DEFAULT 0,
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_campaigns_status ON mkt_campaigns(status);
CREATE INDEX idx_mkt_campaigns_slug ON mkt_campaigns(slug);
CREATE INDEX idx_mkt_campaigns_dates ON mkt_campaigns(start_date, end_date);

-- Trigger
CREATE TRIGGER update_mkt_campaigns_updated_at
  BEFORE UPDATE ON mkt_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_campaigns IS 'Top-level marketing campaigns that orchestrate all marketing activities';

-- Campaign → Segments (Many-to-Many)
CREATE TABLE IF NOT EXISTS mkt_campaign_segment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES mkt_campaigns(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES mkt_segments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, segment_id)
);

CREATE INDEX idx_mkt_campaign_segment_campaign ON mkt_campaign_segment_assignments(campaign_id);
CREATE INDEX idx_mkt_campaign_segment_segment ON mkt_campaign_segment_assignments(segment_id);

-- Campaign → NDP Topics (Many-to-Many)
-- Note: Foreign key to mkt_ndp_topics will be added after 71_mkt_ndp.sql is executed
CREATE TABLE IF NOT EXISTS mkt_campaign_ndp_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES mkt_campaigns(id) ON DELETE CASCADE,
  ndp_topic_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, ndp_topic_id)
);

-- Add foreign key constraint after mkt_ndp_topics table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_ndp_topics') 
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'fk_campaign_ndp_topic'
     ) THEN
    ALTER TABLE mkt_campaign_ndp_assignments
    ADD CONSTRAINT fk_campaign_ndp_topic
    FOREIGN KEY (ndp_topic_id) REFERENCES mkt_ndp_topics(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX idx_mkt_campaign_ndp_campaign ON mkt_campaign_ndp_assignments(campaign_id);
CREATE INDEX idx_mkt_campaign_ndp_topic ON mkt_campaign_ndp_assignments(ndp_topic_id);

-- Campaign → Pillars (Many-to-Many)
-- Note: Foreign key to mkt_con_pillars will be added after 72_mkt_content.sql is executed
CREATE TABLE IF NOT EXISTS mkt_campaign_pillar_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES mkt_campaigns(id) ON DELETE CASCADE,
  pillar_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, pillar_id)
);

-- Add foreign key constraint after mkt_con_pillars table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_con_pillars') 
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'fk_campaign_pillar'
     ) THEN
    ALTER TABLE mkt_campaign_pillar_assignments
    ADD CONSTRAINT fk_campaign_pillar
    FOREIGN KEY (pillar_id) REFERENCES mkt_con_pillars(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX idx_mkt_campaign_pillar_campaign ON mkt_campaign_pillar_assignments(campaign_id);
CREATE INDEX idx_mkt_campaign_pillar_pillar ON mkt_campaign_pillar_assignments(pillar_id);

-- Campaign → Content (Many-to-Many, Optional)
-- Note: Foreign key to mkt_con_content will be added after 72_mkt_content.sql is executed
CREATE TABLE IF NOT EXISTS mkt_campaign_content_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES mkt_campaigns(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, content_id)
);

-- Add foreign key constraint after mkt_con_content table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_con_content') 
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'fk_campaign_content'
     ) THEN
    ALTER TABLE mkt_campaign_content_assignments
    ADD CONSTRAINT fk_campaign_content
    FOREIGN KEY (content_id) REFERENCES mkt_con_content(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX idx_mkt_campaign_content_campaign ON mkt_campaign_content_assignments(campaign_id);
CREATE INDEX idx_mkt_campaign_content_content ON mkt_campaign_content_assignments(content_id);

-- =====================================================
-- SECTION 4: PLATFORM KPIs
-- =====================================================

-- Platform KPIs (PoultryCo Platform Growth)
CREATE TABLE IF NOT EXISTS mkt_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time Period
  metric_date DATE NOT NULL UNIQUE,
  week_number INTEGER,
  month_number INTEGER,
  year INTEGER NOT NULL,
  
  -- User Growth
  total_users INTEGER,
  new_signups INTEGER NOT NULL DEFAULT 0,
  daily_active_users INTEGER NOT NULL DEFAULT 0,
  weekly_active_users INTEGER NOT NULL DEFAULT 0,
  
  -- Engagement
  posts_created INTEGER NOT NULL DEFAULT 0,
  comments_created INTEGER NOT NULL DEFAULT 0,
  connections_made INTEGER NOT NULL DEFAULT 0,
  
  -- Segments (from stakeholder_segments)
  farmers_count INTEGER NOT NULL DEFAULT 0,
  veterinarians_count INTEGER NOT NULL DEFAULT 0,
  fpos_count INTEGER NOT NULL DEFAULT 0,
  researchers_count INTEGER NOT NULL DEFAULT 0,
  
  -- Newsletter
  email_subscribers INTEGER NOT NULL DEFAULT 0,
  new_email_subscribers INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_kpis_date ON mkt_kpis(metric_date);
CREATE INDEX idx_mkt_kpis_year_month ON mkt_kpis(year, month_number);

-- Social Media KPIs (Channel-Specific Metrics)
CREATE TABLE IF NOT EXISTS mkt_social_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time Period
  metric_date DATE NOT NULL,
  week_start DATE,
  week_number INTEGER,
  month_number INTEGER,
  year INTEGER NOT NULL,
  
  -- Channel
  channel_id UUID REFERENCES mkt_channels(id) ON DELETE CASCADE,
  
  -- Universal Metrics
  posts_published INTEGER NOT NULL DEFAULT 0,
  
  -- Channel-Specific Metrics (JSONB for flexibility)
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(metric_date, channel_id)
);

-- Indexes
CREATE INDEX idx_mkt_social_kpis_date ON mkt_social_kpis(metric_date);
CREATE INDEX idx_mkt_social_kpis_channel ON mkt_social_kpis(channel_id);
CREATE INDEX idx_mkt_social_kpis_week ON mkt_social_kpis(week_start);
CREATE INDEX idx_mkt_social_kpis_metrics ON mkt_social_kpis USING GIN(metrics);

-- Trigger
CREATE TRIGGER update_mkt_social_kpis_updated_at
  BEFORE UPDATE ON mkt_social_kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON COLUMN mkt_social_kpis.metrics IS 'Channel-specific metrics stored as JSON. Structure varies by platform/channel type.';

