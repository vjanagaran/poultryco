'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStakeholderSegments, type StakeholderSegment } from '@/lib/api/marketing';

// Types imported from API

export default function CustomerSegmentsPage() {
  const [segments, setSegments] = useState<StakeholderSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSegments();
  }, []);

  async function fetchSegments() {
    try {
      setLoading(true);
      const data = await getStakeholderSegments();
      setSegments(data || []);
    } catch (error) {
      console.error('Error fetching segments:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSegments = segments.filter((segment) => {
    const query = searchQuery.toLowerCase();
    return (
      segment.name.toLowerCase().includes(query) ||
      segment.description?.toLowerCase().includes(query)
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
          <h1 className="text-3xl font-bold text-gray-900">Stakeholder Segments</h1>
          <p className="mt-2 text-gray-600">
            Target audience segments for your marketing content
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">
            Total Segments
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {segments.length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 mb-1">
            Active Segments
          </div>
          <div className="text-2xl font-bold text-green-900">
            {segments.filter((s) => s.is_active).length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-800 mb-1">
            High Priority
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {segments.filter((s) => s.priority_level >= 8).length}
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm font-medium text-orange-800 mb-1">
            Total Audience
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {segments.reduce((sum, s) => sum + (s.segment_size_estimate || 0), 0).toLocaleString()}
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
              : 'Get started by adding your first stakeholder segment'}
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
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {segment.name}
                  </h3>
                  {segment.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {segment.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded border flex-shrink-0 ml-3 ${
                    segment.is_active
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  {segment.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-3">
                {segment.segment_size_estimate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estimated Size</span>
                    <span className="font-medium text-gray-900">
                      {segment.segment_size_estimate.toLocaleString()} people
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Priority Level</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-poultryco-green rounded-full h-2"
                        style={{ width: `${segment.priority_level * 10}%` }}
                      ></div>
                    </div>
                    <span className="font-medium text-gray-900">
                      {segment.priority_level}/10
                    </span>
                  </div>
                </div>

                {segment.key_characteristics && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Key Characteristics</div>
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {segment.key_characteristics}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                  <span>Created {new Date(segment.created_at).toLocaleDateString()}</span>
                  <span className="text-poultryco-green hover:underline">View Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
