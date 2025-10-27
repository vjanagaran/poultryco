import { createClient } from '@/lib/supabase/client';

// Types
export interface FeedbackSubmission {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  category_id?: string;
  title: string;
  description: string;
  page_url?: string;
  user_agent?: string;
  device_type?: string;
  app_version?: string;
  sentiment_score?: number;
  sentiment_label?: 'positive' | 'neutral' | 'negative' | 'mixed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_review' | 'acknowledged' | 'in_progress' | 'resolved' | 'declined' | 'duplicate';
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  category?: FeedbackCategory;
  tags?: FeedbackTag[];
  comments?: FeedbackComment[];
}

export interface FeedbackCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
}

export interface FeedbackTag {
  id: string;
  name: string;
  type: 'feature' | 'issue' | 'theme' | 'component' | 'emotion';
  usage_count: number;
  is_auto_generated: boolean;
}

export interface FeedbackComment {
  id: string;
  feedback_id: string;
  author_id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  author?: {
    email: string;
  };
}

export interface FeedbackInsight {
  id: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  total_feedback: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  category_stats: any;
  top_themes: any[];
  trending_up: any[];
  trending_down: any[];
  executive_summary?: string;
  action_recommendations?: string[];
  generated_at: string;
}

// Feedback Submissions
export async function getFeedbackSubmissions(filters?: {
  status?: string;
  priority?: string;
  category_id?: string;
  sentiment_label?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: FeedbackSubmission[]; count: number }> {
  const supabase = createClient();
  
  let query = supabase
    .from('feedback_submissions')
    .select(`
      *,
      category:feedback_categories(*),
      tags:feedback_tag_relations(tag:feedback_tags(*)),
      comments:feedback_comments(*, author:profiles!author_id(email))
    `, { count: 'exact' });
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }
  
  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  
  if (filters?.sentiment_label) {
    query = query.eq('sentiment_label', filters.sentiment_label);
  }
  
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  
  query = query.order('created_at', { ascending: false });
  
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  return { 
    data: data || [], 
    count: count || 0 
  };
}

export async function getFeedbackSubmission(id: string): Promise<FeedbackSubmission | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('feedback_submissions')
    .select(`
      *,
      category:feedback_categories(*),
      tags:feedback_tag_relations(tag:feedback_tags(*)),
      comments:feedback_comments(*, author:profiles!author_id(email))
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackSubmission['status'],
  resolution_notes?: string
): Promise<FeedbackSubmission> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const updates: any = {
    status,
    updated_at: new Date().toISOString(),
  };
  
  if (resolution_notes) {
    updates.resolution_notes = resolution_notes;
  }
  
  if (status === 'resolved' || status === 'declined') {
    updates.resolved_by = user?.id;
    updates.resolved_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('feedback_submissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function addFeedbackComment(
  feedbackId: string,
  comment: string,
  isInternal: boolean = true
): Promise<FeedbackComment> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('feedback_comments')
    .insert({
      feedback_id: feedbackId,
      author_id: user?.id,
      comment,
      is_internal: isInternal,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Categories
export async function getFeedbackCategories(): Promise<FeedbackCategory[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('feedback_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  
  if (error) throw error;
  return data || [];
}

// Tags
export async function getFeedbackTags(): Promise<FeedbackTag[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('feedback_tags')
    .select('*')
    .order('usage_count', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data || [];
}

export async function addFeedbackTag(feedbackId: string, tagName: string): Promise<void> {
  const supabase = createClient();
  
  // First, find or create the tag
  let { data: tag } = await supabase
    .from('feedback_tags')
    .select('id')
    .eq('name', tagName.toLowerCase())
    .single();
  
  if (!tag) {
    const { data: newTag, error: tagError } = await supabase
      .from('feedback_tags')
      .insert({
        name: tagName.toLowerCase(),
        type: 'theme',
        is_auto_generated: false,
      })
      .select()
      .single();
    
    if (tagError) throw tagError;
    tag = newTag;
  }
  
  // Create the relation
  const { error } = await supabase
    .from('feedback_tag_relations')
    .insert({
      feedback_id: feedbackId,
      tag_id: tag.id,
      is_manual: true,
    });
  
  if (error && error.code !== '23505') { // Ignore duplicate key errors
    throw error;
  }
}

// Analytics
export async function getFeedbackStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  bySentiment: Record<string, number>;
  recentTrend: number;
}> {
  const supabase = createClient();
  
  // Get total count
  const { count: total } = await supabase
    .from('feedback_submissions')
    .select('*', { count: 'exact', head: true });
  
  // Get counts by status
  const { data: statusData } = await supabase
    .from('feedback_submissions')
    .select('status')
    .order('status');
  
  const byStatus = (statusData || []).reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get counts by priority
  const { data: priorityData } = await supabase
    .from('feedback_submissions')
    .select('priority')
    .order('priority');
  
  const byPriority = (priorityData || []).reduce((acc, item) => {
    acc[item.priority] = (acc[item.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get counts by sentiment
  const { data: sentimentData } = await supabase
    .from('feedback_submissions')
    .select('sentiment_label')
    .not('sentiment_label', 'is', null);
  
  const bySentiment = (sentimentData || []).reduce((acc, item) => {
    acc[item.sentiment_label] = (acc[item.sentiment_label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get trend (last 7 days vs previous 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  
  const { count: recent } = await supabase
    .from('feedback_submissions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString());
  
  const { count: previous } = await supabase
    .from('feedback_submissions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', fourteenDaysAgo.toISOString())
    .lt('created_at', sevenDaysAgo.toISOString());
  
  const recentTrend = previous && previous > 0 
    ? ((recent || 0) - previous) / previous * 100 
    : 0;
  
  return {
    total: total || 0,
    byStatus,
    byPriority,
    bySentiment,
    recentTrend,
  };
}

export async function getFeedbackInsights(
  periodType: 'daily' | 'weekly' | 'monthly'
): Promise<FeedbackInsight[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('feedback_insights')
    .select('*')
    .eq('period_type', periodType)
    .order('period_start', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  return data || [];
}

// AI Analysis (mock for now)
export async function analyzeFeedbackSentiment(text: string): Promise<{
  score: number;
  label: 'positive' | 'neutral' | 'negative' | 'mixed';
  confidence: number;
}> {
  // In production, this would call an AI service
  // For now, return mock data based on simple keywords
  
  const positiveWords = ['great', 'excellent', 'love', 'awesome', 'fantastic', 'good'];
  const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'poor', 'worst'];
  
  const lowercaseText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowercaseText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowercaseText.includes(word)).length;
  
  let score = 0;
  let label: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral';
  
  if (positiveCount > negativeCount) {
    score = 0.5 + (positiveCount * 0.1);
    label = 'positive';
  } else if (negativeCount > positiveCount) {
    score = -0.5 - (negativeCount * 0.1);
    label = 'negative';
  } else if (positiveCount > 0 && negativeCount > 0) {
    label = 'mixed';
  }
  
  return {
    score: Math.max(-1, Math.min(1, score)),
    label,
    confidence: 0.75,
  };
}
