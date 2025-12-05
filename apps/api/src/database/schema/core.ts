import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, inet, index } from 'drizzle-orm/pg-core';

// Auth users table - follows auth_ prefix pattern (matches usr_, biz_, adm_ pattern)
export const authUsers = pgTable('auth_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Contact identifiers
  email: text('email'),
  phoneNumber: text('phone'),
  
  // Verification flags (same phone for SMS and WhatsApp)
  emailVerified: boolean('email_verified').notNull().default(false),
  phoneVerified: boolean('phone_verified').notNull().default(false),
  
  // WhatsApp preference flag
  whatsappFlag: boolean('whatsapp_flag').notNull().default(false), // true if user prefers WhatsApp over SMS
  
  // Auto-login token (JWT refresh token or session token)
  token: text('token'), // Hashed token for auto-login after verification
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
  
  // User status
  status: text('status').notNull().default('pending'), // 'pending', 'active', 'suspended', 'deleted'
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  lastSignInAt: timestamp('last_sign_in_at', { withTimezone: true }),
}, (table) => ({
  emailIdx: index('idx_auth_users_email').on(table.email),
  phoneIdx: index('idx_auth_users_phone').on(table.phoneNumber),
  statusIdx: index('idx_auth_users_status').on(table.status),
}));

// OTP requests table - stores hashed OTP codes (auth_ prefix pattern)
// Channel: 'email', 'sms', 'whatsapp' (CHECK constraint in SQL)
// Request type: 'verify_email', 'verify_phone' only (no separate login/signup/password_reset)
export const authRequests = pgTable('auth_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // User reference (nullable for new users during signup)
  userId: uuid('user_id').references(() => authUsers.id, { onDelete: 'cascade' }),
  
  // Identifier (email or phone number)
  identifier: text('identifier').notNull(), // email address or phone number
  
  // Channel (email, sms, whatsapp)
  channel: text('channel').notNull(), // CHECK constraint: IN ('email', 'sms', 'whatsapp')
  
  // OTP code (HASHED - never store plain text)
  codeHash: text('code_hash').notNull(), // bcrypt/argon2 hash of the OTP
  
  // OTP metadata
  codeExpiresAt: timestamp('code_expires_at', { withTimezone: true }).notNull(), // OTP validity (5-10 minutes)
  verifiedAt: timestamp('verified_at', { withTimezone: true }), // When OTP was successfully verified
  
  // Request type (only verification types - no separate login/signup/password_reset)
  requestType: text('request_type').notNull(), // CHECK constraint: IN ('verify_email', 'verify_phone')
  
  // Security tracking
  attempts: integer('attempts').notNull().default(0), // Number of verification attempts
  maxAttempts: integer('max_attempts').notNull().default(5), // Max attempts before OTP is invalidated
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  activeIdx: index('idx_auth_requests_active').on(table.identifier, table.channel, table.createdAt),
  userIdx: index('idx_auth_requests_user').on(table.userId, table.createdAt),
  expiryIdx: index('idx_auth_requests_expiry').on(table.codeExpiresAt),
  identifierIdx: index('idx_auth_requests_identifier').on(table.identifier, table.channel),
}));

// Message templates for OTP delivery across channels (auth_ prefix pattern)
// Channel: 'email', 'sms', 'whatsapp' (CHECK constraint in SQL)
// Template type: 'otp', 'invite', 'welcome', 'password_reset', 'resend' (CHECK constraint in SQL)
export const authTemplates = pgTable('auth_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Template identification
  channel: text('channel').notNull(), // CHECK constraint: IN ('email', 'sms', 'whatsapp')
  templateType: text('template_type').notNull(), // CHECK constraint: IN ('otp', 'invite', 'welcome', 'password_reset', 'resend')
  
  // Template name (for admin reference)
  name: text('name').notNull(), // e.g., 'otp_email_en', 'otp_sms_hi', 'otp_whatsapp_en'
  
  // Template content
  subject: text('subject'), // For email (optional for SMS/WhatsApp)
  bodyTemplate: text('body_template').notNull(), // Template with {{code}}, {{name}}, {{expiry}} placeholders
  
  // Localization
  language: text('language').default('en'), // 'en', 'hi', etc.
  
  // Template variables (JSONB for dynamic content)
  variables: jsonb('variables').default('{}'), // Additional variables like {{company_name}}, {{support_email}}
  
  // Template status
  isActive: boolean('is_active').notNull().default(true),
  priority: integer('priority').default(0), // For fallback templates (higher = preferred)
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  lookupIdx: index('idx_auth_templates_lookup').on(table.channel, table.templateType, table.language, table.isActive),
  activeIdx: index('idx_auth_templates_active').on(table.isActive),
}));

// Core profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  displayName: text('display_name'),
  headline: text('headline'),
  bio: text('bio'),
  profilePhoto: text('profile_photo'),
  coverPhoto: text('cover_photo'),
  
  // Location
  country: text('country').default('India'),
  state: text('state'),
  district: text('district'),
  city: text('city'),
  pincode: text('pincode'),
  
  // Contact
  email: text('email').notNull(),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  website: text('website'),
  
  // Social
  linkedinUrl: text('linkedin_url'),
  twitterUrl: text('twitter_url'),
  facebookUrl: text('facebook_url'),
  instagramUrl: text('instagram_url'),
  
  // Profile metrics
  profileStrength: integer('profile_strength').default(0),
  verificationLevel: text('verification_level').default('basic'), // basic, verified, trusted
  isPublic: boolean('is_public').default(true),
  isActive: boolean('is_active').default(true),
  
  // Engagement counts (denormalized)
  connectionsCount: integer('connections_count').default(0),
  followersCount: integer('followers_count').default(0),
  followingCount: integer('following_count').default(0),
  postsCount: integer('posts_count').default(0),
  
  // Metadata
  metadata: jsonb('metadata'),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

