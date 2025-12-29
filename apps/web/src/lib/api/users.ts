/**
 * Users API - Replaces Supabase profile queries
 */

import { apiClient } from './client';

export interface Profile {
  id: string;
  full_name: string;
  profile_slug: string;
  profile_photo_url: string | null;
  cover_photo_url: string | null;
  headline: string | null;
  bio: string | null;
  location_state: string;
  location_district: string | null;
  location_city: string | null;
  country: string;
  phone: string;
  phone_verified: boolean;
  email: string;
  email_verified: boolean;
  whatsapp_number: string | null;
  profile_strength: number;
  verification_level: string;
  is_public: boolean;
  last_active_at: string | null;
  last_profile_update_at: string | null;
  created_at: string;
  updated_at: string;
  roles?: any[];
  experiences?: any[];
  education?: any[];
  skills?: any[];
}

export interface SearchParams {
  q?: string;
  role?: string;
  state?: string;
  city?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get profile by slug
 */
export async function getProfileBySlug(slug: string): Promise<Profile> {
  return apiClient.get<Profile>(`/users/${slug}`);
}

/**
 * Get current user profile
 */
export async function getCurrentProfile(): Promise<Profile> {
  const result = await apiClient.get<{ user: { profile: Profile } }>('/auth/me');
  return result.user.profile;
}

/**
 * Update current user profile
 */
export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  return apiClient.put<Profile>('/users/me', data);
}

/**
 * Search profiles
 */
export async function searchProfiles(params: SearchParams): Promise<{ data: Profile[]; count: number }> {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.append('q', params.q);
  if (params.role) queryParams.append('role', params.role);
  if (params.state) queryParams.append('state', params.state);
  if (params.city) queryParams.append('city', params.city);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());

  return apiClient.get<{ data: Profile[]; count: number }>(`/users/search?${queryParams.toString()}`);
}

/**
 * Get profile stats
 */
export async function getProfileStats(): Promise<any> {
  return apiClient.get('/users/me/stats');
}

/**
 * Add experience
 */
export async function addExperience(data: any): Promise<any> {
  return apiClient.post('/users/me/experiences', data);
}

/**
 * Update experience
 */
export async function updateExperience(id: string, data: any): Promise<any> {
  return apiClient.put(`/users/me/experiences/${id}`, data);
}

/**
 * Delete experience
 */
export async function deleteExperience(id: string): Promise<void> {
  return apiClient.delete(`/users/me/experiences/${id}`);
}

/**
 * Add education
 */
export async function addEducation(data: any): Promise<any> {
  return apiClient.post('/users/me/education', data);
}

/**
 * Update education
 */
export async function updateEducation(id: string, data: any): Promise<any> {
  return apiClient.put(`/users/me/education/${id}`, data);
}

/**
 * Delete education
 */
export async function deleteEducation(id: string): Promise<void> {
  return apiClient.delete(`/users/me/education/${id}`);
}

/**
 * Add skill
 */
export async function addSkill(skillId: string): Promise<any> {
  return apiClient.post('/users/me/skills', { skillId });
}

/**
 * Remove skill
 */
export async function removeSkill(skillId: string): Promise<void> {
  return apiClient.delete(`/users/me/skills/${skillId}`);
}

