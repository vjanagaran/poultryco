// hooks/useContentTags.ts
/**
 * React Query hooks for Content Tags system
 * Migrated to use REST API instead of Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getContentTags, 
  getPopularContentTags, 
  getContentTagById,
  createContentTag,
  updateContentTag,
  deleteContentTag,
  type ContentTag 
} from '@/lib/api/marketing';

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
      return getContentTags();
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
      return getPopularContentTags(limit);
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
      return getContentTagById(tagId);
    },
    enabled: !!tagId,
  });
}

/**
 * Get tags assigned to specific content
 */
export function useContentTagsForContent(contentId: string | null) {
  // Note: This endpoint needs to be added to API if not exists
  // For now, using a placeholder
  return useQuery({
    queryKey: ['content-tags-for-content', contentId],
    queryFn: async () => {
      if (!contentId) return [];
      // TODO: Add API endpoint for this
      // return getContentTagsForContent(contentId);
      return [];
    },
    enabled: !!contentId,
  });
}

/**
 * Get tags assigned to specific pillar
 */
export function useContentTagsForPillar(pillarId: string | null) {
  return useQuery({
    queryKey: ['content-tags-for-pillar', pillarId],
    queryFn: async () => {
      if (!pillarId) return [];
      // TODO: Use getPillarTags from marketing API
      return [];
    },
    enabled: !!pillarId,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create a new content tag
 */
export function useCreateContentTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ContentTag>) => {
      return createContentTag(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
      queryClient.invalidateQueries({ queryKey: ['popular-tags'] });
    },
  });
}

/**
 * Update a content tag
 */
export function useUpdateContentTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContentTag> }) => {
      return updateContentTag(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
      queryClient.invalidateQueries({ queryKey: ['content-tag', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['popular-tags'] });
    },
  });
}

/**
 * Delete a content tag
 */
export function useDeleteContentTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return deleteContentTag(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
      queryClient.invalidateQueries({ queryKey: ['popular-tags'] });
    },
  });
}

/**
 * Assign tags to content
 */
export function useAssignContentTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, tagIds }: { contentId: string; tagIds: string[] }) => {
      // TODO: Add API endpoint for this
      // return assignContentTags(contentId, tagIds);
      throw new Error('Not implemented yet');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-tags-for-content', variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
    },
  });
}

/**
 * Remove tag from content
 */
export function useRemoveContentTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contentId, tagId }: { contentId: string; tagId: string }) => {
      // TODO: Add API endpoint for this
      // return removeContentTag(contentId, tagId);
      throw new Error('Not implemented yet');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-tags-for-content', variables.contentId] });
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
    },
  });
}
