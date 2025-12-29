import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';

// Analytics: Profile Views
export const anlProfileViews = pgTable('anl_profile_views', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  viewerId: uuid('viewer_id').references(() => profiles.id, { onDelete: 'set null' }),
  viewerType: text('viewer_type').default('authenticated'), // authenticated, anonymous
  source: text('source'), // search, discovery, post, connection
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Analytics: Activity Log
export const anlActivityLog = pgTable('anl_activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  activityType: text('activity_type').notNull(), // login, post_create, connection_request, etc.
  entityType: text('entity_type'),
  entityId: uuid('entity_id'),
  metadata: jsonb('metadata'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

