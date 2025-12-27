import { apiClient } from './client';

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

export interface PriceWithPrevious extends NECCPrice {
  previous_price?: {
    date: string;
    suggested_price: number | null;
    prevailing_price: number | null;
  };
}

export interface PriceStats {
  average: number;
  min: number;
  max: number;
  count: number;
}

/**
 * Get today's prices for all zones
 */
export async function getTodayPrices(): Promise<NECCPrice[]> {
  return apiClient.get<NECCPrice[]>('/necc/prices/today');
}

/**
 * Get yesterday's prices for all zones
 */
export async function getYesterdayPrices(): Promise<NECCPrice[]> {
  return apiClient.get<NECCPrice[]>('/necc/prices/yesterday');
}

/**
 * Get prices for a specific date
 */
export async function getPricesByDate(date: string): Promise<NECCPrice[]> {
  return apiClient.get<NECCPrice[]>(`/necc/prices/date/${date}`);
}

/**
 * Get prices for a specific date with previous day price (for missing data handling)
 */
export async function getPricesByDateWithPrevious(date: string): Promise<PriceWithPrevious[]> {
  const prices = await getPricesByDate(date);
  
  // For each price, get previous day if current is missing
  const pricesWithPrevious = await Promise.all(
    prices.map(async (price) => {
      // If price exists, return as is
      if (price.suggested_price !== null || price.prevailing_price !== null) {
        return price as PriceWithPrevious;
      }
      
      // If missing, get previous day price
      try {
        const zonePrices = await getZonePrices(price.zone_id, undefined, date, 1);
        const previous = zonePrices.find(p => 
          p.date < date && 
          (p.suggested_price !== null || p.prevailing_price !== null)
        );
        
        return {
          ...price,
          previous_price: previous ? {
            date: previous.date,
            suggested_price: previous.suggested_price,
            prevailing_price: previous.prevailing_price,
          } : undefined,
        } as PriceWithPrevious;
      } catch {
        return price as PriceWithPrevious;
      }
    })
  );
  
  return pricesWithPrevious;
}

/**
 * Get prices for a specific zone
 */
export async function getZonePrices(
  zoneId: string,
  startDate?: string,
  endDate?: string,
  limit?: number
): Promise<NECCPrice[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (limit) params.append('limit', limit.toString());
  
  const query = params.toString();
  return apiClient.get<NECCPrice[]>(`/necc/prices/zone/${zoneId}${query ? `?${query}` : ''}`);
}

/**
 * Get prices for a specific month
 */
export async function getMonthPrices(year: number, month: number): Promise<NECCPrice[]> {
  return apiClient.get<NECCPrice[]>(`/necc/prices/month?year=${year}&month=${month}`);
}

/**
 * Get prices for a specific year
 */
export async function getYearPrices(year: number): Promise<NECCPrice[]> {
  return apiClient.get<NECCPrice[]>(`/necc/prices/year/${year}`);
}

/**
 * Get price statistics for a date range
 */
export async function getPriceStats(
  startDate: string,
  endDate: string,
  zoneId?: string
): Promise<PriceStats> {
  const params = new URLSearchParams();
  params.append('startDate', startDate);
  params.append('endDate', endDate);
  if (zoneId) params.append('zoneId', zoneId);
  
  return apiClient.get<PriceStats>(`/necc/prices/stats?${params.toString()}`);
}

/**
 * Get today's average price across all zones
 */
export async function getTodayAverage(): Promise<number | null> {
  const result = await apiClient.get<{ average: number | null }>('/necc/prices/average/today');
  return result.average;
}

/**
 * Get yesterday's average price across all zones
 */
export async function getYesterdayAverage(): Promise<number | null> {
  const result = await apiClient.get<{ average: number | null }>('/necc/prices/average/yesterday');
  return result.average;
}

/**
 * Get prices for a date range
 */
export async function getPricesByDateRange(
  startDate: string,
  endDate: string
): Promise<NECCPrice[]> {
  return apiClient.get<NECCPrice[]>(`/necc/prices/range?startDate=${startDate}&endDate=${endDate}`);
}

// =====================================================
// MONTHLY AVERAGES (Materialized View)
// =====================================================

/**
 * Monthly Average Price Data (from materialized view)
 */
export interface MonthlyAverage {
  zone_id: string;
  month: string; // 'YYYY-MM-01' format
  year: number;
  month_number: number;
  avg_suggested_price: number;
  avg_prevailing_price: number | null;
  min_suggested_price: number;
  max_suggested_price: number;
  min_prevailing_price: number | null;
  max_prevailing_price: number | null;
  days_count: number;
  period_start: string;
  period_end: string;
  // For compatibility with API response
  avg_price?: number;
}

/**
 * Get monthly price averages from materialized view
 * Much faster than real-time aggregation (500ms -> 50ms for "All Time")
 * 
 * @param zoneId - Optional zone ID to filter by specific zone
 * @param startMonth - Optional start month (YYYY-MM-01)
 * @param endMonth - Optional end month (YYYY-MM-01)
 * @param limit - Optional limit on number of months returned
 * @returns Array of monthly averages
 */
export async function getMonthlyAverages(
  zoneId?: string,
  startMonth?: string,
  endMonth?: string,
  limit?: number
): Promise<MonthlyAverage[]> {
  const params = new URLSearchParams();
  if (zoneId) params.append('zoneId', zoneId);
  if (startMonth) params.append('startMonth', startMonth);
  if (endMonth) params.append('endMonth', endMonth);
  if (limit) params.append('limit', limit.toString());
  
  const query = params.toString();
  return apiClient.get<MonthlyAverage[]>(`/necc/monthly-averages${query ? `?${query}` : ''}`);
}

/**
 * Get monthly averages for a specific zone
 * Convenience wrapper around getMonthlyAverages
 */
export async function getZoneMonthlyAverages(
  zoneId: string,
  startMonth?: string,
  endMonth?: string
): Promise<MonthlyAverage[]> {
  const params = new URLSearchParams();
  if (startMonth) params.append('startMonth', startMonth);
  if (endMonth) params.append('endMonth', endMonth);
  
  const query = params.toString();
  return apiClient.get<MonthlyAverage[]>(`/necc/monthly-averages/zone/${zoneId}${query ? `?${query}` : ''}`);
}

/**
 * Get monthly average stats for a zone
 * Returns overall statistics across all monthly averages
 */
export async function getMonthlyAverageStats(
  zoneId?: string,
  startMonth?: string,
  endMonth?: string
): Promise<PriceStats> {
  const params = new URLSearchParams();
  if (zoneId) params.append('zoneId', zoneId);
  if (startMonth) params.append('startMonth', startMonth);
  if (endMonth) params.append('endMonth', endMonth);
  
  const query = params.toString();
  return apiClient.get<PriceStats>(`/necc/monthly-averages/stats${query ? `?${query}` : ''}`);
}

// =====================================================
// YEAR-OVER-YEAR ANALYSIS (Database Functions)
// =====================================================

/**
 * Year-over-Year data point from database function
 */
export interface YoYDataPoint {
  day_of_year: number;
  day_label: string;
  year_data: Record<string, number>; // { "2023": 450, "2024": 475, ... }
  years_count: number;
}

/**
 * Year-over-Year statistics
 */
export interface YoYStats {
  highest_price_day: {
    day_of_year: number;
    day_label: string;
    year: number;
    price: number;
  } | null;
  lowest_price_day: {
    day_of_year: number;
    day_label: string;
    year: number;
    price: number;
  } | null;
  avg_by_year: Record<string, number>;
  years: number[];
}

/**
 * Get Year-over-Year data for a zone (optimized database function)
 * Much faster than fetching all daily data and aggregating client-side
 * 
 * @param zoneId - Zone ID
 * @param minYears - Minimum years of data required per day (default: 2)
 * @returns Array of YoY data points ready for charting
 */
export async function getZoneYoYData(
  zoneId: string,
  minYears: number = 2
): Promise<YoYDataPoint[]> {
  return apiClient.get<YoYDataPoint[]>(`/necc/yoy/zone/${zoneId}?minYears=${minYears}`);
}

/**
 * Get Year-over-Year statistics for a zone
 * Returns insights like highest/lowest price days, averages by year, etc.
 * 
 * @param zoneId - Zone ID
 * @returns YoY statistics object
 */
export async function getZoneYoYStats(zoneId: string): Promise<YoYStats> {
  return apiClient.get<YoYStats>(`/necc/yoy/zone/${zoneId}/stats`);
}
