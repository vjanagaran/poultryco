import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { eq, and, gte, lte, desc, asc, sql, isNotNull } from 'drizzle-orm';
import { necZones, necPrices, necAnnotations } from '@/database/schema';

export interface NECCZone {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  zone_type: 'production_center' | 'consumption_center';
  zone_code: string | null;
  state: string | null;
  district: string | null;
  city: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NECCPrice {
  id: string;
  zone_id: string;
  zone?: {
    id: string;
    name: string;
    slug: string;
    zone_type: 'production_center' | 'consumption_center';
    state?: string;
    city?: string;
  };
  date: string;
  year: number;
  month: number;
  day_of_month: number;
  suggested_price: number | null;
  prevailing_price: number | null;
  source: 'scraped' | 'manual' | 'imported';
  scraper_mode: 'CRON' | 'MANUAL' | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyAverage {
  zone_id: string;
  month: string; // 'YYYY-MM-01' format
  year: number;
  month_number: number;
  avg_suggested_price: number;
  avg_prevailing_price: number;
  min_suggested_price: number;
  max_suggested_price: number;
  min_prevailing_price: number;
  max_prevailing_price: number;
  days_count: number;
  period_start: string;
  period_end: string;
}

export interface PriceStats {
  average: number;
  min: number;
  max: number;
  count: number;
}

@Injectable()
export class NeccService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  // =====================================================
  // ZONES
  // =====================================================

  /**
   * Get all active zones
   */
  async getAllZones(): Promise<NECCZone[]> {
    const zones = await this.db
      .select()
      .from(necZones)
      .where(eq(necZones.isActive, true))
      .orderBy(asc(necZones.sortOrder), asc(necZones.name));

    return zones.map((z: any) => ({
      id: z.id,
      name: z.name,
      slug: z.slug,
      description: z.description,
      zone_type: z.zoneType,
      zone_code: z.zoneCode,
      state: z.state,
      district: z.district,
      city: z.city,
      sort_order: z.sortOrder || 0,
      is_active: z.isActive,
      created_at: z.createdAt.toISOString(),
      updated_at: z.updatedAt?.toISOString() || z.createdAt.toISOString(),
    }));
  }

  /**
   * Get zone by ID
   */
  async getZoneById(zoneId: string): Promise<NECCZone | null> {
    const [zone] = await this.db
      .select()
      .from(necZones)
      .where(and(eq(necZones.id, zoneId), eq(necZones.isActive, true)))
      .limit(1);

    if (!zone) return null;

    return {
      id: zone.id,
      name: zone.name,
      slug: zone.slug,
      description: zone.description,
      zone_type: zone.zoneType,
      zone_code: zone.zoneCode,
      state: zone.state,
      district: zone.district,
      city: zone.city,
      sort_order: zone.sortOrder || 0,
      is_active: zone.isActive,
      created_at: zone.createdAt.toISOString(),
      updated_at: zone.updatedAt?.toISOString() || zone.createdAt.toISOString(),
    };
  }

  /**
   * Get zone by slug
   */
  async getZoneBySlug(slug: string): Promise<NECCZone | null> {
    const [zone] = await this.db
      .select()
      .from(necZones)
      .where(and(eq(necZones.slug, slug), eq(necZones.isActive, true)))
      .limit(1);

    if (!zone) return null;

    return {
      id: zone.id,
      name: zone.name,
      slug: zone.slug,
      description: zone.description,
      zone_type: zone.zoneType,
      zone_code: zone.zoneCode,
      state: zone.state,
      district: zone.district,
      city: zone.city,
      sort_order: zone.sortOrder || 0,
      is_active: zone.isActive,
      created_at: zone.createdAt.toISOString(),
      updated_at: zone.updatedAt?.toISOString() || zone.createdAt.toISOString(),
    };
  }

  /**
   * Get zones by type
   */
  async getZonesByType(
    zoneType: 'production_center' | 'consumption_center',
  ): Promise<NECCZone[]> {
    const zones = await this.db
      .select()
      .from(necZones)
      .where(and(eq(necZones.zoneType, zoneType), eq(necZones.isActive, true)))
      .orderBy(asc(necZones.name));

    return zones.map((z: any) => ({
      id: z.id,
      name: z.name,
      slug: z.slug,
      description: z.description,
      zone_type: z.zoneType,
      zone_code: z.zoneCode,
      state: z.state,
      district: z.district,
      city: z.city,
      sort_order: z.sortOrder || 0,
      is_active: z.isActive,
      created_at: z.createdAt.toISOString(),
      updated_at: z.updatedAt?.toISOString() || z.createdAt.toISOString(),
    }));
  }

  /**
   * Get zones count
   */
  async getZonesCount(): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(necZones)
      .where(eq(necZones.isActive, true));

    return Number(result?.count || 0);
  }

  /**
   * Create a new zone
   */
  async createZone(data: {
    name: string;
    slug: string;
    description?: string;
    zone_type: 'production_center' | 'consumption_center';
    zone_code?: string;
    state?: string;
    district?: string;
    city?: string;
    sort_order?: number;
    is_active?: boolean;
  }): Promise<NECCZone> {
    const [zone] = await this.db
      .insert(necZones)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        zoneType: data.zone_type,
        zoneCode: data.zone_code || null,
        state: data.state || null,
        district: data.district || null,
        city: data.city || null,
        sortOrder: data.sort_order || 0,
        isActive: data.is_active !== false,
      })
      .returning();

    return {
      id: zone.id,
      name: zone.name,
      slug: zone.slug,
      description: zone.description,
      zone_type: zone.zoneType,
      zone_code: zone.zoneCode,
      state: zone.state,
      district: zone.district,
      city: zone.city,
      sort_order: zone.sortOrder || 0,
      is_active: zone.isActive,
      created_at: zone.createdAt.toISOString(),
      updated_at: zone.updatedAt?.toISOString() || zone.createdAt.toISOString(),
    };
  }

  /**
   * Update a zone
   */
  async updateZone(zoneId: string, data: Partial<NECCZone>): Promise<NECCZone | null> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.zone_type !== undefined) updateData.zoneType = data.zone_type;
    if (data.zone_code !== undefined) updateData.zoneCode = data.zone_code;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.sort_order !== undefined) updateData.sortOrder = data.sort_order;
    if (data.is_active !== undefined) updateData.isActive = data.is_active;

    const [zone] = await this.db
      .update(necZones)
      .set(updateData)
      .where(eq(necZones.id, zoneId))
      .returning();

    if (!zone) return null;

    return {
      id: zone.id,
      name: zone.name,
      slug: zone.slug,
      description: zone.description,
      zone_type: zone.zoneType,
      zone_code: zone.zoneCode,
      state: zone.state,
      district: zone.district,
      city: zone.city,
      sort_order: zone.sortOrder || 0,
      is_active: zone.isActive,
      created_at: zone.createdAt.toISOString(),
      updated_at: zone.updatedAt?.toISOString() || zone.createdAt.toISOString(),
    };
  }

  /**
   * Delete a zone
   */
  async deleteZone(zoneId: string): Promise<boolean> {
    const result = await this.db
      .delete(necZones)
      .where(eq(necZones.id, zoneId))
      .returning();

    return result.length > 0;
  }

  // =====================================================
  // PRICES
  // =====================================================

  /**
   * Get prices for a specific date
   */
  async getPricesByDate(date: string): Promise<NECCPrice[]> {
    const prices = await this.db
      .select({
        price: necPrices,
        zone: {
          id: necZones.id,
          name: necZones.name,
          slug: necZones.slug,
          zoneType: necZones.zoneType,
          state: necZones.state,
          city: necZones.city,
        },
      })
      .from(necPrices)
      .innerJoin(necZones, eq(necPrices.zoneId, necZones.id))
      .where(sql`${necPrices.date}::date = ${date}::date`)
      .orderBy(asc(necZones.name));

    return prices.map((p: any) => ({
      id: p.price.id,
      zone_id: p.price.zoneId,
      zone: {
        id: p.zone.id,
        name: p.zone.name,
        slug: p.zone.slug,
        zone_type: p.zone.zoneType,
        state: p.zone.state,
        city: p.zone.city,
      },
      date: typeof p.price.date === 'string' ? p.price.date : p.price.date.toISOString().split('T')[0],
      year: p.price.year,
      month: p.price.month,
      day_of_month: p.price.dayOfMonth,
      suggested_price: p.price.suggestedPrice,
      prevailing_price: p.price.prevailingPrice,
      source: p.price.source,
      scraper_mode: p.price.scraperMode,
      created_at: p.price.createdAt.toISOString(),
      updated_at: p.price.updatedAt?.toISOString() || p.price.createdAt.toISOString(),
    }));
  }

  /**
   * Get today's prices
   */
  async getTodayPrices(): Promise<NECCPrice[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getPricesByDate(today);
  }

  /**
   * Get yesterday's prices
   */
  async getYesterdayPrices(): Promise<NECCPrice[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    return this.getPricesByDate(yesterdayStr);
  }

  /**
   * Get prices for a specific zone
   */
  async getZonePrices(
    zoneId: string,
    startDate?: string,
    endDate?: string,
    limit?: number,
  ): Promise<NECCPrice[]> {
    const conditions = [eq(necPrices.zoneId, zoneId)];
    
    if (startDate) {
      conditions.push(sql`${necPrices.date}::date >= ${startDate}::date`);
    }
    if (endDate) {
      conditions.push(sql`${necPrices.date}::date <= ${endDate}::date`);
    }

    let query = this.db
      .select({
        price: necPrices,
        zone: {
          id: necZones.id,
          name: necZones.name,
          slug: necZones.slug,
          zoneType: necZones.zoneType,
          state: necZones.state,
          city: necZones.city,
        },
      })
      .from(necPrices)
      .innerJoin(necZones, eq(necPrices.zoneId, necZones.id))
      .where(and(...conditions))
      .orderBy(desc(necPrices.date));

    if (limit) {
      query = query.limit(limit);
    }

    const prices = await query;

    return prices.map((p: any) => ({
      id: p.price.id,
      zone_id: p.price.zoneId,
      zone: {
        id: p.zone.id,
        name: p.zone.name,
        slug: p.zone.slug,
        zone_type: p.zone.zoneType,
        state: p.zone.state,
        city: p.zone.city,
      },
      date: typeof p.price.date === 'string' ? p.price.date : p.price.date.toISOString().split('T')[0],
      year: p.price.year,
      month: p.price.month,
      day_of_month: p.price.dayOfMonth,
      suggested_price: p.price.suggestedPrice,
      prevailing_price: p.price.prevailingPrice,
      source: p.price.source,
      scraper_mode: p.price.scraperMode,
      created_at: p.price.createdAt.toISOString(),
      updated_at: p.price.updatedAt?.toISOString() || p.price.createdAt.toISOString(),
    }));
  }

  /**
   * Get prices for a specific month
   */
  async getMonthPrices(year: number, month: number): Promise<NECCPrice[]> {
    const prices = await this.db
      .select({
        price: necPrices,
        zone: {
          id: necZones.id,
          name: necZones.name,
          slug: necZones.slug,
          zoneType: necZones.zoneType,
          state: necZones.state,
          city: necZones.city,
        },
      })
      .from(necPrices)
      .innerJoin(necZones, eq(necPrices.zoneId, necZones.id))
      .where(and(eq(necPrices.year, year), eq(necPrices.month, month)))
      .orderBy(asc(necPrices.date), asc(necZones.name))
      .limit(2000);

    return prices.map((p: any) => ({
      id: p.price.id,
      zone_id: p.price.zoneId,
      zone: {
        id: p.zone.id,
        name: p.zone.name,
        slug: p.zone.slug,
        zone_type: p.zone.zoneType,
        state: p.zone.state,
        city: p.zone.city,
      },
      date: typeof p.price.date === 'string' ? p.price.date : p.price.date.toISOString().split('T')[0],
      year: p.price.year,
      month: p.price.month,
      day_of_month: p.price.dayOfMonth,
      suggested_price: p.price.suggestedPrice,
      prevailing_price: p.price.prevailingPrice,
      source: p.price.source,
      scraper_mode: p.price.scraperMode,
      created_at: p.price.createdAt.toISOString(),
      updated_at: p.price.updatedAt?.toISOString() || p.price.createdAt.toISOString(),
    }));
  }

  /**
   * Get prices for a specific year
   */
  async getYearPrices(year: number): Promise<NECCPrice[]> {
    const prices = await this.db
      .select({
        price: necPrices,
        zone: {
          id: necZones.id,
          name: necZones.name,
          slug: necZones.slug,
          zoneType: necZones.zoneType,
          state: necZones.state,
          city: necZones.city,
        },
      })
      .from(necPrices)
      .innerJoin(necZones, eq(necPrices.zoneId, necZones.id))
      .where(eq(necPrices.year, year))
      .orderBy(asc(necPrices.date), asc(necZones.name));

    return prices.map((p: any) => ({
      id: p.price.id,
      zone_id: p.price.zoneId,
      zone: {
        id: p.zone.id,
        name: p.zone.name,
        slug: p.zone.slug,
        zone_type: p.zone.zoneType,
        state: p.zone.state,
        city: p.zone.city,
      },
      date: typeof p.price.date === 'string' ? p.price.date : p.price.date.toISOString().split('T')[0],
      year: p.price.year,
      month: p.price.month,
      day_of_month: p.price.dayOfMonth,
      suggested_price: p.price.suggestedPrice,
      prevailing_price: p.price.prevailingPrice,
      source: p.price.source,
      scraper_mode: p.price.scraperMode,
      created_at: p.price.createdAt.toISOString(),
      updated_at: p.price.updatedAt?.toISOString() || p.price.createdAt.toISOString(),
    }));
  }

  /**
   * Get prices for a date range
   */
  async getPricesByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<NECCPrice[]> {
    const prices = await this.db
      .select({
        price: necPrices,
        zone: {
          id: necZones.id,
          name: necZones.name,
          slug: necZones.slug,
          zoneType: necZones.zoneType,
          state: necZones.state,
          city: necZones.city,
        },
      })
      .from(necPrices)
      .innerJoin(necZones, eq(necPrices.zoneId, necZones.id))
      .where(sql`${necPrices.date}::date >= ${startDate}::date AND ${necPrices.date}::date <= ${endDate}::date`)
      .orderBy(asc(necPrices.date), asc(necZones.name));

    return prices.map((p: any) => ({
      id: p.price.id,
      zone_id: p.price.zoneId,
      zone: {
        id: p.zone.id,
        name: p.zone.name,
        slug: p.zone.slug,
        zone_type: p.zone.zoneType,
        state: p.zone.state,
        city: p.zone.city,
      },
      date: typeof p.price.date === 'string' ? p.price.date : p.price.date.toISOString().split('T')[0],
      year: p.price.year,
      month: p.price.month,
      day_of_month: p.price.dayOfMonth,
      suggested_price: p.price.suggestedPrice,
      prevailing_price: p.price.prevailingPrice,
      source: p.price.source,
      scraper_mode: p.price.scraperMode,
      created_at: p.price.createdAt.toISOString(),
      updated_at: p.price.updatedAt?.toISOString() || p.price.createdAt.toISOString(),
    }));
  }

  /**
   * Get price statistics for a date range
   */
  async getPriceStats(
    startDate: string,
    endDate: string,
    zoneId?: string,
  ): Promise<PriceStats> {
    const conditions = [
      sql`${necPrices.date}::date >= ${startDate}::date`,
      sql`${necPrices.date}::date <= ${endDate}::date`,
      isNotNull(necPrices.suggestedPrice),
    ];

    if (zoneId) {
      conditions.push(eq(necPrices.zoneId, zoneId));
    }

    const prices = await this.db
      .select({
        suggestedPrice: necPrices.suggestedPrice,
      })
      .from(necPrices)
      .where(and(...conditions));

    if (!prices || prices.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0 };
    }

    const priceValues = prices
      .map((p: any) => p.suggestedPrice)
      .filter((p: number) => p !== null && p !== undefined) as number[];

    if (priceValues.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0 };
    }

    const sum = priceValues.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / priceValues.length);
    const min = Math.min(...priceValues);
    const max = Math.max(...priceValues);

    return {
      average,
      min,
      max,
      count: priceValues.length,
    };
  }

  /**
   * Get today's average price
   */
  async getTodayAverage(): Promise<number | null> {
    const today = new Date().toISOString().split('T')[0];
    const stats = await this.getPriceStats(today, today);
    return stats.count > 0 ? stats.average : null;
  }

  /**
   * Get yesterday's average price
   */
  async getYesterdayAverage(): Promise<number | null> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const stats = await this.getPriceStats(yesterdayStr, yesterdayStr);
    return stats.count > 0 ? stats.average : null;
  }

  // =====================================================
  // MONTHLY AVERAGES (Materialized View)
  // =====================================================

  /**
   * Get monthly averages from materialized view
   */
  async getMonthlyAverages(
    zoneId?: string,
    startMonth?: string,
    endMonth?: string,
    limit?: number,
  ): Promise<MonthlyAverage[]> {
    // Build WHERE conditions
    const conditions: any[] = [];
    
    if (zoneId) {
      conditions.push(sql`zone_id = ${zoneId}::uuid`);
    }
    if (startMonth) {
      // Use month_formatted column if available, otherwise construct from year and month
      conditions.push(sql`COALESCE(month_formatted, TO_CHAR(DATE_TRUNC('month', period_start), 'YYYY-MM-01')) >= ${startMonth}`);
    }
    if (endMonth) {
      conditions.push(sql`COALESCE(month_formatted, TO_CHAR(DATE_TRUNC('month', period_start), 'YYYY-MM-01')) <= ${endMonth}`);
    }

    // Build base query
    // Note: The view already has month_formatted column
    const baseQuery = sql`
      SELECT 
        zone_id,
        COALESCE(month_formatted, TO_CHAR(DATE_TRUNC('month', period_start), 'YYYY-MM-01')) as month,
        year,
        month as month_number,
        avg_suggested_price,
        avg_prevailing_price,
        min_suggested_price,
        max_suggested_price,
        min_prevailing_price,
        max_prevailing_price,
        days_count,
        period_start::text as period_start,
        period_end::text as period_end
      FROM nec_monthly_averages
    `;

    // Add WHERE clause if conditions exist
    let query = baseQuery;
    if (conditions.length > 0) {
      const whereClause = conditions.length === 1 
        ? conditions[0]
        : conditions.reduce((acc, condition, index) => {
            return index === 0 ? condition : sql`${acc} AND ${condition}`;
          });
      query = sql`${baseQuery} WHERE ${whereClause}`;
    }

    // Add ORDER BY
    query = sql`${query} ORDER BY year ASC, month ASC`;

    // Add LIMIT
    if (limit) {
      query = sql`${query} LIMIT ${limit}`;
    }

    try {
      const result = await this.db.execute(query);
      return result.rows || [];
    } catch (error) {
      // If materialized view doesn't exist, return empty array
      console.warn('nec_monthly_averages view not found, returning empty array:', error);
      return [];
    }
  }

  /**
   * Get monthly averages for a specific zone
   */
  async getZoneMonthlyAverages(
    zoneId: string,
    startMonth?: string,
    endMonth?: string,
  ): Promise<MonthlyAverage[]> {
    return this.getMonthlyAverages(zoneId, startMonth, endMonth);
  }

  /**
   * Get monthly average statistics
   */
  async getMonthlyAverageStats(
    zoneId?: string,
    startMonth?: string,
    endMonth?: string,
  ): Promise<PriceStats> {
    const monthlyData = await this.getMonthlyAverages(zoneId, startMonth, endMonth);

    if (monthlyData.length === 0) {
      return { average: 0, min: 0, max: 0, count: 0 };
    }

    const avgPrices = monthlyData.map((m) => m.avg_suggested_price || m.avg_prevailing_price || 0);
    const average = Math.round(
      avgPrices.reduce((a, b) => a + b, 0) / avgPrices.length,
    );
    const min = Math.min(...avgPrices);
    const max = Math.max(...avgPrices);

    return {
      average,
      min,
      max,
      count: monthlyData.length,
    };
  }

  // =====================================================
  // YEAR-OVER-YEAR (Database Functions)
  // =====================================================

  /**
   * Get Year-over-Year data for a zone
   * Uses database function: get_zone_yoy_data
   */
  async getZoneYoYData(
    zoneId: string,
    minYears: number = 2,
  ): Promise<any[]> {
    try {
      const result = await this.db.execute(
        sql`SELECT * FROM get_zone_yoy_data(${zoneId}::uuid, ${minYears})`,
      );
      return result.rows || [];
    } catch (error) {
      // If database function doesn't exist, return empty array
      console.warn('get_zone_yoy_data function not found, returning empty array');
      return [];
    }
  }

  /**
   * Get Year-over-Year statistics for a zone
   * Uses database function: get_zone_yoy_stats
   * Note: The function returns JSONB directly
   */
  async getZoneYoYStats(zoneId: string): Promise<any> {
    try {
      // The function returns JSONB directly, not a table
      const result = await this.db.execute(
        sql`SELECT get_zone_yoy_stats(${zoneId}::uuid) as stats`,
      );
      // If function doesn't exist or returns empty, return default structure
      if (!result.rows || result.rows.length === 0 || !result.rows[0]?.stats) {
        return {
          highest_price_day: null,
          lowest_price_day: null,
          avg_by_year: {},
          years: [],
        };
      }
      // Parse JSONB result
      const stats = result.rows[0].stats;
      return {
        highest_price_day: stats.highest_price_day === 'null' ? null : stats.highest_price_day,
        lowest_price_day: stats.lowest_price_day === 'null' ? null : stats.lowest_price_day,
        avg_by_year: stats.avg_by_year || {},
        years: stats.years || [],
      };
    } catch (error) {
      // If database function doesn't exist, return default structure
      console.warn('get_zone_yoy_stats function not found, returning default stats:', error);
      return {
        highest_price_day: null,
        lowest_price_day: null,
        avg_by_year: {},
        years: [],
      };
    }
  }

  // =====================================================
  // ADMIN: PRICES (Create, Update, Delete)
  // =====================================================

  /**
   * Create a new price
   */
  async createPrice(data: {
    zone_id: string;
    date: string;
    year: number;
    month: number;
    day_of_month: number;
    suggested_price?: number | null;
    prevailing_price?: number | null;
    source?: 'scraped' | 'manual' | 'imported';
    scraper_mode?: 'CRON' | 'MANUAL' | null;
  }): Promise<NECCPrice> {
    const [price] = await this.db
      .insert(necPrices)
      .values({
        zoneId: data.zone_id,
        date: data.date,
        year: data.year,
        month: data.month,
        dayOfMonth: data.day_of_month,
        suggestedPrice: data.suggested_price ?? null,
        prevailingPrice: data.prevailing_price ?? null,
        source: data.source || 'manual',
        scraperMode: data.scraper_mode || null,
      })
      .returning();

    // Fetch zone info
    const [zone] = await this.db
      .select()
      .from(necZones)
      .where(eq(necZones.id, data.zone_id))
      .limit(1);

    return {
      id: price.id,
      zone_id: price.zoneId,
      zone: zone ? {
        id: zone.id,
        name: zone.name,
        slug: zone.slug,
        zone_type: zone.zoneType,
        state: zone.state,
        city: zone.city,
      } : undefined,
      date: typeof price.date === 'string' ? price.date : price.date.toISOString().split('T')[0],
      year: price.year,
      month: price.month,
      day_of_month: price.dayOfMonth,
      suggested_price: price.suggestedPrice,
      prevailing_price: price.prevailingPrice,
      source: price.source,
      scraper_mode: price.scraperMode,
      created_at: price.createdAt.toISOString(),
      updated_at: price.updatedAt?.toISOString() || price.createdAt.toISOString(),
    };
  }

  /**
   * Update a price
   */
  async updatePrice(priceId: string, data: Partial<NECCPrice>): Promise<NECCPrice | null> {
    const updateData: any = {};
    if (data.zone_id !== undefined) updateData.zoneId = data.zone_id;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.month !== undefined) updateData.month = data.month;
    if (data.day_of_month !== undefined) updateData.dayOfMonth = data.day_of_month;
    if (data.suggested_price !== undefined) updateData.suggestedPrice = data.suggested_price;
    if (data.prevailing_price !== undefined) updateData.prevailingPrice = data.prevailing_price;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.scraper_mode !== undefined) updateData.scraperMode = data.scraper_mode;

    const [price] = await this.db
      .update(necPrices)
      .set(updateData)
      .where(eq(necPrices.id, priceId))
      .returning();

    if (!price) return null;

    // Fetch zone info
    const [zone] = await this.db
      .select()
      .from(necZones)
      .where(eq(necZones.id, price.zoneId))
      .limit(1);

    return {
      id: price.id,
      zone_id: price.zoneId,
      zone: zone ? {
        id: zone.id,
        name: zone.name,
        slug: zone.slug,
        zone_type: zone.zoneType,
        state: zone.state,
        city: zone.city,
      } : undefined,
      date: typeof price.date === 'string' ? price.date : price.date.toISOString().split('T')[0],
      year: price.year,
      month: price.month,
      day_of_month: price.dayOfMonth,
      suggested_price: price.suggestedPrice,
      prevailing_price: price.prevailingPrice,
      source: price.source,
      scraper_mode: price.scraperMode,
      created_at: price.createdAt.toISOString(),
      updated_at: price.updatedAt?.toISOString() || price.createdAt.toISOString(),
    };
  }

  /**
   * Delete a price
   */
  async deletePrice(priceId: string): Promise<boolean> {
    const result = await this.db
      .delete(necPrices)
      .where(eq(necPrices.id, priceId))
      .returning();

    return result.length > 0;
  }

  // =====================================================
  // ADMIN: SCRAPER
  // =====================================================

  /**
   * Run scraper for a specific month/year
   */
  async runScraper(month: number, year: number): Promise<{
    success: boolean;
    message: string;
    stats: {
      zonesFound: number;
      zonesValidated: number;
      zonesMissing: number;
      pricesInserted: number;
      pricesSkipped: number;
      errors: string[];
    };
  }> {
    // Import scraper function dynamically to avoid circular dependencies
    const { scrapeNECCMonth } = await import('@/modules/necc/scraper/necc-scraper');
    return scrapeNECCMonth(month, year, this.db);
  }
}
