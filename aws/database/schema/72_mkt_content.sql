-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 72_mkt_content.sql
-- Description: Marketing module - Content Framework (Pillars, Content, Ideas, Schedule)
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 70_mkt_common.sql, 71_mkt_ndp.sql
-- =====================================================

-- =====================================================
-- SECTION 1: CONTENT TYPES & PILLAR TYPES
-- =====================================================

-- Content Types (Lookup Table) - Platform-Specific Formats
CREATE TABLE IF NOT EXISTS mkt_con_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  
  -- Platform
  platform TEXT,
  
  -- Characteristics
  typical_duration_minutes INTEGER,
  character_limit INTEGER,
  production_complexity TEXT CHECK (production_complexity IN ('low', 'medium', 'high')),
  
  -- Specifications
  image_specs JSONB,
  content_structure TEXT[],
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_con_types_platform ON mkt_con_types(platform);
CREATE INDEX idx_mkt_con_types_active ON mkt_con_types(is_active);
CREATE INDEX idx_mkt_con_types_slug ON mkt_con_types(slug);

-- Pillar Types (Lookup Table)
CREATE TABLE IF NOT EXISTS mkt_con_pillar_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_con_pillar_types_active ON mkt_con_pillar_types(is_active);
CREATE INDEX idx_mkt_con_pillar_types_slug ON mkt_con_pillar_types(slug);

-- =====================================================
-- SECTION 2: CONTENT PILLARS
-- =====================================================

-- Content Pillars (Core Research Topics)
CREATE TABLE IF NOT EXISTS mkt_con_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Pillar Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- Classification
  pillar_type_id UUID REFERENCES mkt_con_pillar_types(id),
  
  -- Source Research
  research_question TEXT,
  hypothesis TEXT,
  source_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  research_notes TEXT,
  key_insights TEXT[],
  
  -- SEO Strategy
  target_url TEXT,
  focus_keywords TEXT[],
  
  -- Strategic Alignment
  topic_id UUID, -- References mkt_ndp_topics(id) - FK added conditionally
  segment_id UUID REFERENCES mkt_segments(id),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'ideation' CHECK (status IN ('ideation', 'researching', 'validated', 'in_production', 'completed', 'archived')),
  validated_by UUID REFERENCES profiles(id),
  validated_at TIMESTAMPTZ,
  
  -- Priority
  priority_score INTEGER NOT NULL DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10),
  
  -- Tracking
  total_reach INTEGER NOT NULL DEFAULT 0,
  total_engagement INTEGER NOT NULL DEFAULT 0,
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_con_pillars_status ON mkt_con_pillars(status);
CREATE INDEX idx_mkt_con_pillars_priority ON mkt_con_pillars(priority_score DESC);
CREATE INDEX idx_mkt_con_pillars_type ON mkt_con_pillars(pillar_type_id);
CREATE INDEX idx_mkt_con_pillars_topic ON mkt_con_pillars(topic_id);
CREATE INDEX idx_mkt_con_pillars_segment ON mkt_con_pillars(segment_id);
CREATE INDEX idx_mkt_con_pillars_slug ON mkt_con_pillars(slug);

-- Trigger
CREATE TRIGGER update_mkt_con_pillars_updated_at
  BEFORE UPDATE ON mkt_con_pillars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_con_pillars IS 'Core research topics that serve as foundation for multiple content pieces';
COMMENT ON COLUMN mkt_con_pillars.target_url IS 'Backlink to landing page - all content from this pillar links here';
COMMENT ON COLUMN mkt_con_pillars.focus_keywords IS 'SEO keywords inherited by all content pieces from this pillar';

-- Content Pillar → Planned Content Types (Many-to-Many)
CREATE TABLE IF NOT EXISTS mkt_con_pillar_content_type_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  pillar_id UUID NOT NULL REFERENCES mkt_con_pillars(id) ON DELETE CASCADE,
  content_type_id UUID NOT NULL REFERENCES mkt_con_types(id) ON DELETE CASCADE,
  
  estimated_pieces INTEGER NOT NULL DEFAULT 1,
  pieces_created INTEGER NOT NULL DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(pillar_id, content_type_id)
);

CREATE INDEX idx_mkt_con_pillar_content_type_assignments_pillar ON mkt_con_pillar_content_type_assignments(pillar_id);
CREATE INDEX idx_mkt_con_pillar_content_type_assignments_type ON mkt_con_pillar_content_type_assignments(content_type_id);

-- Comments
COMMENT ON TABLE mkt_con_pillar_content_type_assignments IS 'Maps pillars to planned content types with counts';

-- =====================================================
-- SECTION 3: CONTENT IDEAS
-- =====================================================

-- Content Ideas (Quick Capture)
CREATE TABLE IF NOT EXISTS mkt_con_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Idea
  title TEXT NOT NULL,
  description TEXT,
  idea_source TEXT,
  
  -- Classification
  format TEXT,
  
  -- Strategic Fit
  topic_id UUID, -- References mkt_ndp_topics(id) - FK added conditionally
  pillar_id UUID REFERENCES mkt_con_pillars(id),
  segment_id UUID REFERENCES mkt_segments(id),
  
  -- Evaluation
  estimated_effort TEXT CHECK (estimated_effort IN ('low', 'medium', 'high')),
  estimated_impact TEXT CHECK (estimated_impact IN ('low', 'medium', 'high')),
  priority_score INTEGER NOT NULL DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10),
  
  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'captured' CHECK (status IN ('captured', 'evaluated', 'approved', 'in_production', 'completed', 'rejected')),
  rejection_reason TEXT,
  
  -- Assignment
  assigned_to UUID REFERENCES profiles(id),
  due_date DATE,
  
  -- Notes
  notes TEXT,
  tags TEXT[],
  
  -- Audit
  submitted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_con_ideas_status ON mkt_con_ideas(status);
CREATE INDEX idx_mkt_con_ideas_pillar ON mkt_con_ideas(pillar_id);
CREATE INDEX idx_mkt_con_ideas_topic ON mkt_con_ideas(topic_id);
CREATE INDEX idx_mkt_con_ideas_segment ON mkt_con_ideas(segment_id);
CREATE INDEX idx_mkt_con_ideas_assigned ON mkt_con_ideas(assigned_to);

-- Trigger
CREATE TRIGGER update_mkt_con_ideas_updated_at
  BEFORE UPDATE ON mkt_con_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_con_ideas IS 'Quick capture of content ideas before full pillar development';

-- =====================================================
-- SECTION 4: CONTENT (Unified Table - Master + Repurposed)
-- =====================================================

-- Content (Master + Repurposed in ONE table)
CREATE TABLE IF NOT EXISTS mkt_con_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  
  -- Content Mode (KEY FIELD)
  content_mode TEXT NOT NULL CHECK (content_mode IN ('master', 'repurposed')),
  
  -- If repurposed, link to master
  master_content_id UUID REFERENCES mkt_con_content(id),
  
  -- Source
  pillar_id UUID REFERENCES mkt_con_pillars(id),
  topic_id UUID, -- References mkt_ndp_topics(id) - FK added conditionally
  
  -- Content Type (Publishing Level)
  content_type_id UUID NOT NULL REFERENCES mkt_con_types(id),
  
  -- Content Body
  content_body TEXT,
  excerpt TEXT,
  
  -- SEO (inherited from pillar but can be customized)
  meta_title TEXT,
  meta_description TEXT,
  focus_keywords TEXT[],
  target_url TEXT,
  
  -- Media
  featured_image_url TEXT,
  media_urls TEXT[],
  hashtags TEXT[],
  
  -- Call to Action
  cta_text TEXT,
  cta_url TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
  
  -- Review
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Publishing
  published_url TEXT,
  published_at TIMESTAMPTZ,
  
  -- Performance (aggregated if master, direct if repurposed)
  total_views INTEGER NOT NULL DEFAULT 0,
  total_likes INTEGER NOT NULL DEFAULT 0,
  total_comments INTEGER NOT NULL DEFAULT 0,
  total_shares INTEGER NOT NULL DEFAULT 0,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_con_content_mode ON mkt_con_content(content_mode);
CREATE INDEX idx_mkt_con_content_master_id ON mkt_con_content(master_content_id);
CREATE INDEX idx_mkt_con_content_pillar ON mkt_con_content(pillar_id);
CREATE INDEX idx_mkt_con_content_type ON mkt_con_content(content_type_id);
CREATE INDEX idx_mkt_con_content_status ON mkt_con_content(status);
CREATE INDEX idx_mkt_con_content_slug ON mkt_con_content(slug);
CREATE INDEX idx_mkt_con_content_published ON mkt_con_content(published_at DESC);

-- Trigger
CREATE TRIGGER update_mkt_con_content_updated_at
  BEFORE UPDATE ON mkt_con_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Check constraint: If repurposed, must have master_content_id
ALTER TABLE mkt_con_content ADD CONSTRAINT check_repurposed_has_master
  CHECK (
    (content_mode = 'master' AND master_content_id IS NULL) OR
    (content_mode = 'repurposed' AND master_content_id IS NOT NULL)
  );

-- Comments
COMMENT ON TABLE mkt_con_content IS 'Unified table for master and repurposed content. Flow: Pillar → Content (master) → Content (repurposed) → Schedule';
COMMENT ON COLUMN mkt_con_content.content_mode IS 'master = long-form original (blog, ebook) | repurposed = platform-specific version (social posts)';
COMMENT ON COLUMN mkt_con_content.master_content_id IS 'If content_mode=repurposed, links to parent master content';

-- =====================================================
-- SECTION 5: CONTENT TAGS
-- =====================================================

-- Content Tags
CREATE TABLE IF NOT EXISTS mkt_con_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,
  
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_con_tags_active ON mkt_con_tags(is_active);
CREATE INDEX idx_mkt_con_tags_slug ON mkt_con_tags(slug);

-- Trigger
CREATE TRIGGER update_mkt_con_tags_updated_at
  BEFORE UPDATE ON mkt_con_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Content → Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS mkt_con_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES mkt_con_content(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES mkt_con_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(content_id, tag_id)
);

CREATE INDEX idx_mkt_con_tag_assignments_content ON mkt_con_tag_assignments(content_id);
CREATE INDEX idx_mkt_con_tag_assignments_tag ON mkt_con_tag_assignments(tag_id);

-- Pillar → Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS mkt_con_pillar_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_id UUID NOT NULL REFERENCES mkt_con_pillars(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES mkt_con_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pillar_id, tag_id)
);

CREATE INDEX idx_mkt_con_pillar_tag_assignments_pillar ON mkt_con_pillar_tag_assignments(pillar_id);
CREATE INDEX idx_mkt_con_pillar_tag_assignments_tag ON mkt_con_pillar_tag_assignments(tag_id);

-- =====================================================
-- SECTION 6: CONTENT SCHEDULE (Calendar)
-- =====================================================

-- Content Schedule
CREATE TABLE IF NOT EXISTS mkt_con_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What to publish
  content_id UUID NOT NULL REFERENCES mkt_con_content(id) ON DELETE CASCADE,
  
  -- Where to publish
  channel_id UUID NOT NULL REFERENCES mkt_channels(id) ON DELETE CASCADE,
  
  -- When to publish
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  
  -- Timeline Tracking
  content_created_date TIMESTAMPTZ,
  published_date TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  
  -- Manual Publishing Workflow
  published_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  published_url TEXT,
  
  -- Performance (manual entry)
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mkt_con_schedule_date ON mkt_con_schedule(scheduled_date);
CREATE INDEX idx_mkt_con_schedule_channel ON mkt_con_schedule(channel_id);
CREATE INDEX idx_mkt_con_schedule_content ON mkt_con_schedule(content_id);
CREATE INDEX idx_mkt_con_schedule_status ON mkt_con_schedule(status);
CREATE INDEX idx_mkt_con_schedule_published_date ON mkt_con_schedule(published_date);

-- Trigger
CREATE TRIGGER update_mkt_con_schedule_updated_at
  BEFORE UPDATE ON mkt_con_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE mkt_con_schedule IS 'Calendar view: Links content to channels with scheduling. Flow: Content → Schedule → Published';
COMMENT ON COLUMN mkt_con_schedule.content_created_date IS 'When the content piece was first created (helps track content age)';
COMMENT ON COLUMN mkt_con_schedule.published_date IS 'Actual publication date/time (may differ from scheduled_date if rescheduled)';
COMMENT ON COLUMN mkt_con_schedule.published_at IS 'System timestamp when user clicked "Mark as Published"';

-- =====================================================
-- SECTION 7: CONDITIONAL FOREIGN KEYS
-- =====================================================
-- Add foreign key constraints for mkt_ndp_topics after 71_mkt_ndp.sql is executed

-- Add foreign key: mkt_con_pillars.topic_id → mkt_ndp_topics.id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_ndp_topics')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_con_pillars')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'fk_mkt_con_pillars_topic'
       AND table_name = 'mkt_con_pillars'
     ) THEN
    ALTER TABLE mkt_con_pillars
    ADD CONSTRAINT fk_mkt_con_pillars_topic
    FOREIGN KEY (topic_id) REFERENCES mkt_ndp_topics(id);
    
    RAISE NOTICE 'Added foreign key: fk_mkt_con_pillars_topic';
  END IF;
END $$;

-- Add foreign key: mkt_con_ideas.topic_id → mkt_ndp_topics.id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_ndp_topics')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_con_ideas')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'fk_mkt_con_ideas_topic'
       AND table_name = 'mkt_con_ideas'
     ) THEN
    ALTER TABLE mkt_con_ideas
    ADD CONSTRAINT fk_mkt_con_ideas_topic
    FOREIGN KEY (topic_id) REFERENCES mkt_ndp_topics(id);
    
    RAISE NOTICE 'Added foreign key: fk_mkt_con_ideas_topic';
  END IF;
END $$;

-- Add foreign key: mkt_con_content.topic_id → mkt_ndp_topics.id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_ndp_topics')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mkt_con_content')
     AND NOT EXISTS (
       SELECT 1 FROM information_schema.table_constraints 
       WHERE constraint_name = 'fk_mkt_con_content_topic'
       AND table_name = 'mkt_con_content'
     ) THEN
    ALTER TABLE mkt_con_content
    ADD CONSTRAINT fk_mkt_con_content_topic
    FOREIGN KEY (topic_id) REFERENCES mkt_ndp_topics(id);
    
    RAISE NOTICE 'Added foreign key: fk_mkt_con_content_topic';
  END IF;
END $$;

