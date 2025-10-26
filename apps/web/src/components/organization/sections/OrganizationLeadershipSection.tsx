'use client';

import Image from 'next/image';
import Link from 'next/link';
import { OrganizationProfile } from '../OrganizationProfileView';

interface OrganizationLeadershipSectionProps {
  organization: OrganizationProfile;
  isOwner: boolean;
}

export function OrganizationLeadershipSection({ organization, isOwner }: OrganizationLeadershipSectionProps) {
  const visibleLeadership = organization.leadership?.filter(leader => leader.show_on_page) || [];
  const currentLeadership = visibleLeadership.filter(leader => leader.is_current);
  
  if (!currentLeadership.length && !isOwner) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Leadership</h2>
        {isOwner && (
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">
            ➕ Add Leader
          </button>
        )}
      </div>

      {currentLeadership.length > 0 ? (
        <div className="space-y-4">
          {currentLeadership.map((leader) => (
            <Link
              key={leader.id}
              href={`/me/${leader.profile.profile_slug}`}
              className="block hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0">
                  {leader.profile.profile_photo_url ? (
                    <Image
                      src={leader.profile.profile_photo_url}
                      alt={leader.profile.full_name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      {leader.profile.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">{leader.profile.full_name}</h3>
                  <p className="text-xs text-green-600 font-medium">{leader.position_title}</p>
                  {leader.profile.headline && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{leader.profile.headline}</p>
                  )}
                  {leader.term_start_date && (
                    <p className="text-xs text-gray-400 mt-1">
                      Since {new Date(leader.term_start_date).getFullYear()}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm text-center py-4">
          No leadership added yet. {isOwner && 'Click "Add Leader" to get started.'}
        </p>
      )}
    </div>
  );
}

