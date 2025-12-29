import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';

// Messages: Conversations
export const msgConversations = pgTable('msg_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationType: text('conversation_type').notNull().default('direct'), // direct, group, business, broadcast
  name: text('name'),
  description: text('description'),
  avatarUrl: text('avatar_url'),
  
  // For business/organization conversations
  businessId: uuid('business_id'),
  organizationId: uuid('organization_id'),
  
  // Metadata
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  messagesCount: integer('messages_count').default(0),
  metadata: jsonb('metadata'),
  
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Messages: Participants
export const msgParticipants = pgTable('msg_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => msgConversations.id, { onDelete: 'cascade' }),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: text('role').default('member'), // admin, member
  
  // Read status
  lastReadAt: timestamp('last_read_at', { withTimezone: true }),
  unreadCount: integer('unread_count').default(0),
  
  // Settings
  isMuted: boolean('is_muted').default(false),
  isPinned: boolean('is_pinned').default(false),
  isArchived: boolean('is_archived').default(false),
  
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  leftAt: timestamp('left_at', { withTimezone: true }),
});

// Messages: Messages
export const msgMessages = pgTable('msg_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => msgConversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  
  // Content
  messageType: text('message_type').notNull().default('text'), // text, image, video, document, audio
  content: text('content'),
  mediaUrl: text('media_url'),
  mediaMetadata: jsonb('media_metadata'), // size, duration, dimensions, etc.
  
  // Reply/Forward
  replyToId: uuid('reply_to_id'),
  forwardedFromId: uuid('forwarded_from_id'),
  
  // Status
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  readBy: jsonb('read_by'), // array of profile IDs with timestamps
  
  // Flags
  isEdited: boolean('is_edited').default(false),
  isStarred: boolean('is_starred').default(false),
  isDeleted: boolean('is_deleted').default(false),
  deletedFor: jsonb('deleted_for'), // array of profile IDs (delete for me)
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

