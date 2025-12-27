import { uploadDocument } from '@/lib/api/upload';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadToStorage(
  file: File,
  folder: string,
  userId: string
): Promise<UploadResult> {
  try {
    // Upload via API
    const result = await uploadDocument(file);
    
    return { 
      success: true, 
      url: result.cdnUrl || result.url 
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

