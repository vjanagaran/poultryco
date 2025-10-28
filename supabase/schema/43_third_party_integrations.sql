-- Third Party Integrations Schema
-- Support for Wati (WhatsApp), Twilio (SMS), and social sharing

-- Integration credentials storage (encrypted)
CREATE TABLE integration_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL CHECK (service_name IN ('wati', 'twilio', 'facebook', 'twitter', 'linkedin', 'instagram')),
    credentials JSONB NOT NULL, -- Encrypted in application layer
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(service_name)
);

-- WhatsApp message queue (Wati)
CREATE TABLE whatsapp_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_phone TEXT NOT NULL,
    recipient_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message_type TEXT NOT NULL CHECK (message_type IN ('text', 'template', 'media')),
    template_name TEXT, -- For template messages
    template_params JSONB DEFAULT '{}',
    message_content TEXT, -- For text messages
    media_url TEXT, -- For media messages
    
    -- Context
    context_type TEXT, -- 'invitation', 'announcement', 'event_reminder', etc.
    context_id UUID, -- Related entity ID
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'delivered', 'read')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    wati_message_id TEXT, -- ID from Wati API
    
    -- Retry logic
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_whatsapp_queue_status ON whatsapp_queue(status);
CREATE INDEX idx_whatsapp_queue_priority ON whatsapp_queue(priority) WHERE status = 'pending';
CREATE INDEX idx_whatsapp_queue_phone ON whatsapp_queue(recipient_phone);

-- SMS message queue (Twilio)
CREATE TABLE sms_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_phone TEXT NOT NULL,
    recipient_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    message_content TEXT NOT NULL,
    
    -- Context
    context_type TEXT,
    context_id UUID,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'delivered')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    twilio_message_sid TEXT, -- SID from Twilio
    
    -- Retry logic
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Cost tracking
    segments INTEGER,
    cost_amount DECIMAL(10, 4),
    cost_currency TEXT DEFAULT 'USD',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_sms_queue_status ON sms_queue(status);
CREATE INDEX idx_sms_queue_priority ON sms_queue(priority) WHERE status = 'pending';
CREATE INDEX idx_sms_queue_phone ON sms_queue(recipient_phone);

-- Contact import tracking
CREATE TABLE contact_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    import_source TEXT NOT NULL CHECK (import_source IN ('google', 'phone', 'csv', 'manual')),
    
    -- Import details
    total_contacts INTEGER DEFAULT 0,
    processed_contacts INTEGER DEFAULT 0,
    invited_contacts INTEGER DEFAULT 0,
    existing_users INTEGER DEFAULT 0,
    failed_contacts INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    
    -- Import data
    import_data JSONB DEFAULT '{}', -- Raw import data
    processed_data JSONB DEFAULT '[]', -- Processed contact list
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_contact_imports_profile ON contact_imports(profile_id);
CREATE INDEX idx_contact_imports_status ON contact_imports(status);

-- Social share templates
CREATE TABLE social_share_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'twitter', 'linkedin', 'whatsapp', 'instagram')),
    template_type TEXT NOT NULL CHECK (template_type IN ('profile', 'product', 'service', 'event', 'general')),
    
    -- Template content
    title TEXT,
    description TEXT,
    hashtags TEXT[], -- For platforms that support hashtags
    image_url TEXT,
    
    -- URL patterns
    share_url_template TEXT NOT NULL, -- e.g., 'https://twitter.com/intent/tweet?text={text}&url={url}'
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(platform, template_type)
);

-- Insert default social share templates
INSERT INTO social_share_templates (name, platform, template_type, share_url_template) VALUES
    ('Share Profile on Facebook', 'facebook', 'profile', 'https://www.facebook.com/sharer/sharer.php?u={url}'),
    ('Share Profile on Twitter', 'twitter', 'profile', 'https://twitter.com/intent/tweet?text={text}&url={url}'),
    ('Share Profile on LinkedIn', 'linkedin', 'profile', 'https://www.linkedin.com/sharing/share-offsite/?url={url}'),
    ('Share Profile on WhatsApp', 'whatsapp', 'profile', 'https://wa.me/?text={text}%20{url}'),
    ('Share Event on Facebook', 'facebook', 'event', 'https://www.facebook.com/sharer/sharer.php?u={url}'),
    ('Share Event on Twitter', 'twitter', 'event', 'https://twitter.com/intent/tweet?text={text}&url={url}&hashtags={hashtags}'),
    ('Share Event on LinkedIn', 'linkedin', 'event', 'https://www.linkedin.com/sharing/share-offsite/?url={url}'),
    ('Share Event on WhatsApp', 'whatsapp', 'event', 'https://wa.me/?text={text}%20{url}')
ON CONFLICT (platform, template_type) DO NOTHING;

-- Enable RLS
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_share_templates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Only super admins can manage integration credentials"
    ON integration_credentials FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND email IN ('janagaran@gmail.com') -- Add super admin emails
        )
    );

CREATE POLICY "Users can view their own message queues"
    ON whatsapp_queue FOR SELECT
    USING (recipient_profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own SMS queues"
    ON sms_queue FOR SELECT
    USING (recipient_profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage their own contact imports"
    ON contact_imports FOR ALL
    USING (profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view active share templates"
    ON social_share_templates FOR SELECT
    USING (is_active = true);

-- Functions

-- Queue WhatsApp message
CREATE OR REPLACE FUNCTION queue_whatsapp_message(
    p_phone TEXT,
    p_message_type TEXT,
    p_content TEXT DEFAULT NULL,
    p_template_name TEXT DEFAULT NULL,
    p_template_params JSONB DEFAULT '{}',
    p_context_type TEXT DEFAULT NULL,
    p_context_id UUID DEFAULT NULL,
    p_priority TEXT DEFAULT 'normal'
) RETURNS UUID AS $$
DECLARE
    v_message_id UUID;
    v_recipient_id UUID;
BEGIN
    -- Try to find recipient profile
    SELECT id INTO v_recipient_id FROM profiles WHERE phone = p_phone;
    
    INSERT INTO whatsapp_queue (
        recipient_phone, recipient_profile_id, message_type,
        message_content, template_name, template_params,
        context_type, context_id, priority
    ) VALUES (
        p_phone, v_recipient_id, p_message_type,
        p_content, p_template_name, p_template_params,
        p_context_type, p_context_id, p_priority
    ) RETURNING id INTO v_message_id;
    
    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Queue SMS message
CREATE OR REPLACE FUNCTION queue_sms_message(
    p_phone TEXT,
    p_content TEXT,
    p_context_type TEXT DEFAULT NULL,
    p_context_id UUID DEFAULT NULL,
    p_priority TEXT DEFAULT 'normal'
) RETURNS UUID AS $$
DECLARE
    v_message_id UUID;
    v_recipient_id UUID;
BEGIN
    -- Try to find recipient profile
    SELECT id INTO v_recipient_id FROM profiles WHERE phone = p_phone;
    
    INSERT INTO sms_queue (
        recipient_phone, recipient_profile_id, message_content,
        context_type, context_id, priority
    ) VALUES (
        p_phone, v_recipient_id, p_content,
        p_context_type, p_context_id, p_priority
    ) RETURNING id INTO v_message_id;
    
    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate social share URL
CREATE OR REPLACE FUNCTION generate_share_url(
    p_platform TEXT,
    p_content_type TEXT,
    p_url TEXT,
    p_text TEXT DEFAULT NULL,
    p_hashtags TEXT[] DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_template TEXT;
    v_share_url TEXT;
    v_hashtags_str TEXT;
BEGIN
    -- Get template
    SELECT share_url_template INTO v_template
    FROM social_share_templates
    WHERE platform = p_platform
    AND template_type = p_content_type
    AND is_active = true;
    
    IF v_template IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Process template
    v_share_url := v_template;
    v_share_url := REPLACE(v_share_url, '{url}', COALESCE(p_url, ''));
    v_share_url := REPLACE(v_share_url, '{text}', COALESCE(url_encode(p_text), ''));
    
    -- Handle hashtags
    IF p_hashtags IS NOT NULL AND array_length(p_hashtags, 1) > 0 THEN
        v_hashtags_str := array_to_string(p_hashtags, ',');
        v_share_url := REPLACE(v_share_url, '{hashtags}', v_hashtags_str);
    ELSE
        v_share_url := REPLACE(v_share_url, '&hashtags={hashtags}', '');
        v_share_url := REPLACE(v_share_url, 'hashtags={hashtags}', '');
    END IF;
    
    RETURN v_share_url;
END;
$$ LANGUAGE plpgsql;

-- URL encode function (simple version)
CREATE OR REPLACE FUNCTION url_encode(p_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(p_text, ' ', '%20'),
                    '&', '%26'
                ),
                '#', '%23'
            ),
            '?', '%3F'
        ),
        '=', '%3D'
    );
END;
$$ LANGUAGE plpgsql;

-- Process contact import
CREATE OR REPLACE FUNCTION process_contact_import(
    p_import_id UUID,
    p_contacts JSONB -- Array of {name, phone, email}
) RETURNS JSONB AS $$
DECLARE
    v_contact JSONB;
    v_existing_count INTEGER := 0;
    v_invited_count INTEGER := 0;
    v_failed_count INTEGER := 0;
    v_profile_id UUID;
    v_import_profile_id UUID;
BEGIN
    -- Get import profile
    SELECT profile_id INTO v_import_profile_id
    FROM contact_imports
    WHERE id = p_import_id;
    
    -- Update status
    UPDATE contact_imports
    SET status = 'processing',
        total_contacts = jsonb_array_length(p_contacts)
    WHERE id = p_import_id;
    
    -- Process each contact
    FOR v_contact IN SELECT * FROM jsonb_array_elements(p_contacts)
    LOOP
        BEGIN
            -- Check if user exists
            SELECT id INTO v_profile_id
            FROM profiles
            WHERE email = v_contact->>'email'
            OR phone = v_contact->>'phone';
            
            IF v_profile_id IS NOT NULL THEN
                v_existing_count := v_existing_count + 1;
                
                -- Create connection request
                PERFORM handle_connection_request(
                    v_import_profile_id,
                    v_profile_id,
                    'connect',
                    'I would like to connect with you on PoultryBazaar'
                );
            ELSE
                -- Create invitation
                INSERT INTO invitations (
                    inviter_profile_id,
                    invitee_identifier,
                    invitation_type,
                    message
                ) VALUES (
                    v_import_profile_id,
                    COALESCE(v_contact->>'email', v_contact->>'phone'),
                    CASE 
                        WHEN v_contact->>'email' IS NOT NULL THEN 'email'
                        ELSE 'sms'
                    END,
                    'Join me on PoultryBazaar - India''s premier poultry marketplace'
                );
                
                v_invited_count := v_invited_count + 1;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            v_failed_count := v_failed_count + 1;
        END;
    END LOOP;
    
    -- Update import record
    UPDATE contact_imports
    SET status = 'completed',
        existing_users = v_existing_count,
        invited_contacts = v_invited_count,
        failed_contacts = v_failed_count,
        processed_contacts = jsonb_array_length(p_contacts),
        processed_data = p_contacts,
        completed_at = NOW()
    WHERE id = p_import_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'total', jsonb_array_length(p_contacts),
        'existing', v_existing_count,
        'invited', v_invited_count,
        'failed', v_failed_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers
CREATE TRIGGER update_integration_credentials_updated_at
    BEFORE UPDATE ON integration_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
