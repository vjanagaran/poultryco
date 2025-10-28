-- Messaging Groups Minimal Extension
-- Only adds what's missing to the existing messaging system

-- Add organization support to existing conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS group_type TEXT CHECK (group_type IN ('general', 'announcement', 'tier', 'role', 'event'));

-- The conversation_participants table already exists and has most features
-- Just ensure we have the notification preferences
ALTER TABLE conversation_participants
ADD COLUMN IF NOT EXISTS notification_preference TEXT DEFAULT 'all' CHECK (notification_preference IN ('all', 'mentions', 'none'));

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_conversations_organization ON conversations(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_group_type ON conversations(group_type) WHERE group_type IS NOT NULL;

-- Function to create organization announcement group
CREATE OR REPLACE FUNCTION create_org_announcement_group(
    p_organization_id UUID,
    p_tier_id UUID DEFAULT NULL,
    p_role_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_group_name TEXT;
    v_member_ids UUID[];
    v_member_id UUID;
BEGIN
    -- Determine group name and members
    IF p_tier_id IS NOT NULL THEN
        -- Tier-specific group
        SELECT 'Tier: ' || name INTO v_group_name
        FROM organization_membership_tiers
        WHERE id = p_tier_id;
        
        SELECT array_agg(profile_id) INTO v_member_ids
        FROM organization_members
        WHERE organization_id = p_organization_id
        AND tier_id = p_tier_id
        AND status = 'active';
    ELSIF p_role_id IS NOT NULL THEN
        -- Role-specific group
        SELECT 'Role: ' || name INTO v_group_name
        FROM organization_roles
        WHERE id = p_role_id;
        
        SELECT array_agg(profile_id) INTO v_member_ids
        FROM organization_members
        WHERE organization_id = p_organization_id
        AND role_id = p_role_id
        AND status = 'active';
    ELSE
        -- All members group
        v_group_name := 'All Members';
        
        SELECT array_agg(profile_id) INTO v_member_ids
        FROM organization_members
        WHERE organization_id = p_organization_id
        AND status = 'active';
    END IF;
    
    -- Create the group conversation
    INSERT INTO conversations (
        is_group, group_name, group_description, group_type,
        organization_id, created_by
    ) VALUES (
        true, v_group_name, 'Organization announcement group', 'announcement',
        p_organization_id, p_organization_id
    ) RETURNING id INTO v_conversation_id;
    
    -- Add organization as admin participant
    
    -- Add members
    FOREACH v_member_id IN ARRAY v_member_ids
    LOOP
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (v_conversation_id, v_member_id)
        ON CONFLICT DO NOTHING;
    END LOOP;
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send announcement to organization members
CREATE OR REPLACE FUNCTION send_org_announcement(
    p_organization_id UUID,
    p_content TEXT,
    p_tier_id UUID DEFAULT NULL,
    p_role_id UUID DEFAULT NULL,
    p_send_email BOOLEAN DEFAULT false,
    p_send_whatsapp BOOLEAN DEFAULT false
) RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_message_id UUID;
    v_member RECORD;
BEGIN
    -- Get or create appropriate conversation
    SELECT c.id INTO v_conversation_id
    FROM conversations c
    WHERE c.organization_id = p_organization_id
    AND c.group_type = 'announcement'
    AND c.is_group = true
    AND (
        (p_tier_id IS NULL AND p_role_id IS NULL AND c.group_name = 'All Members')
        OR (p_tier_id IS NOT NULL AND c.group_name LIKE 'Tier:%')
        OR (p_role_id IS NOT NULL AND c.group_name LIKE 'Role:%')
    )
    LIMIT 1;
    
    IF v_conversation_id IS NULL THEN
        v_conversation_id := create_org_announcement_group(p_organization_id, p_tier_id, p_role_id);
    END IF;
    
    -- Send message using existing message structure
    INSERT INTO messages (conversation_id, sender_id, content, message_type)
    VALUES (v_conversation_id, p_organization_id, p_content, 'text')
    RETURNING id INTO v_message_id;
    
    -- Queue for additional channels if requested
    IF p_send_email OR p_send_whatsapp THEN
        FOR v_member IN
            SELECT p.id, p.email, p.phone, ep.email_announcements, ep.whatsapp_notifications
            FROM conversation_participants cp
            JOIN profiles p ON p.id = cp.user_id
            LEFT JOIN email_preferences ep ON ep.profile_id = p.id
            WHERE cp.conversation_id = v_conversation_id
            AND cp.is_active = true
        LOOP
            -- Queue email if enabled
            IF p_send_email AND v_member.email IS NOT NULL AND COALESCE(v_member.email_announcements, true) THEN
                INSERT INTO email_queue (
                    to_email, template_id, template_data, priority
                ) VALUES (
                    v_member.email,
                    'org_announcement',
                    jsonb_build_object(
                        'organization_id', p_organization_id,
                        'content', p_content
                    ),
                    'high'
                );
            END IF;
            
            -- Queue WhatsApp if enabled
            IF p_send_whatsapp AND v_member.phone IS NOT NULL AND COALESCE(v_member.whatsapp_notifications, false) THEN
                -- This will be handled by the WhatsApp integration
                NULL;
            END IF;
        END LOOP;
    END IF;
    
    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for organization groups
CREATE OR REPLACE VIEW organization_conversation_view AS
SELECT 
    c.*,
    COUNT(DISTINCT cp.user_id) as member_count,
    o.display_name as organization_name,
    o.avatar_url as organization_avatar
FROM conversations c
JOIN profiles o ON o.id = c.organization_id
LEFT JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.is_active = true
WHERE c.organization_id IS NOT NULL
GROUP BY c.id, o.display_name, o.avatar_url;
