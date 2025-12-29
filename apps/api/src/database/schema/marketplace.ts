import { pgTable, uuid, text, timestamp, boolean, integer, decimal, jsonb } from 'drizzle-orm/pg-core';
import { profiles } from './core';
import { refCurrencies } from './reference';

// Marketplace: Categories
export const mktCategories = pgTable('mkt_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  parentId: uuid('parent_id'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Marketplace: Products
export const mktProducts = pgTable('mkt_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: uuid('business_id').notNull(),
  categoryId: uuid('category_id').notNull().references(() => mktCategories.id),
  
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  specifications: text('specifications'),
  
  // Pricing
  price: decimal('price', { precision: 10, scale: 2 }),
  currencyId: uuid('currency_id').references(() => refCurrencies.id),
  priceUnit: text('price_unit'), // per kg, per bag, per piece
  minOrderQuantity: integer('min_order_quantity'),
  
  // Media
  images: jsonb('images'), // array of S3 URLs
  primaryImageUrl: text('primary_image_url'),
  
  // Inventory
  stockStatus: text('stock_status').default('in_stock'), // in_stock, out_of_stock, limited
  
  // Engagement
  viewsCount: integer('views_count').default(0),
  inquiriesCount: integer('inquiries_count').default(0),
  reviewsCount: integer('reviews_count').default(0),
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
  
  // Status
  isPublished: boolean('is_published').default(true),
  isFeatured: boolean('is_featured').default(false),
  
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

