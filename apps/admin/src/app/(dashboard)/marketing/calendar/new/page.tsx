'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { createContentSchedule, type ContentSchedule } from '@/lib/api/marketing';

export default function NewSchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentIdFromQuery = searchParams.get('content');

  // Using API client
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);

  // Form state
  const [contentId, setContentId] = useState(contentIdFromQuery || '');
  const [channelId, setChannelId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchLookupData();
  }, []);

  async function fetchLookupData() {
    try {
      // TODO: Implement API endpoints for these lookups
      const [contentData, channelsData] = await Promise.all([
        apiClient.get<any[]>('/admin/content?status=approved,published'),
        apiClient.get<any[]>('/admin/marketing-channels?active=true'),
      ]);

      setContent(Array.isArray(contentData) ? contentData : []);
      setChannels(Array.isArray(channelsData) ? channelsData : []);
    } catch (error) {
      console.error('Error fetching lookup data:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const schedule = await createContentSchedule({
        content_id: contentId,
        channel_id: channelId,
        scheduled_for: scheduledDate + (scheduledTime ? `T${scheduledTime}` : ''),
        status,
      });
      
      router.push(`/marketing/calendar/${schedule.id}`);
    } catch (_error) {
      console.error('Error creating schedule:', _error);
      alert('Failed to schedule content. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const groupedChannels = channels.reduce((acc, channel) => {
    if (!acc[channel.platform]) {
      acc[channel.platform] = [];
    }
    acc[channel.platform].push(channel);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule Content</h1>
          <p className="mt-2 text-gray-600">
            Schedule content to be published on a specific channel and date
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Content</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="">Select content to schedule...</option>
              {content.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} ({item.content_types?.name}) - {item.status}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Only approved or published content can be scheduled
            </p>
          </div>
        </div>

        {/* Channel Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Select Channel</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="">Select channel...</option>
              {Object.entries(groupedChannels).map(([platform, platformChannels]) => (
                <optgroup key={platform} label={platform.toUpperCase()}>
                  {(platformChannels as typeof channels).map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name} {channel.handle ? `(${channel.handle})` : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Only active channels are shown</p>
          </div>
        </div>

        {/* Schedule Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Schedule Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Optional - leave blank for anytime</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            >
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
              placeholder="Any special instructions or notes..."
            />
          </div>
        </div>

        {/* Preview */}
        {contentId && channelId && scheduledDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Schedule Preview</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div>
                <span className="font-medium">Content:</span>{' '}
                {content.find((c) => c.id === contentId)?.title}
              </div>
              <div>
                <span className="font-medium">Channel:</span>{' '}
                {channels.find((c) => c.id === channelId)?.name}
              </div>
              <div>
                <span className="font-medium">Date:</span>{' '}
                {new Date(scheduledDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              {scheduledTime && (
                <div>
                  <span className="font-medium">Time:</span>{' '}
                  {new Date(`2000-01-01T${scheduledTime}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </div>
              )}
              <div>
                <span className="font-medium">Status:</span>{' '}
                <span className="capitalize">{status}</span>
              </div>
            </div>
          </div>
        )}

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
            disabled={loading || !contentId || !channelId || !scheduledDate}
            className="px-6 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Scheduling...' : 'Schedule Content'}
          </button>
        </div>
      </form>
    </div>
  );
}

