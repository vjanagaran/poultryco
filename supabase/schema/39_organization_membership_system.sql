-- Organization Membership System Schema
-- Comprehensive membership tiers, roles, and member management

-- Organization membership tiers
CREATE TABLE organization_membership_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    benefits TEXT[], -- Array of benefits
    member_limit INTEGER, -- NULL for unlimited
    annual_fee DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    color TEXT, -- For UI display
    icon_name TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- Create indexes
CREATE INDEX idx_org_membership_tiers_org ON organization_membership_tiers(organization_id);
CREATE INDEX idx_org_membership_tiers_active ON organization_membership_tiers(is_active);

-- Organization roles
CREATE TABLE organization_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}', -- Flexible permissions structure
    is_system BOOLEAN DEFAULT false, -- System roles can't be deleted
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, name)
);

-- Insert default system roles for organizations
CREATE OR REPLACE FUNCTION create_default_org_roles()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.profile_type = 'organization' THEN
        INSERT INTO organization_roles (organization_id, name, description, is_system, permissions, sort_order)
        VALUES 
            (NEW.id, 'Owner', 'Organization owner with full permissions', true, 
             '{"manage_organization": true, "manage_members": true, "manage_roles": true, "manage_tiers": true, "manage_events": true, "send_announcements": true}'::jsonb, 1),
            (NEW.id, 'Admin', 'Administrator with most permissions', true,
             '{"manage_members": true, "manage_events": true, "send_announcements": true}'::jsonb, 2),
            (NEW.id, 'Member', 'Regular member', true,
             '{"view_members": true, "view_events": true, "participate_events": true}'::jsonb, 100);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_org_default_roles
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_org_roles();

-- Organization members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tier_id UUID REFERENCES organization_membership_tiers(id) ON DELETE SET NULL,
    role_id UUID REFERENCES organization_roles(id) ON DELETE SET NULL,
    membership_number TEXT, -- Unique membership number
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE, -- For time-limited memberships
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'expired', 'cancelled')),
    notes TEXT,
    metadata JSONB DEFAULT '{}', -- For custom fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, profile_id)
);

-- Create indexes
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_profile ON organization_members(profile_id);
CREATE INDEX idx_org_members_status ON organization_members(status);
CREATE INDEX idx_org_members_tier ON organization_members(tier_id);
CREATE INDEX idx_org_members_role ON organization_members(role_id);

-- Membership history for tracking changes
CREATE TABLE organization_membership_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES organization_members(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'joined', 'tier_changed', 'role_changed', 'renewed', 'suspended', 'reactivated', 'left'
    previous_value JSONB,
    new_value JSONB,
    performed_by UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_org_membership_history_member ON organization_membership_history(member_id);

-- Enable RLS
ALTER TABLE organization_membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_membership_history ENABLE ROW LEVEL SECURITY;

-- Policies for organization_membership_tiers
CREATE POLICY "Anyone can view active tiers"
    ON organization_membership_tiers FOR SELECT
    USING (is_active = true);

CREATE POLICY "Org admins can manage tiers"
    ON organization_membership_tiers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            JOIN organization_roles r ON r.id = om.role_id
            WHERE om.organization_id = organization_membership_tiers.organization_id
            AND om.profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND om.status = 'active'
            AND (r.permissions->>'manage_tiers')::boolean = true
        )
    );

-- Policies for organization_roles
CREATE POLICY "Members can view their org roles"
    ON organization_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_roles.organization_id
            AND om.profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND om.status = 'active'
        )
    );

CREATE POLICY "Org admins can manage roles"
    ON organization_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            JOIN organization_roles r ON r.id = om.role_id
            WHERE om.organization_id = organization_roles.organization_id
            AND om.profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND om.status = 'active'
            AND (r.permissions->>'manage_roles')::boolean = true
        )
    );

-- Policies for organization_members
CREATE POLICY "Members can view org members"
    ON organization_members FOR SELECT
    USING (
        -- Can view if you're a member of the org
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND om.status = 'active'
        )
        OR
        -- Or if it's your own membership
        profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Org admins can manage members"
    ON organization_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            JOIN organization_roles r ON r.id = om.role_id
            WHERE om.organization_id = organization_members.organization_id
            AND om.profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND om.status = 'active'
            AND (r.permissions->>'manage_members')::boolean = true
        )
    );

-- Function to add member to organization
CREATE OR REPLACE FUNCTION add_organization_member(
    p_organization_id UUID,
    p_profile_id UUID,
    p_tier_id UUID DEFAULT NULL,
    p_role_id UUID DEFAULT NULL,
    p_valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_member_id UUID;
    v_membership_number TEXT;
    v_default_role_id UUID;
BEGIN
    -- Generate membership number
    v_membership_number := 'M' || TO_CHAR(NOW(), 'YYYY') || LPAD(
        (SELECT COUNT(*) + 1 FROM organization_members WHERE organization_id = p_organization_id)::TEXT, 
        5, '0'
    );
    
    -- Get default member role if not specified
    IF p_role_id IS NULL THEN
        SELECT id INTO v_default_role_id
        FROM organization_roles
        WHERE organization_id = p_organization_id
        AND name = 'Member'
        AND is_system = true;
        
        p_role_id := v_default_role_id;
    END IF;
    
    -- Insert member
    INSERT INTO organization_members (
        organization_id, profile_id, tier_id, role_id, 
        membership_number, valid_until, status
    ) VALUES (
        p_organization_id, p_profile_id, p_tier_id, p_role_id,
        v_membership_number, p_valid_until, 'active'
    )
    ON CONFLICT (organization_id, profile_id) 
    DO UPDATE SET 
        tier_id = EXCLUDED.tier_id,
        role_id = EXCLUDED.role_id,
        status = 'active',
        updated_at = NOW()
    RETURNING id INTO v_member_id;
    
    -- Log the action
    INSERT INTO organization_membership_history (
        member_id, action, new_value
    ) VALUES (
        v_member_id, 'joined', 
        jsonb_build_object('tier_id', p_tier_id, 'role_id', p_role_id)
    );
    
    RETURN v_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update member tier
CREATE OR REPLACE FUNCTION update_member_tier(
    p_member_id UUID,
    p_new_tier_id UUID,
    p_performed_by UUID,
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_old_tier_id UUID;
BEGIN
    -- Get current tier
    SELECT tier_id INTO v_old_tier_id
    FROM organization_members
    WHERE id = p_member_id;
    
    -- Update tier
    UPDATE organization_members
    SET tier_id = p_new_tier_id,
        updated_at = NOW()
    WHERE id = p_member_id;
    
    -- Log the change
    INSERT INTO organization_membership_history (
        member_id, action, previous_value, new_value, performed_by, notes
    ) VALUES (
        p_member_id, 'tier_changed',
        jsonb_build_object('tier_id', v_old_tier_id),
        jsonb_build_object('tier_id', p_new_tier_id),
        p_performed_by, p_notes
    );
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for member details
CREATE OR REPLACE VIEW organization_members_detail AS
SELECT 
    om.*,
    p.display_name as member_name,
    p.profile_type as member_type,
    p.avatar_url as member_avatar,
    bp.business_name,
    ot.name as tier_name,
    ot.color as tier_color,
    ot.benefits as tier_benefits,
    r.name as role_name,
    r.permissions as role_permissions,
    o.display_name as organization_name
FROM organization_members om
JOIN profiles p ON p.id = om.profile_id
LEFT JOIN business_profiles bp ON bp.profile_id = p.id
JOIN profiles o ON o.id = om.organization_id
LEFT JOIN organization_membership_tiers ot ON ot.id = om.tier_id
LEFT JOIN organization_roles r ON r.id = om.role_id;

-- Function to check member permissions
CREATE OR REPLACE FUNCTION check_member_permission(
    p_profile_id UUID,
    p_organization_id UUID,
    p_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_permissions JSONB;
BEGIN
    SELECT r.permissions INTO v_permissions
    FROM organization_members om
    JOIN organization_roles r ON r.id = om.role_id
    WHERE om.profile_id = p_profile_id
    AND om.organization_id = p_organization_id
    AND om.status = 'active';
    
    RETURN COALESCE((v_permissions->>p_permission)::boolean, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for updated_at
CREATE TRIGGER update_org_membership_tiers_updated_at
    BEFORE UPDATE ON organization_membership_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_roles_updated_at
    BEFORE UPDATE ON organization_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
