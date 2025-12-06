import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, date, index } from 'drizzle-orm/pg-core';
import { profiles } from './core';

// NECC: Zones
export const necZones = pgTable('nec_zones', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  zoneType: text('zone_type').notNull(), // 'production_center' | 'consumption_center'
  zoneCode: text('zone_code'),
  state: text('state'),
  district: text('district'),
  city: text('city'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('idx_nec_zones_name').on(table.name),
  slugIdx: index('idx_nec_zones_slug').on(table.slug),
  typeIdx: index('idx_nec_zones_type').on(table.zoneType),
  activeIdx: index('idx_nec_zones_active').on(table.isActive),
}));

// NECC: Prices
export const necPrices = pgTable('nec_prices', {
  id: uuid('id').primaryKey().defaultRandom(),
  zoneId: uuid('zone_id').notNull().references(() => necZones.id),
  date: date('date').notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  dayOfMonth: integer('day_of_month').notNull(),
  suggestedPrice: integer('suggested_price'), // per 100 eggs
  prevailingPrice: integer('prevailing_price'), // per 100 eggs
  source: text('source').notNull().default('scraped'), // 'scraped' | 'manual' | 'imported'
  scraperMode: text('scraper_mode'), // 'CRON' | 'MANUAL'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  zoneDateIdx: index('idx_nec_prices_zone_date').on(table.zoneId, table.date),
  dateIdx: index('idx_nec_prices_date').on(table.date),
  yearMonthIdx: index('idx_nec_prices_year_month').on(table.year, table.month),
  zoneYearMonthIdx: index('idx_nec_prices_zone_year_month').on(table.zoneId, table.year, table.month),
}));

// NECC: Annotations
export const necAnnotations = pgTable('nec_annotations', {
  id: uuid('id').primaryKey().defaultRandom(),
  zoneId: uuid('zone_id').notNull().references(() => necZones.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  annotationType: text('annotation_type'), // 'event' | 'trend' | 'alert' | 'insight'
  authorId: uuid('author_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  isApproved: boolean('is_approved').default(false),
  approvedBy: uuid('approved_by').references(() => profiles.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  likesCount: integer('likes_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  zoneDateIdx: index('idx_nec_annotations_zone_date').on(table.zoneId, table.date),
  authorIdx: index('idx_nec_annotations_author').on(table.authorId),
  approvedIdx: index('idx_nec_annotations_approved').on(table.isApproved, table.createdAt),
}));

// NECC: Annotation Metadata
export const necAnnotationMetadata = pgTable('nec_annotation_metadata', {
  annotationId: uuid('annotation_id').primaryKey().references(() => necAnnotations.id, { onDelete: 'cascade' }),
  tags: text('tags').array(),
  relatedEvents: text('related_events').array(),
  impactLevel: text('impact_level'), // 'low' | 'medium' | 'high'
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// NECC: Predictions
export const necPredictions = pgTable('nec_predictions', {
  id: uuid('id').primaryKey().defaultRandom(),
  zoneId: uuid('zone_id').notNull().references(() => necZones.id, { onDelete: 'cascade' }),
  predictionDate: date('prediction_date').notNull(),
  predictedPrice: integer('predicted_price').notNull(),
  confidenceScore: integer('confidence_score'), // 0-100
  modelVersion: text('model_version'),
  featuresUsed: jsonb('features_used'),
  actualPrice: integer('actual_price'),
  predictionError: integer('prediction_error'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  zoneDateIdx: index('idx_nec_predictions_zone_date').on(table.zoneId, table.predictionDate),
}));

// NECC: Scraper Logs
export const necScraperLogs = pgTable('nec_scraper_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  executionId: text('execution_id').notNull(),
  status: text('status').notNull(), // 'success' | 'partial' | 'failed'
  zonesScraped: integer('zones_scraped'),
  pricesInserted: integer('prices_inserted'),
  pricesUpdated: integer('prices_updated'),
  errorsCount: integer('errors_count'),
  errorDetails: jsonb('error_details'),
  executionTimeMs: integer('execution_time_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  executionIdx: index('idx_nec_scraper_logs_execution').on(table.executionId),
  statusIdx: index('idx_nec_scraper_logs_status').on(table.status),
  createdIdx: index('idx_nec_scraper_logs_created').on(table.createdAt),
}));

