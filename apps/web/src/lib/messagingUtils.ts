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

// Format conversation time
export function formatConversationTime(timestamp: string | null | undefined): string {
  if (!timestamp) return '';
  
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

// Group messages by date
export function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
  const grouped: Record<string, Message[]> = {};
  
  messages.forEach((message) => {
    const date = new Date(message.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey: string;
    
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      dateKey = date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      dateKey = date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(message);
  });
  
  return grouped;
}

// Check if user is online
export function isUserOnline(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  
  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
  
  // Consider online if last seen within last 5 minutes
  return diffInMinutes < 5;
}

// Format last seen time
export function formatLastSeen(lastSeenAt: string | null | undefined): string {
  if (!lastSeenAt) return 'offline';
  
  if (isUserOnline(lastSeenAt)) {
    return 'online';
  }
  
  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `last seen ${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `last seen ${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `last seen ${diffInDays}d ago`;
  }
  
  return `last seen ${lastSeen.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}
