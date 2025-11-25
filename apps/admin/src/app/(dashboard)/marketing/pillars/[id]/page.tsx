'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TagSelector } from '@/components/marketing/TagSelector';
import { CampaignSelector } from '@/components/marketing/CampaignSelector';

export default function PillarDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pillarId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pillar, setPillar] = useState<any>(null);
  const [pillarTypes, setPillarTypes] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [contentTypes, setContentTypes] = useState<any[]>([]);
  const [assignedTags, setAssignedTags] = useState<string[]>([]);
  const [assignedCampaign, setAssignedCampaign] = useState<string | null>(null);
  const [plannedTypes, setPlannedTypes] = useState<any[]>([]);
  const [content, setContent] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<any>({});
  const [keyInsightInput, setKeyInsightInput] = useState('');
  const [focusKeywordInput, setFocusKeywordInput] = useState('');

  useEffect(() => {
    fetchData();
  }, [pillarId]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch pillar
      const { data: pillarData, error: pillarError } = await supabase
        .from('content_pillars')
        .select('*')
        .eq('id', pillarId)
        .single();

      if (pillarError) throw pillarError;
      setPillar(pillarData);
      setFormData(pillarData);

      // Fetch lookup data
      const [typesRes, topicsRes, segmentsRes, contentTypesRes] = await Promise.all([
        supabase.from('pillar_types').select('*').order('name'),
        supabase.from('content_topics').select('id, title').order('title'),
        supabase.from('stakeholder_segments').select('id, name').order('name'),
        supabase.from('content_types').select('*').order('name'),
      ]);

      if (typesRes.data) setPillarTypes(typesRes.data);
      if (topicsRes.data) setTopics(topicsRes.data);
      if (segmentsRes.data) setSegments(segmentsRes.data);
      if (contentTypesRes.data) setContentTypes(contentTypesRes.data);

      // Fetch assigned tags
      const { data: tagsData } = await supabase
        .from('pillar_tag_assignments')
        .select('tag_id')
        .eq('pillar_id', pillarId);

      if (tagsData) {
        setAssignedTags(tagsData.map((t) => t.tag_id));
      }

      // Fetch assigned campaign
      const { data: campaignData } = await supabase
        .from('pillar_campaign_assignments')
        .select('campaign_id')
        .eq('pillar_id', pillarId)
        .maybeSingle();

      if (campaignData) {
        setAssignedCampaign(campaignData.campaign_id);
      }

      // Fetch planned types
      const { data: plannedData } = await supabase
        .from('content_pillar_types')
        .select('*, content_types(name)')
        .eq('pillar_id', pillarId);

      if (plannedData) setPlannedTypes(plannedData);

      // Fetch content
      const { data: contentData } = await supabase
        .from('content')
        .select('*, content_types(name)')
        .eq('pillar_id', pillarId)
        .order('created_at', { ascending: false });

      if (contentData) setContent(contentData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateFormField(field: string, value: any) {
    setFormData({ ...formData, [field]: value });
  }

  function addKeyInsight() {
    if (keyInsightInput.trim()) {
      const insights = formData.key_insights || [];
      updateFormField('key_insights', [...insights, keyInsightInput.trim()]);
      setKeyInsightInput('');
    }
  }

  function removeKeyInsight(index: number) {
    const insights = formData.key_insights || [];
    updateFormField(
      'key_insights',
      insights.filter((_: any, i: number) => i !== index)
    );
  }

  function addFocusKeyword() {
    if (focusKeywordInput.trim()) {
      const keywords = formData.focus_keywords || [];
      updateFormField('focus_keywords', [...keywords, focusKeywordInput.trim()]);
      setFocusKeywordInput('');
    }
  }

  function removeFocusKeyword(index: number) {
    const keywords = formData.focus_keywords || [];
    updateFormField(
      'focus_keywords',
      keywords.filter((_: any, i: number) => i !== index)
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Update pillar
      const { error: pillarError } = await supabase
        .from('content_pillars')
        .update({
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          pillar_type_id: formData.pillar_type_id,
          research_question: formData.research_question,
          hypothesis: formData.hypothesis,
          research_notes: formData.research_notes,
          key_insights: formData.key_insights,
          target_url: formData.target_url,
          focus_keywords: formData.focus_keywords,
          topic_id: formData.topic_id,
          segment_id: formData.segment_id,
          status: formData.status,
          priority_score: formData.priority_score,
        })
        .eq('id', pillarId);

      if (pillarError) throw pillarError;

      // Update tags
      await supabase.from('pillar_tag_assignments').delete().eq('pillar_id', pillarId);
      if (assignedTags.length > 0) {
        const tagAssignments = assignedTags.map((tagId) => ({
          pillar_id: pillarId,
          tag_id: tagId,
        }));
        await supabase.from('pillar_tag_assignments').insert(tagAssignments);
      }

      // Update campaign
      await supabase.from('pillar_campaign_assignments').delete().eq('pillar_id', pillarId);
      if (assignedCampaign) {
        await supabase.from('pillar_campaign_assignments').insert({
          pillar_id: pillarId,
          campaign_id: assignedCampaign,
        });
      }

      setEditing(false);
      fetchData();
    } catch (error) {
      console.error('Error saving pillar:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this pillar? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.from('content_pillars').delete().eq('id', pillarId);

      if (error) throw error;
      router.push('/marketing/pillars');
    } catch (error) {
      console.error('Error deleting pillar:', error);
      alert('Failed to delete pillar. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poultryco-green"></div>
      </div>
    );
  }

  if (!pillar) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pillar not found</h2>
        <Link href="/marketing/pillars" className="text-poultryco-green hover:underline">
          ← Back to Pillars
        </Link>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    ideation: 'bg-gray-100 text-gray-800 border-gray-200',
    researching: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    validated: 'bg-green-100 text-green-800 border-green-200',
    in_production: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-purple-100 text-purple-800 border-purple-200',
    archived: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            href="/marketing/pillars"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Back to Pillars
          </Link>
          {editing ? (
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              className="text-3xl font-bold text-gray-900 w-full border-b-2 border-poultryco-green focus:outline-none"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{pillar.title}</h1>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${
                STATUS_COLORS[pillar.status]
              }`}
            >
              {pillar.status.replace('_', ' ')}
            </span>
            <span className="text-sm text-gray-500">
              Created {new Date(pillar.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(pillar);
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
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

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
                      Pillar Type
                    </label>
                    <select
                      value={formData.pillar_type_id || ''}
                      onChange={(e) => updateFormField('pillar_type_id', e.target.value)}
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
                      value={formData.status}
                      onChange={(e) => updateFormField('status', e.target.value)}
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
              </>
            ) : (
              <>
                {pillar.description && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
                    <p className="text-gray-900">{pillar.description}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Research Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Research & Insights</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Research Question
                  </label>
                  <textarea
                    value={formData.research_question || ''}
                    onChange={(e) => updateFormField('research_question', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hypothesis</label>
                  <textarea
                    value={formData.hypothesis || ''}
                    onChange={(e) => updateFormField('hypothesis', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Research Notes
                  </label>
                  <textarea
                    value={formData.research_notes || ''}
                    onChange={(e) => updateFormField('research_notes', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Insights
                  </label>
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
                  {formData.key_insights && formData.key_insights.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.key_insights.map((insight: string, idx: number) => (
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
              </>
            ) : (
              <>
                {pillar.research_question && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Research Question</div>
                    <p className="text-gray-900">{pillar.research_question}</p>
                  </div>
                )}
                {pillar.hypothesis && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Hypothesis</div>
                    <p className="text-gray-900">{pillar.hypothesis}</p>
                  </div>
                )}
                {pillar.research_notes && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Research Notes</div>
                    <p className="text-gray-900 whitespace-pre-wrap">{pillar.research_notes}</p>
                  </div>
                )}
                {pillar.key_insights && pillar.key_insights.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Key Insights</div>
                    <div className="flex flex-wrap gap-2">
                      {pillar.key_insights.map((insight: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                        >
                          {insight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* SEO Strategy */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">SEO Strategy</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
                  <input
                    type="text"
                    value={formData.target_url || ''}
                    onChange={(e) => updateFormField('target_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    placeholder="/stakeholders/farmers or /about"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Optional backlink to landing page - all content from this pillar will link here
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Focus Keywords
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={focusKeywordInput}
                      onChange={(e) => setFocusKeywordInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === 'Enter' && (e.preventDefault(), addFocusKeyword())
                      }
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
                  {formData.focus_keywords && formData.focus_keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.focus_keywords.map((keyword: string, idx: number) => (
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
              </>
            ) : (
              <>
                {pillar.target_url && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Target URL</div>
                    <a
                      href={pillar.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-poultryco-green hover:underline"
                    >
                      {pillar.target_url}
                    </a>
                  </div>
                )}
                {pillar.focus_keywords && pillar.focus_keywords.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Focus Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {pillar.focus_keywords.map((keyword: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Content Pieces */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Content Pieces</h2>
              <Link
                href={`/marketing/content/new?pillar=${pillarId}`}
                className="px-3 py-1 text-sm bg-poultryco-green text-white rounded hover:bg-green-600"
              >
                + Create Content
              </Link>
            </div>

            {content.length === 0 ? (
              <p className="text-sm text-gray-500">No content created yet from this pillar.</p>
            ) : (
              <div className="space-y-2">
                {content.map((item) => (
                  <Link
                    key={item.id}
                    href={`/marketing/content/${item.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-poultryco-green hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">
                          {item.content_types?.name} • {item.content_mode}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          item.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Strategic Alignment */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Strategic Alignment</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Topic
                  </label>
                  <select
                    value={formData.topic_id || ''}
                    onChange={(e) => updateFormField('topic_id', e.target.value)}
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
                    value={formData.segment_id || ''}
                    onChange={(e) => updateFormField('segment_id', e.target.value)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority: {formData.priority_score}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.priority_score}
                    onChange={(e) => updateFormField('priority_score', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Priority Score</div>
                  <div className="flex items-center gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < pillar.priority_score ? 'bg-amber-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{pillar.priority_score}/10</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tags & Campaigns */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Tags & Campaigns</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <TagSelector selectedTagIds={assignedTags} onTagsChange={setAssignedTags} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
                  <CampaignSelector
                    value={assignedCampaign}
                    onChange={setAssignedCampaign}
                  />
                </div>
              </>
            ) : (
              <>
                {assignedTags.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {assignedTags.map((tagId) => (
                        <span
                          key={tagId}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          Tag {tagId.substring(0, 8)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {assignedCampaign && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Campaign</div>
                    <Link
                      href={`/marketing/campaigns/${assignedCampaign}`}
                      className="text-poultryco-green hover:underline text-sm"
                    >
                      View Campaign →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Planned Types */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Planned Content Types</h2>

            {plannedTypes.length === 0 ? (
              <p className="text-sm text-gray-500">No content types planned yet.</p>
            ) : (
              <div className="space-y-2">
                {plannedTypes.map((pt) => (
                  <div key={pt.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-900">{pt.content_types?.name}</span>
                    <span className="text-gray-600">
                      {pt.pieces_created}/{pt.estimated_pieces}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
            <div>
              <div className="text-sm text-gray-600">Total Reach</div>
              <div className="text-2xl font-bold text-gray-900">
                {pillar.total_reach?.toLocaleString() || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Engagement</div>
              <div className="text-2xl font-bold text-gray-900">
                {pillar.total_engagement?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

