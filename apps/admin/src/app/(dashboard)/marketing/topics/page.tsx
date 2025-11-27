'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface ContentTopic {
  id: string;
  title: string;
  description: string | null;
  ndp_category_id: string;
  target_outcome: string | null;
  key_message: string | null;
  is_active: boolean;
  created_at: string;
  ndp_categories?: {
    name: string;
    description: string | null;
  };
}

export default function NDPTopicsPage() {
  const [topics, setTopics] = useState<ContentTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [ndpCategories, setNdpCategories] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch NDP categories
      const { data: categoriesData } = await supabase
        .from('ndp_categories')
        .select('*')
        .order('name');

      if (categoriesData) setNdpCategories(categoriesData);

      // Fetch topics
      const { data, error } = await supabase
        .from('content_topics')
        .select('*, ndp_categories(name, description)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      searchQuery === '' ||
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.key_message?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === 'all' || topic.ndp_category_id === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const CATEGORY_COLORS: Record<string, string> = {
    Fear: 'bg-red-100 text-red-800 border-red-200',
    PainPoint: 'bg-orange-100 text-orange-800 border-orange-200',
    Problem: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Need: 'bg-blue-100 text-blue-800 border-blue-200',
    Desire: 'bg-green-100 text-green-800 border-green-200',
    Fantasy: 'bg-purple-100 text-purple-800 border-purple-200',
  };

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
          <h1 className="text-3xl font-bold text-gray-900">NDP Topics</h1>
          <p className="mt-2 text-gray-600">
            Content topics organized by Need-Desire-Pain framework
          </p>
        </div>
        <Link
          href="/marketing/topics/new"
          className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          + Add Topic
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NDP Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {ndpCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>
          Showing <strong>{filteredTopics.length}</strong> of{' '}
          <strong>{topics.length}</strong> topics
        </span>
        {(filterCategory !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setFilterCategory('all');
              setSearchQuery('');
            }}
            className="text-poultryco-green hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Topics Grid */}
      {filteredTopics.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No topics found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterCategory !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first NDP topic'}
          </p>
          {!searchQuery && filterCategory === 'all' && (
            <Link
              href="/marketing/topics/new"
              className="inline-block px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              + Add Topic
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/marketing/topics/${topic.id}`}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-poultryco-green"
            >
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  {topic.ndp_categories && (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded border ${
                        CATEGORY_COLORS[topic.ndp_categories.name] ||
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {topic.ndp_categories.name}
                    </span>
                  )}
                  {!topic.is_active && (
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded border border-gray-200">
                      Inactive
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg text-gray-900 leading-tight mb-2">
                  {topic.title}
                </h3>
                {topic.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {topic.description}
                  </p>
                )}
              </div>

              {/* Key Message */}
              {topic.key_message && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-xs font-medium text-blue-700 mb-1">
                    Key Message
                  </div>
                  <p className="text-sm text-blue-900 line-clamp-2">
                    {topic.key_message}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  {new Date(topic.created_at).toLocaleDateString()}
                </div>
                <div className="text-xs font-medium text-poultryco-green">
                  View Details →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
