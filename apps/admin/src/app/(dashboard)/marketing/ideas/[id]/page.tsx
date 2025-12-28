'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';

export default function IdeaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ideaId = params.id as string;
  // Using API client

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [idea, setIdea] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<any>({});
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchData();
  }, [ideaId]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch idea via API
      const ideaData = await apiClient.get(`/admin/content-ideas/${ideaId}`);
      setIdea(ideaData);
      setFormData(ideaData);

      // Fetch lookup data
      const [topics, pillars, segments] = await Promise.all([
        apiClient.get('/admin/content-topics'),
        apiClient.get('/admin/content-pillars'),
        apiClient.get('/admin/stakeholder-segments'),
      ]);

      setTopics(topics || []);
      setPillars(pillars || []);
      setSegments(segments || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateFormField(field: string, value: any) {
    setFormData({ ...formData, [field]: value });
  }

  function addTag() {
    if (tagInput.trim()) {
      const tags = formData.tags || [];
      updateFormField('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  }

  function removeTag(index: number) {
    const tags = formData.tags || [];
    updateFormField(
      'tags',
      tags.filter((_: any, i: number) => i !== index)
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Update idea via API
      await apiClient.put(`/admin/content-ideas/${ideaId}`, {
        title: formData.title,
        description: formData.description,
        ideaSource: formData.idea_source,
        format: formData.format,
        topicId: formData.topic_id,
        pillarId: formData.pillar_id,
        segmentId: formData.segment_id,
        estimatedEffort: formData.estimated_effort,
        estimatedImpact: formData.estimated_impact,
        priorityScore: formData.priority_score,
        status: formData.status,
        rejectionReason: formData.rejection_reason,
        dueDate: formData.due_date,
        notes: formData.notes,
        tags: formData.tags,
      });

      setEditing(false);
      fetchData();
    } catch (error) {
      console.error('Error saving idea:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/content-ideas/${ideaId}`);
      router.push('/marketing/ideas');
    } catch (error) {
      console.error('Error deleting idea:', error);
      alert('Failed to delete idea. Please try again.');
    }
  }

  async function convertToPillar() {
    if (!confirm('Convert this idea to a content pillar? You will be redirected to create the pillar.')) {
      return;
    }

    // Redirect to pillar creation with pre-filled data
    const params = new URLSearchParams({
      from_idea: ideaId,
      title: idea.title,
      description: idea.description || '',
      topic_id: idea.topic_id || '',
      segment_id: idea.segment_id || '',
    });

    router.push(`/marketing/pillars/new?${params.toString()}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poultryco-green"></div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Idea not found</h2>
        <Link href="/marketing/ideas" className="text-poultryco-green hover:underline">
          ← Back to Ideas
        </Link>
      </div>
    );
  }

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            href="/marketing/ideas"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Back to Ideas
          </Link>
          {editing ? (
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              className="text-3xl font-bold text-gray-900 w-full border-b-2 border-poultryco-green focus:outline-none"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{idea.title}</h1>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${
                STATUS_COLORS[idea.status]
              }`}
            >
              {idea.status.replace('_', ' ')}
            </span>
            <div className="flex items-center gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < idea.priority_score ? 'bg-amber-400' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              Created {new Date(idea.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(idea);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={convertToPillar}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Convert to Pillar
              </button>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Idea Details</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => updateFormField('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Idea Source
                    </label>
                    <select
                      value={formData.idea_source || ''}
                      onChange={(e) => updateFormField('idea_source', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    >
                      <option value="">Select source...</option>
                      <option value="team_brainstorm">Team Brainstorm</option>
                      <option value="customer_feedback">Customer Feedback</option>
                      <option value="competitor_analysis">Competitor Analysis</option>
                      <option value="industry_news">Industry News</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                    <select
                      value={formData.format || ''}
                      onChange={(e) => updateFormField('format', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    >
                      <option value="">Select format...</option>
                      <option value="educational">Educational</option>
                      <option value="inspirational">Inspirational</option>
                      <option value="case_study">Case Study</option>
                      <option value="how_to">How-To</option>
                      <option value="listicle">Listicle</option>
                      <option value="interview">Interview</option>
                      <option value="news">News</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                {idea.description && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
                    <p className="text-gray-900">{idea.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {idea.idea_source && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Source</div>
                      <p className="text-gray-900 capitalize">
                        {idea.idea_source.replace('_', ' ')}
                      </p>
                    </div>
                  )}
                  {idea.format && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Format</div>
                      <p className="text-gray-900 capitalize">{idea.format.replace('_', ' ')}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Strategic Fit */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Strategic Fit</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <select
                    value={formData.topic_id || ''}
                    onChange={(e) => updateFormField('topic_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  >
                    <option value="">No topic</option>
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
                  <select
                    value={formData.segment_id || ''}
                    onChange={(e) => updateFormField('segment_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  >
                    <option value="">No segment</option>
                    {segments.map((segment) => (
                      <option key={segment.id} value={segment.id}>
                        {segment.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link to Pillar
                  </label>
                  <select
                    value={formData.pillar_id || ''}
                    onChange={(e) => updateFormField('pillar_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  >
                    <option value="">No pillar</option>
                    {pillars.map((pillar) => (
                      <option key={pillar.id} value={pillar.id}>
                        {pillar.title}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                {idea.content_topics && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Topic</div>
                    <p className="text-gray-900">{idea.content_topics.title}</p>
                  </div>
                )}
                {idea.stakeholder_segments && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Segment</div>
                    <p className="text-gray-900">{idea.stakeholder_segments.name}</p>
                  </div>
                )}
                {idea.content_pillars && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Linked Pillar</div>
                    <Link
                      href={`/marketing/pillars/${idea.pillar_id}`}
                      className="text-poultryco-green hover:underline"
                    >
                      {idea.content_pillars.title}
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Evaluation */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Evaluation</h2>

            {editing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Effort
                    </label>
                    <select
                      value={formData.estimated_effort || ''}
                      onChange={(e) => updateFormField('estimated_effort', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    >
                      <option value="">Not evaluated</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Impact
                    </label>
                    <select
                      value={formData.estimated_impact || ''}
                      onChange={(e) => updateFormField('estimated_impact', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    >
                      <option value="">Not evaluated</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Score: {formData.priority_score}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.priority_score}
                    onChange={(e) => updateFormField('priority_score', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low (1)</span>
                    <span>High (10)</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {idea.estimated_effort && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Effort</div>
                    <p className={`font-semibold capitalize ${EFFORT_COLORS[idea.estimated_effort]}`}>
                      {idea.estimated_effort}
                    </p>
                  </div>
                )}
                {idea.estimated_impact && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Impact</div>
                    <p className={`font-semibold capitalize ${IMPACT_COLORS[idea.estimated_impact]}`}>
                      {idea.estimated_impact}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes & Tags */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Notes & Tags</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateFormField('notes', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                      placeholder="Add a tag..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(idx)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {idea.notes && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Notes</div>
                    <p className="text-gray-900 whitespace-pre-wrap">{idea.notes}</p>
                  </div>
                )}
                {idea.tags && idea.tags.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {idea.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Assignment */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Status & Assignment</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateFormField('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  >
                    <option value="captured">Captured</option>
                    <option value="evaluated">Evaluated</option>
                    <option value="approved">Approved</option>
                    <option value="in_production">In Production</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {formData.status === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rejection Reason
                    </label>
                    <textarea
                      value={formData.rejection_reason || ''}
                      onChange={(e) => updateFormField('rejection_reason', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date || ''}
                    onChange={(e) => updateFormField('due_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <>
                {idea.due_date && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Due Date</div>
                    <p className="text-gray-900">
                      {new Date(idea.due_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {idea.rejection_reason && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Rejection Reason</div>
                    <p className="text-gray-900">{idea.rejection_reason}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Actions */}
          {!editing && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>

              {idea.status === 'captured' && (
                <button
                  onClick={async () => {
                    try {
                      await supabase
                        .from('content_ideas')
                        .update({ status: 'evaluated' })
                        .eq('id', ideaId);
                      fetchData();
                    } catch (error) {
                      console.error('Error:', error);
                    }
                  }}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Mark as Evaluated
                </button>
              )}

              {idea.status === 'evaluated' && (
                <button
                  onClick={async () => {
                    try {
                      await supabase
                        .from('content_ideas')
                        .update({ status: 'approved' })
                        .eq('id', ideaId);
                      fetchData();
                    } catch (error) {
                      console.error('Error:', error);
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Idea
                </button>
              )}

              {idea.status === 'approved' && (
                <button
                  onClick={async () => {
                    try {
                      await supabase
                        .from('content_ideas')
                        .update({ status: 'in_production' })
                        .eq('id', ideaId);
                      fetchData();
                    } catch (error) {
                      console.error('Error:', error);
                    }
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Production
                </button>
              )}

              {['captured', 'evaluated'].includes(idea.status) && (
                <button
                  onClick={async () => {
                    const reason = prompt('Why is this idea being rejected?');
                    if (reason) {
                      try {
                        await supabase
                          .from('content_ideas')
                          .update({ status: 'rejected', rejection_reason: reason })
                          .eq('id', ideaId);
                        fetchData();
                      } catch (error) {
                        console.error('Error:', error);
                      }
                    }
                  }}
                  className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Reject Idea
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

