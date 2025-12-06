'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMarketingChannels, type MarketingChannel } from '@/lib/api/marketing';

// Types imported from API

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: 'bg-blue-600 text-white',
  facebook: 'bg-blue-500 text-white',
  instagram: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white',
  twitter: 'bg-sky-500 text-white',
  youtube: 'bg-red-600 text-white',
  whatsapp: 'bg-green-500 text-white',
  website: 'bg-gray-700 text-white',
  email: 'bg-indigo-600 text-white',
};

const PLATFORM_ICONS: Record<string, string> = {
  linkedin: '💼',
  facebook: '👥',
  instagram: '📷',
  twitter: '🐦',
  youtube: '📹',
  whatsapp: '💬',
  website: '🌐',
  email: '📧',
};

export default function MarketingChannelsPage() {
  const [channels, setChannels] = useState<MarketingChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');

  useEffect(() => {
    fetchChannels();
  }, []);

  async function fetchChannels() {
    try {
      setLoading(true);
      const data = await getMarketingChannels();

      setChannels(data || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  }

  const groupedChannels = channels.reduce((acc, channel) => {
    if (!acc[channel.platform]) {
      acc[channel.platform] = [];
    }
    acc[channel.platform].push(channel);
    return acc;
  }, {} as Record<string, MarketingChannel[]>);

  const filteredChannels =
    filterPlatform === 'all'
      ? channels
      : channels.filter((c) => c.platform === filterPlatform);

  const platforms = Array.from(new Set(channels.map((c) => c.platform)));

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
          <h1 className="text-3xl font-bold text-gray-900">Marketing Channels</h1>
          <p className="mt-2 text-gray-600">
            Manage all your social media accounts and distribution channels
          </p>
        </div>
        <Link
          href="/marketing/channels/new"
          className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          + Add Channel
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
        >
          <option value="all">All Platforms</option>
          {platforms.map((platform) => (
            <option key={platform} value={platform}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">
            Total Channels
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {channels.length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 mb-1">
            Active Channels
          </div>
          <div className="text-2xl font-bold text-green-900">
            {channels.filter((c) => c.is_active).length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-800 mb-1">
            Total Followers
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {channels
              .reduce((sum, c) => sum + c.current_followers, 0)
              .toLocaleString()}
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-sm font-medium text-amber-800 mb-1">
            Weekly Posts Target
          </div>
          <div className="text-2xl font-bold text-amber-900">
            {channels.reduce((sum, c) => sum + c.target_posts_per_week, 0)}
          </div>
        </div>
      </div>

      {/* Channels by Platform */}
      {filterPlatform === 'all' ? (
        <div className="space-y-6">
          {Object.entries(groupedChannels).map(([platform, platformChannels]) => (
            <div key={platform} className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`${
                    PLATFORM_COLORS[platform] || 'bg-gray-500 text-white'
                  } w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}
                >
                  {PLATFORM_ICONS[platform] || '📱'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 capitalize">
                    {platform}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {platformChannels.length} channel
                    {platformChannels.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platformChannels.map((channel) => (
                  <Link
                    key={channel.id}
                    href={`/marketing/channels/${channel.id}`}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 hover:border-poultryco-green"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {channel.is_active ? (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          )}
                          <span className="text-xs text-gray-500 capitalize">
                            {channel.channel_type}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 leading-tight">
                          {channel.name}
                        </h3>
                        {channel.handle && (
                          <p className="text-sm text-gray-500 mt-1">
                            {channel.handle}
                          </p>
                        )}
                      </div>
                    </div>

                    {channel.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {channel.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Followers
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {channel.current_followers.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Posts/Week
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {channel.target_posts_per_week}
                        </div>
                      </div>
                    </div>

                    {channel.url && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                          <span>🔗</span>
                          <span className="truncate">{channel.url}</span>
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChannels.map((channel) => (
            <Link
              key={channel.id}
              href={`/marketing/channels/${channel.id}`}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 hover:border-poultryco-green"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {channel.is_active ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    )}
                    <span className="text-xs text-gray-500 capitalize">
                      {channel.channel_type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 leading-tight">
                    {channel.name}
                  </h3>
                  {channel.handle && (
                    <p className="text-sm text-gray-500 mt-1">{channel.handle}</p>
                  )}
                </div>
              </div>

              {channel.description && (
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {channel.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Followers</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {channel.current_followers.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Posts/Week</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {channel.target_posts_per_week}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {channels.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No channels found
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first marketing channel to start tracking your social media presence
          </p>
          <Link
            href="/marketing/channels/new"
            className="inline-block px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            + Add Channel
          </Link>
        </div>
      )}
    </div>
  );
}

