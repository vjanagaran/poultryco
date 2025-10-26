'use client';

import { useState } from 'react';
import Image from 'next/image';
import { uploadToStorage } from '@/lib/storageUtils';

interface PhotosStepProps {
  data: any;
  onChange: (data: any) => void;
}

export default function PhotosStep({ data, onChange }: PhotosStepProps) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      // For now, we'll upload to a temporary folder. The actual business ID will be used later.
      const tempId = `temp-${Date.now()}`;
      const result = await uploadToStorage(file, 'business-logos', tempId);
      
      if (result.success && result.url) {
        onChange({ ...data, logo_url: result.url });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const tempId = `temp-${Date.now()}`;
      const result = await uploadToStorage(file, 'business-covers', tempId);
      
      if (result.success && result.url) {
        onChange({ ...data, cover_photo_url: result.url });
      }
    } catch (error) {
      console.error('Error uploading cover:', error);
      alert('Failed to upload cover photo');
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Photos</h2>
        <p className="text-gray-600">Add a logo and cover photo to make your profile stand out</p>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Business Logo
        </label>
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
            {data.logo_url ? (
              <Image
                src={data.logo_url}
                alt="Business logo"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4">
                <span className="text-4xl text-gray-400">🏢</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="hidden"
              />
              <span className="font-medium text-gray-700">
                {uploadingLogo ? 'Uploading...' : data.logo_url ? 'Change Logo' : 'Upload Logo'}
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Recommended: Square image, at least 200x200px
              <br />
              Max file size: 5MB
            </p>
          </div>
        </div>
      </div>

      {/* Cover Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Cover Photo
        </label>
        <div className="space-y-4">
          <div className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
            {data.cover_photo_url ? (
              <Image
                src={data.cover_photo_url}
                alt="Cover photo"
                width={800}
                height={192}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-8">
                <span className="text-5xl text-gray-400">🌅</span>
                <p className="text-sm text-gray-500 mt-2">No cover photo uploaded</p>
              </div>
            )}
          </div>
          <div>
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={uploadingCover}
                className="hidden"
              />
              <span className="font-medium text-gray-700">
                {uploadingCover ? 'Uploading...' : data.cover_photo_url ? 'Change Cover Photo' : 'Upload Cover Photo'}
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Recommended: 1200x300px or wider
              <br />
              Max file size: 10MB
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Photos are optional but highly recommended. Businesses with photos get 10x more engagement!
        </p>
      </div>
    </div>
  );
}

