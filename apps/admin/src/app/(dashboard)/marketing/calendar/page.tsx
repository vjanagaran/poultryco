'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';

interface ScheduledContent {
  id: string;
  content_id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  status: string;
  channel_id: string;
  channel: {
    name: string;
    platform: string;
  };
  content: {
    title: string;
    content_type_id: string;
    content_types?: {
      name: string;
    };
  };
  campaign?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  published: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function ContentCalendarPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: currentWeekStart, end: weekEnd });

  useEffect(() => {
    fetchScheduledContent();
  }, [currentWeekStart]);

  async function fetchScheduledContent() {
    try {
      // Fetch scheduled content with content details
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('content_schedule')
        .select(`
          *,
          channel:marketing_channels(name, platform),
          content:content(
            title,
            content_type_id,
            content_types(name)
          )
        `)
        .gte('scheduled_date', format(currentWeekStart, 'yyyy-MM-dd'))
        .lte('scheduled_date', format(weekEnd, 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (scheduleError) throw scheduleError;

      // Fetch campaign assignments for the content
      const contentIds = scheduleData?.map((s: any) => s.content_id) || [];
      let campaignMap: Record<string, any> = {};

      if (contentIds.length > 0) {
        const { data: campaignData } = await supabase
          .from('content_campaign_assignments')
          .select(`
            content_id,
            campaign:content_campaigns(id, name, color, icon)
          `)
          .in('content_id', contentIds);

        if (campaignData) {
          campaignData.forEach((item: any) => {
            campaignMap[item.content_id] = item.campaign;
          });
        }
      }

      // Merge campaign data with schedule data
      const enrichedData = scheduleData?.map((item: any) => ({
        ...item,
        campaign: campaignMap[item.content_id] || null,
      }));

      setScheduledContent(enrichedData as any || []);
    } catch (error) {
      console.error('Error fetching scheduled content:', error);
    } finally {
      setLoading(false);
    }
  }

  const getContentForDay = (day: Date) => {
    return scheduledContent.filter((content) =>
      isSameDay(new Date(content.scheduled_date), day)
    );
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Calendar</h1>
          <p className="mt-2 text-gray-600">
            Schedule and track content across all channels
          </p>
        </div>
        <Link
          href="/marketing/calendar/new"
          className="px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          + Schedule Content
        </Link>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentWeekStart, 'MMMM d')} -{' '}
              {format(weekEnd, 'MMMM d, yyyy')}
            </h2>
            <p className="text-sm text-gray-600">
              Week {format(currentWeekStart, 'w')} of {format(currentWeekStart, 'yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Previous
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={goToNextWeek}
              className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Week Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm font-medium text-blue-800 mb-1">Scheduled</div>
          <div className="text-2xl font-bold text-blue-900">
            {scheduledContent.filter((c) => c.status === 'scheduled').length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm font-medium text-green-800 mb-1">Published</div>
          <div className="text-2xl font-bold text-green-900">
            {scheduledContent.filter((c) => c.status === 'published').length}
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm font-medium text-gray-800 mb-1">
            Total This Week
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {scheduledContent.length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm font-medium text-purple-800 mb-1">
            Completion Rate
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {scheduledContent.length > 0
              ? Math.round(
                  (scheduledContent.filter((c) => c.status === 'published').length /
                    scheduledContent.length) *
                    100
                )
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poultryco-green"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-4">
          {daysOfWeek.map((day) => {
            const dayContent = getContentForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toString()}
                className={`bg-white rounded-lg border-2 p-4 min-h-[200px] ${
                  isToday ? 'border-poultryco-green' : 'border-gray-200'
                }`}
              >
                {/* Day Header */}
                <div className="mb-3 pb-2 border-b border-gray-200">
                  <div
                    className={`text-xs font-medium uppercase ${
                      isToday ? 'text-poultryco-green' : 'text-gray-500'
                    }`}
                  >
                    {format(day, 'EEE')}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      isToday ? 'text-poultryco-green' : 'text-gray-900'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                  {dayContent.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {dayContent.length} post{dayContent.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Content Items */}
                <div className="space-y-2">
                  {dayContent.map((item) => (
                    <Link
                      key={item.id}
                      href={`/marketing/calendar/${item.id}`}
                      className="block p-2 bg-gray-50 rounded border-2 hover:bg-gray-100 transition-colors"
                      style={{
                        borderColor: item.campaign?.color || '#e5e7eb',
                        borderLeftWidth: item.campaign ? '4px' : '2px',
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          {item.scheduled_time && (
                            <div className="text-xs text-gray-500 mb-1">
                              {format(
                                new Date(`2000-01-01T${item.scheduled_time}`),
                                'h:mm a'
                              )}
                            </div>
                          )}
                          <div className="text-xs font-medium text-gray-900 truncate">
                            {item.content.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {item.channel.name} • {item.content.content_types?.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`inline-block px-1.5 py-0.5 text-xs rounded border ${
                                STATUS_COLORS[item.status]
                              }`}
                            >
                              {item.status}
                            </span>
                            {item.campaign && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded"
                                style={{
                                  backgroundColor: `${item.campaign.color}20`,
                                  color: item.campaign.color,
                                }}
                              >
                                <span>{item.campaign.icon}</span>
                                <span className="truncate max-w-[80px]">
                                  {item.campaign.name}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && scheduledContent.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No content scheduled this week
          </h3>
          <p className="text-gray-600 mb-4">
            Start scheduling content to fill up your calendar
          </p>
          <Link
            href="/marketing/calendar/new"
            className="inline-block px-4 py-2 bg-poultryco-green text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            + Schedule Content
          </Link>
        </div>
      )}
    </div>
  );
}

