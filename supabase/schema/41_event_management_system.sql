-- Event Management System Schema
-- Comprehensive system for conferences, webinars, workshops, expos with ticketing and sponsorship

-- Drop existing organization_events table and create comprehensive events system
DROP TABLE IF EXISTS organization_events CASCADE;

-- Main events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, -- Organization
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('conference', 'webinar', 'workshop', 'expo', 'summit', 'meetup')),
    format TEXT NOT NULL CHECK (format IN ('in-person', 'virtual', 'hybrid')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
    
    -- Dates
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_start TIMESTAMP WITH TIME ZONE,
    registration_end TIMESTAMP WITH TIME ZONE,
    
    -- Location (for in-person/hybrid)
    venue_name TEXT,
    venue_address TEXT,
    venue_city TEXT,
    venue_state TEXT,
    venue_country TEXT,
    venue_map_url TEXT,
    
    -- Virtual event details
    virtual_platform TEXT, -- Zoom, Teams, custom, etc.
    virtual_link TEXT,
    
    -- Capacity
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    
    -- Branding
    logo_url TEXT,
    banner_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    custom_css TEXT,
    
    -- Contact
    contact_email TEXT,
    contact_phone TEXT,
    website_url TEXT,
    
    -- Features
    features JSONB DEFAULT '{}', -- {ticketing: true, sponsors: true, expo: true, etc.}
    settings JSONB DEFAULT '{}', -- Various event settings
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (end_date >= start_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_date, end_date);

-- Event sessions/agenda
CREATE TABLE IF NOT EXISTS event_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    session_type TEXT, -- 'keynote', 'panel', 'workshop', 'networking', etc.
    
    -- Timing
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Location
    location TEXT, -- Room name, virtual link, etc.
    is_virtual BOOLEAN DEFAULT false,
    virtual_link TEXT,
    
    -- Capacity
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    
    -- Organization
    track TEXT, -- For multi-track events
    tags TEXT[],
    
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CHECK (end_time > start_time)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_sessions_event ON event_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sessions_time ON event_sessions(start_time, end_time);

-- Event speakers
CREATE TABLE IF NOT EXISTS event_speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Speaker details
    speaker_type TEXT DEFAULT 'speaker' CHECK (speaker_type IN ('keynote', 'speaker', 'panelist', 'moderator', 'host')),
    title TEXT, -- Job title for this event
    organization TEXT, -- Organization for this event
    bio TEXT, -- Event-specific bio
    
    -- Display
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    
    -- Sessions
    session_ids UUID[], -- Array of session IDs this speaker is in
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, profile_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_speakers_event_new ON event_speakers(event_id);
CREATE INDEX IF NOT EXISTS idx_event_speakers_profile_new ON event_speakers(profile_id);

-- Ticket types
CREATE TABLE IF NOT EXISTS event_ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    
    -- Availability
    quantity_available INTEGER, -- NULL for unlimited
    quantity_sold INTEGER DEFAULT 0,
    
    -- Sale period
    sale_start TIMESTAMP WITH TIME ZONE,
    sale_end TIMESTAMP WITH TIME ZONE,
    
    -- Restrictions
    min_per_order INTEGER DEFAULT 1,
    max_per_order INTEGER,
    
    -- Benefits
    benefits TEXT[],
    
    -- Display
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Attendee type
    attendee_type TEXT DEFAULT 'general' CHECK (attendee_type IN ('general', 'vip', 'speaker', 'sponsor', 'exhibitor', 'media', 'staff')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_ticket_types_event ON event_ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_event_ticket_types_active ON event_ticket_types(is_active);

-- Event registrations/tickets
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    attendee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES event_ticket_types(id),
    
    -- Registration details
    registration_number TEXT UNIQUE NOT NULL,
    qr_code TEXT UNIQUE NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'cancelled', 'no_show')),
    
    -- Payment (basic tracking, no payment processing in MVP)
    amount_paid DECIMAL(10, 2) DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_reference TEXT,
    
    -- Check-in
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_in_by UUID REFERENCES profiles(id),
    
    -- Additional info
    dietary_restrictions TEXT,
    special_requirements TEXT,
    attendee_info JSONB DEFAULT '{}', -- Custom fields
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, attendee_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_attendee ON event_registrations(attendee_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_qr ON event_registrations(qr_code);
CREATE INDEX IF NOT EXISTS idx_event_registrations_number ON event_registrations(registration_number);

-- Sponsor tiers
CREATE TABLE IF NOT EXISTS event_sponsor_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Benefits
    benefits TEXT[],
    logo_size TEXT DEFAULT 'medium' CHECK (logo_size IN ('small', 'medium', 'large', 'extra-large')),
    
    -- Limits
    max_sponsors INTEGER,
    current_sponsors INTEGER DEFAULT 0,
    
    -- Pricing (for reference only)
    price DECIMAL(10, 2),
    
    -- Display
    display_order INTEGER DEFAULT 0,
    color TEXT, -- For UI display
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, name)
);

-- Event sponsors
CREATE TABLE IF NOT EXISTS event_sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    sponsor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- Business profile
    tier_id UUID NOT NULL REFERENCES event_sponsor_tiers(id),
    
    -- Sponsor details
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    
    -- Expo/booth
    booth_number TEXT,
    booth_size TEXT,
    
    -- Display
    is_featured BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    
    -- Contact
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, sponsor_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_sponsors_event ON event_sponsors(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sponsors_sponsor ON event_sponsors(sponsor_id);

-- Expo stalls (for events with exhibitions)
CREATE TABLE IF NOT EXISTS event_expo_stalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    exhibitor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    sponsor_id UUID REFERENCES event_sponsors(id) ON DELETE CASCADE,
    
    -- Stall details
    stall_number TEXT NOT NULL,
    stall_size TEXT,
    location_description TEXT,
    
    -- Status
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'confirmed', 'setup', 'active')),
    
    -- Pricing
    price DECIMAL(10, 2) DEFAULT 0,
    is_complimentary BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, stall_number),
    
    CHECK (
        (exhibitor_id IS NOT NULL AND sponsor_id IS NULL) OR
        (exhibitor_id IS NULL AND sponsor_id IS NOT NULL) OR
        (exhibitor_id IS NULL AND sponsor_id IS NULL AND status = 'available')
    )
);

-- Event check-ins log
CREATE TABLE IF NOT EXISTS event_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES event_sessions(id) ON DELETE CASCADE, -- NULL for main event check-in
    
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    checked_in_by UUID REFERENCES profiles(id),
    check_in_method TEXT DEFAULT 'qr' CHECK (check_in_method IN ('qr', 'manual', 'batch')),
    
    device_info JSONB DEFAULT '{}',
    location TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_event_checkins_registration ON event_checkins(registration_id);
CREATE INDEX IF NOT EXISTS idx_event_checkins_session ON event_checkins(session_id);

-- Event analytics summary (materialized view for performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS event_analytics AS
SELECT 
    e.id as event_id,
    e.name as event_name,
    COUNT(DISTINCT er.id) as total_registrations,
    COUNT(DISTINCT er.id) FILTER (WHERE er.status = 'confirmed') as confirmed_registrations,
    COUNT(DISTINCT er.id) FILTER (WHERE er.status = 'checked_in') as checked_in_count,
    COUNT(DISTINCT es.id) as total_sponsors,
    COUNT(DISTINCT est.id) as total_stalls,
    COUNT(DISTINCT est.id) FILTER (WHERE est.status != 'available') as occupied_stalls,
    SUM(er.amount_paid) as total_revenue,
    COUNT(DISTINCT ess.id) as total_sessions,
    COUNT(DISTINCT esp.id) as total_speakers
FROM events e
LEFT JOIN event_registrations er ON er.event_id = e.id
LEFT JOIN event_sponsors es ON es.event_id = e.id
LEFT JOIN event_expo_stalls est ON est.event_id = e.id
LEFT JOIN event_sessions ess ON ess.event_id = e.id
LEFT JOIN event_speakers esp ON esp.event_id = e.id
GROUP BY e.id, e.name;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_event_analytics_event ON event_analytics(event_id);

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsor_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_expo_stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_checkins ENABLE ROW LEVEL SECURITY;

-- Policies will be added in the next file due to length

-- Helper functions

-- Generate QR code data
CREATE OR REPLACE FUNCTION generate_registration_qr(
    p_event_id UUID,
    p_attendee_id UUID
) RETURNS TEXT AS $$
BEGIN
    RETURN encode(
        digest(p_event_id::TEXT || p_attendee_id::TEXT || gen_random_uuid()::TEXT, 'sha256'),
        'hex'
    );
END;
$$ LANGUAGE plpgsql;

-- Generate registration number
CREATE OR REPLACE FUNCTION generate_registration_number(
    p_event_id UUID
) RETURNS TEXT AS $$
DECLARE
    v_event_code TEXT;
    v_count INTEGER;
BEGIN
    -- Get first 4 chars of event slug
    SELECT UPPER(LEFT(slug, 4)) INTO v_event_code FROM events WHERE id = p_event_id;
    
    -- Get current count
    SELECT COUNT(*) + 1 INTO v_count FROM event_registrations WHERE event_id = p_event_id;
    
    RETURN v_event_code || TO_CHAR(NOW(), 'YY') || LPAD(v_count::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at (drop if exists to replace)
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_sessions_updated_at ON event_sessions;
CREATE TRIGGER update_event_sessions_updated_at
    BEFORE UPDATE ON event_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_ticket_types_updated_at ON event_ticket_types;
CREATE TRIGGER update_event_ticket_types_updated_at
    BEFORE UPDATE ON event_ticket_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_registrations_updated_at ON event_registrations;
CREATE TRIGGER update_event_registrations_updated_at
    BEFORE UPDATE ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
