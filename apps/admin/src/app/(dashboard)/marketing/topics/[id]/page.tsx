'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function TopicDetailPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [topic, setTopic] = useState<any>(null);
  const [ndpCategories, setNdpCategories] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [assignedSegments, setAssignedSegments] = useState<string[]>([]);
  const [relatedContent, setRelatedContent] = useState<any[]>([]);
  const [relatedPillars, setRelatedPillars] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<any>({});
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, [topicId]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch topic
      const { data: topicData, error: topicError } = await supabase
        .from('content_topics')
        .select('*, ndp_categories(name, description)')
        .eq('id', topicId)
        .single();

      if (topicError) throw topicError;
      setTopic(topicData);
      setFormData(topicData);

      // Fetch assigned segments
      const { data: segmentMappings } = await supabase
        .from('content_topic_segments')
        .select('segment_id, stakeholder_segments(id, name)')
        .eq('topic_id', topicId);

      const assignedIds = segmentMappings?.map((m: any) => m.segment_id) || [];
      setAssignedSegments(assignedIds);
      setSelectedSegments(assignedIds);

      // Fetch lookup data
      const [categoriesRes, segmentsRes] = await Promise.all([
        supabase.from('ndp_categories').select('*').order('name'),
        supabase.from('stakeholder_segments').select('id, name, description').order('name'),
      ]);

      if (categoriesRes.data) setNdpCategories(categoriesRes.data);
      if (segmentsRes.data) setSegments(segmentsRes.data);

      // Fetch related content
      const { data: contentData } = await supabase
        .from('content')
        .select('id, title, status, content_types(name)')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (contentData) setRelatedContent(contentData);

      // Fetch related pillars
      const { data: pillarsData } = await supabase
        .from('content_pillars')
        .select('id, title, status')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (pillarsData) setRelatedPillars(pillarsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateFormField(field: string, value: any) {
    setFormData({ ...formData, [field]: value });
  }

  function toggleSegment(segmentId: string) {
    setSelectedSegments(prev =>
      prev.includes(segmentId)
        ? prev.filter(id => id !== segmentId)
        : [...prev, segmentId]
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Update topic
      const { error } = await supabase
        .from('content_topics')
        .update({
          title: formData.title,
          description: formData.description,
          ndp_category_id: formData.ndp_category_id,
          target_outcome: formData.target_outcome,
          key_message: formData.key_message,
        })
        .eq('id', topicId);

      if (error) throw error;

      // Update segment assignments
      // Delete existing mappings
      await supabase.from('content_topic_segments').delete().eq('topic_id', topicId);

      // Insert new mappings
      if (selectedSegments.length > 0) {
        const segmentMappings = selectedSegments.map(segmentId => ({
          topic_id: topicId,
          segment_id: segmentId,
        }));

        const { error: mappingError } = await supabase
          .from('content_topic_segments')
          .insert(segmentMappings);

        if (mappingError) throw mappingError;
      }

      setEditing(false);
      fetchData();
    } catch (error) {
      console.error('Error saving topic:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        'Are you sure you want to delete this topic? This will affect all related content and pillars.'
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from('content_topics').delete().eq('id', topicId);

      if (error) throw error;
      router.push('/marketing/topics');
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Failed to delete topic. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poultryco-green"></div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Topic not found</h2>
        <Link href="/marketing/topics" className="text-poultryco-green hover:underline">
          ← Back to Topics
        </Link>
      </div>
    );
  }

  const assignedSegmentDetails = segments.filter(s => assignedSegments.includes(s.id));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            href="/marketing/topics"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Back to Topics
          </Link>
          {editing ? (
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              className="text-3xl font-bold text-gray-900 w-full border-b-2 border-poultryco-green focus:outline-none"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{topic.title}</h1>
          )}
          <div className="flex items-center gap-2 mt-2">
            {topic.ndp_categories && (
              <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 rounded-full">
                {topic.ndp_categories.name}
              </span>
            )}
            <span className="text-sm text-gray-500">
              Created {new Date(topic.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(topic);
                  setSelectedSegments(assignedSegments);
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
          {/* Topic Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Topic Details</h2>

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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NDP Category
                  </label>
                  <select
                    value={formData.ndp_category_id}
                    onChange={(e) => updateFormField('ndp_category_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  >
                    {ndpCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Outcome
                  </label>
                  <textarea
                    value={formData.target_outcome || ''}
                    onChange={(e) => updateFormField('target_outcome', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    placeholder="What should the audience do/feel/know after consuming this content?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Message
                  </label>
                  <textarea
                    value={formData.key_message || ''}
                    onChange={(e) => updateFormField('key_message', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    placeholder="Core message to communicate"
                  />
                </div>
              </>
            ) : (
              <>
                {topic.description && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
                    <p className="text-gray-900">{topic.description}</p>
                  </div>
                )}
                {topic.ndp_categories && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">NDP Category</div>
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="font-medium text-gray-900">{topic.ndp_categories.name}</p>
                        {topic.ndp_categories.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {topic.ndp_categories.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {topic.target_outcome && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Target Outcome</div>
                    <p className="text-gray-900">{topic.target_outcome}</p>
                  </div>
                )}
                {topic.key_message && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Key Message</div>
                    <p className="text-gray-900">{topic.key_message}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Target Segments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Segments</h2>
            
            {editing ? (
              <div className="border border-gray-300 rounded-lg p-4 space-y-2 max-h-80 overflow-y-auto">
                {segments.map((segment) => (
                  <label
                    key={segment.id}
                    className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSegments.includes(segment.id)}
                      onChange={() => toggleSegment(segment.id)}
                      className="mt-1 w-4 h-4 text-poultryco-green border-gray-300 rounded focus:ring-poultryco-green"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {segment.name}
                      </div>
                      {segment.description && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {segment.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <>
                {assignedSegmentDetails.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {assignedSegmentDetails.map((segment) => (
                      <Link
                        key={segment.id}
                        href={`/marketing/segments/${segment.id}`}
                        className="px-3 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-sm font-medium"
                      >
                        {segment.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No segments assigned yet</p>
                )}
              </>
            )}
          </div>

          {/* Related Pillars */}
          {relatedPillars.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Content Pillars</h2>
              <div className="space-y-2">
                {relatedPillars.map((pillar) => (
                  <Link
                    key={pillar.id}
                    href={`/marketing/pillars/${pillar.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-poultryco-green hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{pillar.title}</div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          pillar.status === 'completed'
                            ? 'bg-purple-100 text-purple-800'
                            : pillar.status === 'in_production'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {pillar.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/marketing/pillars?topic=${topicId}`}
                className="block mt-4 text-center text-sm text-poultryco-green hover:underline"
              >
                View all pillars →
              </Link>
            </div>
          )}

          {/* Related Content */}
          {relatedContent.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Content</h2>
              <div className="space-y-2">
                {relatedContent.map((content) => (
                  <Link
                    key={content.id}
                    href={`/marketing/content/${content.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-poultryco-green hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{content.title}</div>
                        <div className="text-xs text-gray-500">{content.content_types?.name}</div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          content.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {content.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/marketing/content?topic=${topicId}`}
                className="block mt-4 text-center text-sm text-poultryco-green hover:underline"
              >
                View all content →
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>

            <div>
              <div className="text-sm text-gray-600 mb-1">Target Segments</div>
              <div className="text-3xl font-bold text-gray-900">{assignedSegments.length}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Content Pillars</div>
              <div className="text-3xl font-bold text-gray-900">{relatedPillars.length}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Content Pieces</div>
              <div className="text-3xl font-bold text-gray-900">{relatedContent.length}</div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Published Content</div>
              <div className="text-2xl font-bold text-gray-900">
                {relatedContent.filter((c) => c.status === 'published').length}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {!editing && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>

              <Link
                href={`/marketing/pillars/new?topic=${topicId}`}
                className="block w-full px-4 py-2 text-center bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Pillar
              </Link>

              <Link
                href={`/marketing/ideas/new?topic=${topicId}`}
                className="block w-full px-4 py-2 text-center bg-poultryco-green text-white rounded-lg hover:bg-green-600"
              >
                Capture Idea
              </Link>

              <Link
                href={`/marketing/content/new?topic=${topicId}`}
                className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Create Content
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
