import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';

// Social: Posts
export const socPosts = pgTable('soc_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  postType: text('post_type').notNull().default('post'), // post, problem, question, article
  content: text('content').notNull(),
  title: text('title'),
  
  // Problem/Question specific
  category: text('category'),
  urgency: text('urgency'), // low, medium, high, critical
  status: text('status'), // open, in_progress, solved, closed
  
  // Media
  mediaUrls: jsonb('media_urls'), // array of S3 URLs
  
  // Engagement counts (denormalized)
  likesCount: integer('likes_count').default(0),
  commentsCount: integer('comments_count').default(0),
  sharesCount: integer('shares_count').default(0),
  viewsCount: integer('views_count').default(0),
  
  // Metadata
  tags: jsonb('tags'), // array of hashtags
  mentions: jsonb('mentions'), // array of profile IDs
  location: text('location'),
  isPinned: boolean('is_pinned').default(false),
  isPublished: boolean('is_published').default(true),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Social: Post Likes
export const socPostLikes = pgTable('soc_post_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => socPosts.id, { onDelete: 'cascade' }),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  reactionType: text('reaction_type').default('like'), // like, love, insightful, celebrate
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Social: Post Comments
export const socPostComments = pgTable('soc_post_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => socPosts.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  parentCommentId: uuid('parent_comment_id'), // for nested comments
  content: text('content').notNull(),
  mediaUrls: jsonb('media_urls'),
  
  // Engagement
  likesCount: integer('likes_count').default(0),
  repliesCount: integer('replies_count').default(0),
  
  isEdited: boolean('is_edited').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Social: Connections (two-way relationship)
export const socConnections = pgTable('soc_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  requesterId: uuid('requester_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  addresseeId: uuid('addressee_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'), // pending, accepted, rejected, blocked
  message: text('message'),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Social: Follows (one-way relationship)
export const socFollows = pgTable('soc_follows', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  followType: text('follow_type').default('user'), // user, business, organization
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Social: Blocks
export const socBlocks = pgTable('soc_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  blockerId: uuid('blocker_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  blockedId: uuid('blocked_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Social: Post Bookmarks
export const socPostBookmarks = pgTable('soc_post_bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => socPosts.id, { onDelete: 'cascade' }),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

