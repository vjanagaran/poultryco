'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface CustomerSegment {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  segment_type: string;
  pain_points: string[];
  goals: string[];
  preferred_channels: string[];
  language_preferences: string[];
  estimated_market_size: number | null;
  current_reach: number;
  priority_score: number;
  is_active: boolean;
  created_at: string;
}

const SEGMENT_TYPE_COLORS: Record<string, string> = {
  primary: 'bg-green-100 text-green-800 border-green-200',
  secondary: 'bg-blue-100 text-blue-800 border-blue-200',
  niche: 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function CustomerSegmentsPage() {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchSegments();
  }, []);

  async function fetchSegments() {
    try {
      const { data, error } = await supabase
        .from('stakeholder_segments')
        .select('*')
        .order('priority_score', { ascending: false });

      if (error) throw error;
      setSegments(data || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSegments = segments.filter((segment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      segment.name.toLowerCase().includes(query) ||
      segment.description?.toLowerCase().includes(query) ||
      segment.pain_points?.some((p) => p.toLowerCase().includes(query)) ||
      segment.goals?.some((g) => g.toLowerCase().includes(query))
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Customer Segments</h1>
          <p className="mt-2 text-gray-600">
            Target audience segments and personas
          </p>
        </div>
        <Link
          href="/marketing/segments/new"
          className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          + Add Segment
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Search segments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 mb-1">
            Primary Segments
          </div>
          <div className="text-2xl font-bold text-green-900">
            {segments.filter((s) => s.segment_type === 'primary').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">
            Secondary Segments
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {segments.filter((s) => s.segment_type === 'secondary').length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-800 mb-1">
            Niche Segments
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {segments.filter((s) => s.segment_type === 'niche').length}
          </div>
        </div>
      </div>

      {/* Segments Grid */}
      {filteredSegments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No segments found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Get started by adding your first customer segment'}
          </p>
          {!searchQuery && (
            <Link
              href="/marketing/segments/new"
              className="inline-block px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              + Add Segment
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSegments.map((segment) => (
            <Link
              key={segment.id}
              href={`/marketing/segments/${segment.id}`}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-poultryco-green"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded border ${
                        SEGMENT_TYPE_COLORS[segment.segment_type]
                      }`}
                    >
                      {segment.segment_type}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            i < segment.priority_score
                              ? 'bg-amber-400'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <h3 className="font-semibold text-xl text-gray-900">
                    {segment.name}
                  </h3>
                  {segment.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {segment.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Market Size</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {segment.estimated_market_size
                      ? segment.estimated_market_size.toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Current Reach</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {segment.current_reach.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Pain Points */}
              {segment.pain_points && segment.pain_points.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Top Pain Points:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {segment.pain_points.slice(0, 3).map((pain, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded"
                      >
                        {pain}
                      </span>
                    ))}
                    {segment.pain_points.length > 3 && (
                      <span className="px-2 py-1 text-xs text-gray-500">
                        +{segment.pain_points.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Channels */}
              {segment.preferred_channels && segment.preferred_channels.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Preferred Channels:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {segment.preferred_channels.map((channel, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

