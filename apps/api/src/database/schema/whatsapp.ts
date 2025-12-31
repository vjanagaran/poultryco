import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, decimal, index } from 'drizzle-orm/pg-core';

// WhatsApp Accounts
export const mktWapAccounts = pgTable('mkt_wap_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: text('phone_number').unique(),
  accountName: text('account_name').notNull(),
  pushName: text('push_name'),
  status: text('status').notNull().default('inactive'), // 'active', 'standby', 'warming', 'banned', 'inactive'
  healthScore: integer('health_score').notNull().default(100),
  dailyUsageCount: integer('daily_usage_count').notNull().default(0),
  dailyUsageLimit: integer('daily_usage_limit').notNull().default(200),
  sessionData: jsonb('session_data'),
  sessionStoragePath: text('session_storage_path'),
  lastConnectedAt: timestamp('last_connected_at', { withTimezone: true }),
  lastDisconnectedAt: timestamp('last_disconnected_at', { withTimezone: true }),
  isRateLimited: boolean('is_rate_limited').notNull().default(false),
  rateLimitUntil: timestamp('rate_limit_until', { withTimezone: true }),
  rateLimitConfig: jsonb('rate_limit_config'), // JSONB for flexible rate limit configuration
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  phoneIdx: index('idx_mkt_wap_accounts_phone').on(table.phoneNumber),
  statusIdx: index('idx_mkt_wap_accounts_status').on(table.status),
}));

// WhatsApp Groups
export const mktWapGroups = pgTable('mkt_wap_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: text('group_id').notNull().unique(), // WhatsApp group ID
  name: text('name').notNull(),
  description: text('description'),
  memberCount: integer('member_count').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  region: text('region'),
  state: text('state'),
  district: text('district'),
  segmentTags: text('segment_tags').array(), // Array of segment tags
  accountId: uuid('account_id'), // References mkt_wap_accounts(id)
  profilePicUrl: text('profile_pic_url'),
  notes: text('notes'),
  discoveredAt: timestamp('discovered_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  groupIdIdx: index('idx_mkt_wap_groups_group_id').on(table.groupId),
  accountIdx: index('idx_mkt_wap_groups_account').on(table.accountId),
}));

// WhatsApp Contacts
export const mktWapContacts = pgTable('mkt_wap_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: text('phone_number').notNull().unique(),
  name: text('name'),
  profilePicUrl: text('profile_pic_url'),
  personaContactId: uuid('persona_contact_id'), // References mkt_persona_contacts(id)
  groupMemberships: uuid('group_memberships').array(),
  engagementScore: integer('engagement_score').notNull().default(0),
  lastInteractionAt: timestamp('last_interaction_at', { withTimezone: true }),
  source: text('source'),
  scrapedFromGroups: uuid('scraped_from_groups').array(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  phoneIdx: index('idx_mkt_wap_contacts_phone').on(table.phoneNumber),
  personaIdx: index('idx_mkt_wap_contacts_persona').on(table.personaContactId),
}));

// WhatsApp Messages
export const mktWapMessages = pgTable('mkt_wap_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull(), // References mkt_campaigns(id)
  contentId: uuid('content_id'), // References mkt_con_content(id)
  messageType: text('message_type').notNull(), // 'text', 'image', 'video', 'document', 'link'
  messageText: text('message_text'),
  mediaUrl: text('media_url'),
  linkUrl: text('link_url'),
  linkPreviewData: jsonb('link_preview_data'),
  channelType: text('channel_type').notNull(), // 'group', 'individual', 'broadcast'
  targetGroupId: uuid('target_group_id'), // References mkt_wap_groups(id)
  targetContactId: uuid('target_contact_id'), // References mkt_wap_contacts(id)
  accountId: uuid('account_id').notNull(), // References mkt_wap_accounts(id)
  status: text('status').notNull().default('pending'), // 'pending', 'queued', 'sending', 'sent', 'delivered', 'read', 'failed'
  sentAt: timestamp('sent_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').notNull().default(0),
  deliveryConfirmations: integer('delivery_confirmations').notNull().default(0),
  readConfirmations: integer('read_confirmations').notNull().default(0),
  clickCount: integer('click_count').notNull().default(0),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  campaignIdx: index('idx_mkt_wap_messages_campaign').on(table.campaignId),
  accountIdx: index('idx_mkt_wap_messages_account').on(table.accountId),
  statusIdx: index('idx_mkt_wap_messages_status').on(table.status),
}));

