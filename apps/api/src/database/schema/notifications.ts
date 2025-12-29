import { pgTable, uuid, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';
import { refNotificationTypes } from './reference';

// Notifications: Notifications
export const ntfNotifications = pgTable('ntf_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipientId: uuid('recipient_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  notificationTypeId: uuid('notification_type_id').notNull().references(() => refNotificationTypes.id),
  
  // Sender (optional, for social notifications)
  senderId: uuid('sender_id').references(() => profiles.id, { onDelete: 'cascade' }),
  
  // Content
  title: text('title').notNull(),
  message: text('message').notNull(),
  actionUrl: text('action_url'),
  imageUrl: text('image_url'),
  
  // Related entities
  relatedEntityType: text('related_entity_type'), // post, comment, connection, message, event, etc.
  relatedEntityId: uuid('related_entity_id'),
  
  // Status
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  
  // Delivery
  deliveryChannels: jsonb('delivery_channels'), // ['in_app', 'email', 'push']
  sentViaEmail: boolean('sent_via_email').default(false),
  sentViaPush: boolean('sent_via_push').default(false),
  
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
});

// Notifications: Preferences
export const ntfPreferences = pgTable('ntf_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }).unique(),
  notificationTypeId: uuid('notification_type_id').notNull().references(() => refNotificationTypes.id),
  
  // Channels
  enableInApp: boolean('enable_in_app').default(true),
  enableEmail: boolean('enable_email').default(true),
  enablePush: boolean('enable_push').default(true),
  enableSms: boolean('enable_sms').default(false),
  
  // Frequency
  frequency: text('frequency').default('instant'), // instant, daily, weekly, never
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

