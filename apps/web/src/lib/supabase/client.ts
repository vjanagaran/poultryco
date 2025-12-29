/**
 * @deprecated This file is deprecated. Use API client instead.
 * This is a stub to prevent import errors during migration.
 * All Supabase calls should be migrated to use the REST API.
 */

import { apiClient } from '@/lib/api/client';

export function createClient() {
  console.warn('⚠️ Supabase client is deprecated. Please migrate to REST API.');
  
  // Return a stub object to prevent runtime errors
  return {
    auth: {
      getUser: async () => {
        try {
          const user = await apiClient.get('/auth/me');
          return { data: { user }, error: null };
        } catch (error) {
          return { data: { user: null }, error };
        }
      },
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: new Error('Supabase storage is deprecated. Use API upload functions.') }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        remove: async () => ({ error: null }),
        list: async () => ({ data: [], error: null }),
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
        }),
      }),
    }),
  } as any;
}

