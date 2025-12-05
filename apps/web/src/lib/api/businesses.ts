/**
 * Businesses API - Placeholder for business operations
 * TODO: Implement when business endpoints are ready
 */

import { apiClient } from './client';

export interface Business {
  id: string;
  business_name: string;
  business_slug: string;
  logo_url?: string;
  owner_id: string;
  // Add other business fields as needed
}

/**
 * Get owned businesses
 */
export async function getOwnedBusinesses(): Promise<Business[]> {
  // TODO: Implement when endpoint is available
  return apiClient.get<Business[]>('/businesses/me');
}

/**
 * Get business by slug
 */
export async function getBusinessBySlug(slug: string): Promise<Business> {
  return apiClient.get<Business>(`/businesses/${slug}`);
}

