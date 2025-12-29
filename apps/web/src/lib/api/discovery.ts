/**
 * Discovery API - Search and discovery endpoints
 * Migrated from Supabase to REST API
 */

import { apiClient } from './client';
import type { DiscoveryType, SortOption } from '@/stores/discoveryStore';

export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
  sortBy?: SortOption;
  userLocation?: { lat: number; lng: number };
}

export interface MemberResult {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  slug: string;
  profilePhoto?: string | null;
  headline?: string | null;
  city?: string | null;
  state?: string | null;
  verificationLevel?: 'basic' | 'verified' | 'trusted';
  connectionsCount?: number;
  followersCount?: number;
}

export interface BusinessResult {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  logoUrl?: string | null;
  city?: string | null;
  state?: string | null;
  businessTypeId?: string | null;
  businessType?: { name: string };
  isVerified: boolean;
  followersCount?: number;
  productsCount?: number;
}

export interface ProductResult {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  primaryImageUrl?: string | null;
  price?: string | null;
  priceUnit?: string | null;
  stockStatus?: string;
  category?: { name: string };
  business?: {
    id: string;
    name: string;
    slug: string;
    city?: string | null;
  };
}

export interface OrganizationResult {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  logoUrl?: string | null;
  city?: string | null;
  state?: string | null;
  organizationTypeId?: string | null;
  organizationType?: { name: string };
  isVerified: boolean;
  membersCount?: number;
  eventsCount?: number;
}

export interface EventResult {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverImageUrl?: string | null;
  startDate: string;
  endDate?: string | null;
  eventType?: { name: string };
  eventFormat?: string | null;
  city?: string | null;
  state?: string | null;
  meetingUrl?: string | null;
  registrationFee?: number;
  isFree?: boolean;
  maxAttendees?: number | null;
  attendeesCount?: number;
  organizer?: {
    name: string;
    slug: string;
    logoUrl?: string | null;
  };
}

export interface JobResult {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  jobType?: string | null;
  city?: string | null;
  state?: string | null;
  isRemote?: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryPeriod?: string | null;
  postedAt?: string;
  applicationsCount?: number;
  employer?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    isVerified?: boolean;
  };
}

// Members
export async function searchMembers(params: SearchParams): Promise<{ data: MemberResult[]; count: number }> {
  const { query, filters = {}, page = 0, limit = 24 } = params;
  
  const queryParams = new URLSearchParams();
  if (query) queryParams.append('q', query);
  if (filters.city) queryParams.append('city', filters.city);
  if (filters.state) queryParams.append('state', filters.state);
  if (filters.role) queryParams.append('role', filters.role);
  if (limit) queryParams.append('limit', limit.toString());
  if (page) queryParams.append('offset', (page * limit).toString());

  const result = await apiClient.get<{ data: MemberResult[]; count: number }>(`/users/search?${queryParams.toString()}`);
  
  // Transform API response to match expected format
  const transformed = result.data.map((profile: any) => ({
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    displayName: profile.displayName,
    slug: profile.slug,
    profilePhoto: profile.profilePhoto,
    headline: profile.headline,
    city: profile.city,
    state: profile.state,
    verificationLevel: profile.verificationLevel,
    connectionsCount: profile.connectionsCount,
    followersCount: profile.followersCount,
  }));

  return { data: transformed, count: result.count || transformed.length };
}

// Businesses
export async function searchBusinesses(params: SearchParams): Promise<{ data: BusinessResult[]; count: number }> {
  const { query, filters = {}, page = 0, limit = 24 } = params;
  
  const queryParams = new URLSearchParams();
  if (query) queryParams.append('q', query);
  if (filters.city) queryParams.append('city', filters.city);
  if (filters.state) queryParams.append('state', filters.state);
  if (filters.businessType) queryParams.append('businessType', filters.businessType);
  if (filters.verified !== undefined) queryParams.append('verified', filters.verified.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (page) queryParams.append('offset', (page * limit).toString());

  const result = await apiClient.get<{ data: BusinessResult[]; count: number }>(`/businesses/search?${queryParams.toString()}`);
  return result;
}

// Products
export async function searchProducts(params: SearchParams): Promise<{ data: ProductResult[]; count: number }> {
  const { query, filters = {}, page = 0, limit = 24 } = params;
  
  const queryParams = new URLSearchParams();
  if (query) queryParams.append('q', query);
  if (filters.category) queryParams.append('category', filters.category);
  if (filters.inStock !== undefined) queryParams.append('inStock', filters.inStock.toString());
  if (filters.priceMin) queryParams.append('priceMin', filters.priceMin.toString());
  if (filters.priceMax) queryParams.append('priceMax', filters.priceMax.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (page) queryParams.append('offset', (page * limit).toString());

  const result = await apiClient.get<{ data: ProductResult[]; count: number }>(`/marketplace/products/search?${queryParams.toString()}`);
  return result;
}

// Organizations
export async function searchOrganizations(params: SearchParams): Promise<{ data: OrganizationResult[]; count: number }> {
  const { query, filters = {}, page = 0, limit = 24 } = params;
  
  const queryParams = new URLSearchParams();
  if (query) queryParams.append('q', query);
  if (filters.city) queryParams.append('city', filters.city);
  if (filters.state) queryParams.append('state', filters.state);
  if (filters.organizationType) queryParams.append('organizationType', filters.organizationType);
  if (limit) queryParams.append('limit', limit.toString());
  if (page) queryParams.append('offset', (page * limit).toString());

  const result = await apiClient.get<{ data: OrganizationResult[]; count: number }>(`/organizations/search?${queryParams.toString()}`);
  return result;
}

// Events
export async function searchEvents(params: SearchParams): Promise<{ data: EventResult[]; count: number }> {
  const { query, filters = {}, page = 0, limit = 24 } = params;
  
  const queryParams = new URLSearchParams();
  if (query) queryParams.append('q', query);
  if (filters.eventType) queryParams.append('eventType', filters.eventType);
  if (filters.format) queryParams.append('format', filters.format);
  if (filters.isFree !== undefined) queryParams.append('isFree', filters.isFree.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (page) queryParams.append('offset', (page * limit).toString());

  const result = await apiClient.get<{ data: EventResult[]; count: number }>(`/events/search?${queryParams.toString()}`);
  return result;
}

// Jobs
export async function searchJobs(params: SearchParams): Promise<{ data: JobResult[]; count: number }> {
  const { query, filters = {}, page = 0, limit = 24 } = params;
  
  const queryParams = new URLSearchParams();
  if (query) queryParams.append('q', query);
  if (filters.employmentType) queryParams.append('employmentType', filters.employmentType);
  if (filters.city) queryParams.append('city', filters.city);
  if (filters.state) queryParams.append('state', filters.state);
  if (filters.isRemote !== undefined) queryParams.append('isRemote', filters.isRemote.toString());
  if (filters.salaryMin) queryParams.append('salaryMin', filters.salaryMin.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (page) queryParams.append('offset', (page * limit).toString());

  const result = await apiClient.get<{ data: JobResult[]; count: number }>(`/jobs/search?${queryParams.toString()}`);
  return result;
}

// Get taxonomy data
export async function getBusinessTypes() {
  // TODO: Implement when reference endpoints are available
  return [];
}

export async function getProductCategories(level?: number) {
  const queryParams = new URLSearchParams();
  if (level) queryParams.append('level', level.toString());
  
  return apiClient.get(`/marketplace/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
}

export async function getOrganizationTypes() {
  // TODO: Implement when reference endpoints are available
  return [];
}

export async function getEventTypes() {
  // Event types are stored in the event_type column as enum/text
  // Return common event types
  return [
    { id: 'conference', name: 'Conference' },
    { id: 'webinar', name: 'Webinar' },
    { id: 'workshop', name: 'Workshop' },
    { id: 'seminar', name: 'Seminar' },
    { id: 'trade_show', name: 'Trade Show' },
    { id: 'networking', name: 'Networking' },
    { id: 'training', name: 'Training' },
  ];
}

export async function getJobTypes() {
  // Employment types are stored in employment_type column
  return [
    { id: 'full_time', name: 'Full Time' },
    { id: 'part_time', name: 'Part Time' },
    { id: 'contract', name: 'Contract' },
    { id: 'temporary', name: 'Temporary' },
    { id: 'internship', name: 'Internship' },
  ];
}
