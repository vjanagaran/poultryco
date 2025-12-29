import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { eq, gte, inArray, sql, and, count, desc } from 'drizzle-orm';
import { profiles } from '@/database/schema/core';
import { bizProfiles } from '@/database/schema/businesses';
import { orgProfiles } from '@/database/schema/organizations';

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

@Injectable()
export class AnalyticsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  /**
   * Get user metrics
   */
  async getUserMetrics(): Promise<UserMetrics> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Total users
    const [{ totalUsers }] = await this.db
      .select({ totalUsers: count() })
      .from(profiles);

    // New users today
    const [{ newUsersToday }] = await this.db
      .select({ newUsersToday: count() })
      .from(profiles)
      .where(gte(profiles.createdAt, today));

    // New users this week
    const [{ newUsersThisWeek }] = await this.db
      .select({ newUsersThisWeek: count() })
      .from(profiles)
      .where(gte(profiles.createdAt, weekAgo));

    // New users this month
    const [{ newUsersThisMonth }] = await this.db
      .select({ newUsersThisMonth: count() })
      .from(profiles)
      .where(gte(profiles.createdAt, monthAgo));

    // Active users today
    const [{ activeUsersToday }] = await this.db
      .select({ activeUsersToday: count() })
      .from(profiles)
      .where(gte(profiles.lastActiveAt, today));

    // Active users this week
    const [{ activeUsersThisWeek }] = await this.db
      .select({ activeUsersThisWeek: count() })
      .from(profiles)
      .where(gte(profiles.lastActiveAt, weekAgo));

    // Active users this month
    const [{ activeUsersThisMonth }] = await this.db
      .select({ activeUsersThisMonth: count() })
      .from(profiles)
      .where(gte(profiles.lastActiveAt, monthAgo));

    // Verified users
    const [{ verifiedUsers }] = await this.db
      .select({ verifiedUsers: count() })
      .from(profiles)
      .where(
        inArray(profiles.verificationLevel, ['verified', 'trusted'])
      );

    // Trusted users
    const [{ trustedUsers }] = await this.db
      .select({ trustedUsers: count() })
      .from(profiles)
      .where(eq(profiles.verificationLevel, 'trusted'));

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

  /**
   * Get profile completion segments
   */
  async getProfileCompletionSegments(): Promise<ProfileCompletionSegment[]> {
    const allProfiles = await this.db
      .select({
        id: profiles.id,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
        displayName: profiles.displayName,
        email: profiles.email,
        slug: profiles.slug,
        profileStrength: profiles.profileStrength,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .orderBy(desc(profiles.profileStrength));

    const segments = [
      { range: '0-20%', min: 0, max: 20, users: [] as any[] },
      { range: '20-50%', min: 20, max: 50, users: [] as any[] },
      { range: '50-80%', min: 50, max: 80, users: [] as any[] },
      { range: '80%+', min: 80, max: 100, users: [] as any[] },
    ];

    allProfiles.forEach((profile: any) => {
      const strength = profile.profileStrength || 0;
      const segment = segments.find(s => strength >= s.min && strength <= s.max);
      if (segment) {
        segment.users.push({
          id: profile.id,
          full_name: profile.displayName || `${profile.firstName} ${profile.lastName}`,
          email: profile.email,
          profile_slug: profile.slug,
          profile_strength: strength,
          created_at: profile.createdAt?.toISOString() || '',
        });
      }
    });

    const total = allProfiles.length;

    return segments.map(segment => ({
      range: segment.range,
      count: segment.users.length,
      percentage: total > 0 ? (segment.users.length / total) * 100 : 0,
      users: segment.users.slice(0, 10),
    }));
  }

  /**
   * Get location distribution
   */
  async getLocationDistribution(): Promise<LocationDistribution[]> {
    const locationData = await this.db
      .select({
        state: profiles.state,
      })
      .from(profiles)
      .where(sql`${profiles.state} IS NOT NULL`);

    const stateCounts = locationData.reduce((acc: any, profile: any) => {
      const state = profile.state;
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = locationData.length;

    return Object.entries(stateCounts)
      .map(([state, count]) => ({
        state,
        count: count as number,
        percentage: total > 0 ? ((count as number) / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get daily user growth
   */
  async getDailyUserGrowth(): Promise<DailyUserGrowth[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const profileData = await this.db
      .select({
        createdAt: profiles.createdAt,
        lastActiveAt: profiles.lastActiveAt,
      })
      .from(profiles)
      .where(gte(profiles.createdAt, thirtyDaysAgo))
      .orderBy(profiles.createdAt);

    const dailyData: Record<string, { new_users: number; active_users: Set<string> }> = {};

    // Initialize all days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = { new_users: 0, active_users: new Set() };
    }

    // Count new users and active users
    profileData.forEach((profile: any) => {
      const createdDate = new Date(profile.createdAt).toISOString().split('T')[0];
      if (dailyData[createdDate]) {
        dailyData[createdDate].new_users++;
      }

      if (profile.lastActiveAt) {
        const activeDate = new Date(profile.lastActiveAt).toISOString().split('T')[0];
        if (dailyData[activeDate]) {
          dailyData[activeDate].active_users.add(profile.createdAt);
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

  /**
   * Get entity metrics
   */
  async getEntityMetrics(): Promise<EntityMetrics> {
    // Business metrics
    const [{ totalBusinesses }] = await this.db
      .select({ totalBusinesses: count() })
      .from(bizProfiles);

    // TODO: Calculate completed businesses when profileStrength field exists
    const completedBusinesses = 0;

    // Organization metrics
    const [{ totalOrganizations }] = await this.db
      .select({ totalOrganizations: count() })
      .from(orgProfiles);

    // TODO: Get organization members count when schema is available
    const orgsWithMembers = 0;
    const avgMembersPerOrg = 0;

    return {
      totalBusinesses: totalBusinesses || 0,
      completedBusinesses: completedBusinesses || 0,
      businessCompletionRate: totalBusinesses ? ((completedBusinesses || 0) / totalBusinesses) * 100 : 0,
      totalOrganizations: totalOrganizations || 0,
      organizationsWithMembers: orgsWithMembers,
      avgMembersPerOrg: avgMembersPerOrg,
    };
  }

  /**
   * Get recent signups
   */
  async getRecentSignups(limit: number = 10) {
    const recent = await this.db
      .select()
      .from(profiles)
      .orderBy(desc(profiles.createdAt))
      .limit(limit);

    return recent.map((p: any) => ({
      id: p.id,
      full_name: p.displayName || `${p.firstName} ${p.lastName}`,
      profile_strength: p.profileStrength || 0,
      location_city: p.city,
      location_state: p.state,
      created_at: p.createdAt?.toISOString() || '',
    }));
  }
}
