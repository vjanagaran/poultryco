'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getMarketingChannelById, updateMarketingChannel, deleteMarketingChannel, getContentSchedule, type MarketingChannel } from '@/lib/api/marketing';

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

export default function ChannelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const channelId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [channel, setChannel] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<any>({});
  const [hashtagInput, setHashtagInput] = useState('');

  useEffect(() => {
    fetchData();
  }, [channelId]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch channel
      const channelData = await getMarketingChannelById(channelId);
      setChannel(channelData);
      setFormData(channelData);

      // Fetch schedules for this channel
      const scheduleData = await getContentSchedule({ channelId });
      setSchedules(scheduleData.slice(0, 10));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateFormField(field: string, value: any) {
    setFormData({ ...formData, [field]: value });
  }

  function addHashtag() {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.trim().startsWith('#')
        ? hashtagInput.trim()
        : `#${hashtagInput.trim()}`;
      const hashtags = formData.default_hashtags || [];
      updateFormField('default_hashtags', [...hashtags, tag]);
      setHashtagInput('');
    }
  }

  function removeHashtag(index: number) {
    const hashtags = formData.default_hashtags || [];
    updateFormField(
      'default_hashtags',
      hashtags.filter((_: any, i: number) => i !== index)
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateMarketingChannel(channelId, {
        platform: formData.platform,
        channel_type: formData.channel_type,
        name: formData.name,
        handle: formData.handle,
        url: formData.url,
        description: formData.description,
        is_active: formData.is_active,
        posting_schedule: formData.posting_schedule,
        default_hashtags: formData.default_hashtags,
        character_limit: formData.character_limit,
        target_posts_per_week: formData.target_posts_per_week,
        target_engagement_rate: formData.target_engagement_rate,
        current_followers: formData.current_followers,
        current_subscribers: formData.current_subscribers,
      });

      setEditing(false);
      fetchData();
    } catch (error) {
      console.error('Error saving channel:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        'Are you sure you want to delete this channel? This action cannot be undone and will affect all scheduled content.'
      )
    ) {
      return;
    }

    try {
      await deleteMarketingChannel(channelId);
      router.push('/marketing/channels');
    } catch (error) {
      console.error('Error deleting channel:', error);
      alert('Failed to delete channel. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poultryco-green"></div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Channel not found</h2>
        <Link href="/marketing/channels" className="text-poultryco-green hover:underline">
          ← Back to Channels
        </Link>
      </div>
    );
  }

  const platformInfo = PLATFORMS.find((p) => p.value === channel.platform);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            href="/marketing/channels"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Back to Channels
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{platformInfo?.icon || '📱'}</span>
            <div>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  className="text-3xl font-bold text-gray-900 border-b-2 border-poultryco-green focus:outline-none"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{channel.name}</h1>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    channel.is_active ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                />
                <span className="text-sm text-gray-600 capitalize">
                  {channel.platform} • {channel.channel_type.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(channel);
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
            <h2 className="text-lg font-semibold text-gray-900">Channel Details</h2>

            {editing ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                    <select
                      value={formData.platform}
                      onChange={(e) => updateFormField('platform', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.icon} {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Channel Type
                    </label>
                    <select
                      value={formData.channel_type}
                      onChange={(e) => updateFormField('channel_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    >
                      {CHANNEL_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Handle</label>
                    <input
                      type="text"
                      value={formData.handle || ''}
                      onChange={(e) => updateFormField('handle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <input
                      type="url"
                      value={formData.url || ''}
                      onChange={(e) => updateFormField('url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    />
                  </div>
                </div>

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

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.is_active}
                    onChange={(e) => updateFormField('is_active', e.target.checked)}
                    className="w-4 h-4 text-poultryco-green border-gray-300 rounded focus:ring-poultryco-green"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Channel is active
                  </label>
                </div>
              </>
            ) : (
              <>
                {channel.handle && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Handle</div>
                    <p className="text-gray-900">{channel.handle}</p>
                  </div>
                )}
                {channel.url && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">URL</div>
                    <a
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-poultryco-green hover:underline break-all"
                    >
                      {channel.url}
                    </a>
                  </div>
                )}
                {channel.description && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
                    <p className="text-gray-900">{channel.description}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Content Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Content Settings</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posting Schedule
                  </label>
                  <input
                    type="text"
                    value={formData.posting_schedule || ''}
                    onChange={(e) => updateFormField('posting_schedule', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    placeholder="e.g., Mon-Fri 9am, 3pm, 7pm"
                  />
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
                  {formData.default_hashtags && formData.default_hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.default_hashtags.map((tag: string, idx: number) => (
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
                    value={formData.character_limit || ''}
                    onChange={(e) => updateFormField('character_limit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <>
                {channel.posting_schedule && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Posting Schedule</div>
                    <p className="text-gray-900">{channel.posting_schedule}</p>
                  </div>
                )}
                {channel.default_hashtags && channel.default_hashtags.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Default Hashtags</div>
                    <div className="flex flex-wrap gap-2">
                      {channel.default_hashtags.map((tag: string, idx: number) => (
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
                {channel.character_limit && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Character Limit</div>
                    <p className="text-gray-900">{channel.character_limit.toLocaleString()}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Recent Schedules */}
          {schedules.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Scheduled Posts</h2>
              <div className="space-y-2">
                {schedules.map((schedule) => (
                  <Link
                    key={schedule.id}
                    href={`/marketing/calendar/${schedule.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-poultryco-green hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{schedule.content?.title}</div>
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
              <Link
                href={`/marketing/calendar?channel=${channelId}`}
                className="block mt-4 text-center text-sm text-poultryco-green hover:underline"
              >
                View all scheduled posts →
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Targets & Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Targets & Metrics</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Posts/Week
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.target_posts_per_week}
                    onChange={(e) =>
                      updateFormField('target_posts_per_week', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Engagement (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={(formData.target_engagement_rate * 100).toFixed(1)}
                    onChange={(e) =>
                      updateFormField('target_engagement_rate', parseFloat(e.target.value) / 100)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Followers
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.current_followers}
                    onChange={(e) =>
                      updateFormField('current_followers', parseInt(e.target.value))
                    }
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
                    value={formData.current_subscribers}
                    onChange={(e) =>
                      updateFormField('current_subscribers', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Target Posts/Week</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {channel.target_posts_per_week}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Target Engagement</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {(channel.target_engagement_rate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Followers</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {channel.current_followers.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Subscribers</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {channel.current_subscribers.toLocaleString()}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          {!editing && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>

              <Link
                href={`/marketing/calendar/new?channel=${channelId}`}
                className="block w-full px-4 py-2 text-center bg-poultryco-green text-white rounded-lg hover:bg-green-600"
              >
                Schedule Content
              </Link>

              {channel.url && (
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Visit Channel
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

