// hooks/useContentTags.ts
/**
 * React Query hooks for Content Tags system
 * Usage: Import and use in your components for tag management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// TODO: Migrate to API
// import { apiClient } from '@/lib/api/client';

// Types
export interface ContentTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string | null;
  usage_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PopularTag extends ContentTag {
  content_count: number;
  pillar_count: number;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Get all content tags
 */
export function useContentTags() {
  return useQuery({
    queryKey: ['content-tags'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('content_tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as ContentTag[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get popular tags (most used)
 */
export function usePopularTags(limit = 10) {
  return useQuery({
    queryKey: ['popular-tags', limit],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('popular_tags')
        .select('*')
        .limit(limit);
      
      if (error) throw error;
      return data as PopularTag[];
    },
  });
}

/**
 * Get single tag by ID
 */
export function useContentTag(tagId: string | null) {
  return useQuery({
    queryKey: ['content-tag', tagId],
    queryFn: async () => {
      if (!tagId) return null;
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('content_tags')
        .select('*')
        .eq('id', tagId)
        .single();
      
      if (error) throw error;
      return data as ContentTag;
    },
    enabled: !!tagId,
  });
}

/**
 * Get tags assigned to specific content
 */
export function useContentTagsForContent(contentId: string | null) {
  return useQuery({
    queryKey: ['content-tags-for-content', contentId],
    queryFn: async () => {
      if (!contentId) return [];
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('content_tag_assignments')
        .select('content_tags(*)')
        .eq('content_id', contentId);
      
      if (error) throw error;
      return data.map((item: any) => item.content_tags) as ContentTag[];
    },
    enabled: !!contentId,
  });
}

/**
 * Get tags assigned to specific pillar
 */
export function useTagsForPillar(pillarId: string | null) {
  return useQuery({
    queryKey: ['tags-for-pillar', pillarId],
    queryFn: async () => {
      if (!pillarId) return [];
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pillar_tag_assignments')
        .select('content_tags(*)')
        .eq('pillar_id', pillarId);
      
      if (error) throw error;
      return data.map((item: any) => item.content_tags) as ContentTag[];
    },
    enabled: !!pillarId,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create a new tag
 */
export function useCreateTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tagData: {
      name: string;
      slug?: string;
      color?: string;
      description?: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('content_tags')
        .insert([tagData])
        .select()
        .single();
      
      if (error) throw error;
      return data as ContentTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
    },
  });
}

/**
 * Update a tag
 */
export function useUpdateTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      tagId,
      updates,
    }: {
      tagId: string;
      updates: Partial<ContentTag>;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('content_tags')
        .update(updates)
        .eq('id', tagId)
        .select()
        .single();
      
      if (error) throw error;
      return data as ContentTag;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
      queryClient.invalidateQueries({ queryKey: ['content-tag', variables.tagId] });
    },
  });
}

/**
 * Delete a tag
 */
export function useDeleteTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tagId: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from('content_tags')
        .delete()
        .eq('id', tagId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
    },
  });
}

/**
 * Assign tags to content (replaces all existing tags)
 */
export function useAssignTagsToContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      contentId,
      tagIds,
    }: {
      contentId: string;
      tagIds: string[];
    }) => {
      const supabase = createClient();
      
      // Delete existing assignments
      await supabase
        .from('content_tag_assignments')
        .delete()
        .eq('content_id', contentId);
      
      // Insert new assignments
      if (tagIds.length > 0) {
        const { error } = await supabase
          .from('content_tag_assignments')
          .insert(
            tagIds.map(tagId => ({
              content_id: contentId,
              tag_id: tagId,
            }))
          );
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['content-tags-for-content', variables.contentId] 
      });
      queryClient.invalidateQueries({ queryKey: ['content-tags'] }); // Refresh usage counts
    },
  });
}

/**
 * Assign tags to pillar (replaces all existing tags)
 */
export function useAssignTagsToPillar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      pillarId,
      tagIds,
    }: {
      pillarId: string;
      tagIds: string[];
    }) => {
      const supabase = createClient();
      
      // Delete existing assignments
      await supabase
        .from('pillar_tag_assignments')
        .delete()
        .eq('pillar_id', pillarId);
      
      // Insert new assignments
      if (tagIds.length > 0) {
        const { error } = await supabase
          .from('pillar_tag_assignments')
          .insert(
            tagIds.map(tagId => ({
              pillar_id: pillarId,
              tag_id: tagId,
            }))
          );
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['tags-for-pillar', variables.pillarId] 
      });
      queryClient.invalidateQueries({ queryKey: ['content-tags'] }); // Refresh usage counts
    },
  });
}

