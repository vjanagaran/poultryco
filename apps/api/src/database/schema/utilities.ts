import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';

// Utilities: Tags
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  tagType: text('tag_type').default('general'), // general, skill, topic, location
  usageCount: integer('usage_count').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Utilities: Media Uploads
export const mediaUploads = pgTable('media_uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  uploaderId: uuid('uploader_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  fileUrl: text('file_url').notNull(),
  cdnUrl: text('cdn_url'),
  
  // S3 details
  s3Bucket: text('s3_bucket'),
  s3Key: text('s3_key'),
  
  // Media metadata
  width: integer('width'),
  height: integer('height'),
  duration: integer('duration'), // for videos/audio
  
  // Usage
  entityType: text('entity_type'), // post, profile, business, message, etc.
  entityId: uuid('entity_id'),
  
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Utilities: Email Queue
export const emailQueue = pgTable('email_queue', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipientEmail: text('recipient_email').notNull(),
  recipientName: text('recipient_name'),
  
  emailType: text('email_type').notNull(), // welcome, verification, notification, marketing
  subject: text('subject').notNull(),
  htmlBody: text('html_body').notNull(),
  textBody: text('text_body'),
  
  // SES details
  messageId: text('message_id'),
  status: text('status').default('pending'), // pending, sent, failed, bounced
  sentAt: timestamp('sent_at', { withTimezone: true }),
  failedAt: timestamp('failed_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  
  // Retry logic
  attempts: integer('attempts').default(0),
  maxAttempts: integer('max_attempts').default(3),
  nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
  
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Utilities: Audit Log
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id'),
  changes: jsonb('changes'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

