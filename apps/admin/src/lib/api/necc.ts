import { apiClient } from './client';

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

export interface ScrapeResult {
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
}

// =====================================================
// ZONES
// =====================================================

/**
 * Get all zones
 */
export async function getAllZones(): Promise<NECCZone[]> {
  return apiClient.get<NECCZone[]>('/necc/zones');
}

/**
 * Get zone by ID
 */
export async function getZoneById(zoneId: string): Promise<NECCZone | null> {
  try {
    return await apiClient.get<NECCZone>(`/necc/zones/${zoneId}`);
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 400) {
      return null;
    }
    throw error;
  }
}

/**
 * Get zone by slug
 */
export async function getZoneBySlug(slug: string): Promise<NECCZone | null> {
  try {
    return await apiClient.get<NECCZone>(`/necc/zones/slug/${encodeURIComponent(slug)}`);
  } catch (error: any) {
    if (error.statusCode === 404 || error.statusCode === 400) {
      return null;
    }
    throw error;
  }
}

/**
 * Get zones count
 */
export async function getZonesCount(): Promise<number> {
  const result = await apiClient.get<{ count: number }>('/necc/zones/count');
  return result.count;
}

/**
 * Create a new zone
 */
export async function createZone(data: Partial<NECCZone>): Promise<NECCZone> {
  return apiClient.post<NECCZone>('/necc/zones', data);
}

/**
 * Update a zone
 */
export async function updateZone(zoneId: string, data: Partial<NECCZone>): Promise<NECCZone> {
  return apiClient.patch<NECCZone>(`/necc/zones/${zoneId}`, data);
}

/**
 * Delete a zone
 */
export async function deleteZone(zoneId: string): Promise<void> {
  return apiClient.delete<void>(`/necc/zones/${zoneId}`);
}

// =====================================================
// PRICES
// =====================================================

/**
 * Get prices with filters
 */
export async function getPrices(params?: {
  date?: string;
  zoneId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<NECCPrice[]> {
  const queryParams = new URLSearchParams();
  if (params?.date) queryParams.append('date', params.date);
  if (params?.zoneId) queryParams.append('zoneId', params.zoneId);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const query = queryParams.toString();
  return apiClient.get<NECCPrice[]>(`/necc/prices${query ? `?${query}` : ''}`);
}

/**
 * Get prices for a specific date
 */
export async function getPricesByDate(date: string): Promise<NECCPrice[]> {
  return apiClient.get<NECCPrice[]>(`/necc/prices/date/${date}`);
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
 * Create a new price
 */
export async function createPrice(data: {
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
  return apiClient.post<NECCPrice>('/necc/prices', data);
}

/**
 * Update a price
 */
export async function updatePrice(priceId: string, data: Partial<NECCPrice>): Promise<NECCPrice> {
  return apiClient.patch<NECCPrice>(`/necc/prices/${priceId}`, data);
}

/**
 * Delete a price
 */
export async function deletePrice(priceId: string): Promise<void> {
  return apiClient.delete<void>(`/necc/prices/${priceId}`);
}

/**
 * Get prices count
 */
export async function getPricesCount(): Promise<number> {
  // Use the stats endpoint with a wide date range to get count
  const today = new Date().toISOString().split('T')[0];
  const startDate = '2009-01-01'; // Earliest NECC data
  try {
    const stats = await apiClient.get<{ count: number; average: number; min: number; max: number }>(
      `/necc/prices/stats?startDate=${startDate}&endDate=${today}`
    );
    return stats.count || 0;
  } catch {
    return 0;
  }
}

/**
 * Get latest price date
 */
export async function getLatestPriceDate(): Promise<string | null> {
  try {
    // Get today's prices, which will include the latest date
    const today = new Date().toISOString().split('T')[0];
    const prices = await getPricesByDate(today);
    if (prices && prices.length > 0) {
      return prices[0].date;
    }
    // If no prices today, get recent prices
    const recentPrices = await getPrices({ limit: 1 });
    if (recentPrices && recentPrices.length > 0) {
      return recentPrices[0].date;
    }
    return null;
  } catch {
    return null;
  }
}

// =====================================================
// SCRAPER
// =====================================================

/**
 * Run scraper for a specific month/year
 */
export async function runScraper(month: number, year: number): Promise<ScrapeResult> {
  return apiClient.post<ScrapeResult>('/necc/scraper/run-month', { month, year });
}

