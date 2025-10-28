-- =====================================================
-- Email System Functions and Security
-- =====================================================

-- Enable pgsodium extension for secure secret storage
CREATE EXTENSION IF NOT EXISTS pgsodium;

-- Function to store AWS SES credentials securely
CREATE OR REPLACE FUNCTION store_aws_ses_credentials(
  p_access_key_id TEXT,
  p_secret_access_key TEXT,
  p_region TEXT DEFAULT 'us-east-1'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_secret_data JSONB;
BEGIN
  -- Only allow admins to set credentials
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND email IN ('admin@poultryco.in', 'vjanagaran@gmail.com')
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Prepare credentials JSON
  v_secret_data = jsonb_build_object(
    'accessKeyId', p_access_key_id,
    'secretAccessKey', p_secret_access_key,
    'region', p_region
  );
  
  -- Store in vault
  INSERT INTO vault.secrets (name, secret)
  VALUES ('aws_ses_credentials', v_secret_data::text)
  ON CONFLICT (name) 
  DO UPDATE SET 
    secret = EXCLUDED.secret,
    updated_at = NOW();
END;
$$;

-- Function to get AWS SES credentials (for Edge Functions)
CREATE OR REPLACE FUNCTION get_secret(secret_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_secret TEXT;
BEGIN
  -- This function is called by Edge Functions with service role
  -- So we check if it's authenticated
  IF auth.role() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  SELECT secret INTO v_secret
  FROM vault.secrets
  WHERE name = secret_name;
  
  RETURN v_secret;
END;
$$;

-- Grant execute permission to authenticated users (Edge Functions use service role)
GRANT EXECUTE ON FUNCTION get_secret TO authenticated;
GRANT EXECUTE ON FUNCTION get_secret TO service_role;

-- RPC function to increment email template stats
CREATE OR REPLACE FUNCTION increment_email_template_sent(p_template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE email_templates 
  SET 
    total_sent = total_sent + 1,
    updated_at = NOW()
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_email_template_opened(p_template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE email_templates 
  SET 
    total_opened = total_opened + 1,
    updated_at = NOW()
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_email_template_clicked(p_template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE email_templates 
  SET 
    total_clicked = total_clicked + 1,
    updated_at = NOW()
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and enforce email limits
CREATE OR REPLACE FUNCTION check_email_limits(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_preferences RECORD;
  v_sent_today INTEGER;
  v_sent_this_week INTEGER;
BEGIN
  -- Get user preferences
  SELECT * INTO v_preferences
  FROM user_email_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences, use defaults
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- Check if user has email enabled
  IF NOT v_preferences.email_enabled THEN
    RETURN false;
  END IF;
  
  -- Count emails sent today
  SELECT COUNT(*) INTO v_sent_today
  FROM email_queue
  WHERE recipient_id = p_user_id
    AND status = 'sent'
    AND sent_at >= CURRENT_DATE;
  
  -- Check daily limit
  IF v_sent_today >= v_preferences.max_emails_per_day THEN
    RETURN false;
  END IF;
  
  -- Count emails sent this week
  SELECT COUNT(*) INTO v_sent_this_week
  FROM email_queue
  WHERE recipient_id = p_user_id
    AND status = 'sent'
    AND sent_at >= CURRENT_DATE - INTERVAL '7 days';
  
  -- Check weekly limit
  IF v_sent_this_week >= v_preferences.max_emails_per_week THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to queue an email
CREATE OR REPLACE FUNCTION queue_email(
  p_recipient_id UUID,
  p_template_id UUID,
  p_personalization_data JSONB DEFAULT '{}',
  p_scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  p_priority INTEGER DEFAULT 5
)
RETURNS UUID AS $$
DECLARE
  v_recipient RECORD;
  v_template RECORD;
  v_email_id UUID;
  v_full_personalization JSONB;
BEGIN
  -- Check email limits
  IF NOT check_email_limits(p_recipient_id) THEN
    RAISE EXCEPTION 'Email limits exceeded for user';
  END IF;
  
  -- Get recipient details
  SELECT * INTO v_recipient
  FROM profiles
  WHERE id = p_recipient_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;
  
  -- Get template
  SELECT * INTO v_template
  FROM email_templates
  WHERE id = p_template_id
    AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Template not found or inactive';
  END IF;
  
  -- Prepare personalization data
  v_full_personalization = jsonb_build_object(
    'full_name', v_recipient.full_name,
    'first_name', split_part(v_recipient.full_name, ' ', 1),
    'email', v_recipient.email,
    'profile_strength', v_recipient.profile_strength,
    'current_year', EXTRACT(YEAR FROM NOW()),
    'current_date', TO_CHAR(NOW(), 'Month DD, YYYY')
  ) || p_personalization_data;
  
  -- Insert into queue
  INSERT INTO email_queue (
    recipient_id,
    recipient_email,
    template_id,
    subject,
    html_body,
    text_body,
    personalization_data,
    priority,
    scheduled_for,
    status
  ) VALUES (
    p_recipient_id,
    v_recipient.email,
    p_template_id,
    v_template.subject,
    v_template.html_body,
    v_template.text_body,
    v_full_personalization,
    p_priority,
    p_scheduled_for,
    'pending'
  )
  RETURNING id INTO v_email_id;
  
  RETURN v_email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's email history
CREATE OR REPLACE FUNCTION get_user_email_history(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  subject TEXT,
  status TEXT,
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  template_name TEXT,
  template_category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    eq.id,
    eq.subject,
    eq.status,
    eq.sent_at,
    eq.opened_at,
    eq.clicked_at,
    et.name AS template_name,
    et.category AS template_category
  FROM email_queue eq
  LEFT JOIN email_templates et ON eq.template_id = et.id
  WHERE eq.recipient_id = p_user_id
  ORDER BY eq.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_email_template_sent TO authenticated;
GRANT EXECUTE ON FUNCTION increment_email_template_opened TO authenticated;
GRANT EXECUTE ON FUNCTION increment_email_template_clicked TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_limits TO authenticated;
GRANT EXECUTE ON FUNCTION queue_email TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_email_history TO authenticated;

-- Create cron job for processing email queue (requires pg_cron extension)
-- This would be set up in Supabase Dashboard
-- SELECT cron.schedule(
--   'process-email-queue',
--   '*/5 * * * *', -- Every 5 minutes
--   $$
--   SELECT net.http_post(
--     url := 'https://your-project.supabase.co/functions/v1/process-email-queue',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
--       'Content-Type', 'application/json'
--     ),
--     body := jsonb_build_object('trigger', 'cron')
--   );
--   $$
-- );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_pending 
  ON email_queue(scheduled_for) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_email_queue_recipient_sent 
  ON email_queue(recipient_id, sent_at) 
  WHERE status = 'sent';

-- Add RLS policy for email queue (users can see their own emails)
CREATE POLICY "Users can view own email history"
  ON email_queue FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

-- Add RLS policy for email events (users can see events for their emails)
CREATE POLICY "Users can view own email events"
  ON email_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_queue 
      WHERE email_queue.id = email_events.email_queue_id 
      AND email_queue.recipient_id = auth.uid()
    )
  );
