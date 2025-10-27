import { createClient } from '@/lib/supabase/client';

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
  const supabase = createClient();
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });
  
  // New users today
  const { count: newUsersToday } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());
  
  // New users this week
  const { count: newUsersThisWeek } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());
  
  // New users this month
  const { count: newUsersThisMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthAgo.toISOString());
  
  // Active users today
  const { count: activeUsersToday } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_active_at', today.toISOString());
  
  // Active users this week
  const { count: activeUsersThisWeek } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_active_at', weekAgo.toISOString());
  
  // Active users this month
  const { count: activeUsersThisMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_active_at', monthAgo.toISOString());
  
  // Verified users
  const { count: verifiedUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .in('verification_level', ['verified', 'trusted']);
  
  // Trusted users
  const { count: trustedUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('verification_level', 'trusted');
  
  return {
    totalUsers: totalUsers || 0,
    newUsersToday: newUsersToday || 0,
    newUsersThisWeek: newUsersThisWeek || 0,
    newUsersThisMonth: newUsersThisMonth || 0,
    activeUsersToday: activeUsersToday || 0,
    activeUsersThisWeek: activeUsersThisWeek || 0,
    activeUsersThisMonth: activeUsersThisMonth || 0,
    verifiedUsers: verifiedUsers || 0,
    trustedUsers: trustedUsers || 0,
  };
}

// Get profile completion segments
export async function getProfileCompletionSegments(): Promise<ProfileCompletionSegment[]> {
  const supabase = createClient();
  
  // Fetch all profiles with their strength
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, profile_slug, profile_strength, created_at')
    .order('profile_strength', { ascending: false });
  
  if (!profiles) return [];
  
  // Segment users
  const segments = [
    { range: '0-20%', min: 0, max: 20, users: [] as typeof profiles },
    { range: '20-50%', min: 20, max: 50, users: [] as typeof profiles },
    { range: '50-80%', min: 50, max: 80, users: [] as typeof profiles },
    { range: '80%+', min: 80, max: 100, users: [] as typeof profiles },
  ];
  
  profiles.forEach(profile => {
    const strength = profile.profile_strength || 0;
    const segment = segments.find(s => strength >= s.min && strength <= s.max);
    if (segment) {
      segment.users.push(profile);
    }
  });
  
  const total = profiles.length;
  
  return segments.map(segment => ({
    range: segment.range,
    count: segment.users.length,
    percentage: total > 0 ? (segment.users.length / total) * 100 : 0,
    users: segment.users.slice(0, 10), // Top 10 users in each segment
  }));
}

// Get location distribution
export async function getLocationDistribution(): Promise<LocationDistribution[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('location_state')
    .not('location_state', 'is', null);
  
  if (error || !data) return [];
  
  // Count by state
  const stateCounts = data.reduce((acc, profile) => {
    const state = profile.location_state;
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const total = data.length;
  
  return Object.entries(stateCounts)
    .map(([state, count]) => ({
      state,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// Get daily user growth for the last 30 days
export async function getDailyUserGrowth(): Promise<DailyUserGrowth[]> {
  const supabase = createClient();
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: profiles } = await supabase
    .from('profiles')
    .select('created_at, last_active_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });
  
  if (!profiles) return [];
  
  // Group by date
  const dailyData: Record<string, { new_users: number; active_users: Set<string> }> = {};
  
  // Initialize all days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    dailyData[dateStr] = { new_users: 0, active_users: new Set() };
  }
  
  // Count new users and active users
  profiles.forEach(profile => {
    const createdDate = new Date(profile.created_at).toISOString().split('T')[0];
    if (dailyData[createdDate]) {
      dailyData[createdDate].new_users++;
    }
    
    if (profile.last_active_at) {
      const activeDate = new Date(profile.last_active_at).toISOString().split('T')[0];
      if (dailyData[activeDate]) {
        dailyData[activeDate].active_users.add(profile.created_at);
      }
    }
  });
  
  // Calculate cumulative users
  let cumulative = 0;
  const result: DailyUserGrowth[] = [];
  
  Object.entries(dailyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([date, data]) => {
      cumulative += data.new_users;
      result.push({
        date,
        new_users: data.new_users,
        active_users: data.active_users.size,
        cumulative_users: cumulative,
      });
    });
  
  return result;
}

// Get entity metrics (businesses and organizations)
export async function getEntityMetrics(): Promise<EntityMetrics> {
  const supabase = createClient();
  
  // Business metrics
  const { count: totalBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true });
  
  const { count: completedBusinesses } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .gte('profile_strength', 80);
  
  // Organization metrics
  const { count: totalOrganizations } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true });
  
  const { data: orgMemberCounts } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('status', 'active');
  
  const orgsWithMembers = new Set(orgMemberCounts?.map(m => m.organization_id) || []).size;
  const avgMembersPerOrg = orgMemberCounts && totalOrganizations 
    ? orgMemberCounts.length / totalOrganizations 
    : 0;
  
  return {
    totalBusinesses: totalBusinesses || 0,
    completedBusinesses: completedBusinesses || 0,
    businessCompletionRate: totalBusinesses ? ((completedBusinesses || 0) / totalBusinesses) * 100 : 0,
    totalOrganizations: totalOrganizations || 0,
    organizationsWithMembers: orgsWithMembers,
    avgMembersPerOrg: Math.round(avgMembersPerOrg * 10) / 10,
  };
}

// Get recent signups with details
export async function getRecentSignups(limit: number = 10) {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return data || [];
}

// Export analytics data
export async function exportAnalyticsData(type: 'users' | 'businesses' | 'organizations') {
  const supabase = createClient();
  
  let query;
  switch (type) {
    case 'users':
      query = supabase.from('profiles').select('*');
      break;
    case 'businesses':
      query = supabase.from('businesses').select('*');
      break;
    case 'organizations':
      query = supabase.from('organizations').select('*');
      break;
  }
  
  const { data } = await query;
  
  if (!data) return null;
  
  // Convert to CSV
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  return csv;
}
