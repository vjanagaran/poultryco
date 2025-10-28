-- Connection and Follow System Schema
-- Supports both mutual connections (like LinkedIn) and one-way follows

-- Drop existing connections table if it exists
DROP TABLE IF EXISTS connections CASCADE;

-- Create new connections table with support for both connect and follow
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    to_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('connect', 'follow')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    message TEXT, -- Optional message with connection request
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(from_profile_id, to_profile_id, connection_type)
);

-- Create indexes for performance
CREATE INDEX idx_connections_from_profile ON connections(from_profile_id);
CREATE INDEX idx_connections_to_profile ON connections(to_profile_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_type ON connections(connection_type);
CREATE INDEX idx_connections_composite ON connections(from_profile_id, to_profile_id, connection_type, status);

-- Enable RLS
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Policies for connections
CREATE POLICY "Users can view their own connections"
    ON connections FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id IN (from_profile_id, to_profile_id)
        )
    );

CREATE POLICY "Users can create connection requests"
    ON connections FOR INSERT
    WITH CHECK (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = from_profile_id)
        AND from_profile_id != to_profile_id
    );

CREATE POLICY "Users can update their received connection requests"
    ON connections FOR UPDATE
    USING (
        auth.uid() = (SELECT user_id FROM profiles WHERE id = to_profile_id)
        AND connection_type = 'connect'
        AND status = 'pending'
    );

CREATE POLICY "Users can delete their own connections"
    ON connections FOR DELETE
    USING (
        auth.uid() IN (
            SELECT user_id FROM profiles WHERE id IN (from_profile_id, to_profile_id)
        )
    );

-- Function to get connection status between two profiles
CREATE OR REPLACE FUNCTION get_connection_status(
    p_from_profile_id UUID,
    p_to_profile_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_connection RECORD;
    v_result JSONB;
BEGIN
    -- Check for mutual connection
    SELECT * INTO v_connection
    FROM connections
    WHERE connection_type = 'connect'
    AND (
        (from_profile_id = p_from_profile_id AND to_profile_id = p_to_profile_id)
        OR (from_profile_id = p_to_profile_id AND to_profile_id = p_from_profile_id AND status = 'accepted')
    )
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
        v_result := jsonb_build_object(
            'is_connected', v_connection.status = 'accepted',
            'connection_status', v_connection.status,
            'is_requester', v_connection.from_profile_id = p_from_profile_id
        );
    ELSE
        v_result := jsonb_build_object(
            'is_connected', false,
            'connection_status', null,
            'is_requester', null
        );
    END IF;

    -- Check for follow status
    SELECT EXISTS(
        SELECT 1 FROM connections
        WHERE from_profile_id = p_from_profile_id
        AND to_profile_id = p_to_profile_id
        AND connection_type = 'follow'
        AND status = 'accepted'
    ) INTO v_result;

    v_result := v_result || jsonb_build_object('is_following', COALESCE((v_result->>'exists')::boolean, false));

    -- Check if being followed
    SELECT EXISTS(
        SELECT 1 FROM connections
        WHERE from_profile_id = p_to_profile_id
        AND to_profile_id = p_from_profile_id
        AND connection_type = 'follow'
        AND status = 'accepted'
    ) INTO v_result;

    v_result := v_result || jsonb_build_object('is_followed_by', COALESCE((v_result->>'exists')::boolean, false));

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle connection request
CREATE OR REPLACE FUNCTION handle_connection_request(
    p_from_profile_id UUID,
    p_to_profile_id UUID,
    p_connection_type TEXT,
    p_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_connection_id UUID;
BEGIN
    -- For follow type, auto-accept
    IF p_connection_type = 'follow' THEN
        INSERT INTO connections (from_profile_id, to_profile_id, connection_type, status, message)
        VALUES (p_from_profile_id, p_to_profile_id, p_connection_type, 'accepted', p_message)
        ON CONFLICT (from_profile_id, to_profile_id, connection_type) 
        DO UPDATE SET status = 'accepted', updated_at = NOW()
        RETURNING id INTO v_connection_id;
    ELSE
        -- For connect type, create pending request
        INSERT INTO connections (from_profile_id, to_profile_id, connection_type, status, message)
        VALUES (p_from_profile_id, p_to_profile_id, p_connection_type, 'pending', p_message)
        RETURNING id INTO v_connection_id;
    END IF;

    RETURN v_connection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to respond to connection request
CREATE OR REPLACE FUNCTION respond_to_connection_request(
    p_connection_id UUID,
    p_response TEXT -- 'accepted' or 'rejected'
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE connections
    SET status = p_response,
        responded_at = NOW(),
        updated_at = NOW()
    WHERE id = p_connection_id
    AND status = 'pending'
    AND connection_type = 'connect';

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Table for invitation tracking
CREATE TABLE invitations (
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

-- Table for social sharing tracking
CREATE TABLE share_tracking (
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

-- Add trigger to update updated_at
CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
