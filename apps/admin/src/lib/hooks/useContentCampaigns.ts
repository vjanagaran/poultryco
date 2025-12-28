// hooks/useContentCampaigns.ts
/**
 * React Query hooks for Content Campaigns system
 * Usage: Import and use in your components for campaign management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

// Types
export type CampaignStatus = 'planning' | 'active' | 'completed' | 'archived';
export type ContentRole = 'hero' | 'supporting' | 'amplification' | 'follow-up';

export interface ContentCampaign {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  target_pieces: number;
  target_reach: number | null;
  target_engagement: number | null;
  budget: number | null;
  color: string;
  icon: string | null;
  status: CampaignStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignPerformance extends ContentCampaign {
  pieces_created: number;
  pieces_published: number;
  pieces_draft: number;
  pieces_in_review: number;
  pillars_linked: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_engagement: number;
  total_clicks: number;
  pieces_progress_pct: number;
  reach_progress_pct: number;
  engagement_progress_pct: number;
  timeline_status: 'not_started' | 'active' | 'ended' | null;
  days_remaining: number | null;
}

export interface CampaignContentSummary {
  campaign_id: string;
  campaign_name: string;
  content_id: string;
  title: string;
  content_mode: 'master' | 'repurposed';
  status: string;
  content_type: string | null;
  scheduled_date: string | null;
  schedule_status: string | null;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  total_engagement: number;
  platform: string | null;
  channel_name: string | null;
}

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Get all campaigns
 */
export function useContentCampaigns(filters?: {
  status?: CampaignStatus | CampaignStatus[];
}) {
  return useQuery({
    queryKey: ['content-campaigns', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        params.append('status', statuses.join(','));
      }
      
      return apiClient.get<ContentCampaign[]>(`/admin/content-campaigns?${params.toString()}`);
    },
  });
}

/**
 * Get active campaigns (status = active OR within date range)
 */
export function useActiveCampaigns() {
  return useQuery({
    queryKey: ['active-campaigns'],
    queryFn: async () => {
      return apiClient.get<CampaignPerformance[]>('/admin/content-campaigns/active');
    },
  });
}

/**
 * Get single campaign by ID
 */
export function useContentCampaign(campaignId: string | null) {
  return useQuery({
    queryKey: ['content-campaign', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      return apiClient.get<ContentCampaign>(`/admin/content-campaigns/${campaignId}`);
    },
    enabled: !!campaignId,
  });
}

/**
 * Get campaign performance metrics
 */
export function useCampaignPerformance(campaignId: string | null) {
  return useQuery({
    queryKey: ['campaign-performance', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      return apiClient.get<CampaignPerformance>(`/admin/content-campaigns/${campaignId}/performance`);
    },
    enabled: !!campaignId,
    refetchInterval: 30000, // Refresh every 30 seconds for live metrics
  });
}

/**
 * Get all campaigns performance (for dashboard)
 */
export function useAllCampaignsPerformance() {
  return useQuery({
    queryKey: ['all-campaigns-performance'],
    queryFn: async () => {
      return apiClient.get<CampaignPerformance[]>('/admin/content-campaigns/performance');
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

/**
 * Get campaign health status
 */
export function useCampaignHealth(campaignId: string | null) {
  return useQuery({
    queryKey: ['campaign-health', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      return apiClient.get<'excellent' | 'good' | 'fair' | 'needs_attention' | 'critical'>(`/admin/content-campaigns/${campaignId}/health`);
    },
    enabled: !!campaignId,
  });
}

/**
 * Get all content in a campaign
 */
export function useCampaignContent(campaignId: string | null) {
  return useQuery({
    queryKey: ['campaign-content', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      return apiClient.get<CampaignContentSummary[]>(`/admin/content-campaigns/${campaignId}/content`);
    },
    enabled: !!campaignId,
  });
}

/**
 * Get campaigns for specific content
 */
export function useCampaignsForContent(contentId: string | null) {
  return useQuery({
    queryKey: ['campaigns-for-content', contentId],
    queryFn: async () => {
      if (!contentId) return [];
      return apiClient.get<ContentCampaign[]>(`/admin/content/${contentId}/campaigns`);
    },
    enabled: !!contentId,
  });
}

/**
 * Get campaigns for specific pillar
 */
export function useCampaignsForPillar(pillarId: string | null) {
  return useQuery({
    queryKey: ['campaigns-for-pillar', pillarId],
    queryFn: async () => {
      if (!pillarId) return [];
      return apiClient.get<ContentCampaign[]>(`/admin/pillars/${pillarId}/campaigns`);
    },
    enabled: !!pillarId,
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Create a new campaign
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaignData: {
      name: string;
      slug?: string;
      description?: string;
      start_date?: string;
      end_date?: string;
      target_pieces?: number;
      target_reach?: number;
      target_engagement?: number;
      color?: string;
      icon?: string;
      status?: CampaignStatus;
    }) => {
      return apiClient.post<ContentCampaign>('/admin/content-campaigns', campaignData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['active-campaigns'] });
    },
  });
}

/**
 * Update a campaign
 */
export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      campaignId,
      updates,
    }: {
      campaignId: string;
      updates: Partial<ContentCampaign>;
    }) => {
      return apiClient.put<ContentCampaign>(`/admin/content-campaigns/${campaignId}`, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['content-campaign', variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaign-performance', variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['active-campaigns'] });
    },
  });
}

/**
 * Delete a campaign
 */
export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (campaignId: string) => {
      await apiClient.delete(`/admin/content-campaigns/${campaignId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['active-campaigns'] });
    },
  });
}

/**
 * Assign content to campaign
 */
export function useAssignContentToCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      contentId,
      campaignId,
      contentRole,
    }: {
      contentId: string;
      campaignId: string;
      contentRole?: ContentRole;
    }) => {
      await apiClient.post(`/admin/content-campaigns/${campaignId}/content`, {
        contentId,
        contentRole,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['campaigns-for-content', variables.contentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['campaign-content', variables.campaignId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['campaign-performance', variables.campaignId] 
      });
    },
  });
}

/**
 * Assign multiple content pieces to campaign (batch)
 */
export function useAssignMultipleContentToCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      contentIds,
      campaignId,
    }: {
      contentIds: string[];
      campaignId: string;
    }) => {
      await apiClient.post(`/admin/content-campaigns/${campaignId}/content/batch`, {
        contentIds,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['campaign-content', variables.campaignId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['campaign-performance', variables.campaignId] 
      });
    },
  });
}

/**
 * Remove content from campaign
 */
export function useRemoveContentFromCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      contentId,
      campaignId,
    }: {
      contentId: string;
      campaignId: string;
    }) => {
      await apiClient.delete(`/admin/content-campaigns/${campaignId}/content/${contentId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['campaigns-for-content', variables.contentId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['campaign-content', variables.campaignId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['campaign-performance', variables.campaignId] 
      });
    },
  });
}

/**
 * Assign pillar to campaign
 */
export function useAssignPillarToCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      pillarId,
      campaignId,
    }: {
      pillarId: string;
      campaignId: string;
    }) => {
      await apiClient.post(`/admin/content-campaigns/${campaignId}/pillars`, {
        pillarId,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['campaigns-for-pillar', variables.pillarId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['campaign-performance', variables.campaignId] 
      });
    },
  });
}

/**
 * Remove pillar from campaign
 */
export function useRemovePillarFromCampaign() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      pillarId,
      campaignId,
    }: {
      pillarId: string;
      campaignId: string;
    }) => {
      await apiClient.delete(`/admin/content-campaigns/${campaignId}/pillars/${pillarId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['campaigns-for-pillar', variables.pillarId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['campaign-performance', variables.campaignId] 
      });
    },
  });
}

