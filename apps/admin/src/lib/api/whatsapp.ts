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
  accountId?: string | null; // Deprecated, use accountId from account access
  profilePicUrl?: string | null;
  notes?: string | null;
  lastScrapedAt?: string | null;
  contactsCountAtLastScrape?: number;
  isHidden?: boolean;
  isFavorite?: boolean;
  isAdminOnlyGroup?: boolean;
  internalDescription?: string | null;
  discoveredAt: string;
  createdAt: string;
  updatedAt: string;
  // Account access fields (when fetched with accountId filter)
  isAccountAdmin?: boolean;
  isAccountSuperAdmin?: boolean;
  canAddContacts?: boolean;
  canPostMessages?: boolean;
  canEditGroupInfo?: boolean;
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

export interface WhatsAppGroupContact {
  id: string;
  contactId: string;
  phoneNumber: string;
  name?: string | null;
  profilePicUrl?: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLeft: boolean;
  joinedAt?: string | null;
  leftAt?: string | null;
  firstScrapedAt: string;
  lastSeenAt?: string | null;
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
  includeHidden?: boolean;
  limit?: number;
  offset?: number;
}): Promise<WhatsAppGroup[]> {
  const params = new URLSearchParams();
  if (filters?.accountId) params.append('accountId', filters.accountId);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.includeHidden !== undefined) params.append('includeHidden', String(filters.includeHidden));
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.offset) params.append('offset', String(filters.offset));
  
  const query = params.toString();
  return apiClient.get<WhatsAppGroup[]>(`/whatsapp/groups${query ? `?${query}` : ''}`);
}

export async function getWhatsAppAccountGroups(
  accountId: string,
  includeHidden: boolean = false
): Promise<WhatsAppGroup[]> {
  const params = new URLSearchParams();
  if (includeHidden) params.append('includeHidden', 'true');
  const query = params.toString();
  return apiClient.get<WhatsAppGroup[]>(`/whatsapp/accounts/${accountId}/groups${query ? `?${query}` : ''}`);
}

export async function getWhatsAppGroupById(id: string): Promise<WhatsAppGroup> {
  return apiClient.get<WhatsAppGroup>(`/whatsapp/groups/${id}`);
}

export async function getLiveWhatsAppGroups(accountId: string): Promise<any[]> {
  return apiClient.get<any[]>(`/whatsapp/accounts/${accountId}/groups/live`);
}

export async function discoverWhatsAppGroups(accountId: string): Promise<WhatsAppGroup[]> {
  return apiClient.post<WhatsAppGroup[]>(`/whatsapp/accounts/${accountId}/groups/discover`);
}

export async function saveSingleWhatsAppGroup(
  accountId: string,
  whatsappGroupId: string
): Promise<WhatsAppGroup> {
  return apiClient.post<WhatsAppGroup>(`/whatsapp/accounts/${accountId}/groups/${whatsappGroupId}/save`);
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
    isHidden?: boolean;
    isFavorite?: boolean;
    internalDescription?: string;
    profilePicUrl?: string;
  },
): Promise<WhatsAppGroup> {
  return apiClient.put<WhatsAppGroup>(`/whatsapp/groups/${id}`, updates);
}

export async function hideWhatsAppGroup(
  id: string,
  isHidden: boolean,
): Promise<WhatsAppGroup> {
  return apiClient.put<WhatsAppGroup>(`/whatsapp/groups/${id}/hide`, { isHidden });
}

export async function deleteWhatsAppGroup(groupId: string): Promise<void> {
  return apiClient.delete<void>(`/whatsapp/groups/${groupId}`);
}

export async function getWhatsAppGroupContacts(
  groupId: string,
  includeLeft: boolean = false,
): Promise<WhatsAppGroupContact[]> {
  const params = new URLSearchParams();
  if (includeLeft) params.append('includeLeft', 'true');
  const query = params.toString();
  return apiClient.get<WhatsAppGroupContact[]>(`/whatsapp/groups/${groupId}/contacts${query ? `?${query}` : ''}`);
}

export async function getLiveWhatsAppGroupContacts(
  groupId: string,
  accountId: string,
  whatsappGroupId?: string,
): Promise<Array<{
  phoneNumber: string;
  name: string | null;
  profilePicUrl: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLeft: boolean;
}>> {
  const params = new URLSearchParams();
  params.append('accountId', accountId);
  if (whatsappGroupId) {
    params.append('whatsappGroupId', whatsappGroupId);
  }
  return apiClient.get(`/whatsapp/groups/${groupId}/contacts/live?${params.toString()}`);
}

export async function scrapeContactsFromGroup(
  groupId: string,
  accountId: string,
): Promise<{
  groupId: string;
  scrapedCount: number;
  totalContacts: number;
}> {
  return apiClient.post(`/whatsapp/groups/${groupId}/scrape-contacts`, { accountId });
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

