-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 71_mkt_ndp.sql
-- Description: Marketing module - NDP Research (Need-Desire-Pain framework)
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 70_mkt_common.sql
-- =====================================================

-- =====================================================
-- SECTION 1: NDP CATEGORIES
-- =====================================================

-- NDP Categories (Lookup Table)
CREATE TABLE IF NOT EXISTS mkt_ndp_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- UI
  color TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_ndp_categories_active ON mkt_ndp_categories(is_active);
CREATE INDEX idx_mkt_ndp_categories_slug ON mkt_ndp_categories(slug);

-- Comments
COMMENT ON TABLE mkt_ndp_categories IS 'NDP framework categories: Need, Desire, Pain, Problem, Fear, Fantasy';

-- =====================================================
-- SECTION 2: NDP TOPICS (Research Findings)
-- =====================================================

-- NDP Topics (Research Findings - ICP Language)
CREATE TABLE IF NOT EXISTS mkt_ndp_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Topic Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- NDP Classification
  ndp_category_id UUID REFERENCES mkt_ndp_categories(id),
  
  -- Keywords & SEO
  primary_keywords TEXT[],
  secondary_keywords TEXT[],
  long_tail_keywords TEXT[],
  
  -- Strategic Planning
  content_angle TEXT,
  expected_impact TEXT,
  priority_score INTEGER NOT NULL DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10),
  
  -- Usage Tracking
  times_used INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_ndp_topics_category ON mkt_ndp_topics(ndp_category_id);
CREATE INDEX idx_mkt_ndp_topics_priority ON mkt_ndp_topics(priority_score DESC);
CREATE INDEX idx_mkt_ndp_topics_active ON mkt_ndp_topics(is_active);
CREATE INDEX idx_mkt_ndp_topics_slug ON mkt_ndp_topics(slug);

-- Trigger
CREATE TRIGGER update_mkt_ndp_topics_updated_at
  BEFORE UPDATE ON mkt_ndp_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_ndp_topics IS 'NDP research topics - defines ICP language and market research findings';
COMMENT ON COLUMN mkt_ndp_topics.title IS 'Research findings: e.g., "High Mortality", "Feed Costs", "Disease Outbreaks"';

-- =====================================================
-- SECTION 3: NDP TOPICS → SEGMENTS MAPPING
-- =====================================================

-- NDP Topics → Stakeholder Segments (Many-to-Many)
CREATE TABLE IF NOT EXISTS mkt_ndp_topic_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  topic_id UUID NOT NULL REFERENCES mkt_ndp_topics(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES mkt_segments(id) ON DELETE CASCADE,
  
  -- Relevance
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(topic_id, segment_id)
);

CREATE INDEX idx_mkt_ndp_topic_segments_topic ON mkt_ndp_topic_segments(topic_id);
CREATE INDEX idx_mkt_ndp_topic_segments_segment ON mkt_ndp_topic_segments(segment_id);

-- Comments
COMMENT ON TABLE mkt_ndp_topic_segments IS 'Maps NDP research topics to target stakeholder segments (many-to-many)';

