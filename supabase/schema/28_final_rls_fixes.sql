-- =====================================================
-- 28: FINAL RLS AND INDEX FIXES
-- =====================================================
-- Consolidated from: FIX_ALL_ISSUES.sql
-- Applied: 2024-10-27
-- Purpose: Final RLS policy corrections for connections and business visibility
-- =====================================================

-- =====================================================
-- SECTION 1: CONNECTION REQUEST FIX
-- =====================================================
-- Allow users to create connection requests between themselves and others
-- Previous policy was too restrictive

DROP POLICY IF EXISTS "Users can create connections" ON connections;
DROP POLICY IF EXISTS "Users can create connection requests" ON connections;

CREATE POLICY "Users can create connection requests"
  ON connections FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    requested_by = auth.uid() AND
    (profile_id_1 = auth.uid() OR profile_id_2 = auth.uid())
  );

-- Unique constraint to prevent duplicate connections
CREATE UNIQUE INDEX IF NOT EXISTS idx_connections_unique_pair
  ON connections(profile_id_1, profile_id_2);

COMMENT ON POLICY "Users can create connection requests" ON connections IS 
'Allows authenticated users to create connection requests where they are the requester and one of the participants';

-- =====================================================
-- SECTION 2: BUSINESS PROFILE VISIBILITY
-- =====================================================
-- Business profiles are public directory - ensure all can view

DROP POLICY IF EXISTS "Business profiles viewable by everyone" ON business_profiles;
CREATE POLICY "Business profiles viewable by everyone"
  ON business_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Business profiles editable by owner" ON business_profiles;
CREATE POLICY "Business profiles editable by owner"
  ON business_profiles FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- =====================================================
-- SECTION 3: BUSINESS RELATED TABLES PUBLIC ACCESS
-- =====================================================
-- All business-related data should be publicly viewable

-- Business contact
DROP POLICY IF EXISTS "Business contact viewable by everyone" ON business_profiles_contact;
CREATE POLICY "Business contact viewable by everyone"
  ON business_profiles_contact FOR SELECT
  USING (true);

-- Business locations
DROP POLICY IF EXISTS "Business locations viewable by everyone" ON business_locations;
CREATE POLICY "Business locations viewable by everyone"
  ON business_locations FOR SELECT
  USING (true);

-- Business products
DROP POLICY IF EXISTS "Business products viewable by everyone" ON business_products;
CREATE POLICY "Business products viewable by everyone"
  ON business_products FOR SELECT
  USING (true);

-- Product images
DROP POLICY IF EXISTS "Product images viewable by everyone" ON product_images;
CREATE POLICY "Product images viewable by everyone"
  ON product_images FOR SELECT
  USING (true);

-- Business certifications
DROP POLICY IF EXISTS "Business certifications viewable by everyone" ON business_certifications;
CREATE POLICY "Business certifications viewable by everyone"
  ON business_certifications FOR SELECT
  USING (true);

-- Business team members (only show if show_on_page = true OR owner viewing)
DROP POLICY IF EXISTS "Business team viewable by everyone" ON business_team_members;
CREATE POLICY "Business team viewable by everyone"
  ON business_team_members FOR SELECT
  USING (show_on_page = true OR EXISTS (
    SELECT 1 FROM business_profiles bp
    WHERE bp.id = business_team_members.business_profile_id
    AND bp.owner_id = auth.uid()
  ));

-- Business contact persons
DROP POLICY IF EXISTS "Business contact persons viewable by everyone" ON business_contact_persons;
CREATE POLICY "Business contact persons viewable by everyone"
  ON business_contact_persons FOR SELECT
  USING (true);

-- Business farm details
DROP POLICY IF EXISTS "Business farm details viewable by everyone" ON business_farm_details;
CREATE POLICY "Business farm details viewable by everyone"
  ON business_farm_details FOR SELECT
  USING (true);

-- Business supplier details
DROP POLICY IF EXISTS "Business supplier details viewable by everyone" ON business_supplier_details;
CREATE POLICY "Business supplier details viewable by everyone"
  ON business_supplier_details FOR SELECT
  USING (true);

-- Business stats
DROP POLICY IF EXISTS "Business stats viewable by everyone" ON business_stats;
CREATE POLICY "Business stats viewable by everyone"
  ON business_stats FOR SELECT
  USING (true);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Business profiles viewable by everyone" ON business_profiles IS 
'Business profiles are publicly viewable for discovery and networking';

-- =====================================================
-- SUMMARY
-- =====================================================
-- ✅ Fixed connection RLS policy - now allows creating connections between different users
-- ✅ Added unique constraint to prevent duplicate connections
-- ✅ Ensured all business-related tables are publicly readable
-- ✅ Business team members filtered by show_on_page flag or ownership
-- =====================================================

