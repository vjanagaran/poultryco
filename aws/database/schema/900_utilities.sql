-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 900_utilities.sql
-- Description: Utility tables (tags, media, etc.)
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql
-- =====================================================

-- =====================================================
-- SECTION 1: TAGS
-- =====================================================

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Tag details
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE NOT NULL,
  
  -- Usage count
  usage_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_usage ON tags(usage_count DESC);

CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: MEDIA UPLOADS
-- =====================================================

CREATE TABLE IF NOT EXISTS media_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Uploader
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- File details
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Media type
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'document', 'audio', 'other')),
  
  -- Image metadata (if applicable)
  width INTEGER,
  height INTEGER,
  
  -- Video metadata (if applicable)
  duration INTEGER, -- in seconds
  
  -- S3 details
  s3_bucket TEXT,
  s3_key TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'ready', 'failed', 'deleted')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_uploads_uploaded_by ON media_uploads(uploaded_by);
CREATE INDEX idx_media_uploads_type ON media_uploads(media_type);
CREATE INDEX idx_media_uploads_status ON media_uploads(status);
CREATE INDEX idx_media_uploads_created ON media_uploads(created_at DESC);

CREATE TRIGGER update_media_uploads_updated_at
  BEFORE UPDATE ON media_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: SAVED SEARCHES
-- =====================================================

CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Search details
  name TEXT NOT NULL,
  search_type TEXT NOT NULL CHECK (search_type IN ('people', 'businesses', 'organizations', 'posts', 'events', 'resources', 'jobs', 'products')),
  
  -- Query
  query_text TEXT,
  filters JSONB,
  
  -- Notifications
  notify_on_new_results BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_profile ON saved_searches(profile_id);
CREATE INDEX idx_saved_searches_type ON saved_searches(search_type);

CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: FEEDBACK
-- =====================================================

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User (optional)
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Feedback details
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature_request', 'improvement', 'complaint', 'praise', 'other')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) <= 2000),
  
  -- Contact
  email TEXT,
  
  -- Metadata
  page_url TEXT,
  user_agent TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_review', 'resolved', 'closed')),
  
  -- Response
  response TEXT,
  responded_by UUID REFERENCES adm_users(id),
  responded_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_profile ON feedback(profile_id);
CREATE INDEX idx_feedback_type ON feedback(feedback_type);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_created ON feedback(created_at DESC);

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 5: EMAIL QUEUE
-- =====================================================

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  to_email TEXT NOT NULL,
  to_name TEXT,
  
  -- Email details
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  
  -- Template
  template_name TEXT,
  template_data JSONB,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  
  -- Attempts
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  
  -- Error
  error_message TEXT,
  
  -- AWS SES
  ses_message_id TEXT,
  
  -- Timestamps
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_pending ON email_queue(status, scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_email_queue_to_email ON email_queue(to_email);

-- =====================================================
-- SECTION 6: AUDIT LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User (optional)
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Action
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  
  -- Data
  old_data JSONB,
  new_data JSONB,
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_profile ON audit_log(profile_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_operation ON audit_log(operation);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE tags IS 'Global tags for content';
COMMENT ON TABLE media_uploads IS 'Media file uploads';
COMMENT ON TABLE saved_searches IS 'User saved searches';
COMMENT ON TABLE feedback IS 'User feedback and support tickets';
COMMENT ON TABLE email_queue IS 'Email sending queue';
COMMENT ON TABLE audit_log IS 'Audit log for sensitive operations';

