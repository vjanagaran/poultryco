'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getFeedbackSubmission,
  updateFeedbackStatus,
  addFeedbackComment,
  addFeedbackTag,
  analyzeFeedbackSentiment,
  type FeedbackSubmission,
} from '@/lib/api/feedback';

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [analyzingSentiment, setAnalyzingSentiment] = useState(false);

  const feedbackId = params.id as string;

  useEffect(() => {
    if (feedbackId) {
      loadFeedback();
    }
  }, [feedbackId]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const data = await getFeedbackSubmission(feedbackId);
      if (data) {
        setFeedback(data);
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: FeedbackSubmission['status']) => {
    if (!feedback) return;
    
    const resolutionNotes = newStatus === 'resolved' || newStatus === 'declined'
      ? prompt('Resolution notes (optional):')
      : undefined;
    
    try {
      await updateFeedbackStatus(feedback.id, newStatus, resolutionNotes || undefined);
      await loadFeedback();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAddComment = async () => {
    if (!feedback || !newComment.trim()) return;
    
    setAddingComment(true);
    try {
      await addFeedbackComment(feedback.id, newComment, true);
      setNewComment('');
      await loadFeedback();
    } catch (err) {
      alert('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  const handleAddTag = async () => {
    if (!feedback || !newTag.trim()) return;
    
    try {
      await addFeedbackTag(feedback.id, newTag);
      setNewTag('');
      await loadFeedback();
    } catch (err) {
      alert('Failed to add tag');
    }
  };

  const handleAnalyzeSentiment = async () => {
    if (!feedback) return;
    
    setAnalyzingSentiment(true);
    try {
      const result = await analyzeFeedbackSentiment(
        `${feedback.title} ${feedback.description}`
      );
      
      await updateFeedbackStatus(feedback.id, feedback.status);
      alert(`Sentiment: ${result.label} (${(result.score * 100).toFixed(0)}% confidence)`);
      await loadFeedback();
    } catch (err) {
      alert('Failed to analyze sentiment');
    } finally {
      setAnalyzingSentiment(false);
    }
  };

  const getStatusBadge = (status: string) => {
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.new}`}>
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
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[priority as keyof typeof styles] || styles.medium}`}>
        {priority}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading feedback...</div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Feedback not found</p>
        <Link href="/feedback" className="text-green-600 hover:text-green-700 mt-4 inline-block">
          ← Back to Feedback
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/feedback" className="text-green-600 hover:text-green-700 text-sm mb-4 inline-block">
          ← Back to Feedback
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{feedback.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              {getStatusBadge(feedback.status)}
              {getPriorityBadge(feedback.priority)}
              {feedback.category && (
                <span className="text-sm text-gray-600">
                  {feedback.category.icon} {feedback.category.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={feedback.status}
              onChange={(e) => handleStatusChange(e.target.value as FeedbackSubmission['status'])}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="new">New</option>
              <option value="in_review">In Review</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="declined">Declined</option>
              <option value="duplicate">Duplicate</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{feedback.description}</p>
          </div>

          {/* Resolution Notes */}
          {feedback.resolution_notes && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resolution Notes</h2>
              <p className="text-gray-700">{feedback.resolution_notes}</p>
              {feedback.resolved_at && (
                <p className="text-sm text-gray-600 mt-2">
                  Resolved on {new Date(feedback.resolved_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Comments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Internal Comments</h2>
            
            {/* Comment List */}
            <div className="space-y-4 mb-6">
              {feedback.comments && feedback.comments.length > 0 ? (
                feedback.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.author?.email || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comment.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No comments yet</p>
              )}
            </div>
            
            {/* Add Comment */}
            <div className="border-t border-gray-200 pt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add an internal comment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || addingComment}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingComment ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900">{feedback.user_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{feedback.user_email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(feedback.created_at).toLocaleString()}
                </dd>
              </div>
              {feedback.page_url && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Page</dt>
                  <dd className="text-sm text-gray-900 truncate">
                    <a href={feedback.page_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700">
                      {feedback.page_url}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h2>
            {feedback.sentiment_label ? (
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {feedback.sentiment_label === 'positive' && '😊'}
                  {feedback.sentiment_label === 'neutral' && '😐'}
                  {feedback.sentiment_label === 'negative' && '😞'}
                  {feedback.sentiment_label === 'mixed' && '🤔'}
                </div>
                <p className="text-lg font-medium capitalize">{feedback.sentiment_label}</p>
                {feedback.sentiment_score !== null && feedback.sentiment_score !== undefined && (
                  <p className="text-sm text-gray-600 mt-1">
                    Score: {(feedback.sentiment_score * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-3">Not analyzed yet</p>
                <button
                  onClick={handleAnalyzeSentiment}
                  disabled={analyzingSentiment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {analyzingSentiment ? 'Analyzing...' : 'Analyze Sentiment'}
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {feedback.tags && feedback.tags.length > 0 ? (
                feedback.tags.map((tagRel: any) => (
                  <span
                    key={tagRel.tag.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                  >
                    {tagRel.tag.name}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No tags yet</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleAddTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
