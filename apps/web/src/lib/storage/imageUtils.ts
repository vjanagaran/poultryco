/**
 * Image Utilities for Profile Photos
 * Handles image validation, conversion to WebP, resizing, and upload to S3 via API
 */

import { uploadProfilePhoto, uploadCoverPhoto } from '@/lib/api/upload';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const AVATAR_SIZE = 400; // Square avatar
const COVER_WIDTH = 1500;
const COVER_HEIGHT = 500;

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Validate image file
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
  }

  return { valid: true };
}

/**
 * Convert image to WebP format with resizing
 */
export async function convertToWebP(
  file: File,
  maxWidth: number,
  maxHeight?: number,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Calculate dimensions
        let width = img.width;
        let height = img.height;

        if (maxHeight) {
          // For cover photos - maintain aspect ratio
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = width * ratio;
          height = height * ratio;
        } else {
          // For avatars - square crop
          const size = Math.min(width, height);
          const offsetX = (width - size) / 2;
          const offsetY = (height - size) / 2;

          canvas.width = maxWidth;
          canvas.height = maxWidth;

          ctx.drawImage(
            img,
            offsetX,
            offsetY,
            size,
            size,
            0,
            0,
            maxWidth,
            maxWidth
          );

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert image'));
              }
            },
            'image/webp',
            quality
          );
          return;
        }

        // For cover photos
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image'));
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload avatar to S3 via API
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<ImageUploadResult> {
  try {
    // Validate
    const validation = validateImage(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Convert to WebP
    const webpBlob = await convertToWebP(file, AVATAR_SIZE);
    
    // Convert blob to File
    const webpFile = new File([webpBlob], 'avatar.webp', { type: 'image/webp' });

    // Upload via API
    const result = await uploadProfilePhoto(webpFile);
    
    // Add timestamp to bust cache
    const url = `${result.cdnUrl || result.url}?t=${Date.now()}`;

    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload avatar',
    };
  }
}

/**
 * Upload cover photo to S3 via API
 */
export async function uploadCover(
  file: File,
  userId: string
): Promise<ImageUploadResult> {
  try {
    // Validate
    const validation = validateImage(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Convert to WebP
    const webpBlob = await convertToWebP(file, COVER_WIDTH, COVER_HEIGHT);
    
    // Convert blob to File
    const webpFile = new File([webpBlob], 'cover.webp', { type: 'image/webp' });

    // Upload via API
    const result = await uploadCoverPhoto(webpFile);
    
    // Add timestamp to bust cache
    const url = `${result.cdnUrl || result.url}?t=${Date.now()}`;

    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload cover photo',
    };
  }
}

/**
 * Delete a photo (via API if upload ID is provided, otherwise just return success)
 * Note: For now, we'll rely on the API to handle deletions via upload ID
 */
export async function deletePhoto(
  uploadId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { deleteFile } = await import('@/lib/api/upload');
    await deleteFile(uploadId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete photo',
    };
  }
}

/**
 * Get avatar URL for a user
 * Note: This is now handled by the API/CDN, so we return a placeholder
 * The actual URL should come from the profile data
 */
export function getAvatarUrl(userId: string): string {
  // Return placeholder - actual URL should come from profile data
  return `/api/placeholder/avatar/${userId}`;
}

/**
 * Get cover URL for a user
 * Note: This is now handled by the API/CDN, so we return a placeholder
 * The actual URL should come from the profile data
 */
export function getCoverUrl(userId: string): string {
  // Return placeholder - actual URL should come from profile data
  return `/api/placeholder/cover/${userId}`;
}

