-- =====================================================
-- Email Queue and Nurturing Campaign System
-- =====================================================

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template Info
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  description TEXT,
  
  -- Template Content (supports variables like {{full_name}}, {{profile_strength}})
  html_body TEXT NOT NULL,
  text_body TEXT NOT NULL,
  
  -- Template Type
  category TEXT NOT NULL CHECK (category IN (
    'welcome',           -- New user welcome series
    'onboarding',       -- Profile completion
    'engagement',       -- Activity encouragement
    'retention',        -- Win-back campaigns
    'network',          -- Connection suggestions
    'content',          -- Content creation prompts
    'achievement',      -- Milestone celebrations
    'educational',      -- How-to guides
    'event',           -- Event invitations
    'digest',          -- Weekly/monthly summaries
    'system'           -- System notifications
  )),
  
  -- Targeting
  min_profile_strength INTEGER,
  max_profile_strength INTEGER,
  user_segment TEXT[], -- ['new', 'inactive', 'active', 'power']
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Analytics
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_opened INTEGER NOT NULL DEFAULT 0,
  total_clicked INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Campaign Info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Campaign Type
  type TEXT NOT NULL CHECK (type IN (
    'drip',              -- Time-based sequence
    'behavioral',        -- Action-triggered
    'milestone',         -- Achievement-based
    're-engagement',     -- Win-back inactive
    'educational',       -- Learning series
    'promotional'        -- Feature announcements
  )),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),
  
  -- Targeting Rules (JSONB for flexibility)
  targeting_rules JSONB NOT NULL DEFAULT '{}',
  /* Example:
  {
    "user_segments": ["new", "inactive"],
    "profile_strength": {"min": 0, "max": 50},
    "days_since_signup": {"min": 3, "max": 30},
    "days_inactive": {"min": 7},
    "has_connections": false,
    "has_posts": false,
    "location_states": ["Maharashtra", "Karnataka"]
  }
  */
  
  -- Schedule
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  
  -- Analytics
  total_recipients INTEGER NOT NULL DEFAULT 0,
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_opened INTEGER NOT NULL DEFAULT 0,
  total_clicked INTEGER NOT NULL DEFAULT 0,
  total_unsubscribed INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaign Steps (for drip campaigns)
CREATE TABLE IF NOT EXISTS campaign_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  
  -- Step Info
  step_number INTEGER NOT NULL,
  template_id UUID NOT NULL REFERENCES email_templates(id),
  
  -- Timing
  delay_days INTEGER NOT NULL DEFAULT 0, -- Days after previous step
  delay_hours INTEGER NOT NULL DEFAULT 0,
  send_time TIME, -- Preferred send time
  
  -- Conditions (JSONB for flexibility)
  conditions JSONB DEFAULT '{}',
  /* Example:
  {
    "profile_completed": false,
    "has_logged_in": true,
    "min_connections": 0
  }
  */
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  UNIQUE(campaign_id, step_number)
);

-- Email Queue
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  
  -- Email Content
  template_id UUID REFERENCES email_templates(id),
  campaign_id UUID REFERENCES email_campaigns(id),
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT NOT NULL,
  
  -- Personalization Data
  personalization_data JSONB DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'sending',
    'sent',
    'failed',
    'bounced',
    'opened',
    'clicked'
  )),
  
  -- Priority
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  
  -- Schedule
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Attempts
  send_attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Tracking
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Email Preferences
CREATE TABLE IF NOT EXISTS user_email_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Global Settings
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Category Preferences
  welcome_emails BOOLEAN NOT NULL DEFAULT true,
  onboarding_emails BOOLEAN NOT NULL DEFAULT true,
  engagement_emails BOOLEAN NOT NULL DEFAULT true,
  network_emails BOOLEAN NOT NULL DEFAULT true,
  achievement_emails BOOLEAN NOT NULL DEFAULT true,
  educational_emails BOOLEAN NOT NULL DEFAULT true,
  digest_emails BOOLEAN NOT NULL DEFAULT true,
  
  -- Frequency Settings
  max_emails_per_day INTEGER NOT NULL DEFAULT 2,
  max_emails_per_week INTEGER NOT NULL DEFAULT 7,
  preferred_send_time TIME,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  
  -- Unsubscribe
  unsubscribed_at TIMESTAMPTZ,
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  
  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaign Recipients (tracking who's in which campaign)
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',
    'completed',
    'unsubscribed',
    'excluded'
  )),
  
  -- Progress
  current_step INTEGER NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ,
  
  -- Analytics
  emails_sent INTEGER NOT NULL DEFAULT 0,
  emails_opened INTEGER NOT NULL DEFAULT 0,
  emails_clicked INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  UNIQUE(campaign_id, user_id)
);

-- Email Analytics Events
CREATE TABLE IF NOT EXISTS email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_queue_id UUID NOT NULL REFERENCES email_queue(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (event_type IN (
    'sent',
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'complained',
    'unsubscribed'
  )),
  
  -- Event Data
  ip_address INET,
  user_agent TEXT,
  clicked_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);

CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_type ON email_campaigns(type);

CREATE INDEX idx_campaign_steps_campaign ON campaign_steps(campaign_id);

CREATE INDEX idx_email_queue_recipient ON email_queue(recipient_id);
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_for);
CREATE INDEX idx_email_queue_campaign ON email_queue(campaign_id);

CREATE INDEX idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_user ON campaign_recipients(user_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);

CREATE INDEX idx_email_events_queue ON email_events(email_queue_id);
CREATE INDEX idx_email_events_type ON email_events(event_type);

-- RLS Policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Admin only policies (you'll need to create an admin check function)
CREATE POLICY "Admins can manage email templates" ON email_templates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND email IN ('admin@poultryco.in', 'vjanagaran@gmail.com') -- Add your admin emails
    )
  );

CREATE POLICY "Admins can manage campaigns" ON email_campaigns
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND email IN ('admin@poultryco.in', 'vjanagaran@gmail.com')
    )
  );

-- Users can manage their own preferences
CREATE POLICY "Users can view own preferences" ON user_email_preferences
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own preferences" ON user_email_preferences
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences" ON user_email_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
