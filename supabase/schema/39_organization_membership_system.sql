-- Organization Membership System Schema Extensions
-- Extends existing membership system with roles, permissions, and enhanced features
-- Note: organization_membership_tiers and organization_members already exist in 06_organizations.sql and 07_memberships_events.sql

-- First, enhance the existing organization_membership_tiers table
ALTER TABLE organization_membership_tiers
ADD COLUMN IF NOT EXISTS benefits TEXT[],
ADD COLUMN IF NOT EXISTS member_limit INTEGER,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS icon_name TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Drop and recreate constraint to use 'name' instead of 'tier_name'
ALTER TABLE organization_membership_tiers 
DROP CONSTRAINT IF EXISTS organization_membership_tiers_organization_id_tier_name_key;

ALTER TABLE organization_membership_tiers
RENAME COLUMN tier_name TO name;

ALTER TABLE organization_membership_tiers
RENAME COLUMN tier_description TO description;

ALTER TABLE organization_membership_tiers
ADD CONSTRAINT organization_membership_tiers_organization_id_name_key UNIQUE(organization_id, name);

-- Organization roles (NEW TABLE)
CREATE TABLE IF NOT EXISTS organization_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
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
    -- Create default roles for new organizations
    INSERT INTO organization_roles (organization_id, name, description, is_system, permissions, sort_order)
    VALUES 
        (NEW.id, 'Owner', 'Organization owner with full permissions', true, 
         '{"manage_organization": true, "manage_members": true, "manage_roles": true, "manage_tiers": true, "manage_events": true, "send_announcements": true}'::jsonb, 1),
        (NEW.id, 'Admin', 'Administrator with most permissions', true,
         '{"manage_members": true, "manage_events": true, "send_announcements": true}'::jsonb, 2),
        (NEW.id, 'Member', 'Regular member', true,
         '{"view_members": true, "view_events": true, "participate_events": true}'::jsonb, 100);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_org_default_roles
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION create_default_org_roles();

-- Enhance existing organization_members table
ALTER TABLE organization_members
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES organization_roles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Update the membership_tier_id column name if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='organization_members' 
                   AND column_name='membership_tier_id') THEN
        ALTER TABLE organization_members RENAME COLUMN tier_id TO membership_tier_id;
    END IF;
END $$;

-- Create index for new role column
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role_id);

-- Membership history for tracking changes (NEW TABLE)
CREATE TABLE IF NOT EXISTS organization_membership_history (
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
            AND om.member_id = auth.uid()
            AND om.member_type = 'personal'
            AND om.membership_status = 'active'
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
            AND om.member_id = auth.uid()
            AND om.member_type = 'personal'
            AND om.membership_status = 'active'
        )
    );

CREATE POLICY "Org admins can manage roles"
    ON organization_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            JOIN organization_roles r ON r.id = om.role_id
            WHERE om.organization_id = organization_roles.organization_id
            AND om.member_id = auth.uid()
            AND om.member_type = 'personal'
            AND om.membership_status = 'active'
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
            AND om.member_id = auth.uid()
            AND om.member_type = 'personal'
            AND om.membership_status = 'active'
        )
        OR
        -- Or if it's your own membership
        (member_id = auth.uid() AND member_type = 'personal')
    );

CREATE POLICY "Org admins can manage members"
    ON organization_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            JOIN organization_roles r ON r.id = om.role_id
            WHERE om.organization_id = organization_members.organization_id
            AND om.member_id = auth.uid()
            AND om.member_type = 'personal'
            AND om.membership_status = 'active'
            AND (r.permissions->>'manage_members')::boolean = true
        )
    );

-- Function to add member to organization (updated for polymorphic members)
CREATE OR REPLACE FUNCTION add_organization_member(
    p_organization_id UUID,
    p_member_id UUID,
    p_member_type TEXT,
    p_tier_id UUID DEFAULT NULL,
    p_role_id UUID DEFAULT NULL,
    p_expiry_date DATE DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_member_record_id UUID;
    v_membership_number TEXT;
    v_default_role_id UUID;
BEGIN
    -- Validate member type
    IF p_member_type NOT IN ('personal', 'business') THEN
        RAISE EXCEPTION 'Invalid member type: %', p_member_type;
    END IF;
    
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
        organization_id, member_id, member_type, membership_tier_id, role_id, 
        membership_number, expiry_date, membership_status
    ) VALUES (
        p_organization_id, p_member_id, p_member_type, p_tier_id, p_role_id,
        v_membership_number, p_expiry_date, 'active'
    )
    ON CONFLICT (organization_id, member_type, member_id) 
    DO UPDATE SET 
        membership_tier_id = EXCLUDED.membership_tier_id,
        role_id = EXCLUDED.role_id,
        membership_status = 'active',
        updated_at = NOW()
    RETURNING id INTO v_member_record_id;
    
    -- Log the action
    INSERT INTO organization_membership_history (
        member_id, action, new_value
    ) VALUES (
        v_member_record_id, 'joined', 
        jsonb_build_object('tier_id', p_tier_id, 'role_id', p_role_id)
    );
    
    RETURN v_member_record_id;
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
    SELECT membership_tier_id INTO v_old_tier_id
    FROM organization_members
    WHERE id = p_member_id;
    
    -- Update tier
    UPDATE organization_members
    SET membership_tier_id = p_new_tier_id,
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

-- View for member details (handles polymorphic members)
CREATE OR REPLACE VIEW organization_members_detail AS
SELECT 
    om.*,
    CASE 
        WHEN om.member_type = 'personal' THEN p.full_name
        WHEN om.member_type = 'business' THEN bp.business_name
    END as member_name,
    CASE 
        WHEN om.member_type = 'personal' THEN p.profile_photo_url
        WHEN om.member_type = 'business' THEN bp.logo_url
    END as member_avatar,
    p.full_name as personal_name,
    bp.business_name,
    ot.name as tier_name,
    ot.color as tier_color,
    ot.benefits as tier_benefits,
    r.name as role_name,
    r.permissions as role_permissions,
    o.organization_name
FROM organization_members om
LEFT JOIN profiles p ON p.id = om.member_id AND om.member_type = 'personal'
LEFT JOIN business_profiles bp ON bp.id = om.member_id AND om.member_type = 'business'
JOIN organizations o ON o.id = om.organization_id
LEFT JOIN organization_membership_tiers ot ON ot.id = om.membership_tier_id
LEFT JOIN organization_roles r ON r.id = om.role_id;

-- Function to check member permissions (handles both personal and business members)
CREATE OR REPLACE FUNCTION check_member_permission(
    p_member_id UUID,
    p_member_type TEXT,
    p_organization_id UUID,
    p_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_permissions JSONB;
BEGIN
    SELECT r.permissions INTO v_permissions
    FROM organization_members om
    JOIN organization_roles r ON r.id = om.role_id
    WHERE om.member_id = p_member_id
    AND om.member_type = p_member_type
    AND om.organization_id = p_organization_id
    AND om.membership_status = 'active';
    
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
