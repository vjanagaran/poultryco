import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';
import { refJobCategories, refCurrencies } from './reference';

// Jobs: Postings
export const jobPostings = pgTable('job_postings', {
  id: uuid('id').primaryKey().defaultRandom(),
  employerId: uuid('employer_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => refJobCategories.id),
  
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  requirements: text('requirements'),
  
  // Job details
  jobType: text('job_type').notNull(), // full-time, part-time, contract, internship
  experienceLevel: text('experience_level'), // entry, mid, senior, executive
  minExperience: integer('min_experience'),
  maxExperience: integer('max_experience'),
  
  // Compensation
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  currencyId: uuid('currency_id').references(() => refCurrencies.id),
  salaryPeriod: text('salary_period').default('monthly'), // hourly, monthly, yearly
  
  // Location
  location: text('location').notNull(),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  isRemote: boolean('is_remote').default(false),
  
  // Application
  applicationDeadline: timestamp('application_deadline', { withTimezone: true }),
  applicationEmail: text('application_email'),
  applicationUrl: text('application_url'),
  applicationsCount: integer('applications_count').default(0),
  
  // Status
  status: text('status').default('active'), // draft, active, closed, filled
  isPublished: boolean('is_published').default(true),
  isFeatured: boolean('is_featured').default(false),
  
  viewsCount: integer('views_count').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Jobs: Applications
export const jobApplications = pgTable('job_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobPostings.id, { onDelete: 'cascade' }),
  applicantId: uuid('applicant_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  
  coverLetter: text('cover_letter'),
  resumeUrl: text('resume_url'),
  status: text('status').default('submitted'), // submitted, reviewed, shortlisted, rejected, accepted
  
  reviewedBy: uuid('reviewed_by'),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewNotes: text('review_notes'),
  
  metadata: jsonb('metadata'),
  appliedAt: timestamp('applied_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

