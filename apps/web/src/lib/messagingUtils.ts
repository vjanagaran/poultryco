/**
 * Messaging utility functions
 * Migrated from Supabase to REST API
 */

import {
  getOrCreateConversation as apiGetOrCreateConversation,
  sendMessage as apiSendMessage,
  markMessageAsRead as apiMarkMessageAsRead,
  markConversationAsRead as apiMarkConversationAsRead,
  uploadMessageMedia,
  type Conversation,
  type Message,
} from './api/messaging';
import { apiClient } from './api/client';

// Re-export types
export type { Conversation, Message };

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

// Create or get existing conversation with a user
export async function getOrCreateConversation(userId: string, otherUserId: string): Promise<string | null> {
  return apiGetOrCreateConversation(userId, otherUserId);
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  messageType: Message['messageType'] = 'text',
  mediaUrls: string[] = [],
  replyToMessageId?: string
): Promise<Message | null> {
  try {
    const message = await apiSendMessage(conversationId, {
      content: content.trim(),
      messageType: messageType === 'text' ? 'text' : messageType === 'image' ? 'image' : 'file',
      mediaUrl: mediaUrls[0], // API expects single mediaUrl for now
    });

    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

// Mark message as delivered
export async function markMessageDelivered(messageId: string, userId: string): Promise<void> {
  // Delivery is handled automatically by the API
  // This function is kept for compatibility
}

// Mark message as read
export async function markMessageRead(messageId: string, userId: string): Promise<void> {
  try {
    await apiMarkMessageAsRead(messageId);
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}

// Mark all messages in conversation as read
export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  try {
    await apiMarkConversationAsRead(conversationId);
  } catch (error) {
    console.error('Error marking conversation as read:', error);
  }
}

// Get message delivery status
export function getMessageStatus(
  message: Message,
  currentUserId: string,
  participantIds: string[]
): MessageStatus {
  // Own message
  if (message.senderId === currentUserId) {
    const otherParticipants = participantIds.filter(id => id !== currentUserId);
    
    // Check if all others have read
    const readBy = message.readBy || [];
    const allRead = otherParticipants.every(id => {
      if (typeof readBy === 'string') return false;
      return readBy.some((r: any) => r.profileId === id);
    });
    if (allRead) return 'read';
    
    // Check if delivered
    if (message.deliveredAt) return 'delivered';
    
    // At least sent
    return 'sent';
  }
  
  return 'sent'; // For other's messages, status doesn't matter
}

// Format timestamp for messages
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Today - show time
  if (diffInSeconds < 86400 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  
  // Yesterday
  if (diffInSeconds < 172800 && date.getDate() === now.getDate() - 1) {
    return 'Yesterday';
  }
  
  // This week
  if (diffInSeconds < 604800) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  // Older
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// Upload media file for message
export async function uploadMessageMediaFile(
  file: File,
  conversationId: string,
  messageId: string
): Promise<{ url: string; path: string } | null> {
  try {
    return await uploadMessageMedia(file, conversationId, messageId);
  } catch (error) {
    console.error('Error uploading message media:', error);
    return null;
  }
}
