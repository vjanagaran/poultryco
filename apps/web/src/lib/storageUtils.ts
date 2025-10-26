import { createClient } from '@/lib/supabase/client';

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
    const supabase = createClient();

    // Get file extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('cdn.poultryco.net')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cdn.poultryco.net')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

