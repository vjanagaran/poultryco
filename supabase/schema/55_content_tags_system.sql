-- ============================================
-- MIGRATION: Content Tags System
-- File: 55_content_tags_system.sql
-- Purpose: Flexible taxonomy for cross-categorization
-- Dependencies: 54_marketing_system.sql
-- ============================================

-- ============================================
-- CONTENT TAGS (Flexible Taxonomy)
-- ============================================

CREATE TABLE content_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6366F1', -- Hex color for UI badges
  description TEXT,
  
  -- Usage stats
  usage_count INT DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_content_tags_name ON content_tags(name);
CREATE INDEX idx_content_tags_slug ON content_tags(slug);

COMMENT ON TABLE content_tags IS 'Flexible tagging system for cross-categorization of content and pillars';
COMMENT ON COLUMN content_tags.color IS 'Hex color code for UI badge display';
COMMENT ON COLUMN content_tags.usage_count IS 'Automatically updated count of content and pillars using this tag';

-- ============================================
-- CONTENT TAG ASSIGNMENTS (Many-to-Many)
-- ============================================

-- Content <-> Tags
CREATE TABLE content_tag_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES content_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, tag_id)
);

CREATE INDEX idx_content_tags_content ON content_tag_assignments(content_id);
CREATE INDEX idx_content_tags_tag ON content_tag_assignments(tag_id);

COMMENT ON TABLE content_tag_assignments IS 'Many-to-many relationship: Content pieces can have multiple tags';

-- Pillar <-> Tags
CREATE TABLE pillar_tag_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pillar_id UUID REFERENCES content_pillars(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES content_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pillar_id, tag_id)
);

CREATE INDEX idx_pillar_tags_pillar ON pillar_tag_assignments(pillar_id);
CREATE INDEX idx_pillar_tags_tag ON pillar_tag_assignments(tag_id);

COMMENT ON TABLE pillar_tag_assignments IS 'Many-to-many relationship: Pillars can have multiple tags';

-- ============================================
-- AUTOMATIC USAGE COUNT TRACKING
-- ============================================

CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
DECLARE
  tag_uuid UUID;
BEGIN
  -- Get the tag_id from either NEW or OLD record
  tag_uuid := COALESCE(NEW.tag_id, OLD.tag_id);
  
  -- Update usage count by counting assignments in both tables
  UPDATE content_tags 
  SET 
    usage_count = (
      SELECT COUNT(*) FROM content_tag_assignments WHERE tag_id = tag_uuid
    ) + (
      SELECT COUNT(*) FROM pillar_tag_assignments WHERE tag_id = tag_uuid
    ),
    updated_at = NOW()
  WHERE id = tag_uuid;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for content tag assignments
CREATE TRIGGER tag_usage_counter_content
AFTER INSERT OR DELETE ON content_tag_assignments
FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Trigger for pillar tag assignments
CREATE TRIGGER tag_usage_counter_pillar
AFTER INSERT OR DELETE ON pillar_tag_assignments
FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

COMMENT ON FUNCTION update_tag_usage_count IS 'Automatically updates usage_count when tags are assigned or removed';

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View: Content with all tags
CREATE VIEW content_with_tags AS
SELECT 
  c.id as content_id,
  c.title,
  c.content_mode,
  c.status,
  ARRAY_AGG(DISTINCT ct.name) FILTER (WHERE ct.name IS NOT NULL) as tag_names,
  ARRAY_AGG(DISTINCT ct.id) FILTER (WHERE ct.id IS NOT NULL) as tag_ids
FROM content c
LEFT JOIN content_tag_assignments cta ON c.id = cta.content_id
LEFT JOIN content_tags ct ON cta.tag_id = ct.id
GROUP BY c.id;

COMMENT ON VIEW content_with_tags IS 'Content pieces with aggregated tag information for easy querying';

-- View: Pillars with all tags
CREATE VIEW pillars_with_tags AS
SELECT 
  p.id as pillar_id,
  p.title,
  p.status,
  ARRAY_AGG(DISTINCT ct.name) FILTER (WHERE ct.name IS NOT NULL) as tag_names,
  ARRAY_AGG(DISTINCT ct.id) FILTER (WHERE ct.id IS NOT NULL) as tag_ids
FROM content_pillars p
LEFT JOIN pillar_tag_assignments pta ON p.id = pta.pillar_id
LEFT JOIN content_tags ct ON pta.tag_id = ct.id
GROUP BY p.id;

COMMENT ON VIEW pillars_with_tags IS 'Pillars with aggregated tag information for easy querying';

-- View: Popular tags (most used)
CREATE VIEW popular_tags AS
SELECT 
  ct.*,
  (
    SELECT COUNT(*) FROM content_tag_assignments WHERE tag_id = ct.id
  ) as content_count,
  (
    SELECT COUNT(*) FROM pillar_tag_assignments WHERE tag_id = ct.id
  ) as pillar_count
FROM content_tags ct
WHERE ct.usage_count > 0
ORDER BY ct.usage_count DESC;

COMMENT ON VIEW popular_tags IS 'Tags sorted by usage frequency for analytics and UI suggestions';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillar_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Policies: Admin users only (same as other marketing tables)
CREATE POLICY "Admin users can manage tags"
  ON content_tags
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Admin users can assign content tags"
  ON content_tag_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Admin users can assign pillar tags"
  ON pillar_tag_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO content_tags (name, slug, color, description) VALUES
  ('Urgent', 'urgent', '#EF4444', 'Time-sensitive content requiring immediate attention'),
  ('Evergreen', 'evergreen', '#10B981', 'Timeless content that stays relevant year-round'),
  ('Seasonal', 'seasonal', '#F59E0B', 'Season-specific content (monsoon, summer, winter)'),
  ('PTSE-2026', 'ptse-2026', '#8B5CF6', 'Content for PTSE platform launch campaign'),
  ('Monsoon-Prep', 'monsoon-prep', '#3B82F6', 'Monsoon preparation and management series'),
  ('Cost-Saving', 'cost-saving', '#14B8A6', 'Content focused on cost reduction strategies'),
  ('Biosecurity', 'biosecurity', '#EC4899', 'Biosecurity and disease prevention topics'),
  ('Tamil-Content', 'tamil-content', '#F97316', 'Content written in Tamil language'),
  ('Telugu-Content', 'telugu-content', '#F59E0B', 'Content written in Telugu language'),
  ('Hindi-Content', 'hindi-content', '#84CC16', 'Content written in Hindi language'),
  ('Beginner-Friendly', 'beginner-friendly', '#06B6D4', 'Easy-to-understand content for new farmers'),
  ('Advanced', 'advanced', '#A855F7', 'Advanced technical content for experienced professionals'),
  ('Data-Driven', 'data-driven', '#6366F1', 'Content with research data and statistics'),
  ('Case-Study', 'case-study', '#EAB308', 'Real-world case studies and success stories'),
  ('How-To', 'how-to', '#22C55E', 'Step-by-step instructional content'),
  ('Video-Content', 'video-content', '#F43F5E', 'Video or reel script content'),
  ('Infographic', 'infographic', '#8B5CF6', 'Visual/infographic content'),
  ('Newsletter', 'newsletter', '#0EA5E9', 'Newsletter-specific content');

-- ============================================
-- EXAMPLE QUERIES
-- ============================================

/*
-- Find all urgent content
SELECT * FROM content_with_tags 
WHERE 'Urgent' = ANY(tag_names);

-- Find content tagged with both 'Biosecurity' AND 'Cost-Saving'
SELECT * FROM content_with_tags 
WHERE tag_names @> ARRAY['Biosecurity', 'Cost-Saving'];

-- Get all content for PTSE 2026 campaign
SELECT c.* 
FROM content c
JOIN content_tag_assignments cta ON c.id = cta.content_id
JOIN content_tags ct ON cta.tag_id = ct.id
WHERE ct.slug = 'ptse-2026';

-- Find most used tags
SELECT * FROM popular_tags LIMIT 10;

-- Tag a content piece
INSERT INTO content_tag_assignments (content_id, tag_id)
VALUES 
  ('content-uuid-here', (SELECT id FROM content_tags WHERE slug = 'urgent')),
  ('content-uuid-here', (SELECT id FROM content_tags WHERE slug = 'biosecurity'));

-- Tag a pillar
INSERT INTO pillar_tag_assignments (pillar_id, tag_id)
VALUES 
  ('pillar-uuid-here', (SELECT id FROM content_tags WHERE slug = 'ptse-2026'));
*/

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify tables created
DO $$
BEGIN
  RAISE NOTICE 'Content Tags System migration completed successfully!';
  RAISE NOTICE 'Created tables: content_tags, content_tag_assignments, pillar_tag_assignments';
  RAISE NOTICE 'Created views: content_with_tags, pillars_with_tags, popular_tags';
  RAISE NOTICE 'Seeded % tags', (SELECT COUNT(*) FROM content_tags);
END $$;
