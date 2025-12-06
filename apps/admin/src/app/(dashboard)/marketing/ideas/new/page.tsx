'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createContentIdea, getContentTopics, getContentPillars, getStakeholderSegments, type ContentTopic, type ContentPillar, type StakeholderSegment } from '@/lib/api/marketing';

export default function NewIdeaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ideaSource, setIdeaSource] = useState('');
  const [format, setFormat] = useState('');
  const [topicId, setTopicId] = useState('');
  const [pillarId, setPillarId] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState('');
  const [estimatedImpact, setEstimatedImpact] = useState('');
  const [priorityScore, setPriorityScore] = useState(5);
  const [status, setStatus] = useState('captured');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchLookupData();
  }, []);

  async function fetchLookupData() {
    try {
      const [topicsRes, pillarsRes, segmentsRes] = await Promise.all([
        supabase.from('content_topics').select('id, title').order('title'),
        supabase.from('content_pillars').select('id, title').order('title'),
        supabase.from('stakeholder_segments').select('id, name').order('name'),
      ]);

      if (topicsRes.data) setTopics(topicsRes.data);
      if (pillarsRes.data) setPillars(pillarsRes.data);
      if (segmentsRes.data) setSegments(segmentsRes.data);
    } catch (error) {
      console.error('Error fetching lookup data:', error);
    }
  }

  function addTag() {
    if (tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  }

  function removeTag(index: number) {
    setTags(tags.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('content_ideas')
        .insert({
          title,
          description: description || null,
          idea_source: ideaSource || null,
          format: format || null,
          topic_id: topicId || null,
          pillar_id: pillarId || null,
          segment_id: segmentId || null,
          estimated_effort: estimatedEffort || null,
          estimated_impact: estimatedImpact || null,
          priority_score: priorityScore,
          status,
          due_date: dueDate || null,
          notes: notes || null,
          tags: tags.length > 0 ? tags : null,
        })
        .select()
        .single();

      if (error) throw error;
      router.push(`/marketing/ideas/${data.id}`);
    } catch (error) {
      console.error('Error creating idea:', error);
      alert('Failed to create idea. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Capture Content Idea</h1>
          <p className="mt-2 text-gray-600">
            Quick capture of content ideas before full pillar development
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="e.g., Create infographic on layer feed efficiency"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="What is this idea about?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idea Source</label>
              <select
                value={ideaSource}
                onChange={(e) => setIdeaSource(e.target.value)}
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
                value={format}
                onChange={(e) => setFormat(e.target.value)}
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
        </div>

        {/* Strategic Fit */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Strategic Fit</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic (NDP)</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              >
                <option value="">Select topic...</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Segment
              </label>
              <select
                value={segmentId}
                onChange={(e) => setSegmentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              >
                <option value="">Select segment...</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link to Existing Pillar (Optional)
            </label>
            <select
              value={pillarId}
              onChange={(e) => setPillarId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="">No pillar (standalone idea)</option>
              {pillars.map((pillar) => (
                <option key={pillar.id} value={pillar.id}>
                  {pillar.title}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              If this idea belongs to an existing content pillar
            </p>
          </div>
        </div>

        {/* Evaluation */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Evaluation</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Effort
              </label>
              <select
                value={estimatedEffort}
                onChange={(e) => setEstimatedEffort(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              >
                <option value="">Not evaluated yet</option>
                <option value="low">Low (Quick win)</option>
                <option value="medium">Medium (Moderate work)</option>
                <option value="high">High (Significant effort)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Impact
              </label>
              <select
                value={estimatedImpact}
                onChange={(e) => setEstimatedImpact(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              >
                <option value="">Not evaluated yet</option>
                <option value="low">Low (Minor impact)</option>
                <option value="medium">Medium (Good impact)</option>
                <option value="high">High (Major impact)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Score: {priorityScore}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={priorityScore}
              onChange={(e) => setPriorityScore(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (10)</span>
            </div>
          </div>
        </div>

        {/* Lifecycle */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Lifecycle & Assignment</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="Additional notes, context, or requirements..."
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
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
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
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !title}
            className="px-6 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Capture Idea'}
          </button>
        </div>
      </form>
    </div>
  );
}

