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
 * Get all active zones
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
 * Get zones by type
 */
export async function getZonesByType(
  zoneType: 'production_center' | 'consumption_center'
): Promise<NECCZone[]> {
  return apiClient.get<NECCZone[]>(`/necc/zones/type/${zoneType}`);
}

/**
 * Get zones count
 */
export async function getZonesCount(): Promise<number> {
  const result = await apiClient.get<{ count: number }>('/necc/zones/count');
  return result.count;
}
