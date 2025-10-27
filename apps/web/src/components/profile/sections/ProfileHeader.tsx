'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import PhotoUploadModal from '../PhotoUploadModal';
import { getPublicUrl } from '@/lib/supabase/storage';
import { sendConnectionRequest, checkConnectionStatus } from '@/lib/api/connections';

interface ProfileHeaderProps {
  profile: any;
  isOwner: boolean;
}

export function ProfileHeader({ profile, isOwner }: ProfileHeaderProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    exists: boolean;
    status?: string;
    isRequester?: boolean;
  }>({ exists: false });
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  
  // Check connection status on mount
  useEffect(() => {
    if (!isOwner && user && profile?.id) {
      checkConnectionStatus(profile.id).then(result => {
        setConnectionStatus(result);
      });
    }
  }, [isOwner, user, profile?.id]);

  const handleAvatarSuccess = async (url: string) => {
    await updateProfile({ profile_photo_url: url });
  };

  const handleCoverSuccess = async (url: string) => {
    await updateProfile({ cover_photo_url: url });
  };

  // Get proper URLs for images
  const coverPhotoUrl = getPublicUrl(profile.cover_photo_url);
  const profilePhotoUrl = getPublicUrl(profile.profile_photo_url);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await sendConnectionRequest(profile.id);
      
      if (result.success) {
        setConnectionStatus({ exists: true, status: 'pending', isRequester: true });
      } else {
        if (result.error === 'Not authenticated') {
          alert('Please login to connect');
        } else if (result.error === 'Connection already exists') {
          setConnectionStatus({ exists: true, status: 'pending' });
        } else {
          alert(result.error || 'Failed to send connection request');
        }
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to send connection request');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gradient-to-r from-green-400 to-blue-500">
          {coverPhotoUrl && (
            <Image
              src={coverPhotoUrl}
              alt="Cover"
              fill
              className="object-cover"
              priority
              unoptimized
              onError={(e) => {
                console.error('Cover image failed to load:', coverPhotoUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          {isOwner && (
            <button
              onClick={() => setShowCoverUpload(true)}
              className="absolute top-4 right-4 bg-white rounded-lg px-4 py-2 shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {profile.cover_photo_url ? 'Edit cover' : 'Add cover'}
              </span>
            </button>
          )}
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Profile Photo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 sm:-mt-20 mb-4">
            <div className="relative">
              {profilePhotoUrl ? (
                <Image
                  src={profilePhotoUrl}
                  alt={profile.full_name || 'Profile'}
                  width={160}
                  height={160}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-white object-cover"
                  priority
                  unoptimized
                  onError={(e) => {
                    console.error('Profile image failed to load:', profilePhotoUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-bold text-white">
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {isOwner && (
                <button
                  onClick={() => setShowAvatarUpload(true)}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Edit Button (Desktop) */}
            {isOwner && (
              <button
                onClick={() => setShowEditModal(true)}
                className="hidden sm:block ml-auto mb-2 px-6 py-2 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
              >
                ✏️ Edit Profile
              </button>
            )}
            
            {/* Connect Button (Desktop) */}
            {!isOwner && (
              <button
                onClick={handleConnect}
                disabled={isConnecting || connectionStatus.exists}
                className={`hidden sm:block ml-auto mb-2 px-6 py-2 font-semibold rounded-lg transition-colors ${
                  connectionStatus.exists
                    ? connectionStatus.status === 'connected'
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {isConnecting ? 'Sending...' : 
                 connectionStatus.status === 'connected' ? '✓ Connected' :
                 connectionStatus.status === 'pending' && connectionStatus.isRequester ? '✓ Request Sent' :
                 connectionStatus.status === 'pending' ? 'Pending Approval' :
                 '🤝 Connect'}
              </button>
            )}
          </div>

          {/* Name & Headline */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {profile.full_name}
            </h1>
            {profile.headline ? (
              <p className="text-lg text-gray-700 mb-2">{profile.headline}</p>
            ) : (
              isOwner && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-lg text-gray-400 hover:text-green-600 transition-colors mb-2"
                >
                  + Add a headline to help others understand what you do
                </button>
              )
            )}
            <p className="text-gray-600">
              📍 {profile.location_city && `${profile.location_city}, `}
              {profile.location_district && `${profile.location_district}, `}
              {profile.location_state}
            </p>
          </div>

          {/* Edit Button (Mobile) */}
          {isOwner && (
            <button
              onClick={() => setShowEditModal(true)}
              className="sm:hidden w-full mt-4 px-6 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
            >
              ✏️ Edit Profile
            </button>
          )}
          
          {/* Connect Button (Mobile) */}
          {!isOwner && (
            <button
              onClick={handleConnect}
              disabled={isConnecting || connectionStatus.exists}
              className={`sm:hidden w-full mt-4 px-6 py-3 font-semibold rounded-lg transition-colors ${
                connectionStatus.exists
                  ? connectionStatus.status === 'connected'
                    ? 'bg-green-100 text-green-700 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {isConnecting ? 'Sending...' : 
               connectionStatus.status === 'connected' ? '✓ Connected' :
               connectionStatus.status === 'pending' && connectionStatus.isRequester ? '✓ Request Sent' :
               connectionStatus.status === 'pending' ? 'Pending Approval' :
               '🤝 Connect'}
            </button>
          )}

          {/* Contact Info */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            {profile.email && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {isOwner || profile.is_public ? profile.email : 'Contact'}
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {isOwner || profile.is_public ? profile.phone : 'Contact'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Avatar Upload Modal */}
      {showAvatarUpload && user && (
        <PhotoUploadModal
          type="avatar"
          userId={user.id}
          currentUrl={profile.profile_photo_url}
          onSuccess={handleAvatarSuccess}
          onClose={() => setShowAvatarUpload(false)}
        />
      )}

      {/* Cover Upload Modal */}
      {showCoverUpload && user && (
        <PhotoUploadModal
          type="cover"
          userId={user.id}
          currentUrl={profile.cover_photo_url}
          onSuccess={handleCoverSuccess}
          onClose={() => setShowCoverUpload(false)}
        />
      )}
    </>
  );
}

// Edit Profile Modal Component
function EditProfileModal({ profile, onClose }: { profile: any; onClose: () => void }) {
  const { updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    headline: profile.headline || '',
    bio: profile.bio || '',
    location_city: profile.location_city || '',
    location_district: profile.location_district || '',
    whatsapp_number: profile.whatsapp_number || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateProfile(formData);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Headline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Headline *
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="E.g., Poultry Farmer & Veterinary Consultant"
              maxLength={150}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.headline.length}/150 characters</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about your experience in the poultry industry..."
              rows={5}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City/Town
              </label>
              <input
                type="text"
                value={formData.location_city}
                onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                placeholder="E.g., Namakkal"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <input
                type="text"
                value={formData.location_district}
                onChange={(e) => setFormData({ ...formData, location_district: e.target.value })}
                placeholder="E.g., Namakkal"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="+91 98842 48927"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
