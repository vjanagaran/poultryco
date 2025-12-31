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
-- First, delete old marketing menus to avoid conflicts
DELETE FROM adm_menus WHERE group_id IN (SELECT id FROM adm_menugroups WHERE slug = 'marketing');

-- Marketing Dashboard (Main)
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Marketing Dashboard',
  'marketing-dashboard',
  '📊',
  'Overview of all marketing activities',
  '/marketing',
  NULL,
  1,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- =====================================================
-- CORE MARKETING
-- =====================================================

-- Campaigns
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Campaigns',
  'marketing-campaigns',
  '🚀',
  'Top-level marketing campaigns',
  '/marketing/campaigns',
  '/marketing',
  10,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Segments
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Segments',
  'marketing-segments',
  '👥',
  'Target audience segments',
  '/marketing/segments',
  '/marketing',
  11,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- NDP Research - Categories
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'NDP Categories',
  'marketing-ndp-categories',
  '📂',
  'NDP framework categories',
  '/marketing/ndp-research/categories',
  '/marketing',
  12,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- NDP Research - Topics
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'NDP Topics',
  'marketing-ndp-topics',
  '💡',
  'NDP research topics',
  '/marketing/ndp-research/topics',
  '/marketing',
  13,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Personas
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Personas',
  'marketing-personas',
  '🎭',
  'ICP definition and mapping',
  '/marketing/personas',
  '/marketing',
  14,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- =====================================================
-- CONTENT SYSTEM
-- =====================================================

-- Content Pillars
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Content Pillars',
  'marketing-content-pillars',
  '🏛️',
  'Core research topics for content',
  '/marketing/content/pillars',
  '/marketing',
  20,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Content
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Content',
  'marketing-content',
  '📄',
  'Master and repurposed content',
  '/marketing/content',
  '/marketing',
  21,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Content Ideas
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Content Ideas',
  'marketing-content-ideas',
  '💭',
  'Quick capture of content ideas',
  '/marketing/content/ideas',
  '/marketing',
  22,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Content Calendar
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Content Calendar',
  'marketing-content-calendar',
  '📅',
  'Schedule and track content publishing',
  '/marketing/content/calendar',
  '/marketing',
  23,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Content Tags
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Content Tags',
  'marketing-content-tags',
  '🏷️',
  'Content taxonomy',
  '/marketing/content/tags',
  '/marketing',
  24,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- =====================================================
-- WHATSAPP
-- =====================================================

-- WhatsApp Dashboard
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'WhatsApp',
  'marketing-whatsapp',
  '💬',
  'WhatsApp marketing integration',
  '/marketing/whatsapp',
  '/marketing',
  30,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- WhatsApp Accounts
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'WhatsApp Accounts',
  'marketing-whatsapp-accounts',
  '📱',
  'Account management',
  '/marketing/whatsapp/accounts',
  '/marketing',
  31,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- WhatsApp Groups
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'WhatsApp Groups',
  'marketing-whatsapp-groups',
  '👥',
  'Group discovery and management',
  '/marketing/whatsapp/groups',
  '/marketing',
  32,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- WhatsApp Contacts
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'WhatsApp Contacts',
  'marketing-whatsapp-contacts',
  '📇',
  'Contact and persona mapping',
  '/marketing/whatsapp/contacts',
  '/marketing',
  33,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- WhatsApp Messages
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'WhatsApp Messages',
  'marketing-whatsapp-messages',
  '💬',
  'Message tracking',
  '/marketing/whatsapp/messages',
  '/marketing',
  34,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- WhatsApp Analytics
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'WhatsApp Analytics',
  'marketing-whatsapp-analytics',
  '📊',
  'WhatsApp performance metrics',
  '/marketing/whatsapp/analytics',
  '/marketing',
  35,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- =====================================================
-- SOCIAL MEDIA
-- =====================================================

-- Social Media Channels
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Social Channels',
  'marketing-social-channels',
  '📺',
  'Social media channel management',
  '/marketing/social/channels',
  '/marketing',
  40,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Social Media Posts
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Social Posts',
  'marketing-social-posts',
  '📝',
  'Social media posts',
  '/marketing/social/posts',
  '/marketing',
  41,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Social Media Schedule
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Social Schedule',
  'marketing-social-schedule',
  '📅',
  'Social media scheduling',
  '/marketing/social/schedule',
  '/marketing',
  42,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Social Media Analytics
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Social Analytics',
  'marketing-social-analytics',
  '📊',
  'Social media performance',
  '/marketing/social/analytics',
  '/marketing',
  43,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- =====================================================
-- EMAIL
-- =====================================================

-- Email Campaigns
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Email Campaigns',
  'marketing-email-campaigns',
  '📬',
  'Email marketing campaigns',
  '/marketing/email/campaigns',
  '/marketing',
  50,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Email Templates
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Email Templates',
  'marketing-email-templates',
  '📝',
  'Email templates',
  '/marketing/email/templates',
  '/marketing',
  51,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Email Lists
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Email Lists',
  'marketing-email-lists',
  '📋',
  'Subscriber lists',
  '/marketing/email/lists',
  '/marketing',
  52,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Email Schedule
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Email Schedule',
  'marketing-email-schedule',
  '📅',
  'Email scheduling',
  '/marketing/email/schedule',
  '/marketing',
  53,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Email Analytics
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Email Analytics',
  'marketing-email-analytics',
  '📊',
  'Email performance',
  '/marketing/email/analytics',
  '/marketing',
  54,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- =====================================================
-- ANALYTICS & KPIS
-- =====================================================

-- Marketing KPIs
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Marketing KPIs',
  'marketing-analytics-kpis',
  '📈',
  'Overall marketing metrics',
  '/marketing/analytics/kpis',
  '/marketing',
  60,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Performance
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Performance',
  'marketing-analytics-performance',
  '📉',
  'Campaign and content performance',
  '/marketing/analytics/performance',
  '/marketing',
  61,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Reports
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Reports',
  'marketing-analytics-reports',
  '📊',
  'Marketing reports',
  '/marketing/analytics/reports',
  '/marketing',
  62,
  true
FROM adm_menugroups mg WHERE mg.slug = 'marketing'
ON CONFLICT (group_id, path) DO NOTHING;

-- Goals
INSERT INTO adm_menus (group_id, name, slug, icon, description, path, parent_path, display_order, is_active)
SELECT 
  mg.id,
  'Goals',
  'marketing-analytics-goals',
  '🎯',
  'Marketing goals and targets',
  '/marketing/analytics/goals',
  '/marketing',
  63,
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
