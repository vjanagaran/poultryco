/**
 * NECC API Client
 * Handles all NECC-related API calls
 */

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

/**
 * Get all active NECC zones
 */
export async function getNECCZones(): Promise<NECCZone[]> {
  try {
    const response = await apiClient.get<NECCZone[]>('/necc/zones');
    return response || [];
  } catch (error) {
    console.error('Error fetching NECC zones:', error);
    return [];
  }
}

/**
 * Trigger NECC price scraping
 */
export async function scrapeNECCPrices(): Promise<any> {
  try {
    const response = await apiClient.post('/necc/scrape');
    return response;
  } catch (error) {
    console.error('Error triggering NECC scrape:', error);
    throw error;
  }
}

