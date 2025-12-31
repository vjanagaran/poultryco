import { apiClient } from './client';

// =====================================================
// TYPES
// =====================================================

export interface WhatsAppAccount {
  id: string;
  phoneNumber: string | null;
  accountName: string;
  status: 'active' | 'standby' | 'warming' | 'banned' | 'inactive';
  healthScore: number;
  dailyUsageCount: number;
  dailyUsageLimit: number;
  lastConnectedAt?: string | null;
  lastDisconnectedAt?: string | null;
  isConnected?: boolean;
  hasClient?: boolean;
  qrCode?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppGroup {
  id: string;
  groupId: string;
  name: string;
  description?: string | null;
  memberCount: number;
  isActive: boolean;
  region?: string | null;
  state?: string | null;
  district?: string | null;
  segmentTags?: string[];
  accountId?: string | null;
  profilePicUrl?: string | null;
  notes?: string | null;
  discoveredAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppContact {
  id: string;
  phoneNumber: string;
  name?: string | null;
  profilePicUrl?: string | null;
  personaContactId?: string | null;
  groupMemberships?: string[];
  engagementScore: number;
  lastInteractionAt?: string | null;
  source?: string | null;
  scrapedFromGroups?: string[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  campaignId: string;
  contentId?: string | null;
  messageType: 'text' | 'image' | 'video' | 'document' | 'link';
  messageText?: string | null;
  mediaUrl?: string | null;
  linkUrl?: string | null;
  linkPreviewData?: any;
  channelType: 'group' | 'individual' | 'broadcast';
  targetGroupId?: string | null;
  targetContactId?: string | null;
  accountId: string;
  status: 'pending' | 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  errorMessage?: string | null;
  retryCount: number;
  deliveryConfirmations: number;
  readConfirmations: number;
  clickCount: number;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppStats {
  accounts: {
    total: number;
    active: number;
  };
  groups: {
    total: number;
    active: number;
  };
  contacts: {
    total: number;
  };
  messages: {
    total: number;
    sent: number;
    delivered: number;
    failed: number;
  };
}

// =====================================================
// ACCOUNTS
// =====================================================

export async function getWhatsAppAccounts(): Promise<WhatsAppAccount[]> {
  return apiClient.get<WhatsAppAccount[]>('/whatsapp/accounts');
}

export async function getWhatsAppAccountById(id: string): Promise<WhatsAppAccount> {
  return apiClient.get<WhatsAppAccount>(`/whatsapp/accounts/${id}`);
}

export async function createWhatsAppAccount(data: {
  accountName: string;
}): Promise<WhatsAppAccount> {
  return apiClient.post<WhatsAppAccount>('/whatsapp/accounts', data);
}

export async function initializeWhatsAppAccount(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.post(`/whatsapp/accounts/${id}/initialize`);
}

export async function disconnectWhatsAppAccount(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient.post(`/whatsapp/accounts/${id}/disconnect`);
}

export async function getWhatsAppAccountQR(id: string): Promise<{ qrCode: string | null }> {
  return apiClient.get<{ qrCode: string | null }>(`/whatsapp/accounts/${id}/qr`);
}

export interface RateLimitConfig {
  messages_per_minute: number;
  messages_per_hour: number;
  messages_per_day: number;
  groups_per_day: number;
  contacts_per_day: number;
  cooldown_after_error: number;
}

export async function getWhatsAppLogs(lines: number = 100): Promise<{
  logs: string[];
  totalLines?: number;
  filteredLines?: number;
  timestamp?: string;
  error?: string;
}> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/v1';
  const response = await fetch(`${apiUrl}/whatsapp/logs?lines=${lines}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch logs');
  }

  return response.json();
}

export async function updateWhatsAppAccountRateLimits(
  id: string,
  config: Partial<{
    messagesPerMinute: number;
    messagesPerHour: number;
    messagesPerDay: number;
    groupsPerDay: number;
    contactsPerDay: number;
    cooldownAfterError: number;
  }>,
): Promise<WhatsAppAccount> {
  return apiClient.put<WhatsAppAccount>(`/whatsapp/accounts/${id}/rate-limits`, config);
}

// =====================================================
// GROUPS
// =====================================================

export async function getWhatsAppGroups(filters?: {
  accountId?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}): Promise<WhatsAppGroup[]> {
  const params = new URLSearchParams();
  if (filters?.accountId) params.append('accountId', filters.accountId);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.offset) params.append('offset', String(filters.offset));
  
  const query = params.toString();
  return apiClient.get<WhatsAppGroup[]>(`/whatsapp/groups${query ? `?${query}` : ''}`);
}

export async function getWhatsAppGroupById(id: string): Promise<WhatsAppGroup> {
  return apiClient.get<WhatsAppGroup>(`/whatsapp/groups/${id}`);
}

export async function discoverWhatsAppGroups(accountId: string): Promise<WhatsAppGroup[]> {
  return apiClient.post<WhatsAppGroup[]>(`/whatsapp/accounts/${accountId}/groups/discover`);
}

export async function updateWhatsAppGroup(
  id: string,
  updates: {
    name?: string;
    description?: string;
    region?: string;
    state?: string;
    district?: string;
    segmentTags?: string[];
    isActive?: boolean;
    notes?: string;
  },
): Promise<WhatsAppGroup> {
  return apiClient.patch<WhatsAppGroup>(`/whatsapp/groups/${id}`, updates);
}

export async function scrapeContactsFromGroup(
  groupId: string,
  accountId: string,
): Promise<any[]> {
  return apiClient.post<any[]>(`/whatsapp/groups/${groupId}/scrape-contacts`, { accountId });
}

// =====================================================
// CONTACTS
// =====================================================

export async function getWhatsAppContacts(filters?: {
  groupId?: string;
}): Promise<WhatsAppContact[]> {
  const params = new URLSearchParams();
  if (filters?.groupId) params.append('groupId', filters.groupId);
  
  const query = params.toString();
  return apiClient.get<WhatsAppContact[]>(`/whatsapp/contacts${query ? `?${query}` : ''}`);
}

export async function getWhatsAppContactById(id: string): Promise<WhatsAppContact> {
  return apiClient.get<WhatsAppContact>(`/whatsapp/contacts/${id}`);
}

// =====================================================
// MESSAGES
// =====================================================

export async function sendWhatsAppMessage(data: {
  accountId: string;
  campaignId: string;
  contentId?: string;
  messageType: 'text' | 'image' | 'video' | 'document' | 'link';
  messageText?: string;
  mediaUrl?: string;
  linkUrl?: string;
  channelType: 'group' | 'individual' | 'broadcast';
  targetGroupId?: string;
  targetContactId?: string;
  scheduledAt?: string;
}): Promise<WhatsAppMessage> {
  return apiClient.post<WhatsAppMessage>('/whatsapp/messages', data);
}

export async function getWhatsAppMessages(filters?: {
  campaignId?: string;
  accountId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<WhatsAppMessage[]> {
  const params = new URLSearchParams();
  if (filters?.campaignId) params.append('campaignId', filters.campaignId);
  if (filters?.accountId) params.append('accountId', filters.accountId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.offset) params.append('offset', String(filters.offset));
  
  const query = params.toString();
  return apiClient.get<WhatsAppMessage[]>(`/whatsapp/messages${query ? `?${query}` : ''}`);
}

export async function getWhatsAppMessageById(id: string): Promise<WhatsAppMessage> {
  return apiClient.get<WhatsAppMessage>(`/whatsapp/messages/${id}`);
}

export async function retryWhatsAppMessage(id: string): Promise<WhatsAppMessage> {
  return apiClient.post<WhatsAppMessage>(`/whatsapp/messages/${id}/retry`);
}

// =====================================================
// STATS
// =====================================================

export async function getWhatsAppStats(): Promise<WhatsAppStats> {
  return apiClient.get<WhatsAppStats>('/whatsapp/stats');
}

