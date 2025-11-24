'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TagSelector } from '@/components/marketing/TagSelector';
import { CampaignSelector } from '@/components/marketing/CampaignSelector';

export default function NewContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pillarIdFromQuery = searchParams.get('pillar');

  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [pillars, setPillars] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [contentTypes, setContentTypes] = useState<any[]>([]);
  const [masterContent, setMasterContent] = useState<any[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [contentMode, setContentMode] = useState<'master' | 'repurposed'>('master');
  const [masterContentId, setMasterContentId] = useState('');
  const [pillarId, setPillarId] = useState(pillarIdFromQuery || '');
  const [topicId, setTopicId] = useState('');
  const [contentTypeId, setContentTypeId] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeywords, setFocusKeywords] = useState<string[]>([]);
  const [focusKeywordInput, setFocusKeywordInput] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');
  const [status, setStatus] = useState('draft');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  useEffect(() => {
    fetchLookupData();
  }, []);

  useEffect(() => {
    // When pillar is selected, inherit its SEO data
    if (pillarId) {
      const selectedPillar = pillars.find((p) => p.id === pillarId);
      if (selectedPillar) {
        if (selectedPillar.focus_keywords) setFocusKeywords(selectedPillar.focus_keywords);
        if (selectedPillar.target_url) setTargetUrl(selectedPillar.target_url);
      }
    }
  }, [pillarId, pillars]);

  async function fetchLookupData() {
    try {
      const [pillarsRes, topicsRes, typesRes, masterRes] = await Promise.all([
        supabase.from('content_pillars').select('*').order('title'),
        supabase.from('content_topics').select('id, title').order('title'),
        supabase.from('content_types').select('*').order('name'),
        supabase
          .from('content')
          .select('id, title')
          .eq('content_mode', 'master')
          .order('title'),
      ]);

      if (pillarsRes.data) setPillars(pillarsRes.data);
      if (topicsRes.data) setTopics(topicsRes.data);
      if (typesRes.data) setContentTypes(typesRes.data);
      if (masterRes.data) setMasterContent(masterRes.data);
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
    if (!metaTitle) {
      setMetaTitle(value);
    }
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

  function addHashtag() {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.trim().startsWith('#')
        ? hashtagInput.trim()
        : `#${hashtagInput.trim()}`;
      setHashtags([...hashtags, tag]);
      setHashtagInput('');
    }
  }

  function removeHashtag(index: number) {
    setHashtags(hashtags.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create the content
      const { data: content, error: contentError } = await supabase
        .from('content')
        .insert({
          title,
          slug: slug || null,
          content_mode: contentMode,
          master_content_id: contentMode === 'repurposed' ? masterContentId || null : null,
          pillar_id: pillarId || null,
          topic_id: topicId || null,
          content_type_id: contentTypeId,
          content_body: contentBody || null,
          excerpt: excerpt || null,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          focus_keywords: focusKeywords.length > 0 ? focusKeywords : null,
          target_url: targetUrl || null,
          featured_image_url: featuredImageUrl || null,
          hashtags: hashtags.length > 0 ? hashtags : null,
          cta_text: ctaText || null,
          cta_url: ctaUrl || null,
          status,
        })
        .select()
        .single();

      if (contentError) throw contentError;

      // 2. Assign tags
      if (selectedTags.length > 0) {
        const tagAssignments = selectedTags.map((tagId) => ({
          content_id: content.id,
          tag_id: tagId,
        }));
        const { error: tagsError } = await supabase
          .from('content_tag_assignments')
          .insert(tagAssignments);
        if (tagsError) throw tagsError;
      }

      // 3. Assign campaign
      if (selectedCampaign) {
        const { error: campaignError } = await supabase
          .from('content_campaign_assignments')
          .insert({
            content_id: content.id,
            campaign_id: selectedCampaign,
          });
        if (campaignError) throw campaignError;
      }

      router.push(`/marketing/content/${content.id}`);
    } catch (error) {
      console.error('Error creating content:', error);
      alert('Failed to create content. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Content</h1>
          <p className="mt-2 text-gray-600">
            Create master content or repurpose existing content for different channels
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Mode */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Content Mode</h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setContentMode('master')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                contentMode === 'master'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900 mb-1">Master Content</div>
              <div className="text-sm text-gray-600">
                Original long-form content (blog, ebook, guide)
              </div>
            </button>

            <button
              type="button"
              onClick={() => setContentMode('repurposed')}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                contentMode === 'repurposed'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900 mb-1">Repurposed Content</div>
              <div className="text-sm text-gray-600">
                Adapted from master content for social media, email, etc.
              </div>
            </button>
          </div>

          {contentMode === 'repurposed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Master Content <span className="text-red-500">*</span>
              </label>
              <select
                value={masterContentId}
                onChange={(e) => setMasterContentId(e.target.value)}
                required={contentMode === 'repurposed'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              >
                <option value="">Select master content...</option>
                {masterContent.map((mc) => (
                  <option key={mc.id} value={mc.id}>
                    {mc.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Select the original content this is being repurposed from
              </p>
            </div>
          )}
        </div>

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
              placeholder="e.g., 10 Tips for Better Layer Nutrition"
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={contentTypeId}
                onChange={(e) => setContentTypeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              >
                <option value="">Select type...</option>
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
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="Short summary..."
            />
          </div>
        </div>

        {/* Strategic Alignment */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Strategic Alignment</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Pillar
              </label>
              <select
                value={pillarId}
                onChange={(e) => setPillarId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              >
                <option value="">Select pillar...</option>
                {pillars.map((pillar) => (
                  <option key={pillar.id} value={pillar.id}>
                    {pillar.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Selecting a pillar will inherit its SEO settings
              </p>
            </div>

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
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Content</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Body</label>
            <textarea
              value={contentBody}
              onChange={(e) => setContentBody(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent font-mono text-sm"
              placeholder="Write your content here (supports Markdown)..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image URL
            </label>
            <input
              type="url"
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="https://..."
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
                placeholder="Add hashtag (with or without #)..."
              />
              <button
                type="button"
                onClick={addHashtag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, idx) => (
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
        </div>

        {/* SEO */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">SEO & Metadata</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="SEO title (defaults to content title)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="Brief description for search engines..."
            />
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
                placeholder="Add focus keyword..."
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
            {pillarId && (
              <p className="mt-1 text-xs text-gray-500">
                Inherited from pillar (can be customized)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target URL</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="/stakeholders/farmers or /about"
            />
            {pillarId && (
              <p className="mt-1 text-xs text-gray-500">
                Inherited from pillar (can be customized)
              </p>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Call to Action</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA Text</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                placeholder="e.g., Learn More, Sign Up, Download"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTA URL</label>
              <input
                type="url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Tags & Campaigns */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Tags & Campaigns</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <TagSelector selectedTags={selectedTags} onTagsChange={setSelectedTags} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
            <CampaignSelector
              selectedCampaign={selectedCampaign}
              onCampaignChange={setSelectedCampaign}
            />
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
            disabled={loading || !title || !contentTypeId}
            className="px-6 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Content'}
          </button>
        </div>
      </form>
    </div>
  );
}

