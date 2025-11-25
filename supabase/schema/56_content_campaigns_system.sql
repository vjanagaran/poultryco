-- ============================================
-- MIGRATION: Content Campaigns System
-- File: 56_content_campaigns_system.sql
-- Purpose: Group related content for coordinated launches
-- Dependencies: 54_marketing_system.sql
-- ============================================

-- ============================================
-- CONTENT CAMPAIGNS
-- ============================================

CREATE TABLE content_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  
  -- Goals & Tracking
  target_pieces INT DEFAULT 0, -- How many content pieces planned
  target_reach INT, -- Expected total reach across all channels
  target_engagement INT, -- Expected total engagement
  budget DECIMAL(10,2), -- Optional: campaign budget
  
  -- Visual Identity
  color TEXT DEFAULT '#6366F1', -- For calendar color-coding
  icon TEXT, -- Emoji or icon name for UI display
  
  -- Status
  status TEXT DEFAULT 'planning',
  -- Enum: planning, active, completed, archived
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CHECK (status IN ('planning', 'active', 'completed', 'archived')),
  CHECK (target_pieces >= 0),
  CHECK (start_date IS NULL OR end_date IS NULL OR start_date <= end_date)
);

CREATE INDEX idx_campaigns_status ON content_campaigns(status);
CREATE INDEX idx_campaigns_dates ON content_campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_slug ON content_campaigns(slug);

COMMENT ON TABLE content_campaigns IS 'Marketing campaigns that group related content across multiple pillars';
COMMENT ON COLUMN content_campaigns.target_pieces IS 'Number of content pieces planned for this campaign';
COMMENT ON COLUMN content_campaigns.color IS 'Hex color code for calendar and UI display';
COMMENT ON COLUMN content_campaigns.icon IS 'Emoji or icon identifier for visual recognition';

-- ============================================
-- CAMPAIGN ASSIGNMENTS (Many-to-Many)
-- ============================================

-- Content <-> Campaigns
CREATE TABLE content_campaign_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES content_campaigns(id) ON DELETE CASCADE,
  
  -- Optional: specific role of this content in campaign
  content_role TEXT, -- 'hero', 'supporting', 'amplification', 'follow-up'
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(content_id, campaign_id)
);

CREATE INDEX idx_content_campaigns_content ON content_campaign_assignments(content_id);
CREATE INDEX idx_content_campaigns_campaign ON content_campaign_assignments(campaign_id);

COMMENT ON TABLE content_campaign_assignments IS 'Many-to-many: Content can belong to multiple campaigns';
COMMENT ON COLUMN content_campaign_assignments.content_role IS 'Optional categorization of content within campaign (hero, supporting, etc.)';

-- Pillar <-> Campaigns
CREATE TABLE pillar_campaign_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pillar_id UUID REFERENCES content_pillars(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES content_campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(pillar_id, campaign_id)
);

CREATE INDEX idx_pillar_campaigns_pillar ON pillar_campaign_assignments(pillar_id);
CREATE INDEX idx_pillar_campaigns_campaign ON pillar_campaign_assignments(campaign_id);

COMMENT ON TABLE pillar_campaign_assignments IS 'Many-to-many: Pillars can be part of multiple campaigns';

-- ============================================
-- CAMPAIGN PERFORMANCE VIEW
-- ============================================

CREATE VIEW campaign_performance AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.status,
  c.start_date,
  c.end_date,
  c.target_pieces,
  c.target_reach,
  c.target_engagement,
  c.color,
  c.icon,
  
  -- Content Counts
  COUNT(DISTINCT cca.content_id) as pieces_created,
  COUNT(DISTINCT CASE WHEN co.status = 'published' THEN cca.content_id END) as pieces_published,
  COUNT(DISTINCT CASE WHEN co.status = 'draft' THEN cca.content_id END) as pieces_draft,
  COUNT(DISTINCT CASE WHEN co.status = 'in_review' THEN cca.content_id END) as pieces_in_review,
  
  -- Pillar Counts
  COUNT(DISTINCT pca.pillar_id) as pillars_linked,
  
  -- Performance Metrics (from published content schedule)
  COALESCE(SUM(cs.views), 0) as total_views,
  COALESCE(SUM(cs.likes), 0) as total_likes,
  COALESCE(SUM(cs.comments), 0) as total_comments,
  COALESCE(SUM(cs.shares), 0) as total_shares,
  COALESCE(SUM(cs.likes + cs.comments + cs.shares), 0) as total_engagement,
  COALESCE(SUM(cs.clicks), 0) as total_clicks,
  
  -- Progress Calculations
  CASE 
    WHEN c.target_pieces > 0 
    THEN ROUND((COUNT(DISTINCT cca.content_id)::DECIMAL / c.target_pieces) * 100, 1)
    ELSE 0 
  END as pieces_progress_pct,
  
  CASE 
    WHEN c.target_reach > 0 
    THEN ROUND((COALESCE(SUM(cs.views), 0)::DECIMAL / c.target_reach) * 100, 1)
    ELSE 0 
  END as reach_progress_pct,
  
  CASE 
    WHEN c.target_engagement > 0 
    THEN ROUND((COALESCE(SUM(cs.likes + cs.comments + cs.shares), 0)::DECIMAL / c.target_engagement) * 100, 1)
    ELSE 0 
  END as engagement_progress_pct,
  
  -- Timeline Progress
  CASE 
    WHEN c.start_date IS NOT NULL AND c.end_date IS NOT NULL THEN
      CASE 
        WHEN CURRENT_DATE < c.start_date THEN 'not_started'
        WHEN CURRENT_DATE > c.end_date THEN 'ended'
        ELSE 'active'
      END
    ELSE NULL
  END as timeline_status,
  
  -- Days calculation
  CASE 
    WHEN c.start_date IS NOT NULL AND c.end_date IS NOT NULL THEN
      CASE 
        WHEN CURRENT_DATE < c.start_date THEN c.start_date - CURRENT_DATE
        WHEN CURRENT_DATE > c.end_date THEN 0
        ELSE c.end_date - CURRENT_DATE
      END
    ELSE NULL
  END as days_remaining

FROM content_campaigns c
LEFT JOIN content_campaign_assignments cca ON c.id = cca.campaign_id
LEFT JOIN content co ON cca.content_id = co.id
LEFT JOIN pillar_campaign_assignments pca ON c.id = pca.campaign_id
LEFT JOIN content_schedule cs ON cca.content_id = cs.content_id AND cs.status = 'published'
GROUP BY c.id;

COMMENT ON VIEW campaign_performance IS 'Real-time campaign metrics, progress tracking, and performance analytics';

-- ============================================
-- CAMPAIGN CONTENT SUMMARY VIEW
-- ============================================

CREATE VIEW campaign_content_summary AS
SELECT 
  cc.id as campaign_id,
  cc.name as campaign_name,
  c.id as content_id,
  c.title,
  c.content_mode,
  c.status,
  ct.name as content_type,
  cs.scheduled_date,
  cs.status as schedule_status,
  cs.views,
  cs.likes,
  cs.comments,
  cs.shares,
  (cs.likes + cs.comments + cs.shares) as total_engagement,
  mc.platform,
  mc.name as channel_name
FROM content_campaigns cc
JOIN content_campaign_assignments cca ON cc.id = cca.campaign_id
JOIN content c ON cca.content_id = c.id
LEFT JOIN content_types ct ON c.content_type_id = ct.id
LEFT JOIN content_schedule cs ON c.id = cs.content_id
LEFT JOIN marketing_channels mc ON cs.channel_id = mc.id;

COMMENT ON VIEW campaign_content_summary IS 'Detailed view of all content within each campaign with scheduling and performance data';

-- ============================================
-- ACTIVE CAMPAIGNS VIEW
-- ============================================

CREATE VIEW active_campaigns AS
SELECT 
  cp.*
FROM campaign_performance cp
WHERE cp.status = 'active'
  OR (
    cp.start_date IS NOT NULL 
    AND cp.end_date IS NOT NULL
    AND CURRENT_DATE BETWEEN cp.start_date AND cp.end_date
  )
ORDER BY cp.start_date ASC;

COMMENT ON VIEW active_campaigns IS 'Currently active campaigns based on status and date range';

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE content_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_campaign_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillar_campaign_assignments ENABLE ROW LEVEL SECURITY;

-- Policies: Admin users only
CREATE POLICY "Admin users can manage campaigns"
  ON content_campaigns
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Admin users can assign content to campaigns"
  ON content_campaign_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Admin users can assign pillars to campaigns"
  ON pillar_campaign_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get campaign health status
CREATE OR REPLACE FUNCTION get_campaign_health(campaign_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  campaign_data RECORD;
  health_status TEXT;
BEGIN
  SELECT * INTO campaign_data FROM campaign_performance WHERE id = campaign_uuid;
  
  IF NOT FOUND THEN
    RETURN 'not_found';
  END IF;
  
  -- Calculate health based on progress
  IF campaign_data.pieces_progress_pct >= 90 THEN
    health_status := 'excellent';
  ELSIF campaign_data.pieces_progress_pct >= 70 THEN
    health_status := 'good';
  ELSIF campaign_data.pieces_progress_pct >= 50 THEN
    health_status := 'fair';
  ELSIF campaign_data.pieces_progress_pct >= 25 THEN
    health_status := 'needs_attention';
  ELSE
    health_status := 'critical';
  END IF;
  
  RETURN health_status;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_campaign_health IS 'Returns health status of a campaign based on progress metrics';

-- ============================================
-- SEED DATA
-- ============================================

INSERT INTO content_campaigns (name, slug, description, start_date, end_date, target_pieces, target_reach, target_engagement, color, icon, status) VALUES
  (
    'PTSE 2026 Launch',
    'ptse-2026-launch',
    'Platform launch campaign for PoultryTech Summit & Expo March 2026. Comprehensive content series introducing PoultryCo to the poultry industry.',
    '2026-02-01',
    '2026-03-31',
    50,
    100000,
    5000,
    '#8B5CF6',
    '🚀',
    'planning'
  ),
  (
    'Monsoon Preparation Series',
    'monsoon-prep-2026',
    'Educational content series for monsoon season preparation. Focus on disease prevention, biosecurity, and flock management during heavy rains.',
    '2026-05-01',
    '2026-07-31',
    30,
    50000,
    2500,
    '#3B82F6',
    '🌧️',
    'planning'
  ),
  (
    'Farmer Onboarding Week 1',
    'farmer-onboarding-w1',
    'Welcome content sequence for new farmer members. Platform introduction, community guidelines, and initial value demonstration.',
    '2026-03-01',
    '2026-03-07',
    15,
    10000,
    1000,
    '#10B981',
    '👋',
    'planning'
  ),
  (
    'Cost Optimization Series',
    'cost-optimization-2026',
    'Multi-part content series focused on cost reduction strategies for independent farmers. Feed management, energy efficiency, and waste reduction.',
    '2026-04-01',
    '2026-06-30',
    25,
    40000,
    2000,
    '#14B8A6',
    '💰',
    'planning'
  ),
  (
    'Biosecurity Month',
    'biosecurity-month-2026',
    'Dedicated month-long campaign on biosecurity best practices. Disease prevention, visitor protocols, and farm hygiene standards.',
    '2026-08-01',
    '2026-08-31',
    20,
    30000,
    1500,
    '#EC4899',
    '🛡️',
    'planning'
  );

-- ============================================
-- EXAMPLE QUERIES
-- ============================================

/*
-- Get all campaigns with performance metrics
SELECT * FROM campaign_performance 
ORDER BY start_date DESC;

-- Get active campaigns
SELECT * FROM active_campaigns;

-- Get campaign health
SELECT 
  name, 
  get_campaign_health(id) as health,
  pieces_progress_pct,
  reach_progress_pct,
  engagement_progress_pct
FROM campaign_performance;

-- Get all content in a campaign
SELECT * FROM campaign_content_summary
WHERE campaign_id = 'campaign-uuid-here'
ORDER BY scheduled_date;

-- Assign content to campaign
INSERT INTO content_campaign_assignments (content_id, campaign_id, content_role)
VALUES ('content-uuid', 'campaign-uuid', 'hero');

-- Assign pillar to campaign
INSERT INTO pillar_campaign_assignments (pillar_id, campaign_id)
VALUES ('pillar-uuid', 'campaign-uuid');

-- Find campaigns behind schedule
SELECT 
  name,
  pieces_created,
  target_pieces,
  pieces_progress_pct,
  days_remaining
FROM campaign_performance
WHERE status = 'active'
  AND pieces_progress_pct < 50
  AND days_remaining < 30;

-- Campaign ROI analysis (views per piece)
SELECT 
  name,
  pieces_published,
  total_views,
  CASE 
    WHEN pieces_published > 0 
    THEN ROUND(total_views::DECIMAL / pieces_published, 0)
    ELSE 0 
  END as avg_views_per_piece,
  total_engagement,
  CASE 
    WHEN pieces_published > 0 
    THEN ROUND(total_engagement::DECIMAL / pieces_published, 0)
    ELSE 0 
  END as avg_engagement_per_piece
FROM campaign_performance
WHERE status IN ('active', 'completed')
ORDER BY avg_views_per_piece DESC;
*/

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Content Campaigns System migration completed successfully!';
  RAISE NOTICE 'Created tables: content_campaigns, content_campaign_assignments, pillar_campaign_assignments';
  RAISE NOTICE 'Created views: campaign_performance, campaign_content_summary, active_campaigns';
  RAISE NOTICE 'Created function: get_campaign_health()';
  RAISE NOTICE 'Seeded % campaigns', (SELECT COUNT(*) FROM content_campaigns);
END $$;
