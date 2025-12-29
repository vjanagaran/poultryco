import { apiClient } from './client';

export interface UploadResponse {
  url: string;
  path: string;
  uploadId?: string;
}

/**
 * Upload a file to S3 via API
 */
export async function uploadFile(
  file: File,
  type: 'profile-photo' | 'cover-photo' | 'post-media' | 'document' = 'post-media',
  folder?: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(`${apiClient['baseUrl']}/upload/${type}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiClient.getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

/**
 * Get presigned URL for client-side upload
 */
export async function getPresignedUrl(
  fileName: string,
  contentType: string,
  folder?: string
): Promise<{ url: string; key: string }> {
  return apiClient.post('/upload/presigned-url', {
    fileName,
    contentType,
    folder: folder || 'uploads',
  });
}

/**
 * Delete uploaded file
 */
export async function deleteUpload(uploadId: string): Promise<void> {
  await apiClient.delete(`/upload/${uploadId}`);
}

