/**
 * Notification Service
 * 
 * Handles all notification-related operations
 * - Fetch notifications
 * - Mark as read
 * - Real-time subscriptions
 * - Create notifications (for @mentions)
 * - Get unread count
 */

import { createClient } from './supabase/client';
import { parseContent } from './streamUtils';

// =====================================================
// TYPES
// =====================================================

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string | null;
  notification_type: string;
  entity_type: string | null;
  entity_id: string | null;
  title: string;
  content: string | null;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  delivered_via: string[];
  created_at: string;
  expires_at: string | null;
  
  // Joined data
  sender?: {
    id: string;
    full_name: string;
    profile_slug: string;
    profile_photo_url: string | null;
  };
}

export interface NotificationPreferences {
  user_id: string;
  email_post_likes: boolean;
  email_post_comments: boolean;
  email_post_mentions: boolean;
  email_connection_requests: boolean;
  email_messages: boolean;
  email_weekly_digest: boolean;
  email_marketing: boolean;
  push_post_likes: boolean;
  push_post_comments: boolean;
  push_post_mentions: boolean;
  push_connection_requests: boolean;
  push_messages: boolean;
  push_events: boolean;
  in_app_post_likes: boolean;
  in_app_post_comments: boolean;
  in_app_connection_requests: boolean;
  in_app_messages: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  digest_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  created_at: string;
  updated_at: string;
}

// =====================================================
// FETCH NOTIFICATIONS
// =====================================================

/**
 * Fetch notifications for current user
 */
export async function fetchNotifications(
  limit: number = 20,
  offset: number = 0,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('notifications')
    .select(`
      *,
      sender:profiles!sender_id(
        id,
        full_name,
        profile_slug,
        profile_photo_url
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (unreadOnly) {
    query = query.eq('is_read', false);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  
  return data as Notification[];
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .rpc('get_unread_notifications_count', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
    });
  
  if (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
  
  return data || 0;
}

// =====================================================
// MARK AS READ
// =====================================================

/**
 * Mark notification(s) as read
 */
export async function markAsRead(notificationIds?: string[]): Promise<number> {
  const supabase = createClient();
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) return 0;
  
  const { data, error } = await supabase
    .rpc('mark_notifications_as_read', {
      p_user_id: user.id,
      p_notification_ids: notificationIds || null,
    });
  
  if (error) {
    console.error('Error marking notifications as read:', error);
    return 0;
  }
  
  return data || 0;
}

/**
 * Mark single notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const count = await markAsRead([notificationId]);
  return count > 0;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<number> {
  return await markAsRead();
}

// =====================================================
// CREATE NOTIFICATIONS
// =====================================================

/**
 * Create a notification (for @mentions in posts)
 */
export async function createNotification(
  recipientId: string,
  senderId: string,
  type: string,
  entityType: string,
  entityId: string,
  title: string,
  content: string,
  actionUrl?: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
): Promise<string | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .rpc('create_notification', {
      p_recipient_id: recipientId,
      p_sender_id: senderId,
      p_notification_type: type,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_title: title,
      p_content: content,
      p_action_url: actionUrl,
      p_priority: priority,
    });
  
  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }
  
  return data;
}

/**
 * Create notifications for @mentions in post content
 */
export async function createMentionNotifications(
  postId: string,
  postContent: string,
  authorId: string,
  authorName: string
): Promise<void> {
  const supabase = createClient();
  const parsed = parseContent(postContent);
  
  if (parsed.mentions.length === 0) return;
  
  // Get mentioned users' IDs
  const mentionSlugs = parsed.mentions.map((m) => m.username);
  
  const { data: mentionedUsers, error } = await supabase
    .from('profiles')
    .select('id, profile_slug')
    .in('profile_slug', mentionSlugs);
  
  if (error || !mentionedUsers) {
    console.error('Error fetching mentioned users:', error);
    return;
  }
  
  // Create notification for each mentioned user
  for (const user of mentionedUsers) {
    // Don't notify if user mentions themselves
    if (user.id === authorId) continue;
    
    await createNotification(
      user.id,
      authorId,
      'post_mention',
      'post',
      postId,
      `${authorName} mentioned you in a post`,
      postContent.substring(0, 100),
      `/stream?post=${postId}`,
      'normal'
    );
  }
}

/**
 * Create notifications for @mentions in comments
 */
export async function createCommentMentionNotifications(
  commentId: string,
  postId: string,
  commentContent: string,
  authorId: string,
  authorName: string
): Promise<void> {
  const supabase = createClient();
  const parsed = parseContent(commentContent);
  
  if (parsed.mentions.length === 0) return;
  
  // Get mentioned users' IDs
  const mentionSlugs = parsed.mentions.map((m) => m.username);
  
  const { data: mentionedUsers, error } = await supabase
    .from('profiles')
    .select('id, profile_slug')
    .in('profile_slug', mentionSlugs);
  
  if (error || !mentionedUsers) {
    console.error('Error fetching mentioned users:', error);
    return;
  }
  
  // Create notification for each mentioned user
  for (const user of mentionedUsers) {
    // Don't notify if user mentions themselves
    if (user.id === authorId) continue;
    
    await createNotification(
      user.id,
      authorId,
      'post_mention',
      'comment',
      commentId,
      `${authorName} mentioned you in a comment`,
      commentContent.substring(0, 100),
      `/stream?post=${postId}#comment-${commentId}`,
      'normal'
    );
  }
}

// =====================================================
// NOTIFICATION PREFERENCES
// =====================================================

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const supabase = createClient();
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching notification preferences:', error);
    return null;
  }
  
  return data;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  const supabase = createClient();
  const user = (await supabase.auth.getUser()).data.user;
  
  if (!user) return false;
  
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user.id,
      ...preferences,
    });
  
  if (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
  
  return true;
}

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void,
  onUnreadCountChange?: (count: number) => void
) {
  const supabase = createClient();
  
  // Subscribe to new notifications
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`,
      },
      async (payload) => {
        // Fetch full notification with sender details
        const { data } = await supabase
          .from('notifications')
          .select(`
            *,
            sender:profiles!sender_id(
              id,
              full_name,
              profile_slug,
              profile_photo_url
            )
          `)
          .eq('id', payload.new.id)
          .single();
        
        if (data) {
          onNotification(data as Notification);
          
          // Update unread count
          if (onUnreadCountChange) {
            const count = await getUnreadCount();
            onUnreadCountChange(count);
          }
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${userId}`,
      },
      async () => {
        // Update unread count when notifications are marked as read
        if (onUnreadCountChange) {
          const count = await getUnreadCount();
          onUnreadCountChange(count);
        }
      }
    )
    .subscribe();
  
  return () => {
    channel.unsubscribe();
  };
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Format notification timestamp
 */
export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  }
  
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    post_like: '❤️',
    post_comment: '💬',
    post_share: '🔄',
    post_mention: '@',
    comment_like: '👍',
    comment_reply: '💬',
    connection_request: '👥',
    connection_accepted: '✅',
    message_new: '📩',
    message_mention: '@',
    follow_new: '👤',
    profile_view: '👁️',
    endorsement_received: '⭐',
    badge_earned: '🏆',
    milestone_reached: '🎉',
    system_announcement: '📢',
    system_update: 'ℹ️',
  };
  
  return icons[type] || '🔔';
}

/**
 * Get notification color based on type
 */
export function getNotificationColor(type: string): string {
  const colors: Record<string, string> = {
    post_like: 'text-red-600',
    post_comment: 'text-blue-600',
    post_share: 'text-green-600',
    post_mention: 'text-purple-600',
    comment_like: 'text-yellow-600',
    comment_reply: 'text-blue-600',
    connection_request: 'text-indigo-600',
    connection_accepted: 'text-green-600',
    message_new: 'text-blue-600',
    message_mention: 'text-purple-600',
    follow_new: 'text-gray-600',
    profile_view: 'text-gray-600',
    endorsement_received: 'text-yellow-600',
    badge_earned: 'text-amber-600',
    milestone_reached: 'text-pink-600',
    system_announcement: 'text-red-600',
    system_update: 'text-blue-600',
  };
  
  return colors[type] || 'text-gray-600';
}

// =====================================================
// EXPORT
// =====================================================

export default {
  fetchNotifications,
  getUnreadCount,
  markAsRead,
  markNotificationAsRead,
  markAllAsRead,
  createNotification,
  createMentionNotifications,
  createCommentMentionNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  subscribeToNotifications,
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor,
};

