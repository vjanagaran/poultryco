'use client';

import { useEffect, useState } from 'react';
import { MetricCard } from '@/components/analytics/MetricCard';
import { RealtimeMetrics } from '@/components/analytics/RealtimeMetrics';
import { getUserMetrics, getRecentSignups, type UserMetrics, type RecentUser } from '@/lib/api/analytics';
// TODO: Migrate blog and newsletter counts to API
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [blogCount, setBlogCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get user metrics
      const userMetrics = await getUserMetrics();
      setMetrics(userMetrics);
      
      // Get recent users
      const recent = await getRecentSignups(5);
      setRecentUsers(recent);
      
      // TODO: Migrate blog and newsletter counts to API
      // For now, set to 0
      setBlogCount(0);
      setEmailCount(0);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          change={{
            value: metrics?.newUsersThisMonth || 0,
            label: "this month"
          }}
          trend="up"
          icon="👥"
          loading={loading}
        />

        <MetricCard
          title="Blog Posts"
          value={blogCount}
          icon="📝"
          loading={loading}
        />

        <MetricCard
          title="Active Users"
          value={metrics?.activeUsersThisWeek || 0}
          change={{
            value: metrics?.activeUsersThisWeek && metrics?.activeUsersThisMonth
              ? Math.round((metrics.activeUsersThisWeek / metrics.activeUsersThisMonth) * 100)
              : 0,
            label: "of monthly"
          }}
          trend="up"
          icon="📊"
          loading={loading}
        />

        <MetricCard
          title="Email Subscribers"
          value={emailCount}
          icon="📧"
          loading={loading}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
            <Link 
              href="/users" 
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {user.location_city || user.location_state} • Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      (user.profile_strength ?? 0) >= 80 ? 'bg-green-100 text-green-800' :
                      (user.profile_strength ?? 0) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.profile_strength ?? 0}% complete
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Real-time Metrics */}
        <RealtimeMetrics />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/blog/new"
            className="flex items-center justify-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span>📝</span>
            <span className="font-medium">New Blog Post</span>
          </Link>
          <Link
            href="/analytics"
            className="flex items-center justify-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span>📊</span>
            <span className="font-medium">View Analytics</span>
          </Link>
          <Link
            href="/forms/contact"
            className="flex items-center justify-center gap-2 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span>✉️</span>
            <span className="font-medium">Check Messages</span>
          </Link>
          <Link
            href="/users"
            className="flex items-center justify-center gap-2 p-4 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <span>👥</span>
            <span className="font-medium">Manage Users</span>
          </Link>
        </div>
      </div>
    </div>
  );
}