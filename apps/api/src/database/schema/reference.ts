import { pgTable, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

// Reference: Countries
export const refCountries = pgTable('ref_countries', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull().unique(),
  nameLocal: text('name_local'),
  iso3: text('iso3').unique(),
  isoNumeric: text('iso_numeric').unique(),
  flagEmoji: text('flag_emoji'),
  flagUrl: text('flag_url'),
  phoneCode: text('phone_code'),
  phoneFormat: text('phone_format'),
  subdivisionLabel: text('subdivision_label').default('State'),
  isFavourite: boolean('is_favourite').default(false),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Reference: States
export const refStates = pgTable('ref_states', {
  id: uuid('id').primaryKey().defaultRandom(),
  countryId: uuid('country_id').notNull().references(() => refCountries.id),
  code: text('code'),
  name: text('name').notNull(),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Reference: Currencies (ISO 4217 Compliant)
export const refCurrencies = pgTable('ref_currencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(), // ISO 4217: 'INR', 'USD'
  numericCode: text('numeric_code').unique(),
  name: text('name').notNull(),
  namePlural: text('name_plural'),
  symbol: text('symbol').notNull(),
  decimalPlaces: integer('decimal_places').default(2),
  decimalSeparator: text('decimal_separator').default('.'),
  thousandsSeparator: text('thousands_separator').default(','),
  symbolPosition: text('symbol_position').default('before'), // 'before' | 'after'
  symbolSpacing: boolean('symbol_spacing').default(true),
  numberSystem: text('number_system').default('international'), // 'indian' | 'international'
  minorUnitName: text('minor_unit_name'),
  minorUnitRatio: integer('minor_unit_ratio').default(100),
  isActive: boolean('is_active').default(true),
  isCrypto: boolean('is_crypto').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Reference: Country-Currency Junction (Many-to-Many)
export const refCountryCurrencies = pgTable('ref_country_currencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  countryId: uuid('country_id').notNull().references(() => refCountries.id, { onDelete: 'cascade' }),
  currencyId: uuid('currency_id').notNull().references(() => refCurrencies.id, { onDelete: 'cascade' }),
  isDefault: boolean('is_default').default(false),
  isPrimary: boolean('is_primary').default(false),
  validFrom: timestamp('valid_from', { withTimezone: true }),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
});

// Reference: Business Types
export const refBusinessTypes = pgTable('ref_business_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Reference: Organization Types
export const refOrganizationTypes = pgTable('ref_organization_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Reference: Event Types
export const refEventTypes = pgTable('ref_event_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Reference: Job Categories
export const refJobCategories = pgTable('ref_job_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Reference: Skills
export const refSkills = pgTable('ref_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  category: text('category'),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Reference: Notification Types
export const refNotificationTypes = pgTable('ref_notification_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  category: text('category'), // social, content, messages, network, system
  defaultEnabled: boolean('default_enabled').default(true),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Reference: Roles (for multi-role system)
export const refRoles = pgTable('ref_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0),
  requiresDetails: boolean('requires_details').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

