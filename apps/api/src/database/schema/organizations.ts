import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';
import { refOrganizationTypes } from './reference';

// Organization: Profiles
export const orgProfiles = pgTable('org_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationTypeId: uuid('organization_type_id').notNull().references(() => refOrganizationTypes.id),
  
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  displayName: text('display_name'),
  tagline: text('tagline'),
  mission: text('mission'),
  vision: text('vision'),
  about: text('about'),
  
  // Media
  logoUrl: text('logo_url'),
  coverPhotoUrl: text('cover_photo_url'),
  
  // Contact
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  
  // Location
  country: text('country').default('India'),
  state: text('state'),
  city: text('city'),
  address: text('address'),
  
  // Organization details
  foundedYear: integer('founded_year'),
  registrationNumber: text('registration_number'),
  
  // Engagement counts
  membersCount: integer('members_count').default(0),
  followersCount: integer('followers_count').default(0),
  eventsCount: integer('events_count').default(0),
  
  // Status
  isVerified: boolean('is_verified').default(false),
  isActive: boolean('is_active').default(true),
  isPublic: boolean('is_public').default(true),
  
  metadata: jsonb('metadata'),
  createdBy: uuid('created_by').notNull().references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Organization: Members
export const orgMembers = pgTable('org_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => orgProfiles.id, { onDelete: 'cascade' }),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  membershipType: text('membership_type').default('individual'), // individual, business
  role: text('role').default('member'), // admin, moderator, member
  position: text('position'),
  isLeadership: boolean('is_leadership').default(false),
  permissions: jsonb('permissions'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  leftAt: timestamp('left_at', { withTimezone: true }),
});

// Organization: Announcements
export const orgAnnouncements = pgTable('org_announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => orgProfiles.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  announcementType: text('announcement_type').default('general'), // general, event, policy, urgent
  isPinned: boolean('is_pinned').default(false),
  isPublished: boolean('is_published').default(true),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

