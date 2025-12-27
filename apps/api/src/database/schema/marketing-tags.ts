import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';

// Content Tags (Flexible Taxonomy)
export const contentTags = pgTable('content_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  color: text('color').default('#6366F1'),
  description: text('description'),
  usageCount: integer('usage_count').default(0),
  createdBy: uuid('created_by'), // References auth.users
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Content Tag Assignments (Content <-> Tags)
export const contentTagAssignments = pgTable('content_tag_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  contentId: uuid('content_id').notNull(), // References content(id)
  tagId: uuid('tag_id').notNull().references(() => contentTags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Pillar Tag Assignments (Pillars <-> Tags)
export const pillarTagAssignments = pgTable('pillar_tag_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  pillarId: uuid('pillar_id').notNull(), // References content_pillars(id)
  tagId: uuid('tag_id').notNull().references(() => contentTags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

