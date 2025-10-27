-- =====================================================
-- Feedback Management System with AI-Powered Insights
-- =====================================================

-- Feedback Categories
CREATE TABLE IF NOT EXISTS feedback_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES feedback_categories(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default categories
INSERT INTO feedback_categories (name, description, icon, sort_order) VALUES
  ('Feature Request', 'Suggestions for new features or improvements', '💡', 1),
  ('Bug Report', 'Report technical issues or errors', '🐛', 2),
  ('User Experience', 'Feedback about usability and design', '🎨', 3),
  ('Performance', 'Issues related to speed or performance', '⚡', 4),
  ('Content', 'Feedback about content quality or moderation', '📝', 5),
  ('Mobile App', 'Mobile-specific feedback', '📱', 6),
  ('Integration', 'Third-party integration requests', '🔗', 7),
  ('Other', 'General feedback and suggestions', '💭', 8)
ON CONFLICT (name) DO NOTHING;

-- Feedback Submissions
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Submitter
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  
  -- Feedback Content
  category_id UUID REFERENCES feedback_categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Context
  page_url TEXT,
  user_agent TEXT,
  device_type TEXT,
  app_version TEXT,
  
  -- AI Analysis (populated by backend)
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  sentiment_label TEXT CHECK (sentiment_label IN ('positive', 'neutral', 'negative', 'mixed')),
  
  -- Priority & Status
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new',
    'in_review',
    'acknowledged',
    'in_progress',
    'resolved',
    'declined',
    'duplicate'
  )),
  
  -- Resolution
  resolution_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  
  -- Engagement
  is_public BOOLEAN NOT NULL DEFAULT false,
  allow_contact BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback Tags (AI-generated and manual)
CREATE TABLE IF NOT EXISTS feedback_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('feature', 'issue', 'theme', 'component', 'emotion')),
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_auto_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback Tag Relations
CREATE TABLE IF NOT EXISTS feedback_tag_relations (
  feedback_id UUID NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES feedback_tags(id) ON DELETE CASCADE,
  confidence_score DECIMAL(3,2) DEFAULT 1.0, -- For AI-generated tags
  is_manual BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (feedback_id, tag_id)
);

-- Feedback Comments (internal notes)
CREATE TABLE IF NOT EXISTS feedback_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback Attachments
CREATE TABLE IF NOT EXISTS feedback_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Insights Summary (aggregated insights)
CREATE TABLE IF NOT EXISTS feedback_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Time Period
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Summary Stats
  total_feedback INTEGER NOT NULL DEFAULT 0,
  positive_count INTEGER NOT NULL DEFAULT 0,
  neutral_count INTEGER NOT NULL DEFAULT 0,
  negative_count INTEGER NOT NULL DEFAULT 0,
  
  -- Category Breakdown (JSONB)
  category_stats JSONB DEFAULT '{}',
  /* Example:
  {
    "Feature Request": {"count": 45, "sentiment": 0.7},
    "Bug Report": {"count": 23, "sentiment": -0.3}
  }
  */
  
  -- Top Issues/Themes (JSONB)
  top_themes JSONB DEFAULT '[]',
  /* Example:
  [
    {"theme": "Mobile Performance", "count": 15, "sentiment": -0.5},
    {"theme": "Profile Completion", "count": 12, "sentiment": 0.2}
  ]
  */
  
  -- Trending Topics (compared to previous period)
  trending_up JSONB DEFAULT '[]',
  trending_down JSONB DEFAULT '[]',
  
  -- Key Insights (AI-generated summary)
  executive_summary TEXT,
  action_recommendations TEXT[],
  
  -- Timestamps
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(period_type, period_start)
);

-- Feedback Response Templates
CREATE TABLE IF NOT EXISTS feedback_response_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES feedback_categories(id),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[],
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Feedback Stats (for gamification/recognition)
CREATE TABLE IF NOT EXISTS user_feedback_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_submissions INTEGER NOT NULL DEFAULT 0,
  helpful_submissions INTEGER NOT NULL DEFAULT 0,
  implemented_suggestions INTEGER NOT NULL DEFAULT 0,
  quality_score DECIMAL(3,2) DEFAULT 0,
  last_submission_at TIMESTAMPTZ,
  badges TEXT[] DEFAULT '{}' -- ['early_adopter', 'bug_hunter', 'idea_machine']
);

-- Feedback Workflows
CREATE TABLE IF NOT EXISTS feedback_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  due_date DATE,
  workflow_status TEXT NOT NULL DEFAULT 'pending' CHECK (workflow_status IN (
    'pending',
    'assigned',
    'investigating',
    'implementing',
    'testing',
    'completed'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_feedback_submissions_user ON feedback_submissions(user_id);
CREATE INDEX idx_feedback_submissions_category ON feedback_submissions(category_id);
CREATE INDEX idx_feedback_submissions_status ON feedback_submissions(status);
CREATE INDEX idx_feedback_submissions_priority ON feedback_submissions(priority);
CREATE INDEX idx_feedback_submissions_created ON feedback_submissions(created_at DESC);
CREATE INDEX idx_feedback_submissions_sentiment ON feedback_submissions(sentiment_label);

CREATE INDEX idx_feedback_tags_type ON feedback_tags(type);
CREATE INDEX idx_feedback_tags_usage ON feedback_tags(usage_count DESC);

CREATE INDEX idx_feedback_tag_relations_feedback ON feedback_tag_relations(feedback_id);
CREATE INDEX idx_feedback_tag_relations_tag ON feedback_tag_relations(tag_id);

CREATE INDEX idx_feedback_comments_feedback ON feedback_comments(feedback_id);

CREATE INDEX idx_feedback_insights_period ON feedback_insights(period_type, period_start);

CREATE INDEX idx_feedback_workflows_feedback ON feedback_workflows(feedback_id);
CREATE INDEX idx_feedback_workflows_assigned ON feedback_workflows(assigned_to);

-- Full-text search
CREATE INDEX idx_feedback_search ON feedback_submissions 
  USING gin(to_tsvector('english', title || ' ' || description));

-- RLS Policies
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_workflows ENABLE ROW LEVEL SECURITY;

-- Users can create and view their own feedback
CREATE POLICY "Users can create feedback" ON feedback_submissions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own feedback" ON feedback_submissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_public = true);

-- Admins can do everything
CREATE POLICY "Admins can manage all feedback" ON feedback_submissions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND email IN ('admin@poultryco.in', 'vjanagaran@gmail.com')
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feedback_updated_at
  BEFORE UPDATE ON feedback_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();
