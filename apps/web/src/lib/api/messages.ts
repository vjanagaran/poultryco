/**
 * Messages API - Replaces Supabase messaging
 * Uses REST API + Socket.io for real-time
 */

import { apiClient } from './client';

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  avatar_url?: string;
  last_message?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
  unread_count: number;
  participants: Array<{
    id: string;
    full_name: string;
    profile_slug: string;
    profile_photo_url: string | null;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  media_url?: string;
  read_at?: string;
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    profile_slug: string;
    profile_photo_url: string | null;
  };
}

/**
 * Get all conversations
 */
export async function getConversations(): Promise<Conversation[]> {
  return apiClient.get<Conversation[]>('/messages/conversations');
}

/**
 * Get a conversation by ID
 */
export async function getConversation(id: string): Promise<Conversation> {
  return apiClient.get<Conversation>(`/messages/conversations/${id}`);
}

/**
 * Create a new conversation
 */
export async function createConversation(data: {
  type: 'direct' | 'group';
  participant_ids: string[];
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
  message_type?: 'text' | 'image' | 'file';
  media_url?: string;
}): Promise<Message> {
  return apiClient.post<Message>(`/messages/conversations/${conversationId}/messages`, data);
}

/**
 * Mark message as read
 */
export async function markAsRead(messageId: string): Promise<void> {
  return apiClient.put(`/messages/${messageId}/read`);
}

/**
 * Mark all messages in conversation as read
 */
export async function markConversationAsRead(conversationId: string): Promise<void> {
  return apiClient.put(`/messages/conversations/${conversationId}/read`);
}

