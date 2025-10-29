-- Event Management System Policies and Functions
-- RLS policies and helper functions for the event management system

-- Policies for events table
CREATE POLICY "Anyone can view published events"
    ON events FOR SELECT
    USING (status IN ('published', 'ongoing', 'completed'));

CREATE POLICY "Organizers can view their own events"
    ON events FOR SELECT
    USING (
        organizer_id IN (
            SELECT id FROM organizations WHERE creator_id = auth.uid()
        )
        OR
        organizer_id IN (
            SELECT organization_id FROM organization_members
            WHERE member_id = auth.uid() AND member_type = 'personal'
            AND membership_status = 'active'
        )
    );

CREATE POLICY "Organizers can create events"
    ON events FOR INSERT
    WITH CHECK (
        -- Must be an organization
        organizer_id IN (
            SELECT id FROM organizations 
            WHERE creator_id = (auth.uid())
            UNION
            SELECT om.organization_id FROM organization_members om
            JOIN organization_roles r ON r.id = om.role_id
            WHERE om.member_id = auth.uid() AND om.member_type = 'personal'
            AND om.membership_status = 'active'
            AND (r.permissions->>'manage_events')::boolean = true
        )
    );

CREATE POLICY "Organizers can update their events"
    ON events FOR UPDATE
    USING (
        organizer_id IN (
            SELECT om.organization_id FROM organization_members om
            JOIN organization_roles r ON r.id = om.role_id
            WHERE om.member_id = auth.uid() AND om.member_type = 'personal'
            AND om.membership_status = 'active'
            AND (r.permissions->>'manage_events')::boolean = true
        )
    );

-- Policies for event_sessions
CREATE POLICY "Anyone can view sessions of published events"
    ON event_sessions FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM events WHERE status IN ('published', 'ongoing', 'completed')
        )
    );

CREATE POLICY "Event organizers can manage sessions"
    ON event_sessions FOR ALL
    USING (
        event_id IN (
            SELECT e.id FROM events e
            JOIN organization_members om ON om.organization_id = e.organizer_id
            JOIN organization_roles r ON r.id = om.role_id
            WHERE om.member_id = auth.uid() AND om.member_type = 'personal'
            AND om.membership_status = 'active'
            AND (r.permissions->>'manage_events')::boolean = true
        )
    );

-- Policies for event_speakers
CREATE POLICY "Anyone can view speakers of published events"
    ON event_speakers FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM events WHERE status IN ('published', 'ongoing', 'completed')
        )
    );

CREATE POLICY "Event organizers can manage speakers"
    ON event_speakers FOR ALL
    USING (
        event_id IN (
            SELECT e.id FROM events e
            JOIN organization_members om ON om.organization_id = e.organizer_id
            JOIN organization_roles r ON r.id = om.role_id
            WHERE om.member_id = auth.uid() AND om.member_type = 'personal'
            AND om.membership_status = 'active'
            AND (r.permissions->>'manage_events')::boolean = true
        )
    );

-- Policies for event_ticket_types
CREATE POLICY "Anyone can view active tickets of published events"
    ON event_ticket_types FOR SELECT
    USING (
        is_active = true
        AND event_id IN (
            SELECT id FROM events WHERE status IN ('published', 'ongoing')
        )
    );

CREATE POLICY "Event organizers can manage ticket types"
    ON event_ticket_types FOR ALL
    USING (
        event_id IN (
            SELECT e.id FROM events e
            JOIN organization_members om ON om.organization_id = e.organizer_id
            JOIN organization_roles r ON r.id = om.role_id
            WHERE om.member_id = auth.uid() AND om.member_type = 'personal'
            AND om.membership_status = 'active'
            AND (r.permissions->>'manage_events')::boolean = true
        )
    );

-- Policies for event_registrations
CREATE POLICY "Users can view their own registrations"
    ON event_registrations FOR SELECT
    USING (
        attendee_id = (auth.uid())
    );

CREATE POLICY "Event organizers can view all registrations"
    ON event_registrations FOR SELECT
    USING (
        event_id IN (
            SELECT e.id FROM events e
            JOIN organization_members om ON om.organization_id = e.organizer_id
            WHERE om.member_id = auth.uid() AND om.member_type = 'personal'
            AND om.membership_status = 'active'
        )
    );

CREATE POLICY "Users can register for events"
    ON event_registrations FOR INSERT
    WITH CHECK (
        attendee_id = (auth.uid())
        AND event_id IN (
            SELECT id FROM events WHERE status = 'published'
        )
    );

CREATE POLICY "Event organizers can manage registrations"
    ON event_registrations FOR UPDATE
    USING (
        event_id IN (
            SELECT e.id FROM events e
            JOIN organization_members om ON om.organization_id = e.organizer_id
            JOIN organization_roles r ON r.id = om.role_id
            WHERE om.member_id = auth.uid() AND om.member_type = 'personal'
            AND om.membership_status = 'active'
            AND (r.permissions->>'manage_events')::boolean = true
        )
    );

-- Policies for sponsors
CREATE POLICY "Anyone can view sponsors of published events"
    ON event_sponsors FOR SELECT
    USING (
        event_id IN (
            SELECT id FROM events WHERE status IN ('published', 'ongoing', 'completed')
        )
    );

CREATE POLICY "Event organizers can manage sponsors"
    ON event_sponsors FOR ALL
    USING (
        event_id IN (
            SELECT e.id FROM events e
            JOIN organization_members om ON om.organization_id = e.organizer_id
            JOIN organization_roles r ON r.id = om.role_id
            WHERE om.member_id = auth.uid() AND om.member_type = 'personal'
            AND om.membership_status = 'active'
            AND (r.permissions->>'manage_events')::boolean = true
        )
    );

-- Function to register for an event
CREATE OR REPLACE FUNCTION register_for_event(
    p_event_id UUID,
    p_ticket_type_id UUID,
    p_attendee_info JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    v_registration_id UUID;
    v_attendee_id UUID;
    v_registration_number TEXT;
    v_qr_code TEXT;
    v_ticket_price DECIMAL;
    v_available_quantity INTEGER;
    v_sold_quantity INTEGER;
BEGIN
    -- Get attendee profile
    SELECT id INTO v_attendee_id FROM profiles WHERE user_id = auth.uid();
    
    -- Check if already registered
    IF EXISTS (
        SELECT 1 FROM event_registrations 
        WHERE event_id = p_event_id AND attendee_id = v_attendee_id
    ) THEN
        RAISE EXCEPTION 'Already registered for this event';
    END IF;
    
    -- Check ticket availability
    SELECT price, quantity_available, quantity_sold 
    INTO v_ticket_price, v_available_quantity, v_sold_quantity
    FROM event_ticket_types
    WHERE id = p_ticket_type_id
    AND event_id = p_event_id
    AND is_active = true
    FOR UPDATE;
    
    IF v_available_quantity IS NOT NULL AND v_sold_quantity >= v_available_quantity THEN
        RAISE EXCEPTION 'Ticket type is sold out';
    END IF;
    
    -- Generate registration details
    v_registration_number := generate_registration_number(p_event_id);
    v_qr_code := generate_registration_qr(p_event_id, v_attendee_id);
    
    -- Create registration
    INSERT INTO event_registrations (
        event_id, attendee_id, ticket_type_id,
        registration_number, qr_code, amount_paid,
        status, payment_status, attendee_info
    ) VALUES (
        p_event_id, v_attendee_id, p_ticket_type_id,
        v_registration_number, v_qr_code, v_ticket_price,
        CASE WHEN v_ticket_price = 0 THEN 'confirmed' ELSE 'pending' END,
        CASE WHEN v_ticket_price = 0 THEN 'paid' ELSE 'pending' END,
        p_attendee_info
    ) RETURNING id INTO v_registration_id;
    
    -- Update ticket sold count
    UPDATE event_ticket_types
    SET quantity_sold = quantity_sold + 1
    WHERE id = p_ticket_type_id;
    
    -- Update event attendee count
    UPDATE events
    SET current_attendees = current_attendees + 1
    WHERE id = p_event_id;
    
    RETURN v_registration_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check in attendee
CREATE OR REPLACE FUNCTION checkin_attendee(
    p_qr_code TEXT,
    p_session_id UUID DEFAULT NULL,
    p_device_info JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
    v_registration RECORD;
    v_checkin_id UUID;
    v_checker_profile_id UUID;
BEGIN
    -- Get checker profile
    v_checker_profile_id := auth.uid();
    
    -- Get registration details
    SELECT 
        r.id, r.event_id, r.attendee_id, r.status,
        p.display_name as attendee_name,
        e.name as event_name,
        tt.name as ticket_type
    INTO v_registration
    FROM event_registrations r
    JOIN profiles p ON p.id = r.attendee_id
    JOIN events e ON e.id = r.event_id
    JOIN event_ticket_types tt ON tt.id = r.ticket_type_id
    WHERE r.qr_code = p_qr_code;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid QR code');
    END IF;
    
    IF v_registration.status != 'confirmed' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Registration not confirmed');
    END IF;
    
    -- Check if already checked in for this session
    IF p_session_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM event_checkins
        WHERE registration_id = v_registration.id
        AND session_id = p_session_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Already checked in for this session');
    END IF;
    
    -- Create check-in record
    INSERT INTO event_checkins (
        registration_id, session_id, checked_in_by, device_info
    ) VALUES (
        v_registration.id, p_session_id, v_checker_profile_id, p_device_info
    ) RETURNING id INTO v_checkin_id;
    
    -- Update registration status if first check-in
    IF p_session_id IS NULL THEN
        UPDATE event_registrations
        SET status = 'checked_in',
            checked_in_at = NOW(),
            checked_in_by = v_checker_profile_id
        WHERE id = v_registration.id
        AND status = 'confirmed';
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Check-in successful',
        'attendee_name', v_registration.attendee_name,
        'event_name', v_registration.event_name,
        'ticket_type', v_registration.ticket_type,
        'checkin_id', v_checkin_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get event dashboard stats
CREATE OR REPLACE FUNCTION get_event_dashboard_stats(p_event_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    WITH registration_stats AS (
        SELECT 
            COUNT(*) as total_registrations,
            COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
            COUNT(*) FILTER (WHERE status = 'checked_in') as checked_in,
            COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
            SUM(amount_paid) as total_revenue
        FROM event_registrations
        WHERE event_id = p_event_id
    ),
    ticket_stats AS (
        SELECT 
            jsonb_agg(
                jsonb_build_object(
                    'name', name,
                    'sold', quantity_sold,
                    'available', quantity_available,
                    'revenue', price * quantity_sold
                ) ORDER BY display_order
            ) as tickets
        FROM event_ticket_types
        WHERE event_id = p_event_id
        AND is_active = true
    ),
    session_stats AS (
        SELECT COUNT(*) as total_sessions
        FROM event_sessions
        WHERE event_id = p_event_id
    ),
    speaker_stats AS (
        SELECT COUNT(*) as total_speakers
        FROM event_speakers
        WHERE event_id = p_event_id
    ),
    sponsor_stats AS (
        SELECT 
            COUNT(*) as total_sponsors,
            jsonb_agg(
                jsonb_build_object(
                    'tier', t.name,
                    'count', sponsor_count
                ) ORDER BY t.display_order
            ) as by_tier
        FROM (
            SELECT tier_id, COUNT(*) as sponsor_count
            FROM event_sponsors
            WHERE event_id = p_event_id
            GROUP BY tier_id
        ) s
        JOIN event_sponsor_tiers t ON t.id = s.tier_id
    )
    SELECT jsonb_build_object(
        'registrations', row_to_json(registration_stats),
        'tickets', COALESCE(ticket_stats.tickets, '[]'::jsonb),
        'sessions', session_stats.total_sessions,
        'speakers', speaker_stats.total_speakers,
        'sponsors', jsonb_build_object(
            'total', COALESCE(sponsor_stats.total_sponsors, 0),
            'by_tier', COALESCE(sponsor_stats.by_tier, '[]'::jsonb)
        )
    ) INTO v_stats
    FROM registration_stats, ticket_stats, session_stats, speaker_stats, sponsor_stats;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to refresh event analytics
CREATE OR REPLACE FUNCTION refresh_event_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW event_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
