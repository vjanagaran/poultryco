'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BusinessProfile } from '../BusinessProfileView';
import { apiClient } from '@/lib/api/client';
import { uploadToStorage } from '@/lib/storageUtils';

interface BusinessHeaderProps {
  business: BusinessProfile;
  isOwner: boolean;
}

export function BusinessHeader({ business, isOwner }: BusinessHeaderProps) {
  const router = useRouter();
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const result = await uploadToStorage(file, 'business-covers', business.id);
      
      if (result.success && result.url) {
        await apiClient.put(`/businesses/${business.id}`, {
          coverPhotoUrl: result.url,
        });
        
        router.refresh();
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      alert('Failed to upload cover photo');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const result = await uploadToStorage(file, 'business-logos', business.id);
      
      if (result.success && result.url) {
        await apiClient.put(`/businesses/${business.id}`, {
          logoUrl: result.url,
        });
        
        router.refresh();
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleContactBusiness = () => {
    // Navigate to messages with the primary contact or owner
    const primaryContact = business.contact_persons?.find(cp => cp.is_primary);
    const contactPersonId = primaryContact?.profile.id || business.owner_id;
    
    router.push(`/messages?start_with=${contactPersonId}&context=business_inquiry&business_id=${business.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-48 bg-gradient-to-br from-green-500 to-blue-600">
        {business.cover_photo_url && (
          <Image
            src={business.cover_photo_url}
            alt={`${business.business_name} cover`}
            fill
            className="object-cover"
          />
        )}
        {isOwner && (
          <label className="absolute top-4 right-4 px-4 py-2 bg-white/90 hover:bg-white rounded-lg cursor-pointer transition-colors backdrop-blur-sm">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
              disabled={uploadingCover}
            />
            <span className="text-sm font-medium text-gray-700">
              {uploadingCover ? '⏳ Uploading...' : '📷 Change Cover'}
            </span>
          </label>
        )}
      </div>

      {/* Business Info */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo */}
          <div className="relative">
            <div className="w-32 h-32 rounded-lg border-4 border-white shadow-lg bg-white overflow-hidden -mt-20">
              {business.logo_url ? (
                <Image
                  src={business.logo_url}
                  alt={business.business_name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 text-white text-3xl font-bold">
                  {business.business_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {isOwner && (
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                />
                <span className="text-white text-lg">
                  {uploadingLogo ? '⏳' : '📷'}
                </span>
              </label>
            )}
          </div>

          {/* Name, Tagline, Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900 truncate">
                    {business.business_name}
                  </h1>
                  {business.is_verified && (
                    <svg className="w-7 h-7 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                {business.tagline && (
                  <p className="text-lg text-gray-600 mt-1">{business.tagline}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="capitalize">{business.business_type.replace(/_/g, ' ')}</span>
                  {business.company_size && <span>• {business.company_size} employees</span>}
                  {business.founded_year && <span>• Founded {business.founded_year}</span>}
                  {business.contact?.headquarters_state && (
                    <span>• {business.contact.headquarters_state}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isOwner && (
                  <>
                    <button
                      onClick={handleContactBusiness}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      💬 Contact Business
                    </button>
                    <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
                      ⭐ Follow
                    </button>
                  </>
                )}
                {isOwner && (
                  <button
                    onClick={() => router.push(`/com/${business.business_slug}/edit`)}
                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Website Link */}
            {business.website_url && (
              <div className="mt-4">
                <a
                  href={business.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {business.website_url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

