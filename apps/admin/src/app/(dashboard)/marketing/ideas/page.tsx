'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getContentIdeas, type ContentIdea } from '@/lib/api/marketing';

// Types imported from API

const STATUS_COLORS: Record<string, string> = {
  captured: 'bg-gray-100 text-gray-800 border-gray-200',
  evaluated: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  in_production: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-purple-100 text-purple-800 border-purple-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const EFFORT_COLORS: Record<string, string> = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600',
};

const IMPACT_COLORS: Record<string, string> = {
  low: 'text-gray-600',
  medium: 'text-blue-600',
  high: 'text-purple-600',
};

export default function ContentIdeasPage() {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEffort, setFilterEffort] = useState<string>('all');
  const [filterImpact, setFilterImpact] = useState<string>('all');

  useEffect(() => {
    fetchIdeas();
  }, []);

  async function fetchIdeas() {
    try {
      setLoading(true);
      const data = await getContentIdeas();
      setIdeas(data || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredIdeas = ideas.filter((idea) => {
    if (filterStatus !== 'all' && idea.status !== filterStatus) return false;
    if (filterEffort !== 'all' && idea.estimated_effort !== filterEffort) return false;
    if (filterImpact !== 'all' && idea.estimated_impact !== filterImpact) return false;
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
          <h1 className="text-3xl font-bold text-gray-900">Content Ideas</h1>
          <p className="mt-2 text-gray-600">
            Quick capture of content ideas before full pillar development
          </p>
        </div>
        <Link
          href="/marketing/ideas/new"
          className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          + Capture Idea
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="captured">Captured</option>
              <option value="evaluated">Evaluated</option>
              <option value="approved">Approved</option>
              <option value="in_production">In Production</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Effort</label>
            <select
              value={filterEffort}
              onChange={(e) => setFilterEffort(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="all">All Effort</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
            <select
              value={filterImpact}
              onChange={(e) => setFilterImpact(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="all">All Impact</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-800 mb-1">Captured</div>
          <div className="text-2xl font-bold text-gray-900">
            {ideas.filter((i) => i.status === 'captured').length}
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-800 mb-1">Evaluated</div>
          <div className="text-2xl font-bold text-yellow-900">
            {ideas.filter((i) => i.status === 'evaluated').length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-900">
            {ideas.filter((i) => i.status === 'approved').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">In Production</div>
          <div className="text-2xl font-bold text-blue-900">
            {ideas.filter((i) => i.status === 'in_production').length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-800 mb-1">Completed</div>
          <div className="text-2xl font-bold text-purple-900">
            {ideas.filter((i) => i.status === 'completed').length}
          </div>
        </div>
      </div>

      {/* Ideas List */}
      {filteredIdeas.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
          <p className="text-gray-600 mb-4">
            {filterStatus !== 'all' || filterEffort !== 'all' || filterImpact !== 'all'
              ? 'Try adjusting your filters'
              : 'Start capturing content ideas to build your content pipeline'}
          </p>
          {filterStatus === 'all' && filterEffort === 'all' && filterImpact === 'all' && (
            <Link
              href="/marketing/ideas/new"
              className="inline-block px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              + Capture Idea
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIdeas.map((idea) => (
            <Link
              key={idea.id}
              href={`/marketing/ideas/${idea.id}`}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-poultryco-green"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded border ${
                        STATUS_COLORS[idea.status]
                      }`}
                    >
                      {idea.status.replace('_', ' ')}
                    </span>
                    {idea.format && (
                      <span className="text-xs text-gray-500 capitalize">
                        {idea.format.replace('_', ' ')}
                      </span>
                    )}
                    {idea.idea_source && (
                      <span className="text-xs text-gray-500 capitalize">
                        • {idea.idea_source.replace('_', ' ')}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            i < (idea.priority_score ?? 0) ? 'bg-amber-400' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="font-semibold text-xl text-gray-900 mb-2">{idea.title}</h3>

                  {idea.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{idea.description}</p>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm">
                    {idea.estimated_effort && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Effort:</span>
                        <span
                          className={`font-medium capitalize ${
                            EFFORT_COLORS[idea.estimated_effort]
                          }`}
                        >
                          {idea.estimated_effort}
                        </span>
                      </div>
                    )}
                    {idea.estimated_impact && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Impact:</span>
                        <span
                          className={`font-medium capitalize ${
                            IMPACT_COLORS[idea.estimated_impact]
                          }`}
                        >
                          {idea.estimated_impact}
                        </span>
                      </div>
                    )}
                    {idea.content_topics && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Topic:</span>
                        <span className="text-gray-900">{idea.content_topics.title || idea.content_topics.name}</span>
                      </div>
                    )}
                    {idea.stakeholder_segments && (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Segment:</span>
                        <span className="text-gray-900">{idea.stakeholder_segments.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Pillar Link */}
                  {idea.content_pillars && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Linked to pillar: </span>
                      <span className="text-poultryco-green font-medium">
                        {idea.content_pillars.title}
                      </span>
                    </div>
                  )}

                  {/* Due Date */}
                  {idea.due_date && (
                    <div className="mt-2 text-xs text-gray-500">
                      Due: {new Date(idea.due_date).toLocaleDateString()}
                    </div>
                  )}
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

