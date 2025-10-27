'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getFeedbackSubmissions,
  getFeedbackStats,
  getFeedbackCategories,
  updateFeedbackStatus,
  type FeedbackSubmission,
  type FeedbackCategory,
} from '@/lib/api/feedback';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackSubmission[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    bySentiment: Record<string, number>;
    recentTrend: number;
  } | null>(null);
  const [categories, setCategories] = useState<FeedbackCategory[]>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category_id: '',
    sentiment_label: '',
    search: '',
  });
  
  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [feedbackData, statsData, categoriesData] = await Promise.all([
          getFeedbackSubmissions({
            ...filters,
            limit,
            offset: (page - 1) * limit,
          }),
          getFeedbackStats(),
          getFeedbackCategories(),
        ]);
        
        setFeedback(feedbackData.data);
        setTotalCount(feedbackData.count);
        setStats(statsData);
        setCategories(categoriesData);
      } catch (_err) {
        console.error('Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters, page]);


  const handleStatusChange = async (id: string, newStatus: FeedbackSubmission['status']) => {
    try {
      await updateFeedbackStatus(id, newStatus);
      // Reload data
      const [feedbackData, statsData, categoriesData] = await Promise.all([
        getFeedbackSubmissions({
          ...filters,
          limit,
          offset: (page - 1) * limit,
        }),
        getFeedbackStats(),
        getFeedbackCategories(),
      ]);
      
      setFeedback(feedbackData.data);
      setTotalCount(feedbackData.count);
      setStats(statsData);
      setCategories(categoriesData);
    } catch (_err) {
      alert('Failed to update status');
    }
  };

  const _getStatusBadge = (status: string) => {
    const styles = {
      new: 'bg-blue-100 text-blue-700',
      in_review: 'bg-yellow-100 text-yellow-700',
      acknowledged: 'bg-purple-100 text-purple-700',
      in_progress: 'bg-orange-100 text-orange-700',
      resolved: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
      duplicate: 'bg-gray-100 text-gray-700',
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.new}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    
    const icons = {
      low: '○',
      medium: '◐',
      high: '●',
      urgent: '⚠️',
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority as keyof typeof styles] || styles.medium}`}>
        <span>{icons[priority as keyof typeof icons]}</span>
        {priority}
      </span>
    );
  };

  const getSentimentIcon = (sentiment?: string) => {
    const icons = {
      positive: '😊',
      neutral: '😐',
      negative: '😞',
      mixed: '🤔',
    };
    return icons[sentiment as keyof typeof icons] || '💭';
  };

  if (loading && !feedback.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading feedback...</div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-600 mt-1">Monitor and respond to user feedback</p>
        </div>
        <Link
          href="/feedback/insights"
          className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
        >
          📊 View Insights
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Feedback</h3>
              <span className="text-2xl">💬</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className={`text-sm mt-2 ${stats.recentTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.recentTrend > 0 ? '↑' : '↓'} {Math.abs(stats.recentTrend).toFixed(1)}% vs last week
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Unresolved</h3>
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {(stats.byStatus.new || 0) + (stats.byStatus.in_review || 0) + (stats.byStatus.in_progress || 0)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Urgent/High</h3>
              <span className="text-2xl">🚨</span>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {(stats.byPriority.urgent || 0) + (stats.byPriority.high || 0)}
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Satisfaction</h3>
              <span className="text-2xl">😊</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {stats.bySentiment.positive && stats.total 
                ? `${((stats.bySentiment.positive / stats.total) * 100).toFixed(0)}%`
                : '-'}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => {
                setFilters({ ...filters, search: e.target.value });
                setPage(1);
              }}
              placeholder="Search feedback..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="in_review">In Review</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="declined">Declined</option>
              <option value="duplicate">Duplicate</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => {
                setFilters({ ...filters, priority: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category_id}
              onChange={(e) => {
                setFilters({ ...filters, category_id: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment</label>
            <select
              value={filters.sentiment_label}
              onChange={(e) => {
                setFilters({ ...filters, sentiment_label: e.target.value });
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Sentiment</option>
              <option value="positive">😊 Positive</option>
              <option value="neutral">😐 Neutral</option>
              <option value="negative">😞 Negative</option>
              <option value="mixed">🤔 Mixed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Feedback
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sentiment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {feedback.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl mb-2">🔍</span>
                    <p>No feedback found</p>
                  </div>
                </td>
              </tr>
            ) : (
              feedback.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="max-w-sm">
                      <Link
                        href={`/feedback/${item.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-green-600 line-clamp-1"
                      >
                        {item.title}
                      </Link>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                      {item.category && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {item.category.icon} {item.category.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">{item.user_name}</div>
                      <div className="text-gray-500">{item.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(item.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackSubmission['status'])}
                      className="text-xs border border-gray-200 rounded px-2 py-1"
                    >
                      <option value="new">New</option>
                      <option value="in_review">In Review</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="declined">Declined</option>
                      <option value="duplicate">Duplicate</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-2xl" title={item.sentiment_label || 'Not analyzed'}>
                      {getSentimentIcon(item.sentiment_label)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/feedback/${item.id}`}
                      className="text-green-600 hover:text-green-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 text-sm border rounded ${
                    page === pageNum
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
