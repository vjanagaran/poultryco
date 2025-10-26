/**
 * Image Utilities for Profile Photos
 * Handles image validation, conversion to WebP, resizing, and upload to Supabase Storage
 */

import { createClient } from '@/lib/supabase/client';

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
 * Upload avatar to Supabase Storage
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

    // Upload to Supabase
    const supabase = createClient();
    const path = `profiles/${userId}/avatar.webp`;

    // Delete old avatar if exists
    await supabase.storage.from('cdn-poultryco').remove([path]);

    // Upload new avatar
    const { error: uploadError } = await supabase.storage
      .from('cdn-poultryco')
      .upload(path, webpBlob, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cdn-poultryco')
      .getPublicUrl(path);

    // Add timestamp to bust cache
    const url = `${publicUrl}?t=${Date.now()}`;

    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload avatar',
    };
  }
}

/**
 * Upload cover photo to Supabase Storage
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

    // Upload to Supabase
    const supabase = createClient();
    const path = `profiles/${userId}/cover.webp`;

    // Delete old cover if exists
    await supabase.storage.from('cdn-poultryco').remove([path]);

    // Upload new cover
    const { error: uploadError } = await supabase.storage
      .from('cdn-poultryco')
      .upload(path, webpBlob, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cdn-poultryco')
      .getPublicUrl(path);

    // Add timestamp to bust cache
    const url = `${publicUrl}?t=${Date.now()}`;

    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload cover photo',
    };
  }
}

/**
 * Delete a photo from Supabase Storage
 */
export async function deletePhoto(
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.storage.from('cdn-poultryco').remove([path]);

    if (error) {
      return { success: false, error: error.message };
    }

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
 */
export function getAvatarUrl(userId: string): string {
  const supabase = createClient();
  const { data: { publicUrl } } = supabase.storage
    .from('cdn-poultryco')
    .getPublicUrl(`profiles/${userId}/avatar.webp`);
  
  return publicUrl;
}

/**
 * Get cover URL for a user
 */
export function getCoverUrl(userId: string): string {
  const supabase = createClient();
  const { data: { publicUrl } } = supabase.storage
    .from('cdn-poultryco')
    .getPublicUrl(`profiles/${userId}/cover.webp`);
  
  return publicUrl;
}

