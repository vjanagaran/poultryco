'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMarketingChannel, type MarketingChannel } from '@/lib/api/marketing';

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'facebook', label: 'Facebook', icon: '👥' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'youtube', label: 'YouTube', icon: '📹' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'website', label: 'Website/Blog', icon: '🌐' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'telegram', label: 'Telegram', icon: '✈️' },
  { value: 'other', label: 'Other', icon: '📱' },
];

const CHANNEL_TYPES = [
  { value: 'page', label: 'Page' },
  { value: 'profile', label: 'Profile' },
  { value: 'group', label: 'Group' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'channel', label: 'Channel' },
  { value: 'business_account', label: 'Business Account' },
  { value: 'blog', label: 'Blog' },
  { value: 'list', label: 'List' },
  { value: 'other', label: 'Other' },
];

export default function NewChannelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state
  const [platform, setPlatform] = useState('');
  const [channelType, setChannelType] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [postingSchedule, setPostingSchedule] = useState('');
  const [defaultHashtags, setDefaultHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [characterLimit, setCharacterLimit] = useState('');
  const [targetPostsPerWeek, setTargetPostsPerWeek] = useState(5);
  const [targetEngagementRate, setTargetEngagementRate] = useState(5);
  const [currentFollowers, setCurrentFollowers] = useState(0);
  const [currentSubscribers, setCurrentSubscribers] = useState(0);

  function addHashtag() {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.trim().startsWith('#')
        ? hashtagInput.trim()
        : `#${hashtagInput.trim()}`;
      setDefaultHashtags([...defaultHashtags, tag]);
      setHashtagInput('');
    }
  }

  function removeHashtag(index: number) {
    setDefaultHashtags(defaultHashtags.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const channel = await createMarketingChannel({
        platform,
        name,
        handle: handle || undefined,
        account_handle: handle || undefined,
        url: url || undefined,
        description: description || null,
        is_active: isActive,
        posting_schedule: postingSchedule || null,
        default_hashtags: defaultHashtags.length > 0 ? defaultHashtags.join(',') : null,
        character_limit: characterLimit ? parseInt(characterLimit) : null,
        target_posts_per_week: targetPostsPerWeek,
        target_engagement_rate: targetEngagementRate ? targetEngagementRate / 100 : null, // Convert to decimal
        current_followers: currentFollowers,
        current_subscribers: currentSubscribers,
      });

      router.push(`/marketing/channels/${channel.id}`);
    } catch (_error) {
      console.error('Error creating channel:', _error);
      alert('Failed to create channel. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Marketing Channel</h1>
          <p className="mt-2 text-gray-600">
            Add a new social media account or distribution channel
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Platform & Type */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Platform & Type</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              >
                <option value="">Select platform...</option>
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.icon} {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Channel Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={channelType}
                onChange={(e) => setChannelType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              >
                <option value="">Select type...</option>
                {CHANNEL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="e.g., PoultryCo LinkedIn Page"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Handle</label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                placeholder="@poultryco"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="Brief description of this channel..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-poultryco-green border-gray-300 rounded focus:ring-poultryco-green"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Channel is active
            </label>
          </div>
        </div>

        {/* Content Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Content Settings</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Posting Schedule (Reference)
            </label>
            <input
              type="text"
              value={postingSchedule}
              onChange={(e) => setPostingSchedule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="e.g., Mon-Fri 9am, 3pm, 7pm"
            />
            <p className="mt-1 text-xs text-gray-500">
              For reference only - actual scheduling done in calendar
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Hashtags
            </label>
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
            {defaultHashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {defaultHashtags.map((tag, idx) => (
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Character Limit
            </label>
            <input
              type="number"
              value={characterLimit}
              onChange={(e) => setCharacterLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="e.g., 280 for Twitter"
            />
            <p className="mt-1 text-xs text-gray-500">
              Platform-specific character limit (optional)
            </p>
          </div>
        </div>

        {/* Targets & Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Targets & Current Metrics</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Posts Per Week
              </label>
              <input
                type="number"
                min="0"
                value={targetPostsPerWeek}
                onChange={(e) => setTargetPostsPerWeek(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Engagement Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={targetEngagementRate}
                onChange={(e) => setTargetEngagementRate(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Followers
              </label>
              <input
                type="number"
                min="0"
                value={currentFollowers}
                onChange={(e) => setCurrentFollowers(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Subscribers
              </label>
              <input
                type="number"
                min="0"
                value={currentSubscribers}
                onChange={(e) => setCurrentSubscribers(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              />
            </div>
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
            disabled={loading || !platform || !channelType || !name}
            className="px-6 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Channel'}
          </button>
        </div>
      </form>
    </div>
  );
}

