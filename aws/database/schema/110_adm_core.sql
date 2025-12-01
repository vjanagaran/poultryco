-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 110_adm_core.sql
-- Description: Admin and moderation system
-- Version: 2.0
-- Date: 2025-12-01
-- Dependencies: 01_core_and_ref.sql
-- =====================================================

-- =====================================================
-- SECTION 1: ADMIN ROLES
-- =====================================================

CREATE TABLE IF NOT EXISTS adm_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Role details
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Permissions (JSONB for flexibility)
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Hierarchy
  level INTEGER NOT NULL DEFAULT 0, -- 0 = highest (super admin)
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_adm_roles_name ON adm_roles(name);
CREATE INDEX idx_adm_roles_level ON adm_roles(level);
CREATE INDEX idx_adm_roles_active ON adm_roles(is_active) WHERE is_active = true;

CREATE TRIGGER update_adm_roles_updated_at
  BEFORE UPDATE ON adm_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 2: ADMIN USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS adm_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES adm_roles(id),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_adm_users_profile ON adm_users(profile_id);
CREATE INDEX idx_adm_users_role ON adm_users(role_id);
CREATE INDEX idx_adm_users_active ON adm_users(is_active) WHERE is_active = true;

CREATE TRIGGER update_adm_users_updated_at
  BEFORE UPDATE ON adm_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 3: MODERATION QUEUE
-- =====================================================

CREATE TABLE IF NOT EXISTS adm_moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content (polymorphic)
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'resource', 'profile', 'business', 'organization', 'event', 'message')),
  content_id UUID NOT NULL,
  
  -- Report
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  report_reason TEXT NOT NULL,
  report_description TEXT,
  
  -- Priority
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'dismissed')),
  
  -- Review
  reviewed_by UUID REFERENCES adm_users(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_adm_moderation_queue_content ON adm_moderation_queue(content_type, content_id);
CREATE INDEX idx_adm_moderation_queue_reported_by ON adm_moderation_queue(reported_by);
CREATE INDEX idx_adm_moderation_queue_status ON adm_moderation_queue(status);
CREATE INDEX idx_adm_moderation_queue_priority ON adm_moderation_queue(priority, created_at DESC);
CREATE INDEX idx_adm_moderation_queue_pending ON adm_moderation_queue(status) WHERE status = 'pending';

CREATE TRIGGER update_adm_moderation_queue_updated_at
  BEFORE UPDATE ON adm_moderation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECTION 4: ADMIN ACTIONS LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS adm_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES adm_users(id) ON DELETE CASCADE,
  
  -- Action
  action_type TEXT NOT NULL CHECK (action_type IN (
    'user_suspend', 'user_ban', 'user_unban',
    'content_remove', 'content_restore',
    'profile_verify', 'profile_unverify',
    'role_assign', 'role_revoke',
    'setting_update',
    'other'
  )),
  
  -- Target (optional)
  target_type TEXT,
  target_id UUID,
  
  -- Details
  description TEXT NOT NULL,
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_adm_actions_log_admin ON adm_actions_log(admin_user_id, created_at DESC);
CREATE INDEX idx_adm_actions_log_type ON adm_actions_log(action_type);
CREATE INDEX idx_adm_actions_log_target ON adm_actions_log(target_type, target_id);
CREATE INDEX idx_adm_actions_log_created ON adm_actions_log(created_at DESC);

-- =====================================================
-- SECTION 5: BANNED USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS adm_banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Ban details
  reason TEXT NOT NULL,
  ban_type TEXT NOT NULL CHECK (ban_type IN ('temporary', 'permanent')),
  
  -- Duration (for temporary bans)
  banned_until TIMESTAMPTZ,
  
  -- Admin
  banned_by UUID NOT NULL REFERENCES adm_users(id),
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  banned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unbanned_at TIMESTAMPTZ
);

CREATE INDEX idx_adm_banned_users_profile ON adm_banned_users(profile_id);
CREATE INDEX idx_adm_banned_users_active ON adm_banned_users(is_active) WHERE is_active = true;
CREATE INDEX idx_adm_banned_users_temporary ON adm_banned_users(banned_until) WHERE ban_type = 'temporary';

-- =====================================================
-- SECTION 6: SYSTEM SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS adm_system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  
  -- Metadata
  category TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_adm_system_settings_category ON adm_system_settings(category);

CREATE TRIGGER update_adm_system_settings_updated_at
  BEFORE UPDATE ON adm_system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE adm_roles IS 'Admin roles with permissions';
COMMENT ON TABLE adm_users IS 'Admin users';
COMMENT ON TABLE adm_moderation_queue IS 'Content moderation queue';
COMMENT ON TABLE adm_actions_log IS 'Admin actions audit log';
COMMENT ON TABLE adm_banned_users IS 'Banned users';
COMMENT ON TABLE adm_system_settings IS 'System-wide settings';

