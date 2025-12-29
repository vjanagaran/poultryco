import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';
import { refRoles, refSkills } from './reference';

// User: Profile Roles (multi-role support)
export const usrProfileRoles = pgTable('usr_profile_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => refRoles.id),
  isPrimary: boolean('is_primary').default(false),
  yearsOfExperience: integer('years_of_experience'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// User: Experiences
export const usrExperiences = pgTable('usr_experiences', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  company: text('company').notNull(),
  location: text('location'),
  employmentType: text('employment_type'), // full-time, part-time, contract, freelance
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  isCurrent: boolean('is_current').default(false),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// User: Education
export const usrEducation = pgTable('usr_education', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  institution: text('institution').notNull(),
  degree: text('degree').notNull(),
  fieldOfStudy: text('field_of_study'),
  startYear: integer('start_year'),
  endYear: integer('end_year'),
  isCurrent: boolean('is_current').default(false),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// User: Profile Skills
export const usrProfileSkills = pgTable('usr_profile_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => refSkills.id),
  endorsementsCount: integer('endorsements_count').default(0),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// User: Skill Endorsements
export const usrSkillEndorsements = pgTable('usr_skill_endorsements', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileSkillId: uuid('profile_skill_id').notNull().references(() => usrProfileSkills.id, { onDelete: 'cascade' }),
  endorserId: uuid('endorser_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// User: Privacy Settings
export const usrPrivacySettings = pgTable('usr_privacy_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }).unique(),
  profileVisibility: text('profile_visibility').default('public'), // public, connections, private
  showEmail: boolean('show_email').default(false),
  showPhone: boolean('show_phone').default(false),
  showConnections: boolean('show_connections').default(true),
  showActivity: boolean('show_activity').default(true),
  allowMessages: text('allow_messages').default('everyone'), // everyone, connections, none
  allowConnectionRequests: boolean('allow_connection_requests').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// User: Verifications
export const usrVerifications = pgTable('usr_verifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  verificationType: text('verification_type').notNull(), // email, phone, identity, professional
  status: text('status').default('pending'), // pending, verified, rejected
  verifiedBy: uuid('verified_by'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

