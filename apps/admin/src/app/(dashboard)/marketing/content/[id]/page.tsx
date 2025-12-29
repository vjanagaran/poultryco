'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { getContentById, type Content } from '@/lib/api/marketing';
import { TagSelector } from '@/components/marketing/TagSelector';
import { CampaignSelector } from '@/components/marketing/CampaignSelector';

export default function ContentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;
  // Using API client

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [contentTypes, setContentTypes] = useState<any[]>([]);
  const [pillars, setPillars] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [masterContent, setMasterContent] = useState<any[]>([]);
  const [assignedTags, setAssignedTags] = useState<string[]>([]);
  const [assignedCampaign, setAssignedCampaign] = useState<string | null>(null);
  const [repurposedContent, setRepurposedContent] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<any>({});
  const [focusKeywordInput, setFocusKeywordInput] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');

  useEffect(() => {
    fetchData();
  }, [contentId]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch content via API
      const contentData = await getContentById(contentId);
      setContent(contentData);
      setFormData(contentData);

      // Fetch lookup data
      const [types, pillars, topics, master] = await Promise.all([
        apiClient.get('/admin/content-types'),
        apiClient.get('/admin/content-pillars'),
        apiClient.get('/admin/content-topics'),
        apiClient.get(`/admin/content?mode=master&exclude=${contentId}`),
      ]);

      setContentTypes(Array.isArray(types) ? types : []);
      setPillars(Array.isArray(pillars) ? pillars : []);
      setTopics(Array.isArray(topics) ? topics : []);
      setMasterContent(Array.isArray(master) ? master : []);

      // Extract assigned tags and campaign from content data
      if (contentData.tagIds) {
        setAssignedTags(contentData.tagIds);
      }
      if (contentData.campaignId) {
        setAssignedCampaign(contentData.campaignId);
      }

      // If this is master content, fetch repurposed content
      if (contentData.content_mode === 'master') {
        const repurposedData = await apiClient.get<any[]>(`/admin/content?masterContentId=${contentId}`);
        setRepurposedContent(Array.isArray(repurposedData) ? repurposedData : []);
      }

      // Fetch schedules
      const scheduleData = await apiClient.get<any[]>(`/admin/content-schedule?contentId=${contentId}`);
      setSchedules(Array.isArray(scheduleData) ? scheduleData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateFormField(field: string, value: any) {
    setFormData({ ...formData, [field]: value });
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

  function addHashtag() {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.trim().startsWith('#')
        ? hashtagInput.trim()
        : `#${hashtagInput.trim()}`;
      const hashtags = formData.hashtags || [];
      updateFormField('hashtags', [...hashtags, tag]);
      setHashtagInput('');
    }
  }

  function removeHashtag(index: number) {
    const hashtags = formData.hashtags || [];
    updateFormField(
      'hashtags',
      hashtags.filter((_: any, i: number) => i !== index)
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Update content via API
      await apiClient.put(`/admin/content/${contentId}`, {
        title: formData.title,
        slug: formData.slug,
        contentMode: formData.content_mode,
        masterContentId: formData.master_content_id,
        pillarId: formData.pillar_id,
        topicId: formData.topic_id,
        contentTypeId: formData.content_type_id,
        contentBody: formData.content_body,
        excerpt: formData.excerpt,
        metaTitle: formData.meta_title,
        metaDescription: formData.meta_description,
        focusKeywords: formData.focus_keywords,
        targetUrl: formData.target_url,
        featuredImageUrl: formData.featured_image_url,
        hashtags: formData.hashtags,
        ctaText: formData.cta_text,
        ctaUrl: formData.cta_url,
        status: formData.status,
        tagIds: assignedTags,
        campaignId: assignedCampaign,
      });

      setEditing(false);
      fetchData();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/admin/content/${contentId}`);
      router.push('/marketing/content');
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poultryco-green"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Content not found</h2>
        <Link href="/marketing/content" className="text-poultryco-green hover:underline">
          ← Back to Content
        </Link>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    in_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    published: 'bg-blue-100 text-blue-800 border-blue-200',
    archived: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  const MODE_COLORS: Record<string, string> = {
    master: 'bg-purple-100 text-purple-800',
    repurposed: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            href="/marketing/content"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Back to Content
          </Link>
          {editing ? (
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              className="text-3xl font-bold text-gray-900 w-full border-b-2 border-poultryco-green focus:outline-none"
            />
          ) : (
            <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${
                STATUS_COLORS[content.status]
              }`}
            >
              {content.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded ${MODE_COLORS[content.content_mode]}`}>
              {content.content_mode}
            </span>
            <span className="text-sm text-gray-500">
              Created {new Date(content.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(content);
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
            <h2 className="text-lg font-semibold text-gray-900">Content Details</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => updateFormField('slug', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea
                    value={formData.excerpt || ''}
                    onChange={(e) => updateFormField('excerpt', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content Type
                    </label>
                    <select
                      value={formData.content_type_id}
                      onChange={(e) => updateFormField('content_type_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    >
                      {contentTypes.map((type) => (
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
                      <option value="draft">Draft</option>
                      <option value="in_review">In Review</option>
                      <option value="approved">Approved</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                {content.excerpt && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Excerpt</div>
                    <p className="text-gray-900">{content.excerpt}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Content Type</div>
                    <p className="text-gray-900">{content.content_types?.name}</p>
                  </div>
                  {content.slug && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Slug</div>
                      <p className="text-gray-900 font-mono text-sm">{content.slug}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Content Body */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Content Body</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Body
                  </label>
                  <textarea
                    value={formData.content_body || ''}
                    onChange={(e) => updateFormField('content_body', e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.featured_image_url || ''}
                    onChange={(e) => updateFormField('featured_image_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={hashtagInput}
                      onChange={(e) => setHashtagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                      placeholder="Add hashtag..."
                    />
                    <button
                      type="button"
                      onClick={addHashtag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>
                  {formData.hashtags && formData.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.hashtags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeHashtag(idx)}
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
                {content.content_body && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Content</div>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-900 bg-gray-50 p-4 rounded">
                        {content.content_body}
                      </pre>
                    </div>
                  </div>
                )}
                {content.featured_image_url && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Featured Image</div>
                    <img
                      src={content.featured_image_url}
                      alt={content.title}
                      className="max-w-md rounded-lg border border-gray-200"
                    />
                  </div>
                )}
                {content.hashtags && content.hashtags.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Hashtags</div>
                    <div className="flex flex-wrap gap-2">
                      {content.hashtags.map((tag: string, idx: number) => (
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

          {/* SEO */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">SEO & Metadata</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={formData.meta_title || ''}
                    onChange={(e) => updateFormField('meta_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.meta_description || ''}
                    onChange={(e) => updateFormField('meta_description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
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
                      placeholder="Add keyword..."
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
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeFocusKeyword(idx)}
                            className="text-green-500 hover:text-green-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
                  <input
                    type="text"
                    value={formData.target_url || ''}
                    onChange={(e) => updateFormField('target_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <>
                {content.meta_title && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Meta Title</div>
                    <p className="text-gray-900">{content.meta_title}</p>
                  </div>
                )}
                {content.meta_description && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Meta Description</div>
                    <p className="text-gray-900">{content.meta_description}</p>
                  </div>
                )}
                {content.focus_keywords && content.focus_keywords.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Focus Keywords</div>
                    <div className="flex flex-wrap gap-2">
                      {content.focus_keywords.map((keyword: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {content.target_url && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Target URL</div>
                    <a
                      href={content.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-poultryco-green hover:underline"
                    >
                      {content.target_url}
                    </a>
                  </div>
                )}
              </>
            )}
          </div>

          {/* CTA */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Call to Action</h2>

            {editing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={formData.cta_text || ''}
                    onChange={(e) => updateFormField('cta_text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA URL</label>
                  <input
                    type="url"
                    value={formData.cta_url || ''}
                    onChange={(e) => updateFormField('cta_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <>
                {content.cta_text && (
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">CTA Text</div>
                      <p className="text-gray-900">{content.cta_text}</p>
                    </div>
                    {content.cta_url && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">CTA URL</div>
                        <a
                          href={content.cta_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-poultryco-green hover:underline"
                        >
                          {content.cta_url}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Repurposed Content (if master) */}
          {content.content_mode === 'master' && repurposedContent.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Repurposed Content</h2>
              <div className="space-y-2">
                {repurposedContent.map((item) => (
                  <Link
                    key={item.id}
                    href={`/marketing/content/${item.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-poultryco-green hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">{item.content_types?.name}</div>
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
            </div>
          )}

          {/* Schedules */}
          {schedules.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Posts</h2>
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <Link
                    key={schedule.id}
                    href={`/marketing/calendar/${schedule.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-poultryco-green hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {schedule.marketing_channels?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(schedule.scheduled_date).toLocaleDateString()}
                          {schedule.scheduled_time &&
                            ` at ${schedule.scheduled_time.substring(0, 5)}`}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          schedule.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {schedule.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
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
                    Content Pillar
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

                {content.content_mode === 'repurposed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Master Content
                    </label>
                    <select
                      value={formData.master_content_id || ''}
                      onChange={(e) => updateFormField('master_content_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    >
                      <option value="">Select master...</option>
                      {masterContent.map((mc) => (
                        <option key={mc.id} value={mc.id}>
                          {mc.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            ) : (
              <>
                {content.content_pillars && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Content Pillar</div>
                    <Link
                      href={`/marketing/pillars/${content.pillar_id}`}
                      className="text-poultryco-green hover:underline"
                    >
                      {content.content_pillars.title}
                    </Link>
                  </div>
                )}
                {content.content_topics && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Topic</div>
                    <p className="text-gray-900">{content.content_topics.title}</p>
                  </div>
                )}
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
                      href={`/marketing/campaigns`}
                      className="text-poultryco-green hover:underline text-sm"
                    >
                      View Campaign →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Performance */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
            <div>
              <div className="text-sm text-gray-600">Total Views</div>
              <div className="text-2xl font-bold text-gray-900">
                {content.total_views?.toLocaleString() || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Engagement</div>
              <div className="text-2xl font-bold text-gray-900">
                {(
                  (content.total_likes || 0) +
                  (content.total_comments || 0) +
                  (content.total_shares || 0)
                ).toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-500">Likes</div>
                <div className="text-sm font-semibold text-gray-900">
                  {content.total_likes || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Comments</div>
                <div className="text-sm font-semibold text-gray-900">
                  {content.total_comments || 0}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Shares</div>
                <div className="text-sm font-semibold text-gray-900">
                  {content.total_shares || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

