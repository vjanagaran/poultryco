// Messaging utility functions
import { createClient } from './supabase/client';

export interface Conversation {
  id: string;
  is_group: boolean;
  group_name?: string | null;
  group_photo_url?: string | null;
  group_description?: string | null;
  created_by: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  
  // Joined data
  participants?: ConversationParticipant[];
  other_participant?: {
    id: string;
    full_name: string;
    profile_slug: string;
    profile_photo_url: string | null;
    headline: string | null;
    is_online?: boolean;
    last_seen_at?: string | null;
  };
  unread_count?: number;
  is_muted?: boolean;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  is_admin: boolean;
  is_active: boolean;
  joined_at: string;
  last_read_at: string;
  unread_count: number;
  is_muted: boolean;
  
  user?: {
    id: string;
    full_name: string;
    profile_slug: string;
    profile_photo_url: string | null;
    headline: string | null;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'location' | 'contact' | 'system';
  media_urls: string[];
  reply_to_message_id: string | null;
  forwarded_from_message_id: string | null;
  edited: boolean;
  edited_at: string | null;
  deleted: boolean;
  deleted_at: string | null;
  read_by: string[];
  delivered_to: string[];
  created_at: string;
  
  // Joined data
  sender?: {
    id: string;
    full_name: string;
    profile_slug: string;
    profile_photo_url: string | null;
  };
  reply_to?: Message;
}

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

// Create or get existing conversation with a user
export async function getOrCreateConversation(userId: string, otherUserId: string): Promise<string | null> {
  const supabase = createClient();
  
  try {
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversation_participants')
      .select('conversation_id, conversations!inner(*)')
      .eq('user_id', userId)
      .eq('conversations.is_group', false);

    if (existing && existing.length > 0) {
      // Find conversation with the other user
      for (const conv of existing) {
        const { data: participants } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.conversation_id);

        const userIds = participants?.map(p => p.user_id) || [];
        if (userIds.includes(otherUserId) && userIds.length === 2) {
          return conv.conversation_id;
        }
      }
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        is_group: false,
        created_by: userId,
      })
      .select()
      .single();

    if (convError) throw convError;

    // Add both participants
    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversation.id, user_id: userId, is_admin: false },
        { conversation_id: conversation.id, user_id: otherUserId, is_admin: false },
      ]);

    if (participantsError) throw participantsError;

    return conversation.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
}

// Send a message
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  messageType: Message['message_type'] = 'text',
  mediaUrls: string[] = [],
  replyToMessageId?: string
): Promise<Message | null> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
        message_type: messageType,
        media_urls: mediaUrls,
        reply_to_message_id: replyToMessageId || null,
      })
      .select(`
        *,
        sender:profiles!sender_id(
          id,
          full_name,
          profile_slug,
          profile_photo_url
        )
      `)
      .single();

    if (error) throw error;

    // Mark as delivered to sender immediately
    await markMessageDelivered(data.id, senderId);

    return data as Message;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

// Mark message as delivered
export async function markMessageDelivered(messageId: string, userId: string): Promise<void> {
  const supabase = createClient();
  
  try {
    const { data: message } = await supabase
      .from('messages')
      .select('delivered_to')
      .eq('id', messageId)
      .single();

    if (message && !message.delivered_to.includes(userId)) {
      await supabase
        .from('messages')
        .update({
          delivered_to: [...message.delivered_to, userId],
        })
        .eq('id', messageId);
    }
  } catch (error) {
    console.error('Error marking message as delivered:', error);
  }
}

// Mark message as read
export async function markMessageRead(messageId: string, userId: string): Promise<void> {
  const supabase = createClient();
  
  try {
    const { data: message } = await supabase
      .from('messages')
      .select('read_by, delivered_to')
      .eq('id', messageId)
      .single();

    if (message && !message.read_by.includes(userId)) {
      // Ensure delivered_to includes user
      const deliveredTo = message.delivered_to.includes(userId)
        ? message.delivered_to
        : [...message.delivered_to, userId];

      await supabase
        .from('messages')
        .update({
          read_by: [...message.read_by, userId],
          delivered_to: deliveredTo,
        })
        .eq('id', messageId);
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}

// Mark all messages in conversation as read
export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  const supabase = createClient();
  
  try {
    // Call the database function
    await supabase.rpc('mark_messages_as_read', {
      p_conversation_id: conversationId,
      p_user_id: userId,
    });
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
  if (message.sender_id === currentUserId) {
    const otherParticipants = participantIds.filter(id => id !== currentUserId);
    
    // Check if all others have read
    const allRead = otherParticipants.every(id => message.read_by.includes(id));
    if (allRead) return 'read';
    
    // Check if all others have received
    const allDelivered = otherParticipants.every(id => message.delivered_to.includes(id));
    if (allDelivered) return 'delivered';
    
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

// Format conversation preview time
export function formatConversationTime(timestamp: string | null): string {
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
  if (diffInSeconds < 172800) {
    return 'Yesterday';
  }
  
  // This week
  if (diffInSeconds < 604800) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  
  // Older
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? '2-digit' : undefined,
  });
}

// Upload media for message
export async function uploadMessageMedia(
  file: File,
  conversationId: string,
  userId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createClient();
    
    // Validate file
    if (file.size > 50 * 1024 * 1024) {
      return { success: false, error: 'File must be less than 50MB' };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `messages/${conversationId}/${userId}/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('cdn-poultryco')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cdn-poultryco')
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Failed to upload file' };
  }
}

// Check if user is online (last seen < 2 minutes ago)
export function isUserOnline(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  
  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000);
  
  return diffInSeconds < 120; // 2 minutes
}

// Format last seen
export function formatLastSeen(lastSeenAt: string | null | undefined): string {
  if (!lastSeenAt) return 'last seen a long time ago';
  
  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'last seen just now';
  if (diffInSeconds < 3600) return `last seen ${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `last seen ${Math.floor(diffInSeconds / 3600)} hours ago`;
  
  return `last seen ${lastSeen.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

// Group messages by date
export function groupMessagesByDate(messages: Message[]): { [date: string]: Message[] } {
  const grouped: { [date: string]: Message[] } = {};
  
  messages.forEach((message) => {
    const date = new Date(message.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateKey: string;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
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

