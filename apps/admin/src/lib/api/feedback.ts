// TODO: Migrate to API endpoints
// import { apiClient } from './client';

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
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  category?: FeedbackCategory;
  tags?: FeedbackTagRelation[];
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

export interface FeedbackTagRelation {
  tag: FeedbackTag;
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
  category_stats: Record<string, { count: number; percentage: number }>;
  top_themes: Array<{ name: string; count: number }>;
  trending_up: Array<{ name: string; growth: number }>;
  trending_down: Array<{ name: string; decline: number }>;
  executive_summary?: string;
  action_recommendations?: string[];
  generated_at: string;
}

// Feedback Submissions - TODO: Migrate to API
export async function getFeedbackSubmissions(filters?: {
  status?: string;
  priority?: string;
  category_id?: string;
  sentiment_label?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: FeedbackSubmission[]; count: number }> {
  return { data: [], count: 0 };
}

export async function getFeedbackSubmission(id: string): Promise<FeedbackSubmission | null> {
  return null;
}

export async function updateFeedbackStatus(
  id: string,
  status: FeedbackSubmission['status'],
  resolutionNotes?: string
): Promise<FeedbackSubmission> {
  throw new Error('Not implemented: API migration pending');
}

export async function addFeedbackComment(
  feedbackId: string,
  comment: string,
  isInternal: boolean = false
): Promise<FeedbackComment> {
  throw new Error('Not implemented: API migration pending');
}

// Feedback Categories - TODO: Migrate to API
export async function getFeedbackCategories(): Promise<FeedbackCategory[]> {
  return [];
}

export async function createFeedbackCategory(category: Partial<FeedbackCategory>): Promise<FeedbackCategory> {
  throw new Error('Not implemented: API migration pending');
}

export async function updateFeedbackCategory(id: string, updates: Partial<FeedbackCategory>): Promise<FeedbackCategory> {
  throw new Error('Not implemented: API migration pending');
}

export async function deleteFeedbackCategory(id: string): Promise<void> {
  throw new Error('Not implemented: API migration pending');
}

// Feedback Tags - TODO: Migrate to API
export async function getFeedbackTags(): Promise<FeedbackTag[]> {
  return [];
}

export async function createFeedbackTag(tag: Partial<FeedbackTag>): Promise<FeedbackTag> {
  throw new Error('Not implemented: API migration pending');
}

export async function updateFeedbackTag(id: string, updates: Partial<FeedbackTag>): Promise<FeedbackTag> {
  throw new Error('Not implemented: API migration pending');
}

export async function deleteFeedbackTag(id: string): Promise<void> {
  throw new Error('Not implemented: API migration pending');
}

// Feedback Insights - TODO: Migrate to API
export async function getFeedbackInsights(periodType: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<FeedbackInsight[]> {
  return [];
}

export async function generateFeedbackInsight(periodType: 'daily' | 'weekly' | 'monthly'): Promise<FeedbackInsight> {
  throw new Error('Not implemented: API migration pending');
}

// Feedback Stats - TODO: Migrate to API
export async function getFeedbackStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  bySentiment: Record<string, number>;
  recentTrend: number;
}> {
  return { total: 0, byStatus: {}, byPriority: {}, bySentiment: {}, recentTrend: 0 };
}

// Feedback Tags - TODO: Migrate to API
export async function addFeedbackTag(feedbackId: string, tagId: string): Promise<void> {
  throw new Error('Not implemented: API migration pending');
}

// Sentiment Analysis - TODO: Migrate to API
export async function analyzeFeedbackSentiment(feedbackId: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  label: 'positive' | 'negative' | 'neutral';
  score: number;
}> {
  return { sentiment: 'neutral', label: 'neutral', score: 0 };
}
