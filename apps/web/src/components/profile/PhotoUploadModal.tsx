'use client';

import { useState, useRef, DragEvent } from 'react';
import { uploadAvatar, uploadCover, validateImage } from '@/lib/storage/imageUtils';

interface PhotoUploadModalProps {
  type: 'avatar' | 'cover';
  userId: string;
  currentUrl?: string;
  onSuccess: (url: string) => void;
  onClose: () => void;
}

export default function PhotoUploadModal({
  type,
  userId,
  currentUrl,
  onSuccess,
  onClose,
}: PhotoUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate
    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Set file and preview
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    const uploadFn = type === 'avatar' ? uploadAvatar : uploadCover;
    const result = await uploadFn(selectedFile, userId);

    setUploading(false);

    if (result.success && result.url) {
      onSuccess(result.url);
      onClose();
    } else {
      setError(result.error || 'Upload failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Upload {type === 'avatar' ? 'Profile Photo' : 'Cover Photo'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={uploading}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {preview ? (
            <div className="space-y-4">
              <div className={`mx-auto ${type === 'avatar' ? 'w-48 h-48' : 'w-full h-64'} relative`}>
                <img
                  src={preview}
                  alt="Preview"
                  className={`w-full h-full object-cover ${type === 'avatar' ? 'rounded-full' : 'rounded-lg'}`}
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-orange-600 hover:text-orange-700 font-medium"
                disabled={uploading}
              >
                Choose a different photo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Click to upload
                </button>
                <span className="text-gray-600"> or drag and drop</span>
              </div>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF or WebP (max. 10MB)
                {type === 'avatar' && ' • Will be cropped to square'}
                {type === 'cover' && ' • Recommended: 1500x500px'}
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Save Photo'}
          </button>
        </div>
      </div>
    </div>
  );
}

