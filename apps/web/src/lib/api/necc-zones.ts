import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

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
  sorting: number;
  status: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Get all active zones
 */
export async function getAllZones(): Promise<NECCZone[]> {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from('necc_zones')
    .select('*')
    .eq('status', true)
    .order('sorting', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get zone by ID
 */
export async function getZoneById(zoneId: string): Promise<NECCZone | null> {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from('necc_zones')
    .select('*')
    .eq('id', zoneId)
    .eq('status', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

/**
 * Get zone by slug
 */
export async function getZoneBySlug(slug: string): Promise<NECCZone | null> {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from('necc_zones')
    .select('*')
    .eq('slug', slug)
    .eq('status', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

/**
 * Get zones by type
 */
export async function getZonesByType(
  zoneType: 'production_center' | 'consumption_center'
): Promise<NECCZone[]> {
  const supabase = await createClient(await cookies());
  const { data, error } = await supabase
    .from('necc_zones')
    .select('*')
    .eq('zone_type', zoneType)
    .eq('status', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get zones count
 */
export async function getZonesCount(): Promise<number> {
  const supabase = await createClient(await cookies());
  const { count, error } = await supabase
    .from('necc_zones')
    .select('*', { count: 'exact', head: true })
    .eq('status', true);

  if (error) throw error;
  return count || 0;
}

