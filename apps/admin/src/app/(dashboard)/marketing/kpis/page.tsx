'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

interface SocialMediaKPI {
  id: string;
  metric_date: string;
  posts_published: number;
  metrics: any;
  channel: {
    name: string;
    platform: string;
  };
}

interface PlatformKPI {
  metric_date: string;
  total_users: number;
  new_signups: number;
  daily_active_users: number;
  email_subscribers: number;
}

export default function KPIDashboardPage() {
  const [socialKPIs, setSocialKPIs] = useState<SocialMediaKPI[]>([]);
  const [platformKPIs, setPlatformKPIs] = useState<PlatformKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // week, month, all

  const supabase = createClient();

  useEffect(() => {
    fetchKPIs();
  }, [dateRange]);

  async function fetchKPIs() {
    try {
      const today = new Date();
      let startDate;

      if (dateRange === 'week') {
        startDate = startOfWeek(today, { weekStartsOn: 1 });
      } else if (dateRange === 'month') {
        startDate = subDays(today, 30);
      } else {
        startDate = subDays(today, 90); // last 3 months
      }

      // Fetch social media KPIs
      const { data: social, error: socialError } = await supabase
        .from('social_media_kpis')
        .select(`
          *,
          channel:marketing_channels(name, platform)
        `)
        .gte('metric_date', format(startDate, 'yyyy-MM-dd'))
        .order('metric_date', { ascending: false });

      if (socialError) throw socialError;
      setSocialKPIs(social as any || []);

      // Fetch platform KPIs
      const { data: platform, error: platformError } = await supabase
        .from('platform_kpis')
        .select('*')
        .gte('metric_date', format(startDate, 'yyyy-MM-dd'))
        .order('metric_date', { ascending: false });

      if (platformError) throw platformError;
      setPlatformKPIs(platform || []);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate totals
  const totalSocialPosts = socialKPIs.reduce((sum, kpi) => sum + kpi.posts_published, 0);
  const totalNewUsers = platformKPIs.reduce((sum, kpi) => sum + (kpi.new_signups || 0), 0);
  const latestPlatformKPI = platformKPIs[0];

  // Group by platform
  const kpisByPlatform = socialKPIs.reduce((acc, kpi) => {
    const platform = kpi.channel.platform;
    if (!acc[platform]) {
      acc[platform] = [];
    }
    acc[platform].push(kpi);
    return acc;
  }, {} as Record<string, SocialMediaKPI[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poultryco-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing KPIs</h1>
          <p className="mt-2 text-gray-600">
            Track and analyze marketing performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/marketing/kpis/entry"
            className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            + Log KPIs
          </Link>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          <div className="flex gap-2">
            {['week', 'month', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-poultryco-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'week' ? 'This Week' : range === 'month' ? 'Last 30 Days' : 'Last 3 Months'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Overview */}
      {latestPlatformKPI && (
        <div className="bg-gradient-to-r from-poultryco-green to-green-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">PoultryCo Platform Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold">{latestPlatformKPI.total_users || 0}</div>
              <div className="text-green-100">Total Users</div>
              {totalNewUsers > 0 && (
                <div className="text-sm text-green-200 mt-1">+{totalNewUsers} new</div>
              )}
            </div>
            <div>
              <div className="text-3xl font-bold">
                {latestPlatformKPI.daily_active_users || 0}
              </div>
              <div className="text-green-100">Daily Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {latestPlatformKPI.email_subscribers || 0}
              </div>
              <div className="text-green-100">Email Subscribers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{totalSocialPosts}</div>
              <div className="text-green-100">Social Posts Published</div>
            </div>
          </div>
        </div>
      )}

      {/* Social Media KPIs by Platform */}
      <div className="space-y-6">
        {Object.entries(kpisByPlatform).map(([platform, kpis]) => {
          const latestKPI = kpis[0];
          const metrics = latestKPI.metrics;

          return (
            <div key={platform} className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize flex items-center gap-2">
                <span>{platform}</span>
                <span className="text-sm font-normal text-gray-500">
                  ({kpis.length} data point{kpis.length !== 1 ? 's' : ''})
                </span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Followers/Subscribers */}
                {(metrics.followers !== undefined || metrics.subscribers !== undefined) && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800 mb-1">
                      {platform === 'youtube' ? 'Subscribers' : 'Followers'}
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {(metrics.followers || metrics.subscribers || 0).toLocaleString()}
                    </div>
                    {(metrics.followers_gained || metrics.subscribers_gained) && (
                      <div className="text-xs text-blue-700 mt-1">
                        +{metrics.followers_gained || metrics.subscribers_gained} gained
                      </div>
                    )}
                  </div>
                )}

                {/* Posts */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-800 mb-1">Posts Published</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {latestKPI.posts_published}
                  </div>
                </div>

                {/* Engagement */}
                {(metrics.engagements || metrics.post_engagements) && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-800 mb-1">Engagements</div>
                    <div className="text-2xl font-bold text-green-900">
                      {(metrics.engagements || metrics.post_engagements || 0).toLocaleString()}
                    </div>
                    {metrics.engagement_rate && (
                      <div className="text-xs text-green-700 mt-1">
                        {(metrics.engagement_rate * 100).toFixed(2)}% rate
                      </div>
                    )}
                  </div>
                )}

                {/* Reach/Impressions/Views */}
                {(metrics.reach || metrics.impressions || metrics.views || metrics.page_reach) && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <div className="text-sm text-amber-800 mb-1">
                      {platform === 'youtube' ? 'Views' : 'Reach'}
                    </div>
                    <div className="text-2xl font-bold text-amber-900">
                      {(
                        metrics.reach ||
                        metrics.impressions ||
                        metrics.views ||
                        metrics.page_reach ||
                        0
                      ).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Channel Breakdown */}
              {kpis.length > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Breakdown by channel:</div>
                  <div className="space-y-2">
                    {kpis.slice(0, 3).map((kpi) => (
                      <div
                        key={kpi.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-700">{kpi.channel.name}</span>
                        <span className="text-gray-500">
                          {format(new Date(kpi.metric_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {socialKPIs.length === 0 && platformKPIs.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No KPI data yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start tracking your marketing performance by logging daily KPIs
          </p>
          <Link
            href="/marketing/kpis/entry"
            className="inline-block px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            + Log KPIs
          </Link>
        </div>
      )}
    </div>
  );
}

