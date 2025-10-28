-- Connection System Extensions
-- Extends existing connection system with additional features

-- Add missing columns to existing connections table if needed
ALTER TABLE connections 
ADD COLUMN IF NOT EXISTS connection_type TEXT DEFAULT 'connect' CHECK (connection_type IN ('connect')),
ADD COLUMN IF NOT EXISTS message TEXT;

-- The existing system already handles mutual connections well
-- Follows are already in a separate table

-- Table for invitation tracking (NEW)
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inviter_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    invitee_identifier TEXT NOT NULL, -- email, phone, or social handle
    invitation_type TEXT NOT NULL CHECK (invitation_type IN ('email', 'sms', 'whatsapp', 'social')),
    invitation_code TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'expired')),
    sent_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_invitations_inviter ON invitations(inviter_profile_id);
CREATE INDEX idx_invitations_code ON invitations(invitation_code);
CREATE INDEX idx_invitations_status ON invitations(status);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Policies for invitations
CREATE POLICY "Users can view their own invitations"
    ON invitations FOR SELECT
    USING (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = inviter_profile_id)
    );

CREATE POLICY "Users can create invitations"
    ON invitations FOR INSERT
    WITH CHECK (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = inviter_profile_id)
    );

-- Table for social sharing tracking (NEW)
CREATE TABLE IF NOT EXISTS share_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- 'profile', 'product', 'event', etc.
    content_id UUID NOT NULL,
    share_platform TEXT NOT NULL, -- 'facebook', 'twitter', 'linkedin', 'whatsapp', etc.
    share_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_share_tracking_profile ON share_tracking(profile_id);
CREATE INDEX idx_share_tracking_content ON share_tracking(content_type, content_id);

-- Enable RLS
ALTER TABLE share_tracking ENABLE ROW LEVEL SECURITY;

-- Policy for share tracking
CREATE POLICY "Users can track their own shares"
    ON share_tracking FOR ALL
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id));

-- Enhanced function to get connection status (works with existing schema)
CREATE OR REPLACE FUNCTION get_full_connection_status(
    p_from_profile_id UUID,
    p_to_profile_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_connection RECORD;
    v_follow RECORD;
    v_result JSONB;
BEGIN
    -- Check for mutual connection (using existing schema)
    SELECT * INTO v_connection
    FROM connections
    WHERE (
        (profile_id_1 = LEAST(p_from_profile_id, p_to_profile_id) 
         AND profile_id_2 = GREATEST(p_from_profile_id, p_to_profile_id))
    );

    -- Build connection result
    IF v_connection IS NOT NULL THEN
        v_result := jsonb_build_object(
            'is_connected', v_connection.status = 'connected',
            'connection_status', v_connection.status,
            'is_requester', v_connection.requested_by = p_from_profile_id,
            'connection_id', v_connection.id
        );
    ELSE
        v_result := jsonb_build_object(
            'is_connected', false,
            'connection_status', null,
            'is_requester', null,
            'connection_id', null
        );
    END IF;

    -- Check for follow status (from existing follows table)
    SELECT * INTO v_follow
    FROM follows
    WHERE follower_id = p_from_profile_id
    AND following_id = p_to_profile_id
    AND unfollowed_at IS NULL;

    v_result := v_result || jsonb_build_object('is_following', v_follow IS NOT NULL);

    -- Check if being followed
    SELECT EXISTS(
        SELECT 1 FROM follows
        WHERE follower_id = p_to_profile_id
        AND following_id = p_from_profile_id
        AND unfollowed_at IS NULL
    ) INTO v_follow;

    v_result := v_result || jsonb_build_object('is_followed_by', COALESCE(v_follow, false));

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
