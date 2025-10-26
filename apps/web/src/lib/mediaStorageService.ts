/**
 * Media Storage Service for Messaging
 * 
 * Handles upload, download, and caching of media files for chat messages
 * with optimized folder structure and offline support
 */

import { createClient } from '@/lib/supabase/client';
import imageCompression from 'browser-image-compression';

// =====================================================
// CDN FOLDER STRUCTURE
// =====================================================

/**
 * Optimized folder structure for cdn-poultryco bucket:
 * 
 * cdn-poultryco/
 * ├── chats/
 * │   ├── direct/                          # One-on-one chats
 * │   │   ├── {userId1}_{userId2}/         # Sorted user IDs
 * │   │   │   ├── images/
 * │   │   │   │   ├── {timestamp}_{messageId}.webp
 * │   │   │   │   └── {timestamp}_{messageId}_thumb.webp
 * │   │   │   ├── videos/
 * │   │   │   │   ├── {timestamp}_{messageId}.mp4
 * │   │   │   │   └── {timestamp}_{messageId}_thumb.jpg
 * │   │   │   ├── documents/
 * │   │   │   │   └── {timestamp}_{messageId}_{originalName}
 * │   │   │   └── audio/
 * │   │   │       └── {timestamp}_{messageId}.mp3
 * │   ├── groups/                          # Group chats
 * │   │   ├── {groupId}/
 * │   │   │   ├── images/
 * │   │   │   ├── videos/
 * │   │   │   ├── documents/
 * │   │   │   └── audio/
 * │   └── temp/                            # Temporary uploads (auto-cleanup)
 * │       └── {userId}/
 * │           └── {timestamp}_{randomId}.*
 * └── group-photos/                        # Group profile photos
 *     └── {groupId}/
 *         ├── original.{ext}
 *         └── thumbnail.webp
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface MediaUploadResult {
  url: string;
  thumbnailUrl?: string;
  path: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  cached: boolean;
}

export interface MediaMetadata {
  files: Array<{
    url: string;
    type: string;
    size: number;
    width?: number;
    height?: number;
    thumbnail?: string;
    name: string;
    cached: boolean;
  }>;
}

export type MediaType = 'image' | 'video' | 'document' | 'audio';

// =====================================================
// STORAGE CONFIGURATION
// =====================================================

const STORAGE_CONFIG = {
  BUCKET_NAME: 'cdn-poultryco',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,  // 5MB for images
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB for videos
  IMAGE_QUALITY: 0.85,
  THUMBNAIL_SIZE: 300,
  IMAGE_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  VIDEO_FORMATS: ['video/mp4', 'video/quicktime', 'video/webm'],
  DOCUMENT_FORMATS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  AUDIO_FORMATS: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Generate conversation folder path
 */
function getConversationPath(conversationId: string, isGroup: boolean, userId?: string, otherUserId?: string): string {
  if (isGroup) {
    return `chats/groups/${conversationId}`;
  } else {
    // Sort user IDs for consistent paths
    const sortedIds = [userId, otherUserId].sort().join('_');
    return `chats/direct/${sortedIds}`;
  }
}

/**
 * Generate file path based on media type
 */
function getMediaFilePath(
  conversationPath: string,
  mediaType: MediaType,
  messageId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const ext = fileName.split('.').pop();
  const mediaFolder = `${mediaType}s`; // images, videos, documents, audios
  
  // Generate clean filename
  const cleanFileName = `${timestamp}_${messageId}.${ext}`;
  
  return `${conversationPath}/${mediaFolder}/${cleanFileName}`;
}

/**
 * Determine media type from file
 */
function getMediaType(file: File): MediaType {
  const mimeType = file.type;
  
  if (STORAGE_CONFIG.IMAGE_FORMATS.includes(mimeType)) return 'image';
  if (STORAGE_CONFIG.VIDEO_FORMATS.includes(mimeType)) return 'video';
  if (STORAGE_CONFIG.AUDIO_FORMATS.includes(mimeType)) return 'audio';
  return 'document';
}

/**
 * Validate file size
 */
function validateFileSize(file: File, mediaType: MediaType): boolean {
  switch (mediaType) {
    case 'image':
      return file.size <= STORAGE_CONFIG.MAX_IMAGE_SIZE;
    case 'video':
      return file.size <= STORAGE_CONFIG.MAX_VIDEO_SIZE;
    default:
      return file.size <= STORAGE_CONFIG.MAX_FILE_SIZE;
  }
}

/**
 * Compress image
 */
async function compressImage(file: File): Promise<File> {
  try {
    const options = {
      maxSizeMB: STORAGE_CONFIG.MAX_IMAGE_SIZE / (1024 * 1024),
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp',
      quality: STORAGE_CONFIG.IMAGE_QUALITY,
    };
    
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Image compression error:', error);
    return file;
  }
}

/**
 * Generate thumbnail for image
 */
async function generateThumbnail(file: File): Promise<File> {
  try {
    const options = {
      maxSizeMB: 0.1, // 100KB max for thumbnail
      maxWidthOrHeight: STORAGE_CONFIG.THUMBNAIL_SIZE,
      useWebWorker: true,
      fileType: 'image/webp',
      quality: 0.7,
    };
    
    return await imageCompression(file, options);
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw error;
  }
}

/**
 * Get image dimensions
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

// =====================================================
// MAIN UPLOAD FUNCTION
// =====================================================

/**
 * Upload media file to CDN with optimized structure
 */
export async function uploadMediaFile(
  file: File,
  conversationId: string,
  messageId: string,
  isGroup: boolean,
  userId: string,
  otherUserId?: string
): Promise<MediaUploadResult> {
  const supabase = createClient();
  
  // Determine media type
  const mediaType = getMediaType(file);
  
  // Validate file size
  if (!validateFileSize(file, mediaType)) {
    throw new Error(`File size exceeds limit for ${mediaType}`);
  }
  
  // Get conversation path
  const conversationPath = getConversationPath(conversationId, isGroup, userId, otherUserId);
  
  let processedFile = file;
  let thumbnailUrl: string | undefined;
  let dimensions: { width?: number; height?: number } = {};
  
  // Process image
  if (mediaType === 'image') {
    // Get original dimensions
    dimensions = await getImageDimensions(file);
    
    // Compress image
    processedFile = await compressImage(file);
    
    // Generate thumbnail
    try {
      const thumbnail = await generateThumbnail(file);
      const thumbPath = getMediaFilePath(conversationPath, mediaType, messageId, 'thumb.webp');
      
      const { error: thumbError } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .upload(thumbPath, thumbnail, {
          contentType: 'image/webp',
          cacheControl: '31536000', // 1 year
          upsert: false,
        });
      
      if (!thumbError) {
        const { data: thumbUrlData } = supabase.storage
          .from(STORAGE_CONFIG.BUCKET_NAME)
          .getPublicUrl(thumbPath);
        thumbnailUrl = thumbUrlData.publicUrl;
      }
    } catch (error) {
      console.warn('Thumbnail generation failed, continuing without thumbnail:', error);
    }
  }
  
  // Upload main file
  const filePath = getMediaFilePath(conversationPath, mediaType, messageId, processedFile.name);
  
  const { data, error } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .upload(filePath, processedFile, {
      contentType: processedFile.type,
      cacheControl: '31536000', // 1 year
      upsert: false,
    });
  
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .getPublicUrl(filePath);
  
  return {
    url: urlData.publicUrl,
    thumbnailUrl,
    path: filePath,
    type: processedFile.type,
    size: processedFile.size,
    ...dimensions,
    cached: false,
  };
}

/**
 * Upload multiple media files
 */
export async function uploadMultipleMedia(
  files: File[],
  conversationId: string,
  messageId: string,
  isGroup: boolean,
  userId: string,
  otherUserId?: string
): Promise<MediaUploadResult[]> {
  const uploadPromises = files.map((file) =>
    uploadMediaFile(file, conversationId, messageId, isGroup, userId, otherUserId)
  );
  
  return Promise.all(uploadPromises);
}

// =====================================================
// GROUP PHOTO UPLOAD
// =====================================================

/**
 * Upload group photo
 */
export async function uploadGroupPhoto(
  file: File,
  groupId: string
): Promise<{ url: string; thumbnailUrl: string }> {
  const supabase = createClient();
  
  // Validate
  if (!STORAGE_CONFIG.IMAGE_FORMATS.includes(file.type)) {
    throw new Error('Invalid image format');
  }
  
  if (file.size > STORAGE_CONFIG.MAX_IMAGE_SIZE) {
    throw new Error('Image size exceeds limit');
  }
  
  // Compress
  const compressed = await compressImage(file);
  const thumbnail = await generateThumbnail(file);
  
  // Upload original
  const originalPath = `group-photos/${groupId}/original.webp`;
  const { error: originalError } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .upload(originalPath, compressed, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: true, // Allow updates
    });
  
  if (originalError) throw originalError;
  
  // Upload thumbnail
  const thumbPath = `group-photos/${groupId}/thumbnail.webp`;
  const { error: thumbError } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .upload(thumbPath, thumbnail, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: true,
    });
  
  if (thumbError) throw thumbError;
  
  // Get URLs
  const { data: originalUrl } = supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .getPublicUrl(originalPath);
  
  const { data: thumbUrl } = supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .getPublicUrl(thumbPath);
  
  return {
    url: originalUrl.publicUrl,
    thumbnailUrl: thumbUrl.publicUrl,
  };
}

// =====================================================
// DELETE MEDIA
// =====================================================

/**
 * Delete media file from CDN
 */
export async function deleteMediaFile(filePath: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .remove([filePath]);
  
  if (error) {
    console.error('Failed to delete media:', error);
    throw error;
  }
}

/**
 * Delete multiple media files
 */
export async function deleteMultipleMedia(filePaths: string[]): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .remove(filePaths);
  
  if (error) {
    console.error('Failed to delete media files:', error);
    throw error;
  }
}

// =====================================================
// STORAGE CLEANUP
// =====================================================

/**
 * Clean up temporary uploads (call periodically)
 */
export async function cleanupTempUploads(userId: string): Promise<void> {
  const supabase = createClient();
  
  const tempPath = `chats/temp/${userId}`;
  
  // List files older than 24 hours
  const { data: files, error: listError } = await supabase.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .list(tempPath);
  
  if (listError || !files) return;
  
  const now = Date.now();
  const oldFiles = files
    .filter((file) => {
      const createdAt = new Date(file.created_at).getTime();
      return now - createdAt > 24 * 60 * 60 * 1000; // 24 hours
    })
    .map((file) => `${tempPath}/${file.name}`);
  
  if (oldFiles.length > 0) {
    await deleteMultipleMedia(oldFiles);
  }
}

export default {
  uploadMediaFile,
  uploadMultipleMedia,
  uploadGroupPhoto,
  deleteMediaFile,
  deleteMultipleMedia,
  cleanupTempUploads,
  STORAGE_CONFIG,
};

