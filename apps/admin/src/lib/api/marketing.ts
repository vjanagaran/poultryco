import { apiClient } from './client';

// Types
export interface NdpCategory {
  id: string;
  name: string;
  description: string | null;
}

export interface StakeholderSegment {
  id: string;
  name: string;
  description: string | null;
}

export interface ContentTopic {
  id: string;
  title: string;
  description: string | null;
  ndp_category_id: string;
  target_outcome: string | null;
  key_message: string | null;
  is_active: boolean;
  created_at: string;
  ndp_categories?: NdpCategory;
}

export interface ContentPillar {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  pillar_type_id: string | null;
  pillar_type?: string; // For display
  topic_id: string | null;
  segment_id: string | null;
  status: string;
  priority_score?: number;
  content_pieces_created?: number;
  estimated_pieces?: number;
  key_insights?: string[];
  research_question?: string | null;
  tagIds?: string[]; // Tag assignments from API
  campaignId?: string; // Campaign assignment from API
  created_at: string;
}

export interface Content {
  id: string;
  title: string;
  slug: string;
  content_mode: 'master' | 'repurposed';
  pillar_id: string | null;
  topic_id: string | null;
  content_type_id: string;
  status: string;
  created_at: string;
}

export interface ContentIdea {
  id: string;
  title: string;
  description: string | null;
  topic_id: string | null;
  pillar_id: string | null;
  segment_id: string | null;
  status: string;
  created_at: string;
}

export interface MarketingChannel {
  id: string;
  name: string;
  platform: string;
  account_handle: string;
  followers_count: number;
  is_active: boolean;
  created_at: string;
}

export interface ContentSchedule {
  id: string;
  content_id: string;
  channel_id: string;
  scheduled_for: string;
  status: string;
  published_url: string | null;
  created_at: string;
}

// Dashboard
export async function getMarketingDashboardStats() {
  return apiClient.get('/marketing/dashboard/stats');
}

// NDP Categories
export async function getNdpCategories(): Promise<NdpCategory[]> {
  return apiClient.get<NdpCategory[]>('/marketing/ndp-categories');
}

// Stakeholder Segments
export async function getStakeholderSegments(): Promise<StakeholderSegment[]> {
  return apiClient.get<StakeholderSegment[]>('/marketing/segments');
}

export async function getStakeholderSegmentById(id: string): Promise<StakeholderSegment> {
  return apiClient.get<StakeholderSegment>(`/marketing/segments/${id}`);
}

export async function createStakeholderSegment(data: Partial<StakeholderSegment>): Promise<StakeholderSegment> {
  return apiClient.post<StakeholderSegment>('/marketing/segments', data);
}

export async function updateStakeholderSegment(id: string, data: Partial<StakeholderSegment>): Promise<StakeholderSegment> {
  return apiClient.patch<StakeholderSegment>(`/marketing/segments/${id}`, data);
}

export async function deleteStakeholderSegment(id: string): Promise<void> {
  await apiClient.delete(`/marketing/segments/${id}`);
}

// Content Topics
export async function getContentTopics(filters?: { categoryId?: string; search?: string }): Promise<ContentTopic[]> {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.append('categoryId', filters.categoryId);
  if (filters?.search) params.append('search', filters.search);
  
  const query = params.toString();
  return apiClient.get<ContentTopic[]>(`/marketing/topics${query ? `?${query}` : ''}`);
}

export async function getContentTopicById(id: string): Promise<ContentTopic> {
  return apiClient.get<ContentTopic>(`/marketing/topics/${id}`);
}

export async function createContentTopic(data: Partial<ContentTopic>): Promise<ContentTopic> {
  return apiClient.post<ContentTopic>('/marketing/topics', data);
}

export async function updateContentTopic(id: string, data: Partial<ContentTopic>): Promise<ContentTopic> {
  return apiClient.patch<ContentTopic>(`/marketing/topics/${id}`, data);
}

export async function deleteContentTopic(id: string): Promise<void> {
  await apiClient.delete(`/marketing/topics/${id}`);
}

// Content Pillars
export async function getContentPillars(filters?: { status?: string; search?: string }): Promise<ContentPillar[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  
  const query = params.toString();
  return apiClient.get<ContentPillar[]>(`/marketing/pillars${query ? `?${query}` : ''}`);
}

export async function getContentPillarById(id: string): Promise<ContentPillar> {
  return apiClient.get<ContentPillar>(`/marketing/pillars/${id}`);
}

export async function createContentPillar(data: Partial<ContentPillar>): Promise<ContentPillar> {
  return apiClient.post<ContentPillar>('/marketing/pillars', data);
}

export async function updateContentPillar(id: string, data: Partial<ContentPillar>): Promise<ContentPillar> {
  return apiClient.patch<ContentPillar>(`/marketing/pillars/${id}`, data);
}

export async function deleteContentPillar(id: string): Promise<void> {
  await apiClient.delete(`/marketing/pillars/${id}`);
}

// Content
export async function getContent(filters?: { status?: string; pillarId?: string; topicId?: string }): Promise<Content[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.pillarId) params.append('pillarId', filters.pillarId);
  if (filters?.topicId) params.append('topicId', filters.topicId);
  
  const query = params.toString();
  return apiClient.get<Content[]>(`/marketing/content${query ? `?${query}` : ''}`);
}

export async function getContentById(id: string): Promise<Content> {
  return apiClient.get<Content>(`/marketing/content/${id}`);
}

export async function createContent(data: Partial<Content>): Promise<Content> {
  return apiClient.post<Content>('/marketing/content', data);
}

export async function updateContent(id: string, data: Partial<Content>): Promise<Content> {
  return apiClient.patch<Content>(`/marketing/content/${id}`, data);
}

export async function deleteContent(id: string): Promise<void> {
  await apiClient.delete(`/marketing/content/${id}`);
}

// Content Ideas
export async function getContentIdeas(filters?: { status?: string; pillarId?: string; topicId?: string }): Promise<ContentIdea[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.pillarId) params.append('pillarId', filters.pillarId);
  if (filters?.topicId) params.append('topicId', filters.topicId);
  
  const query = params.toString();
  return apiClient.get<ContentIdea[]>(`/marketing/ideas${query ? `?${query}` : ''}`);
}

export async function getContentIdeaById(id: string): Promise<ContentIdea> {
  return apiClient.get<ContentIdea>(`/marketing/ideas/${id}`);
}

export async function createContentIdea(data: Partial<ContentIdea>): Promise<ContentIdea> {
  return apiClient.post<ContentIdea>('/marketing/ideas', data);
}

export async function updateContentIdea(id: string, data: Partial<ContentIdea>): Promise<ContentIdea> {
  return apiClient.patch<ContentIdea>(`/marketing/ideas/${id}`, data);
}

export async function deleteContentIdea(id: string): Promise<void> {
  await apiClient.delete(`/marketing/ideas/${id}`);
}

// Marketing Channels
export async function getMarketingChannels(): Promise<MarketingChannel[]> {
  return apiClient.get<MarketingChannel[]>('/marketing/channels');
}

export async function getMarketingChannelById(id: string): Promise<MarketingChannel> {
  return apiClient.get<MarketingChannel>(`/marketing/channels/${id}`);
}

export async function createMarketingChannel(data: Partial<MarketingChannel>): Promise<MarketingChannel> {
  return apiClient.post<MarketingChannel>('/marketing/channels', data);
}

export async function updateMarketingChannel(id: string, data: Partial<MarketingChannel>): Promise<MarketingChannel> {
  return apiClient.patch<MarketingChannel>(`/marketing/channels/${id}`, data);
}

export async function deleteMarketingChannel(id: string): Promise<void> {
  await apiClient.delete(`/marketing/channels/${id}`);
}

// Content Schedule
export async function getContentSchedule(filters?: {
  startDate?: string;
  endDate?: string;
  channelId?: string;
  status?: string;
}): Promise<ContentSchedule[]> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.channelId) params.append('channelId', filters.channelId);
  if (filters?.status) params.append('status', filters.status);
  
  const query = params.toString();
  return apiClient.get<ContentSchedule[]>(`/marketing/schedule${query ? `?${query}` : ''}`);
}

export async function getContentScheduleById(id: string): Promise<ContentSchedule> {
  return apiClient.get<ContentSchedule>(`/marketing/schedule/${id}`);
}

export async function createContentSchedule(data: Partial<ContentSchedule>): Promise<ContentSchedule> {
  return apiClient.post<ContentSchedule>('/marketing/schedule', data);
}

export async function updateContentSchedule(id: string, data: Partial<ContentSchedule>): Promise<ContentSchedule> {
  return apiClient.patch<ContentSchedule>(`/marketing/schedule/${id}`, data);
}

export async function deleteContentSchedule(id: string): Promise<void> {
  await apiClient.delete(`/marketing/schedule/${id}`);
}

// KPIs
export async function getSocialMediaKpis(filters?: {
  channelId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any[]> {
  const params = new URLSearchParams();
  if (filters?.channelId) params.append('channelId', filters.channelId);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  
  const query = params.toString();
  return apiClient.get(`/marketing/kpis/social-media${query ? `?${query}` : ''}`);
}

export async function getPlatformKpis(filters?: { startDate?: string; endDate?: string }): Promise<any[]> {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  
  const query = params.toString();
  return apiClient.get(`/marketing/kpis/platform${query ? `?${query}` : ''}`);
}

export async function createSocialMediaKpi(data: any): Promise<any> {
  return apiClient.post('/marketing/kpis/social-media', data);
}

export async function createPlatformKpi(data: any): Promise<any> {
  return apiClient.post('/marketing/kpis/platform', data);
}

// =====================================================
// CONTENT TAGS
// =====================================================

export interface ContentTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  description: string | null;
  usageCount: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getContentTags(): Promise<ContentTag[]> {
  return apiClient.get<ContentTag[]>('/marketing/tags');
}

export async function getPopularContentTags(limit: number = 10): Promise<ContentTag[]> {
  return apiClient.get<ContentTag[]>(`/marketing/tags/popular?limit=${limit}`);
}

export async function getContentTagById(id: string): Promise<ContentTag> {
  return apiClient.get<ContentTag>(`/marketing/tags/${id}`);
}

export async function createContentTag(data: Partial<ContentTag>): Promise<ContentTag> {
  return apiClient.post<ContentTag>('/marketing/tags', data);
}

export async function updateContentTag(id: string, data: Partial<ContentTag>): Promise<ContentTag> {
  return apiClient.patch<ContentTag>(`/marketing/tags/${id}`, data);
}

export async function deleteContentTag(id: string): Promise<void> {
  await apiClient.delete(`/marketing/tags/${id}`);
}

// =====================================================
// PILLAR-TAG RELATIONSHIPS
// =====================================================

export async function getPillarTags(pillarId: string): Promise<ContentTag[]> {
  return apiClient.get<ContentTag[]>(`/marketing/pillars/${pillarId}/tags`);
}

export async function setPillarTags(pillarId: string, tagIds: string[]): Promise<void> {
  await apiClient.post(`/marketing/pillars/${pillarId}/tags`, { tagIds });
}

export async function removePillarTag(pillarId: string, tagId: string): Promise<void> {
  await apiClient.delete(`/marketing/pillars/${pillarId}/tags/${tagId}`);
}
