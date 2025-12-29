'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getContent, type Content } from '@/lib/api/marketing';

// Types imported from API

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  in_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  published: 'bg-blue-100 text-blue-800 border-blue-200',
  archived: 'bg-gray-100 text-gray-600 border-gray-200',
};

const MODE_COLORS: Record<string, string> = {
  master: 'bg-purple-100 text-purple-800',
  repurposed: 'bg-indigo-100 text-indigo-800',
};

export default function ContentListPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [tags, setTags] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [contentTags, setContentTags] = useState<Record<string, string[]>>({});
  const [contentCampaigns, setContentCampaigns] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchContent();
    fetchFilters();
  }, []);

  async function fetchContent() {
    try {
      setLoading(true);
      const status = filterStatus !== 'all' ? filterStatus : undefined;
      const data = await getContent({ status });
      
      // Sort by created_at descending
      const sortedData = (data || []).sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      
      setContent(sortedData);

      // Extract tag and campaign assignments from content data
      if (sortedData && sortedData.length > 0) {
        const tagMap: Record<string, string[]> = {};
        const campaignMap: Record<string, string> = {};

        sortedData.forEach((content) => {
          // If API returns tagIds array, use it
          if (content.tagIds && Array.isArray(content.tagIds)) {
            tagMap[content.id] = content.tagIds;
          }
          // If API returns campaignId, use it
          if (content.campaignId) {
            campaignMap[content.id] = content.campaignId;
          }
        });

        setContentTags(tagMap);
        setContentCampaigns(campaignMap);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFilters() {
    try {
      // TODO: Fetch tags and campaigns when API supports it
      setTags([]);
      setCampaigns([]);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  }

  const filteredContent = content.filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterMode !== 'all' && item.content_mode !== filterMode) return false;
    if (filterTag !== 'all') {
      const tags = contentTags[item.id] || [];
      if (!tags.includes(filterTag)) return false;
    }
    if (filterCampaign !== 'all') {
      const campaign = contentCampaigns[item.id];
      if (campaign !== filterCampaign) return false;
    }
    return true;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
          <p className="mt-2 text-gray-600">
            Manage all your content pieces - master content and repurposed variations
          </p>
        </div>
        <Link
          href="/marketing/content/new"
          className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          + Create Content
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Mode</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="all">All Modes</option>
              <option value="master">Master Content</option>
              <option value="repurposed">Repurposed Content</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="all">All Tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-800 mb-1">Master Content</div>
          <div className="text-2xl font-bold text-purple-900">
            {content.filter((c) => c.content_mode === 'master').length}
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="text-sm font-medium text-indigo-800 mb-1">Repurposed</div>
          <div className="text-2xl font-bold text-indigo-900">
            {content.filter((c) => c.content_mode === 'repurposed').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">Published</div>
          <div className="text-2xl font-bold text-blue-900">
            {content.filter((c) => c.status === 'published').length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 mb-1">Total Views</div>
          <div className="text-2xl font-bold text-green-900">
            {content.reduce((sum, c) => sum + (c.total_views ?? 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Content List */}
      {filteredContent.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-600 mb-4">
            {filterStatus !== 'all' || filterMode !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first content piece to get started'}
          </p>
          {filterStatus === 'all' && filterMode === 'all' && (
            <Link
              href="/marketing/content/new"
              className="inline-block px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              + Create Content
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4">
                    <Link
                      href={`/marketing/content/${item.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-poultryco-green"
                    >
                      {item.title}
                    </Link>
                    {item.content_pillars && (
                      <div className="text-xs text-gray-500 mt-1">
                        From: {item.content_pillars.title}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {item.content_types?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        MODE_COLORS[item.content_mode]
                      }`}
                    >
                      {item.content_mode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded border ${
                        STATUS_COLORS[item.status]
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(item.total_views ?? 0).toLocaleString()} views
                    </div>
                    <div className="text-xs text-gray-500">
                      {((item.total_likes ?? 0) + (item.total_comments ?? 0) + (item.total_shares ?? 0)).toLocaleString()}{' '}
                      engagement
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.published_at
                      ? new Date(item.published_at).toLocaleDateString()
                      : 'Not published'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

