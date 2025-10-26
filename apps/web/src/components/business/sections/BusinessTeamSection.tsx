'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BusinessProfile } from '../BusinessProfileView';
import { InviteTeamMemberModal } from '../modals/InviteTeamMemberModal';
import { EditTeamMemberModal } from '../modals/EditTeamMemberModal';
import { useRouter } from 'next/navigation';

interface BusinessTeamSectionProps {
  business: BusinessProfile;
  isOwner: boolean;
}

export function BusinessTeamSection({ business, isOwner }: BusinessTeamSectionProps) {
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const visibleTeam = business.team?.filter(member => member.show_on_page) || [];

  if (visibleTeam.length === 0 && !isOwner) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Team</h2>
          {isOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              ➕ Invite Team Member
            </button>
          )}
        </div>

      {visibleTeam.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleTeam.map((member) => (
            <div key={member.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0">
                {member.profile.profile_photo_url ? (
                  <Image
                    src={member.profile.profile_photo_url}
                    alt={member.profile.full_name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                    {member.profile.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{member.profile.full_name}</h3>
                  {member.is_admin && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                      Admin
                    </span>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setShowEditModal(true);
                      }}
                      className="ml-auto opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                      title="Edit member"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600">{member.role_title}</p>
                {member.department && (
                  <p className="text-xs text-gray-500">{member.department}</p>
                )}
                {member.profile.headline && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {member.profile.headline}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic text-center py-8">
          No team members added yet. {isOwner && 'Click "Invite Team Member" to get started.'}
        </p>
      )}
      </div>

      {/* Invite Team Member Modal */}
      <InviteTeamMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        businessId={business.id}
        businessName={business.business_name}
        onMemberInvited={() => router.refresh()}
      />

      {/* Edit Team Member Modal */}
      {selectedMember && (
        <EditTeamMemberModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedMember(null);
          }}
          member={selectedMember}
          businessId={business.id}
          onMemberUpdated={() => router.refresh()}
        />
      )}
    </>
  );
}

