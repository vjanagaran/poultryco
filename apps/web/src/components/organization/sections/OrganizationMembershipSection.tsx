'use client';

import { OrganizationProfile } from '../OrganizationProfileView';

interface OrganizationMembershipSectionProps {
  organization: OrganizationProfile;
  isOwner: boolean;
  currentUserId: string | null;
}

export function OrganizationMembershipSection({ organization, isOwner, currentUserId }: OrganizationMembershipSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Membership</h2>
      </div>

      {/* Membership Stats */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-gray-600">Total Members</span>
          <span className="font-semibold text-gray-900">{organization.member_count || 0}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b">
          <span className="text-gray-600">Individual Members</span>
          <span className="font-semibold text-gray-900">
            {organization.members?.filter(m => m.member_type === 'individual').length || 0}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-600">Business Members</span>
          <span className="font-semibold text-gray-900">
            {organization.members?.filter(m => m.member_type === 'business').length || 0}
          </span>
        </div>
      </div>

      {/* Join Button */}
      {!isOwner && currentUserId && (
        <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors">
          Request to Join
        </button>
      )}

      {isOwner && (
        <button className="w-full px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
          Manage Members
        </button>
      )}
    </div>
  );
}

