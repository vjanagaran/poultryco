/**
 * Image Utility Functions
 * Handles image conversion, resizing, and validation
 */

// Maximum file sizes
export const MAX_FILE_SIZES = {
  avatar: 2 * 1024 * 1024, // 2MB
  cover: 5 * 1024 * 1024, // 5MB
  post: 5 * 1024 * 1024, // 5MB
  document: 10 * 1024 * 1024, // 10MB
};

// Image dimensions
export const IMAGE_DIMENSIONS = {
  avatar: { width: 400, height: 400 },
  cover: { width: 1500, height: 500 },
  thumbnail: { width: 150, height: 150 },
};

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Validates image file
 */
export function validateImageFile(
  file: File,
  maxSize: number = MAX_FILE_SIZES.avatar
): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Converts image to WebP format
 */
export async function convertToWebP(
  file: File,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not convert image'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Could not load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resizes image to specified dimensions
 */
export async function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not resize image'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Could not load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Converts and resizes image to WebP
 */
export async function processImage(
  file: File,
  type: 'avatar' | 'cover' = 'avatar',
  quality: number = 0.9
): Promise<Blob> {
  const dimensions = IMAGE_DIMENSIONS[type];
  
  // Resize and convert to WebP in one step
  const processedBlob = await resizeImage(
    file,
    dimensions.width,
    dimensions.height,
    quality
  );

  return processedBlob;
}

/**
 * Creates a preview URL from file
 */
export function createPreviewUrl(file: File | Blob): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Gets file extension from MIME type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };

  return mimeMap[mimeType] || 'jpg';
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`;
}

