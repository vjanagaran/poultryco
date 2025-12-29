'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getContentPillars, type ContentPillar } from '@/lib/api/marketing';

// Types imported from API

const STATUS_COLORS: Record<string, string> = {
  ideation: 'bg-gray-100 text-gray-800 border-gray-200',
  researching: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  validated: 'bg-green-100 text-green-800 border-green-200',
  in_production: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-purple-100 text-purple-800 border-purple-200',
  archived: 'bg-gray-100 text-gray-600 border-gray-200',
};

const TYPE_ICONS: Record<string, string> = {
  research: '🔬',
  case_study: '📊',
  industry_trend: '📈',
  company_story: '📖',
  product_feature: '⚙️',
};

export default function ContentPillarsPage() {
  const [pillars, setPillars] = useState<ContentPillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [tags, setTags] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [pillarTags, setPillarTags] = useState<Record<string, string[]>>({});
  const [pillarCampaigns, setPillarCampaigns] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPillars();
    fetchFilters();
  }, []);

  async function fetchPillars() {
    try {
      setLoading(true);
      const data = await getContentPillars();
      
      // Sort by priority_score descending
      const sortedData = (data || []).sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));
      setPillars(sortedData);

      // Extract tag and campaign assignments from pillar data
      if (sortedData && sortedData.length > 0) {
        const tagMap: Record<string, string[]> = {};
        const campaignMap: Record<string, string> = {};

        sortedData.forEach((pillar) => {
          // If API returns tagIds array, use it
          if (pillar.tagIds && Array.isArray(pillar.tagIds)) {
            tagMap[pillar.id] = pillar.tagIds;
          }
          // If API returns campaignId, use it
          if (pillar.campaignId) {
            campaignMap[pillar.id] = pillar.campaignId;
          }
        });

        setPillarTags(tagMap);
        setPillarCampaigns(campaignMap);
      }
    } catch (error) {
      console.error('Error fetching pillars:', error);
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

  const filteredPillars = pillars.filter((pillar) => {
    if (filterStatus !== 'all' && pillar.status !== filterStatus) return false;
    if (filterType !== 'all' && (pillar.pillar_type || pillar.pillar_type_id) !== filterType) return false;
    if (filterTag !== 'all') {
      const tags = pillarTags[pillar.id] || [];
      if (!tags.includes(filterTag)) return false;
    }
    if (filterCampaign !== 'all') {
      const campaign = pillarCampaigns[pillar.id];
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
          <h1 className="text-3xl font-bold text-gray-900">Content Pillars</h1>
          <p className="mt-2 text-gray-600">
            Core research topics that serve as foundation for multiple content pieces
          </p>
        </div>
        <Link
          href="/marketing/pillars/new"
          className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          + Create Pillar
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="ideation">Ideation</option>
              <option value="researching">Researching</option>
              <option value="validated">Validated</option>
              <option value="in_production">In Production</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="research">Research</option>
              <option value="case_study">Case Study</option>
              <option value="industry_trend">Industry Trend</option>
              <option value="company_story">Company Story</option>
              <option value="product_feature">Product Feature</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign
            </label>
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-800 mb-1">
            Researching
          </div>
          <div className="text-2xl font-bold text-yellow-900">
            {pillars.filter((p) => p.status === 'researching').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">
            In Production
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {pillars.filter((p) => p.status === 'in_production').length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-800 mb-1">
            Completed
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {pillars.filter((p) => p.status === 'completed').length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 mb-1">
            Total Content
          </div>
          <div className="text-2xl font-bold text-green-900">
            {pillars.reduce((sum, p) => sum + (p.content_pieces_created ?? 0), 0)}
          </div>
        </div>
      </div>

      {/* Pillars Grid */}
      {filteredPillars.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">🏛️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No content pillars found
          </h3>
          <p className="text-gray-600 mb-4">
            {filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first content pillar to start building systematic content'}
          </p>
          {filterStatus === 'all' && filterType === 'all' && (
            <Link
              href="/marketing/pillars/new"
              className="inline-block px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              + Create Pillar
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPillars.map((pillar) => (
            <Link
              key={pillar.id}
              href={`/marketing/pillars/${pillar.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-poultryco-green"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">
                      {TYPE_ICONS[pillar.pillar_type || ''] || '📄'}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded border ${
                            STATUS_COLORS[pillar.status]
                          }`}
                        >
                          {pillar.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {(pillar.pillar_type || '').replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i < (pillar.priority_score ?? 0)
                                  ? 'bg-amber-400'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <h3 className="font-semibold text-xl text-gray-900">
                        {pillar.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  {pillar.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {pillar.description}
                    </p>
                  )}

                  {/* Research Question */}
                  {pillar.research_question && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xs font-medium text-blue-800 mb-1">
                        Research Question:
                      </div>
                      <div className="text-sm text-blue-900">
                        {pillar.research_question}
                      </div>
                    </div>
                  )}

                  {/* Key Insights */}
                  {pillar.key_insights && pillar.key_insights.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        Key Insights:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {pillar.key_insights.slice(0, 3).map((insight, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded"
                          >
                            {insight}
                          </span>
                        ))}
                        {pillar.key_insights.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{pillar.key_insights.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">Content Created: </span>
                      <span className="font-semibold text-gray-900">
                        {pillar.content_pieces_created ?? 0}
                      </span>
                      {pillar.estimated_pieces && (
                        <span className="text-gray-500">
                          /{pillar.estimated_pieces}
                        </span>
                      )}
                    </div>
                    {pillar.estimated_pieces && (
                      <div className="flex-1 max-w-xs">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-poultryco-green h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                ((pillar.content_pieces_created ?? 0) /
                                  (pillar.estimated_pieces ?? 1)) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <svg
                  className="w-6 h-6 text-gray-400 flex-shrink-0 mt-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

