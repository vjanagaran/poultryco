'use client';

import { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';

interface AboutSectionProps {
  profile: any;
  isOwner: boolean;
}

export function AboutSection({ profile, isOwner }: AboutSectionProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  if (!profile.bio && !isOwner) return null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">About</h2>
          {isOwner && (
            <button
              onClick={() => setShowEditModal(true)}
              className="text-gray-600 hover:text-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>

        {profile.bio ? (
          <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
        ) : (
          isOwner && (
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-green-500 hover:text-green-600 transition-colors"
            >
              + Add a summary about yourself to help others understand your expertise
            </button>
          )
        )}
      </div>

      {showEditModal && (
        <EditAboutModal
          bio={profile.bio || ''}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}

// Edit About Modal
function EditAboutModal({ bio, onClose }: { bio: string; onClose: () => void }) {
  const { updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(bio);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile({ bio: value });
      onClose();
    } catch (error) {
      console.error('Error updating bio:', error);
      alert('Failed to update about section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Edit About</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Tell us about your experience in the poultry industry..."
            rows={8}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">{value.length}/500 characters</p>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

