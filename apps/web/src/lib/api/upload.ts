/**
 * Upload API - File uploads to S3 via API
 * Replaces Supabase storage
 */

import { apiClient } from './client';

export interface UploadResult {
  id: string;
  url: string;
  cdnUrl?: string;
  key: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

/**
 * Upload profile photo
 */
export async function uploadProfilePhoto(file: File): Promise<UploadResult> {
  return apiClient.uploadFile('/upload/profile-photo', file, 'file');
}

/**
 * Upload cover photo
 */
export async function uploadCoverPhoto(file: File): Promise<UploadResult> {
  return apiClient.uploadFile('/upload/cover-photo', file, 'file');
}

/**
 * Upload post media (up to 5 files)
 */
export async function uploadPostMedia(files: File[]): Promise<UploadResult[]> {
  const result = await apiClient.uploadFiles('/upload/post-media', files, 'files');
  return Array.isArray(result) ? result : [result];
}

/**
 * Upload document
 */
export async function uploadDocument(file: File): Promise<UploadResult> {
  return apiClient.uploadFile('/upload/document', file, 'file');
}

/**
 * Get presigned URL for direct client-side upload
 */
export async function getPresignedUrl(data: {
  fileName: string;
  contentType: string;
  folder: string;
}): Promise<{
  uploadUrl: string;
  cdnUrl: string;
  key: string;
}> {
  return apiClient.post('/upload/presigned-url', data);
}

/**
 * Delete uploaded file
 */
export async function deleteFile(uploadId: string): Promise<void> {
  return apiClient.delete(`/upload/${uploadId}`);
}

