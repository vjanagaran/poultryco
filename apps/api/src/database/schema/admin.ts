import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { profiles } from './core';

// Admin: Menu Groups
export const admMenuGroups = pgTable('adm_menugroups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('idx_adm_menugroups_slug').on(table.slug),
  orderIdx: index('idx_adm_menugroups_order').on(table.displayOrder),
  activeIdx: index('idx_adm_menugroups_active').on(table.isActive),
}));

// Admin: Menus
export const admMenus = pgTable('adm_menus', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => admMenuGroups.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  icon: text('icon'),
  description: text('description'),
  path: text('path').notNull(),
  parentPath: text('parent_path'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  groupIdx: index('idx_adm_menus_group').on(table.groupId),
  pathIdx: index('idx_adm_menus_path').on(table.path),
  parentIdx: index('idx_adm_menus_parent').on(table.parentPath),
  orderIdx: index('idx_adm_menus_order').on(table.groupId, table.displayOrder),
  activeIdx: index('idx_adm_menus_active').on(table.isActive),
  uniqueGroupPath: index('idx_adm_menus_unique').on(table.groupId, table.path),
}));

// Admin: Roles
export const admRoles = pgTable('adm_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('idx_adm_roles_name').on(table.name),
  slugIdx: index('idx_adm_roles_slug').on(table.slug),
  activeIdx: index('idx_adm_roles_active').on(table.isActive),
}));

// Admin: Roles Menus (Mapping)
export const admRolesMenus = pgTable('adm_roles_menus', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id').notNull().references(() => admRoles.id, { onDelete: 'cascade' }),
  menuId: uuid('menu_id').notNull().references(() => admMenus.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  roleIdx: index('idx_adm_roles_menus_role').on(table.roleId),
  menuIdx: index('idx_adm_roles_menus_menu').on(table.menuId),
  uniqueRoleMenu: index('idx_adm_roles_menus_unique').on(table.roleId, table.menuId),
}));

// Admin: Users
export const admUsers = pgTable('adm_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id').notNull().references(() => admRoles.id),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: index('idx_adm_users_email').on(table.email),
  roleIdx: index('idx_adm_users_role').on(table.roleId),
  activeIdx: index('idx_adm_users_active').on(table.isActive),
}));

// Admin: Moderation Queue
export const admModerationQueue = pgTable('adm_moderation_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentType: text('content_type').notNull(),
  contentId: uuid('content_id').notNull(),
  reportedBy: uuid('reported_by').references(() => profiles.id, { onDelete: 'set null' }),
  reportReason: text('report_reason').notNull(),
  reportDescription: text('report_description'),
  priority: text('priority').notNull().default('normal'),
  status: text('status').notNull().default('pending'),
  reviewedBy: uuid('reviewed_by').references(() => admUsers.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  actionTaken: text('action_taken'),
  resolutionNotes: text('resolution_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  contentIdx: index('idx_adm_moderation_queue_content').on(table.contentType, table.contentId),
  reportedByIdx: index('idx_adm_moderation_queue_reported_by').on(table.reportedBy),
  statusIdx: index('idx_adm_moderation_queue_status').on(table.status),
  priorityIdx: index('idx_adm_moderation_queue_priority').on(table.priority, table.createdAt),
}));

// Admin: Actions Log
export const admActionsLog = pgTable('adm_actions_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminUserId: uuid('admin_user_id').notNull().references(() => admUsers.id, { onDelete: 'cascade' }),
  actionType: text('action_type').notNull(),
  targetType: text('target_type'),
  targetId: uuid('target_id'),
  description: text('description').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  adminIdx: index('idx_adm_actions_log_admin').on(table.adminUserId, table.createdAt),
  typeIdx: index('idx_adm_actions_log_type').on(table.actionType),
  targetIdx: index('idx_adm_actions_log_target').on(table.targetType, table.targetId),
  createdIdx: index('idx_adm_actions_log_created').on(table.createdAt),
}));

// Admin: Banned Users
export const admBannedUsers = pgTable('adm_banned_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }).unique(),
  reason: text('reason').notNull(),
  banType: text('ban_type').notNull(),
  bannedUntil: timestamp('banned_until', { withTimezone: true }),
  bannedBy: uuid('banned_by').notNull().references(() => admUsers.id),
  isActive: boolean('is_active').default(true),
  bannedAt: timestamp('banned_at', { withTimezone: true }).defaultNow().notNull(),
  unbannedAt: timestamp('unbanned_at', { withTimezone: true }),
}, (table) => ({
  profileIdx: index('idx_adm_banned_users_profile').on(table.profileId),
  activeIdx: index('idx_adm_banned_users_active').on(table.isActive),
}));

// Admin: System Settings
export const admSystemSettings = pgTable('adm_system_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  description: text('description'),
  category: text('category'),
  isPublic: boolean('is_public').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index('idx_adm_system_settings_category').on(table.category),
}));
