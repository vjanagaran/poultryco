/**
 * Businesses API - Replaces Supabase business queries
 */

import { apiClient } from './client';

export interface BusinessProfile {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  logoUrl?: string | null;
  coverPhotoUrl?: string | null;
  about?: string | null;
  businessTypeId?: string | null;
  industryCategory?: string | null;
  companySize?: string | null;
  foundedYear?: number | null;
  websiteUrl?: string | null;
  ownerId: string;
  isVerified: boolean;
  verificationDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get business by slug
 */
export async function getBusinessBySlug(slug: string): Promise<BusinessProfile> {
  return apiClient.get<BusinessProfile>(`/businesses/slug/${slug}`);
}

/**
 * Search businesses
 */
export async function searchBusinesses(params?: {
  q?: string;
  city?: string;
  state?: string;
  businessType?: string;
  verified?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ data: BusinessProfile[]; count: number }> {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.append('q', params.q);
  if (params?.city) queryParams.append('city', params.city);
  if (params?.state) queryParams.append('state', params.state);
  if (params?.businessType) queryParams.append('businessType', params.businessType);
  if (params?.verified !== undefined) queryParams.append('verified', params.verified.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  return apiClient.get<{ data: BusinessProfile[]; count: number }>(`/businesses/search?${queryParams.toString()}`);
}
