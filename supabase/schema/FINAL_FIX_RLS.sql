-- =====================================================
-- FINAL FIX: Add ALL missing RLS policies
-- This fixes profile creation and all related issues
-- Date: 2025-10-17
-- Execute this ONCE in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. PROFILE STATS (CRITICAL - blocks profile creation)
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profile_stats' AND policyname = 'Users can insert own profile stats'
    ) THEN
        CREATE POLICY "Users can insert own profile stats"
          ON profile_stats FOR INSERT
          WITH CHECK (profile_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profile_stats' AND policyname = 'Users can update own profile stats'
    ) THEN
        CREATE POLICY "Users can update own profile stats"
          ON profile_stats FOR UPDATE
          USING (profile_id = auth.uid())
          WITH CHECK (profile_id = auth.uid());
    END IF;
END $$;

-- =====================================================
-- 2. PROFILE ROLES (blocks role creation)
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profile_roles' AND policyname = 'Users can insert own roles'
    ) THEN
        CREATE POLICY "Users can insert own roles"
          ON profile_roles FOR INSERT
          WITH CHECK (profile_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profile_roles' AND policyname = 'Users can update own roles'
    ) THEN
        CREATE POLICY "Users can update own roles"
          ON profile_roles FOR UPDATE
          USING (profile_id = auth.uid())
          WITH CHECK (profile_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profile_roles' AND policyname = 'Users can delete own roles'
    ) THEN
        CREATE POLICY "Users can delete own roles"
          ON profile_roles FOR DELETE
          USING (profile_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profile_roles' AND policyname = 'Users can view own roles'
    ) THEN
        CREATE POLICY "Users can view own roles"
          ON profile_roles FOR SELECT
          USING (profile_id = auth.uid());
    END IF;
END $$;

-- =====================================================
-- 3. BUSINESS STATS
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'business_stats' AND policyname = 'Users can insert own business stats'
    ) THEN
        CREATE POLICY "Users can insert own business stats"
          ON business_stats FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM business_profiles
              WHERE business_profiles.id = business_stats.business_profile_id
              AND business_profiles.owner_id = auth.uid()
            )
          );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'business_stats' AND policyname = 'Users can update own business stats'
    ) THEN
        CREATE POLICY "Users can update own business stats"
          ON business_stats FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM business_profiles
              WHERE business_profiles.id = business_stats.business_profile_id
              AND business_profiles.owner_id = auth.uid()
            )
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM business_profiles
              WHERE business_profiles.id = business_stats.business_profile_id
              AND business_profiles.owner_id = auth.uid()
            )
          );
    END IF;
END $$;

-- =====================================================
-- 4. ORGANIZATION STATS
-- =====================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization_stats' AND policyname = 'Org admins can insert org stats'
    ) THEN
        CREATE POLICY "Org admins can insert org stats"
          ON organization_stats FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM organizations
              WHERE organizations.id = organization_stats.organization_id
              AND organizations.creator_id = auth.uid()
            )
          );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organization_stats' AND policyname = 'Org admins can update org stats'
    ) THEN
        CREATE POLICY "Org admins can update org stats"
          ON organization_stats FOR UPDATE
          USING (
            EXISTS (
              SELECT 1 FROM organizations
              WHERE organizations.id = organization_stats.organization_id
              AND organizations.creator_id = auth.uid()
            )
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM organizations
              WHERE organizations.id = organization_stats.organization_id
              AND organizations.creator_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ALL RLS POLICIES CREATED SUCCESSFULLY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ profile_stats - INSERT/UPDATE policies added';
  RAISE NOTICE '✅ profile_roles - INSERT/UPDATE/DELETE/SELECT policies added';
  RAISE NOTICE '✅ business_stats - INSERT/UPDATE policies added';
  RAISE NOTICE '✅ organization_stats - INSERT/UPDATE policies added';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Profile creation should now work!';
  RAISE NOTICE '🎉 Reload the app and try creating a profile';
  RAISE NOTICE '========================================';
END $$;

