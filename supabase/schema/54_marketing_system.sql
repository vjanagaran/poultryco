-- =====================================================
-- PoultryCo Marketing System Schema
-- File: 54_marketing_system.sql
-- Description: In-house marketing system for content strategy, creation, and KPI tracking
-- Version: 2.0 (FINALIZED)
-- Date: 2025-11-24
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SECTION 1: STAKEHOLDER SEGMENTS (11 Segments)
-- =====================================================

-- Stakeholder Segments (Target Audiences for Content)
CREATE TABLE IF NOT EXISTS stakeholder_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Segment Info
  name TEXT NOT NULL UNIQUE, -- 'Farmers', 'Veterinarians', 'FPOs', 'Associations', etc.
  slug TEXT NOT NULL UNIQUE, -- URL-friendly version
  description TEXT,
  
  -- Classification
  segment_type TEXT NOT NULL DEFAULT 'primary' CHECK (segment_type IN ('primary', 'secondary', 'niche')),
  
  -- Characteristics
  pain_points TEXT[], -- Key pain points for this segment
  goals TEXT[], -- What they want to achieve
  preferred_channels TEXT[], -- Strategy reference only (linkedin, whatsapp, facebook) - NOT a limitation
  
  -- Market Sizing
  estimated_market_size INT, -- Rough estimate of addressable market
  current_reach INT DEFAULT 0, -- How many we currently reach
  target_reach INT, -- Target reach goal
  
  -- Priority
  priority_score INT DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10),
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  icon TEXT, -- Emoji or icon name for UI
  color TEXT, -- Hex color for UI visualization
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stakeholder_segments_active ON stakeholder_segments(is_active);
CREATE INDEX idx_stakeholder_segments_priority ON stakeholder_segments(priority_score DESC);
CREATE INDEX idx_stakeholder_segments_slug ON stakeholder_segments(slug);

-- Trigger
CREATE TRIGGER update_stakeholder_segments_updated_at
  BEFORE UPDATE ON stakeholder_segments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE stakeholder_segments IS 'Target audience segments (11 stakeholder types) for content marketing';
COMMENT ON COLUMN stakeholder_segments.name IS 'Farmers, Veterinarians, FPOs, Associations, Nutritionists, Students, Feed Mills, Hatcheries, Consultants, Researchers, Equipment Suppliers';
COMMENT ON COLUMN stakeholder_segments.preferred_channels IS 'Strategy reference only - does NOT limit where marketers can publish';

-- Seed data: 11 PoultryCo Stakeholder Segments
INSERT INTO stakeholder_segments (name, slug, description, segment_type, priority_score, icon, color, preferred_channels) VALUES
  ('Farmers', 'farmers', 'Independent broiler and layer farm operators', 'primary', 10, '👨‍🌾', '#10B981', ARRAY['whatsapp', 'facebook', 'youtube']),
  ('Veterinarians', 'veterinarians', 'Licensed veterinarians and technical consultants', 'primary', 9, '⚕️', '#3B82F6', ARRAY['linkedin', 'whatsapp', 'instagram']),
  ('FPOs', 'fpos', 'Farmer Producer Organizations and cooperatives', 'primary', 8, '🤝', '#8B5CF6', ARRAY['linkedin', 'whatsapp', 'facebook']),
  ('Associations', 'associations', 'Farmer associations and industry bodies', 'primary', 7, '🏛️', '#F59E0B', ARRAY['linkedin', 'email', 'website']),
  ('Nutritionists', 'nutritionists', 'Poultry nutrition specialists', 'secondary', 6, '🥗', '#EC4899', ARRAY['linkedin', 'twitter', 'email']),
  ('Students', 'students', 'Students and interns in poultry science', 'secondary', 5, '🎓', '#6366F1', ARRAY['instagram', 'youtube', 'linkedin']),
  ('Feed Mills', 'feed-mills', 'Feed mill operators and manufacturers', 'primary', 8, '🏭', '#EF4444', ARRAY['linkedin', 'whatsapp', 'website']),
  ('Hatcheries', 'hatcheries', 'Hatchery operators and chick suppliers', 'primary', 7, '🐣', '#F97316', ARRAY['whatsapp', 'linkedin', 'facebook']),
  ('Consultants', 'consultants', 'Independent poultry consultants', 'secondary', 6, '💼', '#14B8A6', ARRAY['linkedin', 'twitter', 'website']),
  ('Researchers', 'researchers', 'Academics and research institutions', 'secondary', 5, '🔬', '#8B5CF6', ARRAY['linkedin', 'twitter', 'email']),
  ('Equipment Suppliers', 'equipment-suppliers', 'Equipment and technology suppliers', 'secondary', 6, '⚙️', '#6B7280', ARRAY['linkedin', 'website', 'facebook'])
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SECTION 2: NDP FRAMEWORK (Need-Desire-Pain)
-- =====================================================

-- NDP Categories (Lookup Table)
CREATE TABLE IF NOT EXISTS ndp_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE, -- 'Fear', 'PainPoint', 'Problem', 'Need', 'Desire', 'Fantasy'
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- UI
  color TEXT, -- Hex color for category
  icon TEXT, -- Emoji or icon
  sort_order INT DEFAULT 0,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed NDP Categories
INSERT INTO ndp_categories (name, slug, description, color, icon, sort_order) VALUES
  ('Fear', 'fear', 'Deep anxieties and worst-case scenarios', '#EF4444', '😨', 1),
  ('PainPoint', 'painpoint', 'Current frustrations and difficulties', '#F97316', '😤', 2),
  ('Problem', 'problem', 'Challenges that need solving', '#F59E0B', '🤔', 3),
  ('Need', 'need', 'Essential requirements for success', '#3B82F6', '✅', 4),
  ('Desire', 'desire', 'Aspirations and goals', '#10B981', '🌟', 5),
  ('Fantasy', 'fantasy', 'Ideal future state visions', '#8B5CF6', '✨', 6)
ON CONFLICT (slug) DO NOTHING;

-- Content Topics (NDP Framework)
CREATE TABLE IF NOT EXISTS content_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Topic Info
  title TEXT NOT NULL, -- e.g., "Managing Disease Outbreaks", "Reducing Feed Costs"
  slug TEXT UNIQUE,
  description TEXT,
  
  -- NDP Classification
  ndp_category_id UUID REFERENCES ndp_categories(id),
  
  -- Keywords & SEO
  primary_keywords TEXT[],
  secondary_keywords TEXT[],
  long_tail_keywords TEXT[],
  
  -- Strategic Planning
  content_angle TEXT, -- How to approach this topic
  expected_impact TEXT, -- Why this matters
  priority_score INT DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10),
  
  -- Usage Tracking
  times_used INT DEFAULT 0, -- How many content pieces created from this topic
  last_used_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_topics_category ON content_topics(ndp_category_id);
CREATE INDEX idx_content_topics_priority ON content_topics(priority_score DESC);
CREATE INDEX idx_content_topics_active ON content_topics(is_active);
CREATE INDEX idx_content_topics_slug ON content_topics(slug);

-- Trigger
CREATE TRIGGER update_content_topics_updated_at
  BEFORE UPDATE ON content_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Content Topics → Stakeholder Segments (Many-to-Many)
CREATE TABLE IF NOT EXISTS content_topic_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  topic_id UUID NOT NULL REFERENCES content_topics(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES stakeholder_segments(id) ON DELETE CASCADE,
  
  -- Relevance
  relevance_score INT CHECK (relevance_score >= 1 AND relevance_score <= 10), -- How relevant is this topic to this segment?
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(topic_id, segment_id)
);

CREATE INDEX idx_content_topic_segments_topic ON content_topic_segments(topic_id);
CREATE INDEX idx_content_topic_segments_segment ON content_topic_segments(segment_id);

COMMENT ON TABLE content_topic_segments IS 'Maps content topics to target stakeholder segments (many-to-many)';

-- =====================================================
-- SECTION 3: CONTENT TYPES & PILLAR TYPES
-- =====================================================

-- Content Types (Lookup Table) - Platform-Specific Formats
CREATE TABLE IF NOT EXISTS content_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE, -- 'LinkedIn Post', 'Facebook Post', 'Blog', 'Video', etc.
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Platform
  platform TEXT, -- linkedin, facebook, instagram, twitter, youtube, website, whatsapp, email
  
  -- Characteristics
  typical_duration_minutes INT, -- Estimated time to consume
  character_limit INT, -- Platform-specific character limit
  production_complexity TEXT CHECK (production_complexity IN ('low', 'medium', 'high')),
  
  -- Specifications
  image_specs JSONB, -- {width: 1200, height: 630, format: 'jpg', max_size_mb: 5}
  content_structure TEXT[], -- ['hook', 'body', 'cta', 'hashtags']
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Content Types (Platform-Specific)
INSERT INTO content_types (name, slug, platform, character_limit, production_complexity, content_structure) VALUES
  -- Blogs & Long-form
  ('Blog Article', 'blog-article', 'website', NULL, 'medium', ARRAY['title', 'intro', 'body', 'conclusion', 'cta']),
  ('Ebook', 'ebook', 'website', NULL, 'high', ARRAY['cover', 'chapters', 'conclusion']),
  ('Case Study', 'case-study', 'website', NULL, 'medium', ARRAY['challenge', 'solution', 'results']),
  
  -- LinkedIn
  ('LinkedIn Post', 'linkedin-post', 'linkedin', 3000, 'low', ARRAY['hook', 'body', 'cta', 'hashtags']),
  ('LinkedIn Carousel', 'linkedin-carousel', 'linkedin', 3000, 'medium', ARRAY['slide_1_hook', 'slides_2_9_content', 'slide_10_cta']),
  ('LinkedIn Article', 'linkedin-article', 'linkedin', NULL, 'medium', ARRAY['title', 'intro', 'body', 'conclusion']),
  
  -- Facebook
  ('Facebook Post', 'facebook-post', 'facebook', 63206, 'low', ARRAY['hook', 'body', 'cta', 'hashtags']),
  ('Facebook Story', 'facebook-story', 'facebook', NULL, 'low', ARRAY['visual', 'text_overlay']),
  
  -- Instagram
  ('Instagram Post', 'instagram-post', 'instagram', 2200, 'low', ARRAY['caption', 'hashtags']),
  ('Instagram Carousel', 'instagram-carousel', 'instagram', 2200, 'medium', ARRAY['slide_captions', 'hashtags']),
  ('Instagram Reel', 'instagram-reel', 'instagram', 2200, 'medium', ARRAY['script', 'captions', 'hashtags']),
  ('Instagram Story', 'instagram-story', 'instagram', NULL, 'low', ARRAY['visual', 'text', 'sticker']),
  
  -- Twitter
  ('Twitter Post', 'twitter-post', 'twitter', 280, 'low', ARRAY['tweet', 'hashtags']),
  ('Twitter Thread', 'twitter-thread', 'twitter', 280, 'medium', ARRAY['tweet_1_hook', 'tweets_2_n_content', 'final_tweet_cta']),
  
  -- WhatsApp
  ('WhatsApp Message', 'whatsapp-message', 'whatsapp', NULL, 'low', ARRAY['greeting', 'message', 'link']),
  ('WhatsApp Broadcast', 'whatsapp-broadcast', 'whatsapp', NULL, 'low', ARRAY['announcement', 'details', 'cta']),
  
  -- YouTube
  ('YouTube Video', 'youtube-video', 'youtube', NULL, 'high', ARRAY['script', 'description', 'tags']),
  ('YouTube Short', 'youtube-short', 'youtube', NULL, 'medium', ARRAY['script', 'hook', 'cta']),
  
  -- Email
  ('Email Newsletter', 'email-newsletter', 'email', NULL, 'medium', ARRAY['subject', 'preview', 'body', 'cta']),
  
  -- Other
  ('Infographic', 'infographic', 'website', NULL, 'high', ARRAY['title', 'data_points', 'visual']),
  ('Webinar', 'webinar', 'youtube', NULL, 'high', ARRAY['presentation', 'qa', 'recording']),
  ('Podcast', 'podcast', 'website', NULL, 'high', ARRAY['script', 'interview', 'show_notes'])
ON CONFLICT (slug) DO NOTHING;

-- Pillar Types (Lookup Table)
CREATE TABLE IF NOT EXISTS pillar_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL UNIQUE, -- 'Research', 'Case Study', 'Industry Trend', etc.
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Pillar Types
INSERT INTO pillar_types (name, slug, description, icon) VALUES
  ('Research', 'research', 'In-depth research on specific topics', '🔬'),
  ('Case Study', 'case-study', 'Success stories and real-world examples', '📊'),
  ('Industry Trend', 'industry-trend', 'Analysis of market trends and predictions', '📈'),
  ('Company Story', 'company-story', 'About PoultryCo, team, and vision', '📖'),
  ('Product Feature', 'product-feature', 'Platform features and capabilities', '⚙️'),
  ('Thought Leadership', 'thought-leadership', 'Expert opinions and insights', '💡')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SECTION 4: CONTENT PILLARS & IDEAS
-- =====================================================

-- Content Pillars (Core Research Topics)
CREATE TABLE IF NOT EXISTS content_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Pillar Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  
  -- Classification
  pillar_type_id UUID REFERENCES pillar_types(id),
  
  -- Source Research
  research_question TEXT, -- What are we investigating?
  hypothesis TEXT, -- What do we expect to find?
  source_documents JSONB DEFAULT '[]'::jsonb, -- Array of sources: [{title, url, type, notes, uploaded_at}, ...]
  research_notes TEXT, -- Internal research findings
  key_insights TEXT[], -- Main takeaways from research
  
  -- SEO Strategy
  target_url TEXT, -- Optional backlink to landing page (e.g., /stakeholders/farmers, /about)
  focus_keywords TEXT[], -- Primary SEO keywords for all content from this pillar
  
  -- Strategic Alignment
  topic_id UUID REFERENCES content_topics(id), -- Single primary topic
  segment_id UUID REFERENCES stakeholder_segments(id), -- Single primary segment
  
  -- Status
  status TEXT DEFAULT 'ideation' CHECK (status IN ('ideation', 'researching', 'validated', 'in_production', 'completed', 'archived')),
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMPTZ,
  
  -- Priority
  priority_score INT DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10),
  
  -- Tracking
  total_reach INT DEFAULT 0, -- Combined reach across all content pieces
  total_engagement INT DEFAULT 0, -- Combined engagement
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_pillars_status ON content_pillars(status);
CREATE INDEX idx_content_pillars_priority ON content_pillars(priority_score DESC);
CREATE INDEX idx_content_pillars_type ON content_pillars(pillar_type_id);
CREATE INDEX idx_content_pillars_topic ON content_pillars(topic_id);
CREATE INDEX idx_content_pillars_segment ON content_pillars(segment_id);
CREATE INDEX idx_content_pillars_slug ON content_pillars(slug);

-- Trigger
CREATE TRIGGER update_content_pillars_updated_at
  BEFORE UPDATE ON content_pillars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE content_pillars IS 'Core research topics that serve as foundation for multiple content pieces';
COMMENT ON COLUMN content_pillars.target_url IS 'Backlink to landing page - all content from this pillar links here';
COMMENT ON COLUMN content_pillars.focus_keywords IS 'SEO keywords inherited by all content pieces from this pillar';

-- Content Pillar → Planned Content Types (Many-to-Many)
CREATE TABLE IF NOT EXISTS content_pillar_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  pillar_id UUID NOT NULL REFERENCES content_pillars(id) ON DELETE CASCADE,
  content_type_id UUID NOT NULL REFERENCES content_types(id) ON DELETE CASCADE,
  
  estimated_pieces INT DEFAULT 1, -- How many pieces of this type planned
  pieces_created INT DEFAULT 0, -- How many actually created
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(pillar_id, content_type_id)
);

CREATE INDEX idx_content_pillar_types_pillar ON content_pillar_types(pillar_id);
CREATE INDEX idx_content_pillar_types_type ON content_pillar_types(content_type_id);

COMMENT ON TABLE content_pillar_types IS 'Maps pillars to planned content types with counts';

-- Content Ideas (Quick Capture)
CREATE TABLE IF NOT EXISTS content_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Idea
  title TEXT NOT NULL,
  description TEXT,
  idea_source TEXT, -- team_brainstorm, customer_feedback, competitor_analysis, industry_news
  
  -- Classification
  format TEXT, -- educational, inspirational, case_study, how_to, listicle, interview, news
  
  -- Strategic Fit
  topic_id UUID REFERENCES content_topics(id),
  pillar_id UUID REFERENCES content_pillars(id), -- If it belongs to an existing pillar
  segment_id UUID REFERENCES stakeholder_segments(id), -- Primary target segment
  
  -- Evaluation
  estimated_effort TEXT CHECK (estimated_effort IN ('low', 'medium', 'high')),
  estimated_impact TEXT CHECK (estimated_impact IN ('low', 'medium', 'high')),
  priority_score INT DEFAULT 5 CHECK (priority_score >= 1 AND priority_score <= 10),
  
  -- Lifecycle
  status TEXT DEFAULT 'captured' CHECK (status IN ('captured', 'evaluated', 'approved', 'in_production', 'completed', 'rejected')),
  rejection_reason TEXT,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  due_date DATE,
  
  -- Notes
  notes TEXT,
  tags TEXT[],
  
  -- Audit
  submitted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_ideas_status ON content_ideas(status);
CREATE INDEX idx_content_ideas_pillar ON content_ideas(pillar_id);
CREATE INDEX idx_content_ideas_topic ON content_ideas(topic_id);
CREATE INDEX idx_content_ideas_segment ON content_ideas(segment_id);
CREATE INDEX idx_content_ideas_assigned ON content_ideas(assigned_to);

-- Trigger
CREATE TRIGGER update_content_ideas_updated_at
  BEFORE UPDATE ON content_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE content_ideas IS 'Quick capture of content ideas before full pillar development. Topics = strategic themes (abstract), Ideas = specific proposals (concrete)';

-- =====================================================
-- SECTION 5: CONTENT (UNIFIED TABLE)
-- =====================================================

-- Content (Master + Repurposed in ONE table)
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  
  -- Content Mode (KEY FIELD)
  content_mode TEXT NOT NULL CHECK (content_mode IN ('master', 'repurposed')),
  
  -- If repurposed, link to master
  master_content_id UUID REFERENCES content(id), -- NULL if mode=master, populated if mode=repurposed
  
  -- Source
  pillar_id UUID REFERENCES content_pillars(id),
  topic_id UUID REFERENCES content_topics(id),
  
  -- Content Type (Publishing Level)
  content_type_id UUID NOT NULL REFERENCES content_types(id), -- Blog, LinkedIn Post, etc.
  
  -- Content Body
  content_body TEXT, -- Full content (markdown or HTML)
  excerpt TEXT, -- Short summary
  
  -- SEO (inherited from pillar but can be customized)
  meta_title TEXT,
  meta_description TEXT,
  focus_keywords TEXT[], -- Inherited from pillar.focus_keywords
  target_url TEXT, -- Inherited from pillar.target_url
  
  -- Media
  featured_image_url TEXT,
  media_urls TEXT[], -- Additional images/videos
  hashtags TEXT[], -- Platform-specific hashtags
  
  -- Call to Action
  cta_text TEXT,
  cta_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved', 'published', 'archived')),
  
  -- Review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Publishing
  published_url TEXT, -- Actual URL where published (if master content on website)
  published_at TIMESTAMPTZ,
  
  -- Performance (aggregated if master, direct if repurposed)
  total_views INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_shares INT DEFAULT 0,
  total_clicks INT DEFAULT 0,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_mode ON content(content_mode);
CREATE INDEX idx_content_master_id ON content(master_content_id);
CREATE INDEX idx_content_pillar ON content(pillar_id);
CREATE INDEX idx_content_type ON content(content_type_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_published ON content(published_at DESC);

-- Trigger
CREATE TRIGGER update_content_updated_at
  BEFORE UPDATE ON content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Check constraint: If repurposed, must have master_content_id
ALTER TABLE content ADD CONSTRAINT check_repurposed_has_master
  CHECK (
    (content_mode = 'master' AND master_content_id IS NULL) OR
    (content_mode = 'repurposed' AND master_content_id IS NOT NULL)
  );

COMMENT ON TABLE content IS 'Unified table for master and repurposed content. Flow: Pillar → Content (master) → Content (repurposed) → Schedule';
COMMENT ON COLUMN content.content_mode IS 'master = long-form original (blog, ebook) | repurposed = platform-specific version (social posts)';
COMMENT ON COLUMN content.master_content_id IS 'If content_mode=repurposed, links to parent master content';

-- =====================================================
-- SECTION 6: MARKETING CHANNELS
-- =====================================================

-- Marketing Channels (Social Media Accounts)
CREATE TABLE IF NOT EXISTS marketing_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Platform
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'facebook', 'instagram', 'twitter', 'youtube', 'whatsapp', 'website', 'email', 'telegram', 'other')),
  channel_type TEXT NOT NULL CHECK (channel_type IN ('page', 'profile', 'group', 'newsletter', 'channel', 'business_account', 'blog', 'list', 'other')),
  
  -- Details
  name TEXT NOT NULL, -- "PoultryCo LinkedIn Page", "Founder Profile"
  handle TEXT, -- @poultryco
  url TEXT,
  description TEXT,
  
  -- Configuration (for future API integration - Phase 2)
  api_credentials JSONB, -- Encrypted: {access_token, refresh_token, etc} - NULL in Phase 1
  is_api_connected BOOLEAN DEFAULT false, -- Always false in Phase 1
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  posting_schedule TEXT, -- "Mon-Fri 9am, 3pm, 7pm" (for reference)
  default_hashtags TEXT[],
  
  -- Content Guidelines
  character_limit INT, -- Platform-specific limits
  image_specs JSONB, -- Recommended image dimensions, formats
  best_posting_times TEXT[], -- ["Mon 9am", "Wed 3pm", "Fri 7pm"]
  
  -- Performance Targets (weekly)
  target_posts_per_week INT DEFAULT 5,
  target_engagement_rate DECIMAL(5,4) DEFAULT 0.05, -- 5%
  
  -- Current Stats (updated manually or via API)
  current_followers INT DEFAULT 0,
  current_subscribers INT DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_marketing_channels_platform ON marketing_channels(platform);
CREATE INDEX idx_marketing_channels_active ON marketing_channels(is_active);

-- Trigger
CREATE TRIGGER update_marketing_channels_updated_at
  BEFORE UPDATE ON marketing_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 7: CONTENT SCHEDULE (CALENDAR)
-- =====================================================

-- Content Schedule
CREATE TABLE IF NOT EXISTS content_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What to publish
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  
  -- Where to publish
  channel_id UUID NOT NULL REFERENCES marketing_channels(id) ON DELETE CASCADE,
  
  -- When to publish
  scheduled_date DATE NOT NULL,
  scheduled_time TIME, -- Can be NULL for "anytime today"
  
  -- Timeline Tracking
  content_created_date TIMESTAMPTZ, -- When content was originally created
  published_date TIMESTAMPTZ, -- Actual date/time when published (may differ from scheduled)
  
  -- Status (all manual in Phase 1)
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  
  -- Manual Publishing Workflow
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ, -- System timestamp when marked as published
  published_url TEXT, -- URL where it was actually published
  
  -- Performance (manual entry in Phase 1)
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  clicks INT DEFAULT 0,
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_schedule_date ON content_schedule(scheduled_date);
CREATE INDEX idx_content_schedule_channel ON content_schedule(channel_id);
CREATE INDEX idx_content_schedule_content ON content_schedule(content_id);
CREATE INDEX idx_content_schedule_status ON content_schedule(status);
CREATE INDEX idx_content_schedule_published_date ON content_schedule(published_date);

-- Trigger
CREATE TRIGGER update_content_schedule_updated_at
  BEFORE UPDATE ON content_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE content_schedule IS 'Calendar view: Links content to channels with scheduling. Flow: Content → Schedule → Published';
COMMENT ON COLUMN content_schedule.content_created_date IS 'When the content piece was first created (helps track content age)';
COMMENT ON COLUMN content_schedule.published_date IS 'Actual publication date/time (may differ from scheduled_date if rescheduled)';
COMMENT ON COLUMN content_schedule.published_at IS 'System timestamp when user clicked "Mark as Published"';

-- =====================================================
-- SECTION 8: KPI TRACKING
-- =====================================================

-- Social Media KPIs (Flexible JSONB Metrics)
CREATE TABLE IF NOT EXISTS social_media_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time Period
  metric_date DATE NOT NULL,
  week_start DATE,
  week_number INT,
  month_number INT,
  year INT,
  
  -- Channel
  channel_id UUID REFERENCES marketing_channels(id),
  
  -- Universal Metrics
  posts_published INT DEFAULT 0,
  
  -- Channel-Specific Metrics (stored as JSONB for flexibility)
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(metric_date, channel_id)
);

-- Indexes
CREATE INDEX idx_social_kpis_date ON social_media_kpis(metric_date);
CREATE INDEX idx_social_kpis_channel ON social_media_kpis(channel_id);
CREATE INDEX idx_social_kpis_week ON social_media_kpis(week_start);
CREATE INDEX idx_social_kpis_metrics ON social_media_kpis USING GIN(metrics);

-- Trigger
CREATE TRIGGER update_social_media_kpis_updated_at
  BEFORE UPDATE ON social_media_kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON COLUMN social_media_kpis.metrics IS 'Channel-specific metrics stored as JSON. Structure varies by platform/channel type.';

-- Platform KPIs (PoultryCo Platform Growth)
CREATE TABLE IF NOT EXISTS platform_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time Period
  metric_date DATE NOT NULL UNIQUE,
  week_number INT,
  month_number INT,
  year INT,
  
  -- User Growth
  total_users INT,
  new_signups INT DEFAULT 0,
  daily_active_users INT DEFAULT 0,
  weekly_active_users INT DEFAULT 0,
  
  -- Engagement
  posts_created INT DEFAULT 0,
  comments_created INT DEFAULT 0,
  connections_made INT DEFAULT 0,
  
  -- Segments (from stakeholder_segments)
  farmers_count INT DEFAULT 0,
  veterinarians_count INT DEFAULT 0,
  fpos_count INT DEFAULT 0,
  researchers_count INT DEFAULT 0,
  
  -- Newsletter
  email_subscribers INT DEFAULT 0,
  new_email_subscribers INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_platform_kpis_date ON platform_kpis(metric_date);

-- =====================================================
-- SECTION 9: HELPER VIEWS
-- =====================================================

-- View: Content Pillar Progress
CREATE OR REPLACE VIEW content_pillar_progress AS
SELECT 
  cp.id,
  cp.title,
  cp.status,
  cp.priority_score,
  ss.name as segment_name,
  ct.title as topic_title,
  -- Planned vs Created
  COALESCE(SUM(cpt.estimated_pieces), 0) as total_estimated_pieces,
  COALESCE(SUM(cpt.pieces_created), 0) as total_pieces_created,
  -- Progress percentage
  CASE 
    WHEN COALESCE(SUM(cpt.estimated_pieces), 0) > 0 THEN
      ROUND((COALESCE(SUM(cpt.pieces_created), 0)::decimal / SUM(cpt.estimated_pieces) * 100), 1)
    ELSE 0
  END as progress_percentage
FROM content_pillars cp
LEFT JOIN stakeholder_segments ss ON cp.segment_id = ss.id
LEFT JOIN content_topics ct ON cp.topic_id = ct.id
LEFT JOIN content_pillar_types cpt ON cp.id = cpt.pillar_id
GROUP BY cp.id, cp.title, cp.status, cp.priority_score, ss.name, ct.title;

-- View: Weekly Schedule Summary (Dynamic - NO duplication)
CREATE OR REPLACE VIEW weekly_schedule_summary AS
SELECT 
  DATE_TRUNC('week', scheduled_date)::date as week_start,
  EXTRACT(week FROM scheduled_date) as week_number,
  EXTRACT(year FROM scheduled_date) as year,
  COUNT(*) as total_scheduled,
  COUNT(*) FILTER (WHERE status = 'published') as published_count,
  COUNT(*) FILTER (WHERE status = 'scheduled') as pending_count,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
  SUM(views) as total_views,
  SUM(likes + comments + shares) as total_engagement
FROM content_schedule
GROUP BY week_start, week_number, year
ORDER BY week_start DESC;

-- View: Content by Mode and Type
CREATE OR REPLACE VIEW content_by_type AS
SELECT 
  c.content_mode,
  ct.name as content_type_name,
  ct.platform,
  COUNT(*) as content_count,
  COUNT(*) FILTER (WHERE c.status = 'published') as published_count,
  SUM(c.total_views) as total_views,
  SUM(c.total_likes + c.total_comments + c.total_shares) as total_engagement
FROM content c
JOIN content_types ct ON c.content_type_id = ct.id
GROUP BY c.content_mode, ct.name, ct.platform;

-- View: Content Topics by Segment
CREATE OR REPLACE VIEW topics_by_segment AS
SELECT 
  ss.name as segment_name,
  nc.name as ndp_category,
  COUNT(DISTINCT ct.id) as topic_count,
  AVG(ct.priority_score) as avg_priority
FROM stakeholder_segments ss
LEFT JOIN content_topic_segments cts ON ss.id = cts.segment_id
LEFT JOIN content_topics ct ON cts.topic_id = ct.id
LEFT JOIN ndp_categories nc ON ct.ndp_category_id = nc.id
WHERE ct.is_active = true
GROUP BY ss.name, nc.name;

-- =====================================================
-- SECTION 10: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE stakeholder_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ndp_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_topic_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillar_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pillar_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_kpis ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin full access to stakeholder_segments" ON stakeholder_segments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to ndp_categories" ON ndp_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to content_topics" ON content_topics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to content_topic_segments" ON content_topic_segments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to content_types" ON content_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to pillar_types" ON pillar_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to content_pillars" ON content_pillars
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to content_pillar_types" ON content_pillar_types
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to content_ideas" ON content_ideas
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to content" ON content
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to marketing_channels" ON marketing_channels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to content_schedule" ON content_schedule
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to social_media_kpis" ON social_media_kpis
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

CREATE POLICY "Admin full access to platform_kpis" ON platform_kpis
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

-- =====================================================
-- COMPLETE
-- =====================================================
-- Schema 54: Marketing System Complete (FINALIZED)
-- Tables: 13 main tables + 2 mapping tables
-- Views: 4 (dynamic, no duplication)
-- Lookup Tables: ndp_categories, content_types, pillar_types, stakeholder_segments
-- Seed Data: 11 stakeholder segments, 6 NDP categories, 24 content types, 6 pillar types
-- Key Features: Unified content table (master + repurposed), SEO backlinks, simplified 2-level flow
-- =====================================================
