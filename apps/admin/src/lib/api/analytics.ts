import { apiClient } from './client';

// Types
export interface UserMetrics {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsersToday: number;
  activeUsersThisWeek: number;
  activeUsersThisMonth: number;
  verifiedUsers: number;
  trustedUsers: number;
}

export interface ProfileCompletionSegment {
  range: string;
  count: number;
  percentage: number;
  users?: Array<{
    id: string;
    full_name: string;
    email: string;
    profile_slug: string;
    profile_strength: number;
    created_at: string;
  }>;
}

export interface LocationDistribution {
  state: string;
  count: number;
  percentage: number;
}

export interface DailyUserGrowth {
  date: string;
  new_users: number;
  active_users: number;
  cumulative_users: number;
}

export interface EntityMetrics {
  totalBusinesses: number;
  completedBusinesses: number;
  businessCompletionRate: number;
  totalOrganizations: number;
  organizationsWithMembers: number;
  avgMembersPerOrg: number;
}

// Fetch user metrics
export async function getUserMetrics(): Promise<UserMetrics> {
  return apiClient.get<UserMetrics>('/analytics/users/metrics');
}

// Get profile completion segments
export async function getProfileCompletionSegments(): Promise<ProfileCompletionSegment[]> {
  return apiClient.get<ProfileCompletionSegment[]>('/analytics/users/completion-segments');
}

// Get location distribution
export async function getLocationDistribution(): Promise<LocationDistribution[]> {
  return apiClient.get<LocationDistribution[]>('/analytics/users/location-distribution');
}

// Get daily user growth for the last 30 days
export async function getDailyUserGrowth(): Promise<DailyUserGrowth[]> {
  return apiClient.get<DailyUserGrowth[]>('/analytics/users/daily-growth');
}

// Get entity metrics (businesses and organizations)
export async function getEntityMetrics(): Promise<EntityMetrics> {
  return apiClient.get<EntityMetrics>('/analytics/entities/metrics');
}

// Get recent signups with details
export async function getRecentSignups(limit: number = 10) {
  return apiClient.get(`/analytics/users/recent-signups?limit=${limit}`);
}

// Export analytics data
export async function exportAnalyticsData(type: 'users' | 'businesses' | 'organizations') {
  // TODO: Replace with API call
  return null;
}
