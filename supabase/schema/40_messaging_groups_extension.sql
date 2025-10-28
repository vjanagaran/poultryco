-- Messaging Groups Extension Schema
-- Extends existing messaging system to support group chats and org communications

-- Add group support to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS is_group BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS group_name TEXT,
ADD COLUMN IF NOT EXISTS group_description TEXT,
ADD COLUMN IF NOT EXISTS group_avatar_url TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS group_type TEXT CHECK (group_type IN ('general', 'announcement', 'tier', 'role', 'event'));

-- Create conversation members table for group chats
CREATE TABLE IF NOT EXISTS conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT false,
    notification_preference TEXT DEFAULT 'all' CHECK (notification_preference IN ('all', 'mentions', 'none')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(conversation_id, profile_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversation_members_conv ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_profile ON conversation_members(profile_id);

-- Enable RLS
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;

-- Policies for conversation_members
CREATE POLICY "Members can view their conversations"
    ON conversation_members FOR SELECT
    USING (profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Group admins can manage members"
    ON conversation_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM conversation_members cm
            WHERE cm.conversation_id = conversation_members.conversation_id
            AND cm.profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND cm.role IN ('owner', 'admin')
        )
    );

-- Function to create group conversation
CREATE OR REPLACE FUNCTION create_group_conversation(
    p_group_name TEXT,
    p_group_description TEXT DEFAULT NULL,
    p_group_type TEXT DEFAULT 'general',
    p_organization_id UUID DEFAULT NULL,
    p_member_ids UUID[] DEFAULT ARRAY[]::UUID[],
    p_created_by UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_creator_profile_id UUID;
    v_member_id UUID;
BEGIN
    -- Get creator profile ID
    IF p_created_by IS NULL THEN
        SELECT id INTO v_creator_profile_id FROM profiles WHERE user_id = auth.uid();
    ELSE
        v_creator_profile_id := p_created_by;
    END IF;
    
    -- Create conversation
    INSERT INTO conversations (
        is_group, group_name, group_description, group_type, 
        organization_id, created_by
    ) VALUES (
        true, p_group_name, p_group_description, p_group_type,
        p_organization_id, v_creator_profile_id
    ) RETURNING id INTO v_conversation_id;
    
    -- Add creator as owner
    INSERT INTO conversation_members (conversation_id, profile_id, role)
    VALUES (v_conversation_id, v_creator_profile_id, 'owner');
    
    -- Add other members
    FOREACH v_member_id IN ARRAY p_member_ids
    LOOP
        INSERT INTO conversation_members (conversation_id, profile_id, role)
        VALUES (v_conversation_id, v_member_id, 'member')
        ON CONFLICT (conversation_id, profile_id) DO NOTHING;
    END LOOP;
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    
    -- Create the group
    v_conversation_id := create_group_conversation(
        v_group_name,
        'Organization announcement group',
        'announcement',
        p_organization_id,
        v_member_ids,
        p_organization_id
    );
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update messages policies for group support
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
    ON messages FOR SELECT
    USING (
        -- Direct messages (existing logic)
        (
            EXISTS (
                SELECT 1 FROM conversations c
                WHERE c.id = messages.conversation_id
                AND c.is_group = false
                AND (
                    c.participant1_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
                    OR c.participant2_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
                )
            )
        )
        OR
        -- Group messages
        (
            EXISTS (
                SELECT 1 FROM conversation_members cm
                WHERE cm.conversation_id = messages.conversation_id
                AND cm.profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
            )
        )
    );

DROP POLICY IF EXISTS "Users can send messages to their conversations" ON messages;
CREATE POLICY "Users can send messages to their conversations"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
        AND (
            -- Direct messages
            EXISTS (
                SELECT 1 FROM conversations c
                WHERE c.id = messages.conversation_id
                AND c.is_group = false
                AND (
                    c.participant1_id = sender_id
                    OR c.participant2_id = sender_id
                )
            )
            OR
            -- Group messages
            EXISTS (
                SELECT 1 FROM conversation_members cm
                WHERE cm.conversation_id = messages.conversation_id
                AND cm.profile_id = sender_id
            )
        )
    );

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
    v_sender_id UUID;
    v_member RECORD;
BEGIN
    -- Get or create appropriate conversation
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE organization_id = p_organization_id
    AND group_type = 'announcement'
    AND (
        (p_tier_id IS NULL AND p_role_id IS NULL) -- All members
        OR (group_name LIKE 'Tier:%' AND p_tier_id IS NOT NULL)
        OR (group_name LIKE 'Role:%' AND p_role_id IS NOT NULL)
    )
    LIMIT 1;
    
    IF v_conversation_id IS NULL THEN
        v_conversation_id := create_org_announcement_group(p_organization_id, p_tier_id, p_role_id);
    END IF;
    
    -- Use organization profile as sender
    v_sender_id := p_organization_id;
    
    -- Send message
    INSERT INTO messages (conversation_id, sender_id, content, metadata)
    VALUES (
        v_conversation_id, 
        v_sender_id, 
        p_content,
        jsonb_build_object(
            'type', 'announcement',
            'send_email', p_send_email,
            'send_whatsapp', p_send_whatsapp
        )
    )
    RETURNING id INTO v_message_id;
    
    -- Queue for additional channels if requested
    IF p_send_email OR p_send_whatsapp THEN
        FOR v_member IN
            SELECT p.id, p.email, p.phone, ep.email_announcements, ep.whatsapp_notifications
            FROM conversation_members cm
            JOIN profiles p ON p.id = cm.profile_id
            LEFT JOIN email_preferences ep ON ep.profile_id = p.id
            WHERE cm.conversation_id = v_conversation_id
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
            
            -- Queue WhatsApp if enabled (placeholder for future implementation)
            IF p_send_whatsapp AND v_member.phone IS NOT NULL AND COALESCE(v_member.whatsapp_notifications, false) THEN
                -- TODO: Implement WhatsApp queue
                NULL;
            END IF;
        END LOOP;
    END IF;
    
    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for group conversations with member count
CREATE OR REPLACE VIEW group_conversations_view AS
SELECT 
    c.*,
    COUNT(DISTINCT cm.profile_id) as member_count,
    array_agg(
        jsonb_build_object(
            'profile_id', cm.profile_id,
            'role', cm.role,
            'name', p.display_name,
            'avatar', p.avatar_url
        ) ORDER BY cm.role, p.display_name
    ) FILTER (WHERE cm.role IN ('owner', 'admin')) as admins
FROM conversations c
JOIN conversation_members cm ON cm.conversation_id = c.id
JOIN profiles p ON p.id = cm.profile_id
WHERE c.is_group = true
GROUP BY c.id;

-- Add trigger for updated_at
CREATE TRIGGER update_conversation_members_updated_at
    BEFORE UPDATE ON conversation_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
