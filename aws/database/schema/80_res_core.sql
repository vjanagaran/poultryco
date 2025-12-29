-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 80_res_core.sql
-- Description: Resources system (guides, articles, videos)
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql
-- =====================================================

-- =====================================================
-- SECTION 1: RESOURCE CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS res_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Category details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Hierarchy
  parent_category_id UUID REFERENCES res_categories(id) ON DELETE SET NULL,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_res_categories_slug ON res_categories(slug);
CREATE INDEX idx_res_categories_parent ON res_categories(parent_category_id);
CREATE INDEX idx_res_categories_active ON res_categories(is_active) WHERE is_active = true;

CREATE TRIGGER update_res_categories_updated_at
  BEFORE UPDATE ON res_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: RESOURCES
-- =====================================================

CREATE TABLE IF NOT EXISTS res_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Author
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT CHECK (char_length(description) <= 500),
  content TEXT,
  
  -- Type
  resource_type TEXT NOT NULL CHECK (resource_type IN ('article', 'guide', 'video', 'infographic', 'document', 'tool')),
  
  -- Category
  category_id UUID REFERENCES res_categories(id),
  
  -- Media
  featured_image_url TEXT,
  video_url TEXT,
  document_url TEXT,
  
  -- Metadata
  tags TEXT[],
  reading_time_minutes INTEGER,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  
  -- Stats (denormalized)
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  bookmarks_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_res_resources_author ON res_resources(author_id);
CREATE INDEX idx_res_resources_slug ON res_resources(slug);
CREATE INDEX idx_res_resources_category ON res_resources(category_id);
CREATE INDEX idx_res_resources_type ON res_resources(resource_type);
CREATE INDEX idx_res_resources_status ON res_resources(status);
CREATE INDEX idx_res_resources_published ON res_resources(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_res_resources_views ON res_resources(views_count DESC);

-- Full-text search
CREATE INDEX idx_res_resources_search ON res_resources USING gin(
  to_tsvector('english',
    title || ' ' ||
    COALESCE(description, '') || ' ' ||
    COALESCE(content, '')
  )
);

CREATE TRIGGER update_res_resources_updated_at
  BEFORE UPDATE ON res_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: RESOURCE LIKES
-- =====================================================

CREATE TABLE IF NOT EXISTS res_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES res_resources(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(resource_id, profile_id)
);

CREATE INDEX idx_res_likes_resource ON res_likes(resource_id);
CREATE INDEX idx_res_likes_profile ON res_likes(profile_id);

-- =====================================================
-- SECTION 4: RESOURCE BOOKMARKS
-- =====================================================

CREATE TABLE IF NOT EXISTS res_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES res_resources(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Collection
  collection_name TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(resource_id, profile_id)
);

CREATE INDEX idx_res_bookmarks_resource ON res_bookmarks(resource_id);
CREATE INDEX idx_res_bookmarks_profile ON res_bookmarks(profile_id, created_at DESC);
CREATE INDEX idx_res_bookmarks_collection ON res_bookmarks(profile_id, collection_name);

-- =====================================================
-- SECTION 5: RESOURCE VIEWS
-- =====================================================

CREATE TABLE IF NOT EXISTS res_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES res_resources(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Session
  session_id TEXT,
  
  -- Metadata
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_res_views_resource ON res_views(resource_id);
CREATE INDEX idx_res_views_profile ON res_views(profile_id);
CREATE INDEX idx_res_views_created ON res_views(created_at DESC);

-- =====================================================
-- SECTION 6: RESOURCE COMMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS res_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES res_resources(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Comment content
  content TEXT NOT NULL CHECK (char_length(content) <= 1000),
  
  -- Threading
  parent_comment_id UUID REFERENCES res_comments(id) ON DELETE CASCADE,
  
  -- Engagement
  likes_count INTEGER NOT NULL DEFAULT 0,
  
  -- Moderation
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_res_comments_resource ON res_comments(resource_id, created_at DESC);
CREATE INDEX idx_res_comments_profile ON res_comments(profile_id);
CREATE INDEX idx_res_comments_parent ON res_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_res_comments_active ON res_comments(is_deleted) WHERE is_deleted = false;

CREATE TRIGGER update_res_comments_updated_at
  BEFORE UPDATE ON res_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 7: HELPER FUNCTIONS
-- =====================================================

-- Update resource likes count
CREATE OR REPLACE FUNCTION update_resource_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE res_resources SET likes_count = likes_count + 1 WHERE id = NEW.resource_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE res_resources SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.resource_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_resource_likes_count
  AFTER INSERT OR DELETE ON res_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_likes_count();

-- Update resource bookmarks count
CREATE OR REPLACE FUNCTION update_resource_bookmarks_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE res_resources SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.resource_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE res_resources SET bookmarks_count = GREATEST(bookmarks_count - 1, 0) WHERE id = OLD.resource_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_resource_bookmarks_count
  AFTER INSERT OR DELETE ON res_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_bookmarks_count();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE res_categories IS 'Resource categories';
COMMENT ON TABLE res_resources IS 'Resources (articles, guides, videos, etc.)';
COMMENT ON TABLE res_likes IS 'Resource likes';
COMMENT ON TABLE res_bookmarks IS 'Resource bookmarks';
COMMENT ON TABLE res_views IS 'Resource views for analytics';
COMMENT ON TABLE res_comments IS 'Resource comments';

