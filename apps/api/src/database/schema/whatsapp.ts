import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, decimal, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

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
// Global groups - one record per WhatsApp group (identified by groupId/WhatsApp group ID)
// Account relationships stored in mkt_wap_group_accounts
export const mktWapGroups = pgTable('mkt_wap_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: text('group_id').notNull().unique(), // WhatsApp group ID (unique for deduplication)
  name: text('name').notNull(),
  description: text('description'),
  memberCount: integer('member_count').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  region: text('region'),
  state: text('state'),
  district: text('district'),
  segmentTags: text('segment_tags').array(), // Array of segment tags
  profilePicUrl: text('profile_pic_url'),
  notes: text('notes'),
  // New columns for group management
  lastScrapedAt: timestamp('last_scraped_at', { withTimezone: true }),
  contactsCountAtLastScrape: integer('contacts_count_at_last_scrape').notNull().default(0),
  isHidden: boolean('is_hidden').notNull().default(false), // Hide personal/non-relevant groups (global setting)
  isFavorite: boolean('is_favorite').notNull().default(false), // Mark group as favorite/featured (global setting)
  isAdminOnlyGroup: boolean('is_admin_only_group').notNull().default(false), // Group is admin-only
  internalDescription: text('internal_description'), // Internal notes/description
  discoveredAt: timestamp('discovered_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  groupIdIdx: index('idx_mkt_wap_groups_group_id').on(table.groupId),
  hiddenIdx: index('idx_mkt_wap_groups_hidden').on(table.isHidden),
  favoriteIdx: index('idx_mkt_wap_groups_favorite').on(table.isFavorite),
  lastScrapedIdx: index('idx_mkt_wap_groups_last_scraped').on(table.lastScrapedAt),
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

// Group-Account Mapping (Many-to-Many: Accounts ↔ Groups)
// Tracks which accounts have access to which groups, with permissions
// Enables deduplication: Same group across multiple accounts
export const mktWapGroupAccounts = pgTable('mkt_wap_group_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull(), // References mkt_wap_groups(id)
  accountId: uuid('account_id').notNull(), // References mkt_wap_accounts(id)
  // Account's Role in Group
  isAccountAdmin: boolean('is_account_admin').notNull().default(false), // Is our account an admin?
  isAccountSuperAdmin: boolean('is_account_super_admin').notNull().default(false), // Is our account a super admin?
  // Group Permissions (from WhatsApp)
  canAddContacts: boolean('can_add_contacts').notNull().default(false), // Can account add new members?
  canPostMessages: boolean('can_post_messages').notNull().default(true), // Can account post messages?
  canEditGroupInfo: boolean('can_edit_group_info').notNull().default(false), // Can account edit group name/description?
  // Group Settings (from WhatsApp)
  isAdminOnlyGroup: boolean('is_admin_only_group').notNull().default(false), // Is group admin-only? (synced from group)
  // Discovery
  discoveredAt: timestamp('discovered_at', { withTimezone: true }).defaultNow().notNull(), // When account discovered this group
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }), // Last time account accessed this group
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  groupIdx: index('idx_mkt_wap_group_accounts_group').on(table.groupId),
  accountIdx: index('idx_mkt_wap_group_accounts_account').on(table.accountId),
  adminIdx: index('idx_mkt_wap_group_accounts_admin').on(table.isAccountAdmin),
  uniqueGroupAccount: unique('mkt_wap_group_accounts_group_account_unique').on(table.groupId, table.accountId),
}));

// Group-Contact Mapping (Many-to-Many: Groups ↔ Contacts)
// Tracks which contacts are in which groups, with admin status
export const mktWapGroupContacts = pgTable('mkt_wap_group_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull(), // References mkt_wap_groups(id)
  contactId: uuid('contact_id').notNull(), // References mkt_wap_contacts(id)
  // Membership Details
  isAdmin: boolean('is_admin').notNull().default(false), // Is contact an admin?
  isSuperAdmin: boolean('is_super_admin').notNull().default(false), // Is contact a super admin?
  isLeft: boolean('is_left').notNull().default(false), // Contact left the group (don't remove, just mark)
  // Timestamps
  joinedAt: timestamp('joined_at', { withTimezone: true }), // When contact joined (from WhatsApp, if available)
  leftAt: timestamp('left_at', { withTimezone: true }), // When contact left (if applicable)
  firstScrapedAt: timestamp('first_scraped_at', { withTimezone: true }).defaultNow().notNull(), // First time we scraped this contact
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }), // Last time we saw this contact in group (updated on each scrape)
  // Metadata
  scrapedByAccountId: uuid('scraped_by_account_id'), // References mkt_wap_accounts(id) - Which account scraped this contact
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  groupIdx: index('idx_mkt_wap_group_contacts_group').on(table.groupId),
  contactIdx: index('idx_mkt_wap_group_contacts_contact').on(table.contactId),
  adminIdx: index('idx_mkt_wap_group_contacts_admin').on(table.isAdmin),
  leftIdx: index('idx_mkt_wap_group_contacts_left').on(table.isLeft),
  activeIdx: index('idx_mkt_wap_group_contacts_active').on(table.groupId, table.isLeft),
  uniqueGroupContact: unique('mkt_wap_group_contacts_group_contact_unique').on(table.groupId, table.contactId),
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

