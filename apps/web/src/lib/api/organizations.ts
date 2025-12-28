/**
 * Organizations API - Replaces Supabase organization queries
 */

import { apiClient } from './client';

export interface OrganizationProfile {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  logoUrl?: string | null;
  coverPhotoUrl?: string | null;
  about?: string | null;
  mission?: string | null;
  vision?: string | null;
  organizationTypeId?: string | null;
  foundedYear?: number | null;
  registrationNumber?: string | null;
  websiteUrl?: string | null;
  ownerId: string;
  isVerified: boolean;
  membersCount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get organization by slug
 */
export async function getOrganizationBySlug(slug: string): Promise<OrganizationProfile> {
  return apiClient.get<OrganizationProfile>(`/organizations/slug/${slug}`);
}

/**
 * Search organizations
 */
export async function searchOrganizations(params?: {
  q?: string;
  city?: string;
  state?: string;
  organizationType?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: OrganizationProfile[]; count: number }> {
  const queryParams = new URLSearchParams();
  if (params?.q) queryParams.append('q', params.q);
  if (params?.city) queryParams.append('city', params.city);
  if (params?.state) queryParams.append('state', params.state);
  if (params?.organizationType) queryParams.append('organizationType', params.organizationType);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  return apiClient.get<{ data: OrganizationProfile[]; count: number }>(`/organizations/search?${queryParams.toString()}`);
}

