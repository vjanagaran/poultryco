import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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
  mode: 'CRON' | 'MANUAL' | null;
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
  const supabase = await createClient(await cookies());
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('necc_prices')
    .select(`
      *,
      zone:necc_zones(id, name, slug, zone_type, state, city)
    `)
    .eq('date', today);

  if (error) throw error;
  
  // Sort by zone name on the client side
  const sorted = (data || []).sort((a, b) => {
    const nameA = a.zone?.name || '';
    const nameB = b.zone?.name || '';
    return nameA.localeCompare(nameB);
  });
  
  return sorted;
}

/**
 * Get yesterday's prices for all zones
 */
export async function getYesterdayPrices(): Promise<NECCPrice[]> {
  const supabase = await createClient(await cookies());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('necc_prices')
    .select(`
      *,
      zone:necc_zones(id, name, slug, zone_type, state, city)
    `)
    .eq('date', yesterdayStr);

  if (error) throw error;
  
  // Sort by zone name on the client side
  const sorted = (data || []).sort((a, b) => {
    const nameA = a.zone?.name || '';
    const nameB = b.zone?.name || '';
    return nameA.localeCompare(nameB);
  });
  
  return sorted;
}

/**
 * Get prices for a specific date
 */
export async function getPricesByDate(date: string): Promise<NECCPrice[]> {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from('necc_prices')
    .select(`
      *,
      zone:necc_zones(id, name, slug, zone_type, state, city)
    `)
    .eq('date', date);

  if (error) throw error;
  
  // Sort by zone name on the client side
  const sorted = (data || []).sort((a, b) => {
    const nameA = a.zone?.name || '';
    const nameB = b.zone?.name || '';
    return nameA.localeCompare(nameB);
  });
  
  return sorted;
}

/**
 * Get prices for a specific date with previous day price (for missing data handling)
 */
export async function getPricesByDateWithPrevious(date: string): Promise<PriceWithPrevious[]> {
  const supabase = await createClient(await cookies());
  const prices = await getPricesByDate(date);
  
  // For each price, get previous day if current is missing
  const pricesWithPrevious = await Promise.all(
    prices.map(async (price) => {
      // If price exists, return as is
      if (price.suggested_price !== null || price.prevailing_price !== null) {
        return price as PriceWithPrevious;
      }
      
      // If missing, get previous day price
      const { data: previous } = await supabase
        .from('necc_prices')
        .select('date, suggested_price, prevailing_price')
        .eq('zone_id', price.zone_id)
        .lt('date', date)
        .or('suggested_price.not.is.null,prevailing_price.not.is.null')
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      return {
        ...price,
        previous_price: previous || undefined,
      } as PriceWithPrevious;
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
  const supabase = await createClient(await cookies());
  let query = supabase
    .from('necc_prices')
    .select(`
      *,
      zone:necc_zones(id, name, slug, zone_type, state, city)
    `)
    .eq('zone_id', zoneId)
    .order('date', { ascending: false });

  if (startDate) {
    query = query.gte('date', startDate);
  }
  if (endDate) {
    query = query.lte('date', endDate);
  }
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Get prices for a specific month
 */
export async function getMonthPrices(year: number, month: number): Promise<NECCPrice[]> {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from('necc_prices')
    .select(`
      *,
      zone:necc_zones(id, name, slug, zone_type, state, city)
    `)
    .eq('year', year)
    .eq('month', month)
    .order('date', { ascending: true });

  if (error) throw error;
  
  // Sort by date first, then zone name
  const sorted = (data || []).sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    const nameA = a.zone?.name || '';
    const nameB = b.zone?.name || '';
    return nameA.localeCompare(nameB);
  });
  
  return sorted;
}

/**
 * Get prices for a specific year
 */
export async function getYearPrices(year: number): Promise<NECCPrice[]> {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from('necc_prices')
    .select(`
      *,
      zone:necc_zones(id, name, slug, zone_type, state, city)
    `)
    .eq('year', year)
    .order('date', { ascending: true });

  if (error) throw error;
  
  // Sort by date first, then zone name
  const sorted = (data || []).sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    const nameA = a.zone?.name || '';
    const nameB = b.zone?.name || '';
    return nameA.localeCompare(nameB);
  });
  
  return sorted;
}

/**
 * Get price statistics for a date range
 */
export async function getPriceStats(
  startDate: string,
  endDate: string,
  zoneId?: string
): Promise<PriceStats> {
  const supabase = await createClient(await cookies());
  let query = supabase
    .from('necc_prices')
    .select('suggested_price')
    .gte('date', startDate)
    .lte('date', endDate)
    .not('suggested_price', 'is', null);

  if (zoneId) {
    query = query.eq('zone_id', zoneId);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (!data || data.length === 0) {
    return { average: 0, min: 0, max: 0, count: 0 };
  }

  const prices = data.map((p) => p.suggested_price!).filter((p) => p !== null);
  const sum = prices.reduce((a, b) => a + b, 0);
  const average = Math.round(sum / prices.length);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return {
    average,
    min,
    max,
    count: prices.length,
  };
}

/**
 * Get today's average price across all zones
 */
export async function getTodayAverage(): Promise<number | null> {
  const today = new Date().toISOString().split('T')[0];
  const stats = await getPriceStats(today, today);
  return stats.count > 0 ? stats.average : null;
}

/**
 * Get yesterday's average price across all zones
 */
export async function getYesterdayAverage(): Promise<number | null> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const stats = await getPriceStats(yesterdayStr, yesterdayStr);
  return stats.count > 0 ? stats.average : null;
}

