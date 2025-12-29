-- =====================================================
-- PoultryCo AWS Database Schema
-- File: 111_adm_seed_data.sql
-- Description: Admin system seed data
-- Version: 1.0
-- Date: 2025-12-06
-- Dependencies: 110_adm_core.sql
-- =====================================================

-- =====================================================
-- SECTION 1: MENU GROUPS
-- =====================================================

INSERT INTO adm_menugroups (name, slug, icon, display_order, is_active) VALUES
  ('Dashboard', 'dashboard', '📊', 1, true),
  ('Content', 'content', '📝', 2, true),
  ('Forms', 'forms', '📋', 3, true),
  ('NECC System', 'necc', '🥚', 4, true),
  ('Marketing', 'marketing', '🎯', 5, true),
  ('Platform', 'platform', '🌐', 6, true),
  ('Administration', 'administration', '⚙️', 7, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 2: MENUS
-- =====================================================

-- Dashboard
INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Dashboard',
  'dashboard',
  '📊',
  '/dashboard',
  NULL,
  1,
  true
FROM adm_menugroups mg WHERE mg.slug = 'dashboard'
ON CONFLICT (group_id, path) DO NOTHING;

-- Content: Blog
INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Blog Posts',
  'blog',
  '📝',
  '/blog',
  NULL,
  1,
  true
FROM adm_menugroups mg WHERE mg.slug = 'content'
ON CONFLICT (group_id, path) DO NOTHING;

-- Forms
INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Early Access',
  'early-access',
  '🎯',
  '/forms/early-access',
  '/forms',
  1,
  true
FROM adm_menugroups mg WHERE mg.slug = 'forms'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Newsletter',
  'newsletter',
  '📰',
  '/forms/newsletter',
  '/forms',
  2,
  true
FROM adm_menugroups mg WHERE mg.slug = 'forms'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Contact',
  'contact',
  '✉️',
  '/forms/contact',
  '/forms',
  3,
  true
FROM adm_menugroups mg WHERE mg.slug = 'forms'
ON CONFLICT (group_id, path) DO NOTHING;

-- NECC System
INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'NECC Dashboard',
  'necc-dashboard',
  '🥚',
  '/necc',
  NULL,
  1,
  true
FROM adm_menugroups mg WHERE mg.slug = 'necc'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Zones',
  'necc-zones',
  '🗺️',
  '/necc/zones',
  '/necc',
  2,
  true
FROM adm_menugroups mg WHERE mg.slug = 'necc'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Prices',
  'necc-prices',
  '💰',
  '/necc/prices',
  '/necc',
  3,
  true
FROM adm_menugroups mg WHERE mg.slug = 'necc'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Scraper',
  'necc-scraper',
  '🤖',
  '/necc/scraper',
  '/necc',
  4,
  true
FROM adm_menugroups mg WHERE mg.slug = 'necc'
ON CONFLICT (group_id, path) DO NOTHING;

-- Marketing
INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Marketing Dashboard',
  'marketing-dashboard',
  '🎯',
  '/marketing',
  NULL,
  1,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'NDP Topics',
  'marketing-topics',
  '💡',
  '/marketing/topics',
  '/marketing',
  2,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Segments',
  'marketing-segments',
  '👥',
  '/marketing/segments',
  '/marketing',
  3,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Content Pillars',
  'marketing-pillars',
  '🏛️',
  '/marketing/pillars',
  '/marketing',
  4,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Campaigns',
  'marketing-campaigns',
  '🚀',
  '/marketing/campaigns',
  '/marketing',
  5,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Channels',
  'marketing-channels',
  '📱',
  '/marketing/channels',
  '/marketing',
  6,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Calendar',
  'marketing-calendar',
  '📅',
  '/marketing/calendar',
  '/marketing',
  7,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'KPIs',
  'marketing-kpis',
  '📊',
  '/marketing/kpis',
  '/marketing',
  8,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Tags',
  'marketing-tags',
  '🏷️',
  '/marketing/settings/tags',
  '/marketing',
  9,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Platform
INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Users',
  'users',
  '👥',
  '/users',
  NULL,
  1,
  true
FROM adm_menugroups mg WHERE mg.slug = 'platform'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Analytics',
  'analytics',
  '📈',
  '/analytics',
  NULL,
  2,
  true
FROM adm_menugroups mg WHERE mg.slug = 'platform'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Email Campaigns',
  'email-campaigns',
  '📧',
  '/email-campaigns',
  NULL,
  3,
  true
FROM adm_menugroups mg WHERE mg.slug = 'platform'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Feedback',
  'feedback',
  '💬',
  '/feedback',
  NULL,
  4,
  true
FROM adm_menugroups mg WHERE mg.slug = 'platform'
ON CONFLICT (group_id, path) DO NOTHING;

-- Administration
INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Admin Users',
  'admin-users',
  '👤',
  '/admin/users',
  NULL,
  1,
  true
FROM adm_menugroups mg WHERE mg.slug = 'administration'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Roles',
  'admin-roles',
  '🔐',
  '/admin/roles',
  NULL,
  2,
  true
FROM adm_menugroups mg WHERE mg.slug = 'administration'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Moderation Queue',
  'admin-moderation',
  '🛡️',
  '/admin/moderation',
  NULL,
  3,
  true
FROM adm_menugroups mg WHERE mg.slug = 'administration'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Audit Log',
  'admin-audit-log',
  '📋',
  '/admin/audit-log',
  NULL,
  4,
  true
FROM adm_menugroups mg WHERE mg.slug = 'administration'
ON CONFLICT (group_id, path) DO NOTHING;

INSERT INTO adm_menus (group_id, name, slug, icon, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'System Settings',
  'admin-settings',
  '⚙️',
  '/admin/settings',
  NULL,
  5,
  true
FROM adm_menugroups mg WHERE mg.slug = 'administration'
ON CONFLICT (group_id, path) DO NOTHING;

-- =====================================================
-- SECTION 3: ROLES
-- =====================================================

INSERT INTO adm_roles (name, slug, description, is_active) VALUES
  ('Super Admin', 'super_admin', 'Full system access with all permissions', true),
  ('Admin', 'admin', 'Administrative access to most features', true),
  ('Moderator', 'moderator', 'Content moderation and user management', true),
  ('Content Manager', 'content_manager', 'Blog, marketing, and content management', true),
  ('Analyst', 'analyst', 'Analytics and reporting access', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 4: SUPER ADMIN - ALL MENUS
-- =====================================================

-- Assign all menus to Super Admin role
INSERT INTO adm_roles_menus (role_id, menu_id)
SELECT 
  r.id,
  m.id
FROM adm_roles r
CROSS JOIN adm_menus m
WHERE r.slug = 'super_admin'
ON CONFLICT (role_id, menu_id) DO NOTHING;

-- =====================================================
-- SECTION 5: SUPER ADMIN USER
-- =====================================================
-- Password: PoultryCo#1
-- Hash: $2b$10$x8vBHKdj/oTLPcvx3E3MQuACQ7a4dvJpajIxEXB68illC1/TC3Qgi

INSERT INTO adm_users (role_id, email, password_hash, is_active)
SELECT 
  r.id,
  'admin@poultryco.net',
  '$2b$10$x8vBHKdj/oTLPcvx3E3MQuACQ7a4dvJpajIxEXB68illC1/TC3Qgi',
  true
FROM adm_roles r
WHERE r.slug = 'super_admin'
ON CONFLICT (email) DO NOTHING;
