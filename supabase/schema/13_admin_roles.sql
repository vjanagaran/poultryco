-- =====================================================
-- PoultryCo Admin Roles & Permissions System
-- =====================================================
-- This file creates the admin role system that works
-- with the same Supabase Auth used for regular users
-- =====================================================

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'super_admin',
    'content_manager',
    'user_manager',
    'marketing_manager',
    'community_manager'
  )),
  permissions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id),
  last_login_at TIMESTAMPTZ,
  
  -- Ensure one user can only have one admin role
  UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all admin users
CREATE POLICY "Admins can view admin users"
  ON admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- Policy: Super admins can manage admin users
CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = user_uuid
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM admin_users
  WHERE user_id = user_uuid
  AND is_active = true;
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Table comments
COMMENT ON TABLE admin_users IS 'Admin users with role-based access control for the admin portal';
COMMENT ON COLUMN admin_users.user_id IS 'References auth.users - same user can be both regular user and admin';
COMMENT ON COLUMN admin_users.role IS 'Admin role: super_admin, content_manager, user_manager, marketing_manager, community_manager';
COMMENT ON COLUMN admin_users.permissions IS 'Additional granular permissions stored as JSON for fine-grained access control';
COMMENT ON COLUMN admin_users.is_active IS 'Whether this admin account is active - set to false to revoke admin access';

-- =====================================================
-- Example: Create first super admin
-- =====================================================
-- Run this after creating a user in Supabase Auth:
-- 
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" and create admin@poultryco.net
-- 3. Get the user_id from the users table
-- 4. Run this query (replace USER_ID):
--
-- INSERT INTO admin_users (user_id, role, is_active)
-- VALUES (
--   'USER_ID_HERE',  -- Replace with actual UUID from auth.users
--   'super_admin',
--   true
-- );
-- =====================================================

