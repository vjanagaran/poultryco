import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';
import { refBusinessTypes } from './reference';

// Business: Profiles
export const bizProfiles = pgTable('biz_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  businessTypeId: uuid('business_type_id').notNull().references(() => refBusinessTypes.id),
  
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  displayName: text('display_name'),
  tagline: text('tagline'),
  about: text('about'),
  
  // Media
  logoUrl: text('logo_url'),
  coverPhotoUrl: text('cover_photo_url'),
  
  // Contact
  email: text('email'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  website: text('website'),
  
  // Location
  country: text('country').default('India'),
  state: text('state'),
  district: text('district'),
  city: text('city'),
  address: text('address'),
  pincode: text('pincode'),
  
  // Business details
  foundedYear: integer('founded_year'),
  companySize: text('company_size'), // 1-10, 11-50, 51-200, 201-500, 500+
  gstNumber: text('gst_number'),
  
  // Verification
  isVerified: boolean('is_verified').default(false),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  
  // Engagement counts
  followersCount: integer('followers_count').default(0),
  productsCount: integer('products_count').default(0),
  reviewsCount: integer('reviews_count').default(0),
  averageRating: integer('average_rating').default(0),
  
  // Status
  isActive: boolean('is_active').default(true),
  isPublic: boolean('is_public').default(true),
  
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Business: Team Members
export const bizTeamMembers = pgTable('biz_team_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => bizProfiles.id, { onDelete: 'cascade' }),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  department: text('department'),
  permissions: jsonb('permissions'),
  isContactPerson: boolean('is_contact_person').default(false),
  displayOrder: integer('display_order').default(0),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
  leftAt: timestamp('left_at', { withTimezone: true }),
});

// Business: Certifications
export const bizCertifications = pgTable('biz_certifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull().references(() => bizProfiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  issuedBy: text('issued_by').notNull(),
  certificateNumber: text('certificate_number'),
  issuedDate: timestamp('issued_date', { withTimezone: true }),
  expiryDate: timestamp('expiry_date', { withTimezone: true }),
  documentUrl: text('document_url'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

