import { createClient } from '@/lib/supabase/client';
import type { DiscoveryType, SortOption } from '@/stores/discoveryStore';

const supabase = createClient();

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
  full_name: string;
  headline: string | null;
  profile_slug: string;
  profile_photo_url: string | null;
  location_city: string | null;
  location_state: string | null;
  current_role: string | null;
  is_verified: boolean;
  connections_count?: number;
  followers_count?: number;
  rating?: number;
  review_count?: number;
}

export interface BusinessResult {
  id: string;
  business_name: string;
  tagline: string | null;
  business_slug: string;
  logo_url: string | null;
  location_city: string | null;
  location_state: string | null;
  business_type_id: string | null;
  business_type?: { name: string };
  rating?: number;
  review_count?: number;
  product_count?: number;
  team_count?: number;
  established_year: number | null;
  is_verified: boolean;
}

export interface ProductResult {
  id: string;
  product_name: string;
  short_description: string | null;
  featured_image_url: string | null;
  price: number | null;
  price_unit: string | null;
  is_available: boolean;
  primary_category_id: string | null;
  category?: { name: string };
  business: {
    id: string;
    business_name: string;
    business_slug: string;
    location_city: string | null;
  };
  rating?: number;
  review_count?: number;
}

export interface OrganizationResult {
  id: string;
  organization_name: string;
  tagline: string | null;
  slug: string;
  logo_url: string | null;
  location_city: string | null;
  location_state: string | null;
  organization_type_id: string | null;
  organization_type?: { name: string };
  member_count?: number;
  event_count?: number;
  resource_count?: number;
  is_verified: boolean;
  established_year: number | null;
}

export interface EventResult {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  end_datetime: string | null;
  event_type?: { name: string };
  format: string | null;
  location_city: string | null;
  location_state: string | null;
  online_link: string | null;
  is_free: boolean;
  price: number | null;
  capacity: number | null;
  registered_count: number;
  is_featured: boolean;
  organizer: {
    organization_name: string;
    slug: string;
    logo_url: string | null;
  };
}

export interface JobResult {
  id: string;
  title: string;
  description: string | null;
  employment_type: string | null;
  experience_min: number | null;
  experience_max: number | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string | null;
  location_city: string | null;
  location_state: string | null;
  is_remote: boolean;
  is_active: boolean;
  posted_at: string;
  applicant_count?: number;
  required_skills: string[] | null;
  company: {
    id: string;
    business_name: string;
    business_slug: string;
    logo_url: string | null;
    is_verified: boolean;
  };
}

// Members
export async function searchMembers(params: SearchParams): Promise<{ data: MemberResult[]; count: number }> {
  const { query, filters = {}, page = 0, limit = 24, sortBy = 'relevant' } = params;
  
  let queryBuilder = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('is_active', true);
  
  // Search query
  if (query) {
    queryBuilder = queryBuilder.or(`full_name.ilike.%${query}%,headline.ilike.%${query}%`);
  }
  
  // Filters
  if (filters.city) {
    queryBuilder = queryBuilder.eq('location_city', filters.city);
  }
  if (filters.state) {
    queryBuilder = queryBuilder.eq('location_state', filters.state);
  }
  if (filters.role) {
    queryBuilder = queryBuilder.eq('current_role', filters.role);
  }
  if (filters.verified) {
    queryBuilder = queryBuilder.eq('is_verified', true);
  }
  if (filters.hasPhoto) {
    queryBuilder = queryBuilder.not('profile_photo_url', 'is', null);
  }
  
  // Sorting
  switch (sortBy) {
    case 'recent':
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
      break;
    case 'relevant':
    default:
      queryBuilder = queryBuilder.order('is_verified', { ascending: false });
      break;
  }
  
  // Pagination
  const from = page * limit;
  const to = from + limit - 1;
  queryBuilder = queryBuilder.range(from, to);
  
  const { data, error, count } = await queryBuilder;
  
  if (error) throw error;
  
  return { data: data || [], count: count || 0 };
}

// Businesses
export async function searchBusinesses(params: SearchParams): Promise<{ data: BusinessResult[]; count: number }> {
  const { query, filters = {}, page = 0, limit = 24, sortBy = 'relevant' } = params;
  
  let queryBuilder = supabase
    .from('business_profiles')
    .select('*, business_type:business_types(name)', { count: 'exact' })
    .eq('is_active', true);
  
  if (query) {
    queryBuilder = queryBuilder.or(`business_name.ilike.%${query}%,tagline.ilike.%${query}%`);
  }
  
  if (filters.city) {
    queryBuilder = queryBuilder.eq('location_city', filters.city);
  }
  if (filters.businessType) {
    queryBuilder = queryBuilder.eq('business_type_id', filters.businessType);
  }
  if (filters.verified) {
    queryBuilder = queryBuilder.eq('is_verified', true);
  }
  
  switch (sortBy) {
    case 'recent':
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
      break;
    default:
      queryBuilder = queryBuilder.order('is_verified', { ascending: false });
      break;
  }
  
  const from = page * limit;
  queryBuilder = queryBuilder.range(from, from + limit - 1);
  
  const { data, error, count } = await queryBuilder;
  if (error) throw error;
  
  return { data: data || [], count: count || 0 };
}

// Products
export async function searchProducts(params: SearchParams): Promise<{ data: ProductResult[]; count: number }> {
  const { query, filters = {}, page = 0, limit = 24, sortBy = 'relevant' } = params;
  
  let queryBuilder = supabase
    .from('business_products')
    .select(`
      *,
      category:product_categories(name),
      business:business_profiles(id, business_name, business_slug, location_city)
    `, { count: 'exact' })
    .eq('is_published', true);
  
  if (query) {
    queryBuilder = queryBuilder.or(`product_name.ilike.%${query}%,short_description.ilike.%${query}%`);
  }
  
  if (filters.category) {
    queryBuilder = queryBuilder.eq('primary_category_id', filters.category);
  }
  if (filters.inStock) {
    queryBuilder = queryBuilder.eq('is_available', true);
  }
  if (filters.priceMin) {
    queryBuilder = queryBuilder.gte('price', filters.priceMin);
  }
  if (filters.priceMax) {
    queryBuilder = queryBuilder.lte('price', filters.priceMax);
  }
  if (filters.birdTypes && filters.birdTypes.length > 0) {
    queryBuilder = queryBuilder.contains('bird_types', filters.birdTypes);
  }
  
  switch (sortBy) {
    case 'price_low':
      queryBuilder = queryBuilder.order('price', { ascending: true, nullsFirst: false });
      break;
    case 'price_high':
      queryBuilder = queryBuilder.order('price', { ascending: false, nullsFirst: false });
      break;
    default:
      queryBuilder = queryBuilder.order('created_at', { ascending: false });
      break;
  }
  
  const from = page * limit;
  queryBuilder = queryBuilder.range(from, from + limit - 1);
  
  const { data, error, count } = await queryBuilder;
  if (error) throw error;
  
  return { data: data || [], count: count || 0 };
}

// Organizations
export async function searchOrganizations(params: SearchParams): Promise<{ data: OrganizationResult[]; count: number }> {
  const { query, filters = {}, page = 0, limit = 24 } = params;
  
  let queryBuilder = supabase
    .from('organizations')
    .select('*, organization_type:organization_types(name)', { count: 'exact' })
    .eq('is_active', true);
  
  if (query) {
    queryBuilder = queryBuilder.or(`organization_name.ilike.%${query}%,tagline.ilike.%${query}%`);
  }
  
  if (filters.city) {
    queryBuilder = queryBuilder.eq('location_city', filters.city);
  }
  if (filters.organizationType) {
    queryBuilder = queryBuilder.eq('organization_type_id', filters.organizationType);
  }
  
  queryBuilder = queryBuilder.order('created_at', { ascending: false });
  
  const from = page * limit;
  queryBuilder = queryBuilder.range(from, from + limit - 1);
  
  const { data, error, count } = await queryBuilder;
  if (error) throw error;
  
  return { data: data || [], count: count || 0 };
}

// Events
export async function searchEvents(params: SearchParams): Promise<{ data: EventResult[]; count: number }> {
  const { query, filters = {}, page = 0, limit = 24 } = params;
  
  let queryBuilder = supabase
    .from('organization_events')
    .select(`
      *,
      event_type:event_types(name),
      organizer:organizations(organization_name, slug, logo_url)
    `, { count: 'exact' })
    .eq('status', 'published')
    .gte('start_datetime', new Date().toISOString());
  
  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }
  
  if (filters.eventType) {
    queryBuilder = queryBuilder.eq('event_type', filters.eventType);
  }
  if (filters.format) {
    queryBuilder = queryBuilder.eq('format', filters.format);
  }
  if (filters.isFree) {
    queryBuilder = queryBuilder.eq('is_free', true);
  }
  
  queryBuilder = queryBuilder.order('start_datetime', { ascending: true });
  
  const from = page * limit;
  queryBuilder = queryBuilder.range(from, from + limit - 1);
  
  const { data, error, count } = await queryBuilder;
  if (error) throw error;
  
  return { data: data || [], count: count || 0 };
}

// Jobs
export async function searchJobs(params: SearchParams): Promise<{ data: JobResult[]; count: number }> {
  const { query, filters = {}, page = 0, limit = 24 } = params;
  
  let queryBuilder = supabase
    .from('business_jobs')
    .select(`
      *,
      company:business_profiles(id, business_name, business_slug, logo_url, is_verified)
    `, { count: 'exact' })
    .eq('is_active', true);
  
  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }
  
  if (filters.employmentType) {
    queryBuilder = queryBuilder.eq('employment_type', filters.employmentType);
  }
  if (filters.city) {
    queryBuilder = queryBuilder.eq('location_city', filters.city);
  }
  if (filters.isRemote) {
    queryBuilder = queryBuilder.eq('is_remote', true);
  }
  if (filters.salaryMin) {
    queryBuilder = queryBuilder.gte('salary_min', filters.salaryMin);
  }
  
  queryBuilder = queryBuilder.order('posted_at', { ascending: false });
  
  const from = page * limit;
  queryBuilder = queryBuilder.range(from, from + limit - 1);
  
  const { data, error, count } = await queryBuilder;
  if (error) throw error;
  
  return { data: data || [], count: count || 0 };
}

// Get taxonomy data
export async function getBusinessTypes() {
  const { data, error } = await supabase
    .from('business_types')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  
  if (error) throw error;
  return data || [];
}

export async function getProductCategories(level?: number) {
  let query = supabase
    .from('product_categories')
    .select('*')
    .eq('is_active', true);
  
  if (level) {
    query = query.eq('level', level);
  }
  
  query = query.order('display_order');
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getOrganizationTypes() {
  const { data, error } = await supabase
    .from('organization_types')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  
  if (error) throw error;
  return data || [];
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

