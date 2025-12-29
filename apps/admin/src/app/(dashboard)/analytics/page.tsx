'use client';

import { useState, useEffect } from 'react';
import { MetricCard } from '@/components/analytics/MetricCard';
import { ProfileSegmentChart } from '@/components/analytics/ProfileSegmentChart';
import { UserGrowthChart } from '@/components/analytics/UserGrowthChart';
import { UserSegmentModal } from '@/components/analytics/UserSegmentModal';
import {
  getUserMetrics,
  getProfileCompletionSegments,
  getLocationDistribution,
  getDailyUserGrowth,
  getEntityMetrics,
  getRecentSignups,
  exportAnalyticsData,
  type UserMetrics,
  type ProfileCompletionSegment,
  type LocationDistribution,
  type DailyUserGrowth,
  type EntityMetrics,
  type RecentUser,
} from '@/lib/api/analytics';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [profileSegments, setProfileSegments] = useState<ProfileCompletionSegment[]>([]);
  const [locationData, setLocationData] = useState<LocationDistribution[]>([]);
  const [growthData, setGrowthData] = useState<DailyUserGrowth[]>([]);
  const [entityMetrics, setEntityMetrics] = useState<EntityMetrics | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<ProfileCompletionSegment | null>(null);
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [metrics, segments, locations, growth, entities, recent] = await Promise.all([
        getUserMetrics(),
        getProfileCompletionSegments(),
        getLocationDistribution(),
        getDailyUserGrowth(),
        getEntityMetrics(),
        getRecentSignups(5),
      ]);

      setUserMetrics(metrics);
      setProfileSegments(segments);
      setLocationData(locations);
      setGrowthData(growth);
      setEntityMetrics(entities);
      setRecentUsers(recent);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (type: 'users' | 'businesses' | 'organizations') => {
    setExportingData(true);
    try {
      const csvData = await exportAnalyticsData(type);
      if (csvData) {
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExportingData(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track user growth, engagement, and platform metrics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadAnalytics()}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            🔄 Refresh
          </button>
          <div className="relative group">
            <button
              disabled={exportingData}
              className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {exportingData ? 'Exporting...' : '📥 Export Data'}
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <button
                onClick={() => handleExportData('users')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export Users
              </button>
              <button
                onClick={() => handleExportData('businesses')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export Businesses
              </button>
              <button
                onClick={() => handleExportData('organizations')}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Export Organizations
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Metrics Grid */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={userMetrics?.totalUsers || 0}
            icon="👥"
            loading={loading}
          />
          <MetricCard
            title="New Today"
            value={userMetrics?.newUsersToday || 0}
            change={{
              value: userMetrics?.newUsersToday || 0,
              label: "vs yesterday"
            }}
            trend="up"
            icon="📈"
            loading={loading}
          />
          <MetricCard
            title="Active This Week"
            value={userMetrics?.activeUsersThisWeek || 0}
            change={{
              value: userMetrics?.activeUsersThisWeek && userMetrics?.totalUsers 
                ? Math.round((userMetrics.activeUsersThisWeek / userMetrics.totalUsers) * 100)
                : 0,
              label: "of total"
            }}
            trend="up"
            icon="⚡"
            loading={loading}
          />
          <MetricCard
            title="Verified Users"
            value={userMetrics?.verifiedUsers || 0}
            change={{
              value: userMetrics?.verifiedUsers && userMetrics?.totalUsers
                ? Math.round((userMetrics.verifiedUsers / userMetrics.totalUsers) * 100)
                : 0,
              label: "of total"
            }}
            trend="neutral"
            icon="✓"
            loading={loading}
          />
        </div>
      </div>

      {/* Growth and Segmentation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={growthData} />
        <ProfileSegmentChart 
          segments={profileSegments} 
          onSegmentClick={setSelectedSegment}
        />
      </div>

      {/* Entity Metrics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Business & Organization Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Total Businesses"
            value={entityMetrics?.totalBusinesses || 0}
            change={{
              value: entityMetrics?.businessCompletionRate || 0,
              label: "completed"
            }}
            trend="neutral"
            icon="🏢"
            loading={loading}
          />
          <MetricCard
            title="Total Organizations"
            value={entityMetrics?.totalOrganizations || 0}
            change={{
              value: entityMetrics?.organizationsWithMembers || 0,
              label: "with members"
            }}
            trend="up"
            icon="🏛️"
            loading={loading}
          />
          <MetricCard
            title="Avg Members/Org"
            value={entityMetrics?.avgMembersPerOrg || 0}
            icon="👥"
            loading={loading}
          />
        </div>
      </div>

      {/* Location Distribution */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Geographic Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {locationData.slice(0, 8).map((location) => (
            <div key={location.state} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900">{location.state}</h3>
              <p className="text-2xl font-bold text-green-600">{location.count}</p>
              <p className="text-sm text-gray-600">{location.percentage.toFixed(1)}%</p>
            </div>
          ))}
        </div>
        {locationData.length > 8 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            And {locationData.length - 8} more states...
          </p>
        )}
      </div>

      {/* Recent Signups */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Signups</h2>
        <div className="space-y-4">
          {recentUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{user.full_name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.location_city || user.location_district || user.location_state}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Segment Modal */}
      <UserSegmentModal
        segment={selectedSegment}
        onClose={() => setSelectedSegment(null)}
      />
    </div>
  );
}
