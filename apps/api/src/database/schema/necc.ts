import { pgTable, uuid, text, timestamp, boolean, integer, decimal, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';

// NECC: Zones
export const necZones = pgTable('nec_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  state: text('state'),
  region: text('region'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// NECC: Prices
export const necPrices = pgTable('nec_prices', {
  id: uuid('id').primaryKey().defaultRandom(),
  zoneId: uuid('zone_id').notNull().references(() => necZones.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  priceChange: decimal('price_change', { precision: 10, scale: 2 }),
  percentageChange: decimal('percentage_change', { precision: 5, scale: 2 }),
  source: text('source').default('necc_website'),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// NECC: Annotations (expert insights)
export const necAnnotations = pgTable('nec_annotations', {
  id: uuid('id').primaryKey().defaultRandom(),
  expertId: uuid('expert_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  zoneId: uuid('zone_id').references(() => necZones.id),
  date: timestamp('date', { withTimezone: true }).notNull(),
  annotationType: text('annotation_type').notNull(), // insight, prediction, alert, trend
  title: text('title').notNull(),
  content: text('content').notNull(),
  sentiment: text('sentiment'), // bullish, bearish, neutral
  confidence: integer('confidence'), // 0-100
  isPublished: boolean('is_published').default(false),
  likesCount: integer('likes_count').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// NECC: Scraper Logs
export const necScraperLogs = pgTable('nec_scraper_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  runDate: timestamp('run_date', { withTimezone: true }).notNull(),
  status: text('status').notNull(), // success, failed, partial
  recordsScraped: integer('records_scraped').default(0),
  recordsInserted: integer('records_inserted').default(0),
  recordsUpdated: integer('records_updated').default(0),
  errorMessage: text('error_message'),
  executionTime: integer('execution_time'), // milliseconds
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

