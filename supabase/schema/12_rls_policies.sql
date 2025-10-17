-- =====================================================
-- PoultryCo Database Schema
-- File: 12_rls_policies.sql
-- Description: Row Level Security (RLS) policies
-- Version: 1.0
-- Date: 2025-10-17
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

-- Core Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations_contact ENABLE ROW LEVEL SECURITY;

-- Roles
ALTER TABLE profile_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_farmer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_veterinarian_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_supplier_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_consultant_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_researcher_details ENABLE ROW LEVEL SECURITY;

-- Professional Info
ALTER TABLE profile_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;

-- Business Details
ALTER TABLE business_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_contact_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_farm_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_supplier_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_certifications ENABLE ROW LEVEL SECURITY;

-- Products & Jobs
ALTER TABLE business_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_jobs ENABLE ROW LEVEL SECURITY;

-- Organizations
ALTER TABLE organization_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_leadership ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_announcements ENABLE ROW LEVEL SECURITY;

-- Memberships & Events
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_member_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_event_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_event_exhibitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_event_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_event_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_event_feedback ENABLE ROW LEVEL SECURITY;

-- Privacy & Verification
ALTER TABLE profile_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_completeness_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_badges ENABLE ROW LEVEL SECURITY;

-- Network
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Stats
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_stats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Check if user is authenticated
CREATE OR REPLACE FUNCTION auth_uid()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if profile is public
CREATE OR REPLACE FUNCTION is_profile_public(p_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM profiles 
    WHERE id = p_profile_id AND is_public = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if users are connected
CREATE OR REPLACE FUNCTION are_connected(p_user_id_1 UUID, p_user_id_2 UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_min_id UUID;
  v_max_id UUID;
BEGIN
  IF p_user_id_1 < p_user_id_2 THEN
    v_min_id := p_user_id_1;
    v_max_id := p_user_id_2;
  ELSE
    v_min_id := p_user_id_2;
    v_max_id := p_user_id_1;
  END IF;
  
  RETURN EXISTS(
    SELECT 1 FROM connections 
    WHERE profile_id_1 = v_min_id 
      AND profile_id_2 = v_max_id 
      AND status = 'connected'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is business owner or admin
CREATE OR REPLACE FUNCTION is_business_admin(p_business_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM business_profiles 
    WHERE id = p_business_id AND owner_id = p_user_id
  ) OR EXISTS(
    SELECT 1 FROM business_team_members 
    WHERE business_profile_id = p_business_id 
      AND profile_id = p_user_id 
      AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is organization admin
CREATE OR REPLACE FUNCTION is_organization_admin(p_org_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM organizations 
    WHERE id = p_org_id AND creator_id = p_user_id
  ) OR EXISTS(
    SELECT 1 FROM organization_leadership 
    WHERE organization_id = p_org_id 
      AND profile_id = p_user_id 
      AND is_current = true
      AND position_level IN ('president', 'secretary', 'director')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES RLS POLICIES
-- =====================================================

-- Public profiles: readable by anyone
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (is_public = true);

-- Private profiles: readable by owner and connections
CREATE POLICY "Private profiles viewable by owner and connections"
  ON profiles FOR SELECT
  USING (
    NOT is_public AND (
      id = auth_uid() OR
      are_connected(id, auth_uid())
    )
  );

-- Profiles: users can update their own
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (id = auth_uid())
  WITH CHECK (id = auth_uid());

-- Profiles: users can insert (via trigger from auth.users)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth_uid());

-- =====================================================
-- BUSINESS PROFILES RLS POLICIES
-- =====================================================

-- Business profiles: readable by everyone (public directory)
CREATE POLICY "Business profiles are viewable by everyone"
  ON business_profiles FOR SELECT
  USING (true);

-- Business profiles: owner and admins can update
CREATE POLICY "Business owners/admins can update"
  ON business_profiles FOR UPDATE
  USING (is_business_admin(id, auth_uid()))
  WITH CHECK (is_business_admin(id, auth_uid()));

-- Business profiles: authenticated users can create
CREATE POLICY "Authenticated users can create business"
  ON business_profiles FOR INSERT
  WITH CHECK (auth_uid() IS NOT NULL AND owner_id = auth_uid());

-- =====================================================
-- ORGANIZATIONS RLS POLICIES
-- =====================================================

-- Organizations: readable by everyone
CREATE POLICY "Organizations are viewable by everyone"
  ON organizations FOR SELECT
  USING (true);

-- Organizations: creator and admins can update
CREATE POLICY "Organization admins can update"
  ON organizations FOR UPDATE
  USING (is_organization_admin(id, auth_uid()))
  WITH CHECK (is_organization_admin(id, auth_uid()));

-- Organizations: authenticated users can create
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth_uid() IS NOT NULL AND creator_id = auth_uid());

-- =====================================================
-- PROFESSIONAL INFO RLS POLICIES
-- =====================================================

-- Experience: viewable if profile is public or connected
CREATE POLICY "Experience viewable by public/connections"
  ON profile_experience FOR SELECT
  USING (
    is_profile_public(profile_id) OR
    profile_id = auth_uid() OR
    are_connected(profile_id, auth_uid())
  );

-- Experience: users can manage their own
CREATE POLICY "Users can manage own experience"
  ON profile_experience FOR ALL
  USING (profile_id = auth_uid())
  WITH CHECK (profile_id = auth_uid());

-- Similar policies for education, certifications, etc.
CREATE POLICY "Education viewable by public/connections"
  ON profile_education FOR SELECT
  USING (
    is_profile_public(profile_id) OR
    profile_id = auth_uid() OR
    are_connected(profile_id, auth_uid())
  );

CREATE POLICY "Users can manage own education"
  ON profile_education FOR ALL
  USING (profile_id = auth_uid())
  WITH CHECK (profile_id = auth_uid());

CREATE POLICY "Certifications viewable by public/connections"
  ON profile_certifications FOR SELECT
  USING (
    is_profile_public(profile_id) OR
    profile_id = auth_uid() OR
    are_connected(profile_id, auth_uid())
  );

CREATE POLICY "Users can manage own certifications"
  ON profile_certifications FOR ALL
  USING (profile_id = auth_uid())
  WITH CHECK (profile_id = auth_uid());

-- =====================================================
-- SKILLS RLS POLICIES
-- =====================================================

-- Skills: readable by everyone (global catalog)
CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  USING (is_approved = true);

-- Skills: authenticated users can create (pending approval)
CREATE POLICY "Authenticated users can create skills"
  ON skills FOR INSERT
  WITH CHECK (auth_uid() IS NOT NULL);

-- Profile skills: viewable if profile is public or connected
CREATE POLICY "Profile skills viewable by public/connections"
  ON profile_skills FOR SELECT
  USING (
    is_profile_public(profile_id) OR
    profile_id = auth_uid() OR
    are_connected(profile_id, auth_uid())
  );

-- Profile skills: users can manage their own
CREATE POLICY "Users can manage own skills"
  ON profile_skills FOR ALL
  USING (profile_id = auth_uid())
  WITH CHECK (profile_id = auth_uid());

-- Endorsements: viewable if profile is public or connected
CREATE POLICY "Endorsements viewable by public/connections"
  ON skill_endorsements FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM profile_skills ps
      WHERE ps.id = profile_skill_id
        AND (
          is_profile_public(ps.profile_id) OR
          ps.profile_id = auth_uid() OR
          are_connected(ps.profile_id, auth_uid())
        )
    )
  );

-- Endorsements: connections can endorse
CREATE POLICY "Connections can endorse skills"
  ON skill_endorsements FOR INSERT
  WITH CHECK (
    auth_uid() IS NOT NULL AND
    endorsed_by = auth_uid() AND
    EXISTS(
      SELECT 1 FROM profile_skills ps
      WHERE ps.id = profile_skill_id
        AND are_connected(ps.profile_id, auth_uid())
    )
  );

-- =====================================================
-- CONNECTIONS RLS POLICIES
-- =====================================================

-- Connections: viewable by participants and their connections
CREATE POLICY "Connections viewable by participants"
  ON connections FOR SELECT
  USING (
    profile_id_1 = auth_uid() OR
    profile_id_2 = auth_uid() OR
    (status = 'connected' AND (
      are_connected(profile_id_1, auth_uid()) OR
      are_connected(profile_id_2, auth_uid())
    ))
  );

-- Connections: users can create connection requests
CREATE POLICY "Users can create connection requests"
  ON connections FOR INSERT
  WITH CHECK (
    auth_uid() IS NOT NULL AND
    (profile_id_1 = auth_uid() OR profile_id_2 = auth_uid()) AND
    requested_by = auth_uid()
  );

-- Connections: users can update their connections
CREATE POLICY "Users can update their connections"
  ON connections FOR UPDATE
  USING (profile_id_1 = auth_uid() OR profile_id_2 = auth_uid())
  WITH CHECK (profile_id_1 = auth_uid() OR profile_id_2 = auth_uid());

-- =====================================================
-- PRIVACY SETTINGS RLS POLICIES
-- =====================================================

-- Privacy settings: users can view and manage their own
CREATE POLICY "Users can manage own privacy settings"
  ON profile_privacy_settings FOR ALL
  USING (profile_id = auth_uid())
  WITH CHECK (profile_id = auth_uid());

-- =====================================================
-- ORGANIZATION MEMBERS RLS POLICIES
-- =====================================================

-- Members: viewable by organization members
CREATE POLICY "Organization members viewable by members"
  ON organization_members FOR SELECT
  USING (
    -- Public organization
    EXISTS(SELECT 1 FROM organizations WHERE id = organization_id AND is_verified = true) OR
    -- User is a member
    (member_type = 'personal' AND member_id = auth_uid()) OR
    EXISTS(
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
        AND om.member_type = 'personal'
        AND om.member_id = auth_uid()
        AND om.membership_status = 'active'
    )
  );

-- Members: organization admins can manage
CREATE POLICY "Organization admins can manage members"
  ON organization_members FOR ALL
  USING (is_organization_admin(organization_id, auth_uid()))
  WITH CHECK (is_organization_admin(organization_id, auth_uid()));

-- =====================================================
-- EVENTS RLS POLICIES
-- =====================================================

-- Events: public events viewable by everyone
CREATE POLICY "Public events viewable by everyone"
  ON organization_events FOR SELECT
  USING (is_public = true);

-- Events: members-only events viewable by members
CREATE POLICY "Members-only events viewable by members"
  ON organization_events FOR SELECT
  USING (
    NOT is_public AND
    EXISTS(
      SELECT 1 FROM organization_members
      WHERE organization_id = organization_events.organization_id
        AND member_type = 'personal'
        AND member_id = auth_uid()
        AND membership_status = 'active'
    )
  );

-- Events: organization admins can manage
CREATE POLICY "Organization admins can manage events"
  ON organization_events FOR ALL
  USING (is_organization_admin(organization_id, auth_uid()))
  WITH CHECK (is_organization_admin(organization_id, auth_uid()));

-- =====================================================
-- STATS RLS POLICIES
-- =====================================================

-- Stats: readable based on profile visibility
CREATE POLICY "Profile stats viewable with profile"
  ON profile_stats FOR SELECT
  USING (
    is_profile_public(profile_id) OR
    profile_id = auth_uid() OR
    are_connected(profile_id, auth_uid())
  );

CREATE POLICY "Business stats viewable by everyone"
  ON business_stats FOR SELECT
  USING (true);

CREATE POLICY "Organization stats viewable by everyone"
  ON organization_stats FOR SELECT
  USING (true);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Public profiles are viewable by everyone" ON profiles IS 
  'Allows anyone to view public profiles';

COMMENT ON POLICY "Private profiles viewable by owner and connections" ON profiles IS 
  'Private profiles are only visible to owner and their connections';

COMMENT ON FUNCTION is_business_admin IS 
  'Returns true if user is business owner or admin team member';

COMMENT ON FUNCTION is_organization_admin IS 
  'Returns true if user is organization creator or leadership member';

-- =====================================================
-- END OF FILE
-- =====================================================

