'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ScheduleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const scheduleId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [schedule, setSchedule] = useState<any>(null);
  const [channels, setChannels] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [scheduleId]);

  async function fetchData() {
    try {
      setLoading(true);

      // Fetch schedule with related data
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('content_schedule')
        .select(`
          *,
          content(id, title, content_types(name)),
          marketing_channels(id, name, platform)
        `)
        .eq('id', scheduleId)
        .single();

      if (scheduleError) throw scheduleError;
      setSchedule(scheduleData);
      setFormData(scheduleData);

      // Fetch channels for editing
      const { data: channelsData } = await supabase
        .from('marketing_channels')
        .select('*')
        .eq('is_active', true)
        .order('platform')
        .order('name');

      if (channelsData) setChannels(channelsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateFormField(field: string, value: any) {
    setFormData({ ...formData, [field]: value });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('content_schedule')
        .update({
          channel_id: formData.channel_id,
          scheduled_date: formData.scheduled_date,
          scheduled_time: formData.scheduled_time,
          status: formData.status,
          published_url: formData.published_url,
          views: formData.views,
          likes: formData.likes,
          comments: formData.comments,
          shares: formData.shares,
          clicks: formData.clicks,
          notes: formData.notes,
        })
        .eq('id', scheduleId);

      if (error) throw error;

      // If marking as published, update published_at
      if (formData.status === 'published' && schedule.status !== 'published') {
        await supabase
          .from('content_schedule')
          .update({
            published_at: new Date().toISOString(),
          })
          .eq('id', scheduleId);
      }

      setEditing(false);
      fetchData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        'Are you sure you want to delete this scheduled item? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from('content_schedule').delete().eq('id', scheduleId);

      if (error) throw error;
      router.push('/marketing/calendar');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poultryco-green"></div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule not found</h2>
        <Link href="/marketing/calendar" className="text-poultryco-green hover:underline">
          ← Back to Calendar
        </Link>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    published: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const groupedChannels = channels.reduce((acc, channel) => {
    if (!acc[channel.platform]) {
      acc[channel.platform] = [];
    }
    acc[channel.platform].push(channel);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            href="/marketing/calendar"
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-block"
          >
            ← Back to Calendar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Content</h1>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded border ${
                STATUS_COLORS[schedule.status]
              }`}
            >
              {schedule.status}
            </span>
            <span className="text-sm text-gray-500">
              Created {new Date(schedule.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(schedule);
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
          {/* Content Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Content</h2>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Title</div>
              <Link
                href={`/marketing/content/${schedule.content.id}`}
                className="text-lg font-medium text-poultryco-green hover:underline"
              >
                {schedule.content.title}
              </Link>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Content Type</div>
              <p className="text-gray-900">{schedule.content.content_types?.name}</p>
            </div>
          </div>

          {/* Schedule Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Schedule Details</h2>

            {editing ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <select
                    value={formData.channel_id}
                    onChange={(e) => updateFormField('channel_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  >
                    {Object.entries(groupedChannels).map(([platform, platformChannels]) => (
                      <optgroup key={platform} label={platform.toUpperCase()}>
                        {platformChannels.map((channel) => (
                          <option key={channel.id} value={channel.id}>
                            {channel.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.scheduled_date}
                      onChange={(e) => updateFormField('scheduled_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={formData.scheduled_time || ''}
                      onChange={(e) => updateFormField('scheduled_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => updateFormField('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {formData.status === 'published' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Published URL
                    </label>
                    <input
                      type="url"
                      value={formData.published_url || ''}
                      onChange={(e) => updateFormField('published_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateFormField('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Channel</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{schedule.marketing_channels.platform === 'linkedin' ? '💼' : schedule.marketing_channels.platform === 'facebook' ? '👥' : schedule.marketing_channels.platform === 'instagram' ? '📷' : schedule.marketing_channels.platform === 'twitter' ? '🐦' : '📱'}</span>
                    <Link
                      href={`/marketing/channels/${schedule.marketing_channels.id}`}
                      className="text-poultryco-green hover:underline"
                    >
                      {schedule.marketing_channels.name}
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Scheduled Date</div>
                    <p className="text-gray-900">
                      {new Date(schedule.scheduled_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  {schedule.scheduled_time && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Scheduled Time</div>
                      <p className="text-gray-900">
                        {new Date(`2000-01-01T${schedule.scheduled_time}`).toLocaleTimeString(
                          'en-US',
                          {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          }
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {schedule.published_url && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Published URL</div>
                    <a
                      href={schedule.published_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-poultryco-green hover:underline break-all"
                    >
                      {schedule.published_url}
                    </a>
                  </div>
                )}

                {schedule.published_at && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Published At</div>
                    <p className="text-gray-900">
                      {new Date(schedule.published_at).toLocaleString()}
                    </p>
                  </div>
                )}

                {schedule.notes && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Notes</div>
                    <p className="text-gray-900 whitespace-pre-wrap">{schedule.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>

            {editing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Views</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.views}
                    onChange={(e) => updateFormField('views', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Likes</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.likes}
                    onChange={(e) => updateFormField('likes', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.comments}
                    onChange={(e) => updateFormField('comments', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shares</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.shares}
                    onChange={(e) => updateFormField('shares', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clicks</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.clicks}
                    onChange={(e) => updateFormField('clicks', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-800 mb-1">Views</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {schedule.views.toLocaleString()}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-purple-800 mb-1">Engagement</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {(schedule.likes + schedule.comments + schedule.shares).toLocaleString()}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-800 mb-1">Clicks</div>
                  <div className="text-2xl font-bold text-green-900">
                    {schedule.clicks.toLocaleString()}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Likes</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {schedule.likes.toLocaleString()}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Comments</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {schedule.comments.toLocaleString()}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-xs text-gray-600 mb-1">Shares</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {schedule.shares.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Manual entry in Phase 1. Future phases will auto-sync from platforms.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {!editing && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>

              {schedule.status === 'scheduled' && (
                <button
                  onClick={async () => {
                    try {
                      await supabase
                        .from('content_schedule')
                        .update({
                          status: 'published',
                          published_at: new Date().toISOString(),
                        })
                        .eq('id', scheduleId);
                      fetchData();
                    } catch (error) {
                      console.error('Error:', error);
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark as Published
                </button>
              )}

              {schedule.status === 'scheduled' && (
                <button
                  onClick={async () => {
                    try {
                      await supabase
                        .from('content_schedule')
                        .update({ status: 'cancelled' })
                        .eq('id', scheduleId);
                      fetchData();
                    } catch (error) {
                      console.error('Error:', error);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel Schedule
                </button>
              )}

              <Link
                href={`/marketing/content/${schedule.content.id}`}
                className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                View Content
              </Link>

              <Link
                href={`/marketing/channels/${schedule.marketing_channels.id}`}
                className="block w-full px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                View Channel
              </Link>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-gray-400"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Created</div>
                  <div className="text-xs text-gray-500">
                    {new Date(schedule.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {schedule.updated_at !== schedule.created_at && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-400"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Last Updated</div>
                    <div className="text-xs text-gray-500">
                      {new Date(schedule.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {schedule.published_at && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-green-400"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Published</div>
                    <div className="text-xs text-gray-500">
                      {new Date(schedule.published_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

