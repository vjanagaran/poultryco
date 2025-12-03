import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

// Auth schema for Cognito integration
export const authUsers = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  encryptedPassword: text('encrypted_password'),
  emailConfirmedAt: timestamp('email_confirmed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  schema: 'auth',
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

