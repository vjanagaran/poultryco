import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';

// Admin: Roles
export const admRoles = pgTable('adm_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  permissions: jsonb('permissions'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Admin: Users
export const admUsers = pgTable('adm_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }).unique(),
  roleId: uuid('role_id').notNull().references(() => admRoles.id),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Admin: System Settings
export const admSystemSettings = pgTable('adm_system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  category: text('category').notNull(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  dataType: text('data_type').default('string'), // string, number, boolean, json
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  updatedBy: uuid('updated_by').references(() => admUsers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

