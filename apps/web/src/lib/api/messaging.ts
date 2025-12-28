/**
 * Messaging API - Replaces Supabase messaging
 * Uses REST API + Socket.io for real-time
 */

import { apiClient } from './client';

export interface Conversation {
  id: string;
  conversationType: 'direct' | 'group' | 'business' | 'broadcast';
  name?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  businessId?: string | null;
  organizationId?: string | null;
  lastMessageAt?: string | null;
  messagesCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Joined data
  participants?: ConversationParticipant[];
  unreadCount?: number;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  profileId: string;
  role: 'admin' | 'member';
  lastReadAt?: string | null;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
  joinedAt: string;
  leftAt?: string | null;
  
  profile?: {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    profilePhoto?: string | null;
    headline?: string | null;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  messageType: 'text' | 'image' | 'video' | 'document' | 'audio';
  content?: string | null;
  mediaUrl?: string | null;
  mediaMetadata?: any;
  replyToId?: string | null;
  forwardedFromId?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  readBy?: any;
  isEdited: boolean;
  isStarred: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    profilePhoto?: string | null;
  };
  replyTo?: Message;
}

/**
 * Get all conversations for current user
 */
export async function getConversations(): Promise<Conversation[]> {
  return apiClient.get<Conversation[]>('/messages/conversations');
}

/**
 * Get conversation by ID
 */
export async function getConversation(conversationId: string): Promise<Conversation> {
  return apiClient.get<Conversation>(`/messages/conversations/${conversationId}`);
}

/**
 * Create a new conversation
 */
export async function createConversation(data: {
  type: 'direct' | 'group';
  participantIds: string[];
  name?: string;
}): Promise<Conversation> {
  return apiClient.post<Conversation>('/messages/conversations', data);
}

/**
 * Get messages in a conversation
 */
export async function getMessages(conversationId: string, params?: {
  limit?: number;
  before?: string; // message ID for pagination
}): Promise<{ data: Message[]; hasMore: boolean }> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.before) queryParams.append('before', params.before);

  return apiClient.get<{ data: Message[]; hasMore: boolean }>(
    `/messages/conversations/${conversationId}/messages?${queryParams.toString()}`
  );
}

/**
 * Send a message
 */
export async function sendMessage(conversationId: string, data: {
  content: string;
  messageType?: 'text' | 'image' | 'file';
  mediaUrl?: string;
}): Promise<Message> {
  return apiClient.post<Message>(`/messages/conversations/${conversationId}/messages`, data);
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  return apiClient.put(`/messages/messages/${messageId}/read`);
}

/**
 * Mark all messages in conversation as read
 */
export async function markConversationAsRead(conversationId: string): Promise<void> {
  return apiClient.put(`/messages/conversations/${conversationId}/read`);
}

/**
 * Create or get existing conversation with a user
 */
export async function getOrCreateConversation(userId: string, otherUserId: string): Promise<string | null> {
  try {
    // Get all conversations
    const conversations = await getConversations();
    
    // Find existing direct conversation with the other user
    const existing = conversations.find((conv) => {
      if (conv.conversationType !== 'direct') return false;
      const participantIds = conv.participants?.map(p => p.profileId) || [];
      return participantIds.includes(otherUserId) && participantIds.length === 2;
    });

    if (existing) {
      return existing.id;
    }

    // Create new conversation
    const newConv = await createConversation({
      type: 'direct',
      participantIds: [otherUserId],
    });

    return newConv.id;
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    return null;
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string, messageIds: string[]): Promise<void> {
  // Mark conversation as read (this marks all messages)
  await markConversationAsRead(conversationId);
}

/**
 * Upload media file for message
 */
export async function uploadMessageMedia(
  file: File,
  conversationId: string,
  messageId: string
): Promise<{ url: string; path: string }> {
  // Use the upload API
  const { uploadPostMedia } = await import('./upload');
  const result = await uploadPostMedia(file);
  return { url: result.cdnUrl, path: result.key };
}

