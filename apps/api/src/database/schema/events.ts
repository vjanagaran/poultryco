import { pgTable, uuid, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';
import { refEventTypes, refCurrencies } from './reference';

// Events: Events
export const evtEvents = pgTable('evt_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizerId: uuid('organizer_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  eventTypeId: uuid('event_type_id').notNull().references(() => refEventTypes.id),
  
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  coverImageUrl: text('cover_image_url'),
  
  // Date & Time
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  timezone: text('timezone').default('Asia/Kolkata'),
  
  // Location
  eventFormat: text('event_format').notNull(), // in-person, virtual, hybrid
  venue: text('venue'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  meetingUrl: text('meeting_url'),
  
  // Registration
  registrationRequired: boolean('registration_required').default(true),
  registrationDeadline: timestamp('registration_deadline', { withTimezone: true }),
  maxAttendees: integer('max_attendees'),
  registrationFee: integer('registration_fee').default(0),
  currencyId: uuid('currency_id').references(() => refCurrencies.id),
  
  // Engagement
  attendeesCount: integer('attendees_count').default(0),
  viewsCount: integer('views_count').default(0),
  
  // Status
  status: text('status').default('draft'), // draft, published, ongoing, completed, cancelled
  isPublished: boolean('is_published').default(false),
  isFeatured: boolean('is_featured').default(false),
  
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Events: Attendees
export const evtAttendees = pgTable('evt_attendees', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => evtEvents.id, { onDelete: 'cascade' }),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  registrationStatus: text('registration_status').default('registered'), // registered, attended, cancelled
  ticketNumber: text('ticket_number'),
  registeredAt: timestamp('registered_at', { withTimezone: true }).defaultNow().notNull(),
  attendedAt: timestamp('attended_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
});

