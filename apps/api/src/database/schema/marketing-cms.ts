import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

// Blog Categories
export const blogCategories = pgTable('blog_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color'),
  icon: text('icon'),
  postCount: integer('post_count').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Blog Tags
export const blogTags = pgTable('blog_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  postCount: integer('post_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Blog Posts
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Basic Info
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  
  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  metaKeywords: jsonb('meta_keywords'), // array
  ogImage: text('og_image'),
  
  // Featured Image
  featuredImage: text('featured_image'),
  featuredImageAlt: text('featured_image_alt'),
  
  // Categorization
  categoryId: uuid('category_id').references(() => blogCategories.id, { onDelete: 'set null' }),
  
  // Author
  authorId: uuid('author_id'), // References auth.users
  authorName: text('author_name'),
  
  // Status & Publishing
  status: text('status').default('draft').$type<'draft' | 'published' | 'scheduled' | 'archived'>(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }),
  
  // Engagement Metrics
  viewCount: integer('view_count').default(0),
  likeCount: integer('like_count').default(0),
  commentCount: integer('comment_count').default(0),
  shareCount: integer('share_count').default(0),
  
  // Reading Stats
  readingTimeMinutes: integer('reading_time_minutes'),
  wordCount: integer('word_count'),
  
  // Featured & Pinned
  isFeatured: boolean('is_featured').default(false),
  isPinned: boolean('is_pinned').default(false),
  featuredOrder: integer('featured_order'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Blog Post Tags (Many-to-Many)
export const blogPostTags = pgTable('blog_post_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => blogTags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

