/**
 * Utility functions for working with Supabase Storage
 */

/**
 * Get the public URL for a file in Supabase Storage
 */
export function getPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  // If it's already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error('NEXT_PUBLIC_SUPABASE_URL is not set');
    return null;
  }
  
  // Remove any leading slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct the public URL
  return `${supabaseUrl}/storage/v1/object/public/${cleanPath}`;
}

/**
 * Get the bucket and path from a storage URL
 */
export function parseStorageUrl(url: string): { bucket: string; path: string } | null {
  if (!url) return null;
  
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
  if (!match) return null;
  
  return {
    bucket: match[1],
    path: match[2],
  };
}

/**
 * Check if a URL is a valid Supabase storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url) return false;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;
  
  return url.includes('/storage/v1/object/public/') && 
    (url.startsWith(supabaseUrl) || url.includes('.supabase.co'));
}
