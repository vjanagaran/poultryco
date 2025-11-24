// hooks/useContentCampaigns.ts
/**
 * React Query hooks for Content Campaigns system
 * Usage: Import and use in your components for campaign management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

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
      const supabase = createClient();
      let query = supabase
        .from('content_campaigns')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ContentCampaign[];
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
      const supabase = createClient();
      const { data, error } = await supabase
        .from('active_campaigns')
        .select('*');
      
      if (error) throw error;
      return data as CampaignPerformance[];
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
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('content_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (error) throw error;
      return data as ContentCampaign;
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
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('campaign_performance')
        .select('*')
        .eq('id', campaignId)
        .single();
      
      if (error) throw error;
      return data as CampaignPerformance;
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
      const supabase = createClient();
      const { data, error } = await supabase
        .from('campaign_performance')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as CampaignPerformance[];
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
      
      const supabase = createClient();
      const { data, error } = await supabase
        .rpc('get_campaign_health', { campaign_uuid: campaignId });
      
      if (error) throw error;
      return data as 'excellent' | 'good' | 'fair' | 'needs_attention' | 'critical';
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
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('campaign_content_summary')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('scheduled_date');
      
      if (error) throw error;
      return data as CampaignContentSummary[];
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
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('content_campaign_assignments')
        .select('content_campaigns(*)')
        .eq('content_id', contentId);
      
      if (error) throw error;
      return data.map((item: any) => item.content_campaigns) as ContentCampaign[];
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
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('pillar_campaign_assignments')
        .select('content_campaigns(*)')
        .eq('pillar_id', pillarId);
      
      if (error) throw error;
      return data.map((item: any) => item.content_campaigns) as ContentCampaign[];
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
      const supabase = createClient();
      const { data, error} = await supabase
        .from('content_campaigns')
        .insert([campaignData])
        .select()
        .single();
      
      if (error) throw error;
      return data as ContentCampaign;
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
      const supabase = createClient();
      const { data, error } = await supabase
        .from('content_campaigns')
        .update(updates)
        .eq('id', campaignId)
        .select()
        .single();
      
      if (error) throw error;
      return data as ContentCampaign;
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
      const supabase = createClient();
      const { error } = await supabase
        .from('content_campaigns')
        .delete()
        .eq('id', campaignId);
      
      if (error) throw error;
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
      const supabase = createClient();
      const { error } = await supabase
        .from('content_campaign_assignments')
        .insert([{
          content_id: contentId,
          campaign_id: campaignId,
          content_role: contentRole,
        }]);
      
      if (error) throw error;
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
      const supabase = createClient();
      const { error } = await supabase
        .from('content_campaign_assignments')
        .insert(
          contentIds.map(contentId => ({
            content_id: contentId,
            campaign_id: campaignId,
          }))
        );
      
      if (error) throw error;
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
      const supabase = createClient();
      const { error } = await supabase
        .from('content_campaign_assignments')
        .delete()
        .eq('content_id', contentId)
        .eq('campaign_id', campaignId);
      
      if (error) throw error;
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
      const supabase = createClient();
      const { error } = await supabase
        .from('pillar_campaign_assignments')
        .insert([{
          pillar_id: pillarId,
          campaign_id: campaignId,
        }]);
      
      if (error) throw error;
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
      const supabase = createClient();
      const { error } = await supabase
        .from('pillar_campaign_assignments')
        .delete()
        .eq('pillar_id', pillarId)
        .eq('campaign_id', campaignId);
      
      if (error) throw error;
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

