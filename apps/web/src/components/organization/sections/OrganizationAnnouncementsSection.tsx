'use client';

import { OrganizationProfile } from '../OrganizationProfileView';

interface OrganizationAnnouncementsSectionProps {
  organization: OrganizationProfile;
  isOwner: boolean;
}

export function OrganizationAnnouncementsSection({ organization, isOwner }: OrganizationAnnouncementsSectionProps) {
  const announcements = organization.announcements?.filter(a => a.is_published)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .slice(0, 5) || [];
  
  if (!announcements.length && !isOwner) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Announcements</h2>
        {isOwner && (
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">
            ➕ New Announcement
          </button>
        )}
      </div>

      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="border-b last:border-b-0 pb-4 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-2">{announcement.content}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>📅 {formatDate(announcement.published_at)}</span>
                    {announcement.announcement_type && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded capitalize">
                        {announcement.announcement_type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-4">
          No announcements yet. {isOwner && 'Click "New Announcement" to share updates with members.'}
        </p>
      )}
    </div>
  );
}

