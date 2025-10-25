'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
  loading: boolean;
}

export default function PhotoHeadlineStep({ data, onNext, onBack, loading }: Props) {
  const [formData, setFormData] = useState({
    headline: data.headline || '',
    bio: data.bio || '',
    profile_photo_url: data.profile_photo_url || null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cdn.poultryco.net')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cdn.poultryco.net')
        .getPublicUrl(filePath);

      setFormData({ ...formData, profile_photo_url: publicUrl });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Photo & Headline</h2>
        <p className="text-gray-600">Add a photo and tell us about yourself</p>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Profile Photo
        </label>
        <div className="flex items-start gap-6">
          <div className="relative">
            {formData.profile_photo_url ? (
              <img
                src={formData.profile_photo_url}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-green-500"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {data.full_name?.[0] || 'U'}
                </span>
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : formData.profile_photo_url ? 'Change Photo' : 'Upload Photo'}
            </button>
            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG or GIF. Max size 5MB.
            </p>
            {uploadError && (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Headline */}
      <div>
        <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
          Professional Headline
        </label>
        <input
          id="headline"
          name="headline"
          type="text"
          maxLength={150}
          value={formData.headline}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="e.g., Broiler Farmer | 15 years experience | Namakkal"
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.headline.length}/150 characters
        </p>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          About You
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          value={formData.bio}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Tell the community about yourself, your experience, and what you're looking for..."
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.bio.length}/500 characters
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>
      </div>
    </form>
  );
}

