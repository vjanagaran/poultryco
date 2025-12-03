import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';

// Resources: Categories
export const resCategories = pgTable('res_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  parentId: uuid('parent_id'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Resources: Resources
export const resResources = pgTable('res_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => resCategories.id),
  
  resourceType: text('resource_type').notNull(), // calculator, guide, reference, tool
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  content: text('content'),
  
  // Media
  thumbnailUrl: text('thumbnail_url'),
  fileUrl: text('file_url'),
  
  // Engagement
  viewsCount: integer('views_count').default(0),
  likesCount: integer('likes_count').default(0),
  bookmarksCount: integer('bookmarks_count').default(0),
  
  // Status
  isPublished: boolean('is_published').default(true),
  isFeatured: boolean('is_featured').default(false),
  
  metadata: jsonb('metadata'),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

