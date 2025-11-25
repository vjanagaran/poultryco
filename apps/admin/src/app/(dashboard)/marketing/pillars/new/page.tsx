'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TagSelector } from '@/components/marketing/TagSelector';
import { CampaignSelector } from '@/components/marketing/CampaignSelector';

interface PillarType {
  id: string;
  name: string;
  description: string | null;
}

interface ContentTopic {
  id: string;
  title: string;
  ndp_category_id: string;
}

interface StakeholderSegment {
  id: string;
  name: string;
  description: string | null;
}

interface ContentType {
  id: string;
  name: string;
  description: string | null;
}

export default function NewPillarPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [pillarTypes, setPillarTypes] = useState<PillarType[]>([]);
  const [topics, setTopics] = useState<ContentTopic[]>([]);
  const [segments, setSegments] = useState<StakeholderSegment[]>([]);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [pillarTypeId, setPillarTypeId] = useState('');
  const [researchQuestion, setResearchQuestion] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [researchNotes, setResearchNotes] = useState('');
  const [keyInsights, setKeyInsights] = useState<string[]>([]);
  const [keyInsightInput, setKeyInsightInput] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [focusKeywords, setFocusKeywords] = useState<string[]>([]);
  const [focusKeywordInput, setFocusKeywordInput] = useState('');
  const [topicId, setTopicId] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [status, setStatus] = useState('ideation');
  const [priorityScore, setPriorityScore] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [plannedTypes, setPlannedTypes] = useState<{ typeId: string; estimated: number }[]>([]);

  useEffect(() => {
    fetchLookupData();
  }, []);

  async function fetchLookupData() {
    try {
      const [typesRes, topicsRes, segmentsRes, contentTypesRes] = await Promise.all([
        supabase.from('pillar_types').select('*').order('name'),
        supabase.from('content_topics').select('id, title, ndp_category_id').order('title'),
        supabase.from('stakeholder_segments').select('id, name, description').order('name'),
        supabase.from('content_types').select('*').order('name'),
      ]);

      if (typesRes.data) setPillarTypes(typesRes.data);
      if (topicsRes.data) setTopics(topicsRes.data);
      if (segmentsRes.data) setSegments(segmentsRes.data);
      if (contentTypesRes.data) setContentTypes(contentTypesRes.data);
    } catch (error) {
      console.error('Error fetching lookup data:', error);
    }
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slug) {
      setSlug(generateSlug(value));
    }
  }

  function addKeyInsight() {
    if (keyInsightInput.trim()) {
      setKeyInsights([...keyInsights, keyInsightInput.trim()]);
      setKeyInsightInput('');
    }
  }

  function removeKeyInsight(index: number) {
    setKeyInsights(keyInsights.filter((_, i) => i !== index));
  }

  function addFocusKeyword() {
    if (focusKeywordInput.trim()) {
      setFocusKeywords([...focusKeywords, focusKeywordInput.trim()]);
      setFocusKeywordInput('');
    }
  }

  function removeFocusKeyword(index: number) {
    setFocusKeywords(focusKeywords.filter((_, i) => i !== index));
  }

  function addPlannedType() {
    setPlannedTypes([...plannedTypes, { typeId: '', estimated: 1 }]);
  }

  function updatePlannedType(index: number, field: 'typeId' | 'estimated', value: string | number) {
    const updated = [...plannedTypes];
    updated[index] = { ...updated[index], [field]: value };
    setPlannedTypes(updated);
  }

  function removePlannedType(index: number) {
    setPlannedTypes(plannedTypes.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create the pillar
      const { data: pillar, error: pillarError } = await supabase
        .from('content_pillars')
        .insert({
          title,
          slug: slug || null,
          description: description || null,
          pillar_type_id: pillarTypeId || null,
          research_question: researchQuestion || null,
          hypothesis: hypothesis || null,
          research_notes: researchNotes || null,
          key_insights: keyInsights.length > 0 ? keyInsights : null,
          target_url: targetUrl || null,
          focus_keywords: focusKeywords.length > 0 ? focusKeywords : null,
          topic_id: topicId || null,
          segment_id: segmentId || null,
          status,
          priority_score: priorityScore,
        })
        .select()
        .single();

      if (pillarError) throw pillarError;

      // 2. Assign tags
      if (selectedTags.length > 0) {
        const tagAssignments = selectedTags.map((tagId) => ({
          pillar_id: pillar.id,
          tag_id: tagId,
        }));
        const { error: tagsError } = await supabase
          .from('pillar_tag_assignments')
          .insert(tagAssignments);
        if (tagsError) throw tagsError;
      }

      // 3. Assign campaign
      if (selectedCampaign) {
        const { error: campaignError } = await supabase
          .from('pillar_campaign_assignments')
          .insert({
            pillar_id: pillar.id,
            campaign_id: selectedCampaign,
          });
        if (campaignError) throw campaignError;
      }

      // 4. Create planned content types
      if (plannedTypes.length > 0) {
        const validPlannedTypes = plannedTypes.filter((pt) => pt.typeId);
        if (validPlannedTypes.length > 0) {
          const typeAssignments = validPlannedTypes.map((pt) => ({
            pillar_id: pillar.id,
            content_type_id: pt.typeId,
            estimated_pieces: pt.estimated,
          }));
          const { error: typesError } = await supabase
            .from('content_pillar_types')
            .insert(typeAssignments);
          if (typesError) throw typesError;
        }
      }

      router.push(`/marketing/pillars/${pillar.id}`);
    } catch (error) {
      console.error('Error creating pillar:', error);
      alert('Failed to create pillar. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Content Pillar</h1>
          <p className="mt-2 text-gray-600">
            Build a core research topic that will serve as foundation for multiple content pieces
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
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="e.g., The Science Behind Optimal Layer Nutrition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="auto-generated-from-title"
            />
            <p className="mt-1 text-xs text-gray-500">
              URL-friendly identifier (auto-generated if left blank)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="Brief overview of what this pillar covers..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pillar Type</label>
              <select
                value={pillarTypeId}
                onChange={(e) => setPillarTypeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              >
                <option value="">Select type...</option>
                {pillarTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              >
                <option value="ideation">Ideation</option>
                <option value="researching">Researching</option>
                <option value="validated">Validated</option>
                <option value="in_production">In Production</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Research Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Research & Insights</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Research Question
            </label>
            <textarea
              value={researchQuestion}
              onChange={(e) => setResearchQuestion(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="What are we investigating?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hypothesis</label>
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="What do we expect to find?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Research Notes</label>
            <textarea
              value={researchNotes}
              onChange={(e) => setResearchNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="Internal research findings, sources, data..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Insights</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keyInsightInput}
                onChange={(e) => setKeyInsightInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyInsight())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                placeholder="Add a key insight..."
              />
              <button
                type="button"
                onClick={addKeyInsight}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {keyInsights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keyInsights.map((insight, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                  >
                    {insight}
                    <button
                      type="button"
                      onClick={() => removeKeyInsight(idx)}
                      className="text-purple-500 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SEO Strategy */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">SEO Strategy</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="/stakeholders/farmers or /about"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional backlink to landing page - all content from this pillar will link here
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Focus Keywords</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={focusKeywordInput}
                onChange={(e) => setFocusKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFocusKeyword())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                placeholder="Add a focus keyword..."
              />
              <button
                type="button"
                onClick={addFocusKeyword}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {focusKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {focusKeywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeFocusKeyword(idx)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Primary SEO keywords inherited by all content pieces from this pillar
            </p>
          </div>
        </div>

        {/* Strategic Alignment */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Strategic Alignment</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Topic (NDP)
              </label>
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
                Primary Segment
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

        {/* Tags & Campaigns */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Tags & Campaigns</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <TagSelector selectedTagIds={selectedTags} onTagsChange={setSelectedTags} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
            <CampaignSelector
              value={selectedCampaign}
              onChange={setSelectedCampaign}
            />
          </div>
        </div>

        {/* Planned Content Types */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Planned Content Types</h2>
            <button
              type="button"
              onClick={addPlannedType}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              + Add Type
            </button>
          </div>

          {plannedTypes.length === 0 ? (
            <p className="text-sm text-gray-500">
              No content types planned yet. Click "Add Type" to specify what content you plan to
              create from this pillar.
            </p>
          ) : (
            <div className="space-y-3">
              {plannedTypes.map((pt, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <select
                    value={pt.typeId}
                    onChange={(e) => updatePlannedType(idx, 'typeId', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  >
                    <option value="">Select content type...</option>
                    {contentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={pt.estimated}
                    onChange={(e) => updatePlannedType(idx, 'estimated', parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    onClick={() => removePlannedType(idx)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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
            {loading ? 'Creating...' : 'Create Pillar'}
          </button>
        </div>
      </form>
    </div>
  );
}

