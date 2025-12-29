/**
 * Notification Service
 * 
 * Handles all notification-related operations
 * Migrated from Supabase to REST API
 */

import { 
  fetchNotifications as apiFetchNotifications,
  getUnreadCount as apiGetUnreadCount,
  markNotificationAsRead as apiMarkNotificationAsRead,
  markAllNotificationsAsRead as apiMarkAllNotificationsAsRead,
  getNotificationPreferences as apiGetNotificationPreferences,
  updateNotificationPreferences as apiUpdateNotificationPreferences,
  type Notification,
  type NotificationPreferences,
} from './api/notifications';
import { parseContent } from './streamUtils';

// Re-export types
export type { Notification, NotificationPreferences };

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
  return apiFetchNotifications(limit, offset, unreadOnly);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<number> {
  const result = await apiGetUnreadCount();
  return result.count || 0;
}

// =====================================================
// MARK AS READ
// =====================================================

/**
 * Mark notification(s) as read
 */
export async function markAsRead(notificationIds?: string[]): Promise<number> {
  if (!notificationIds || notificationIds.length === 0) {
    await apiMarkAllNotificationsAsRead();
    return 1;
  }

  let count = 0;
  for (const id of notificationIds) {
    try {
      await apiMarkNotificationAsRead(id);
      count++;
    } catch (error) {
      console.error(`Error marking notification ${id} as read:`, error);
    }
  }
  return count;
}

/**
 * Mark single notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    await apiMarkNotificationAsRead(notificationId);
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<number> {
  try {
    await apiMarkAllNotificationsAsRead();
    return 1;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return 0;
  }
}

// =====================================================
// CREATE NOTIFICATIONS
// =====================================================

/**
 * Create a notification (for @mentions in posts)
 * Note: This should be handled by the backend when posts are created
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
  // TODO: Implement notification creation endpoint in API
  console.warn('createNotification: Should be handled by backend when posts are created');
  return null;
}

/**
 * Create notifications for @mentions in post content
 * Note: This should be handled by the backend when posts are created
 */
export async function createMentionNotifications(
  postId: string,
  postContent: string,
  authorId: string,
  authorName: string
): Promise<void> {
  // TODO: Implement mention notification creation in API
  console.warn('createMentionNotifications: Should be handled by backend when posts are created');
}

/**
 * Create notifications for @mentions in comments
 * Note: This should be handled by the backend when comments are created
 */
export async function createCommentMentionNotifications(
  commentId: string,
  postId: string,
  commentContent: string,
  authorId: string,
  authorName: string
): Promise<void> {
  // TODO: Implement mention notification creation in API
  console.warn('createCommentMentionNotifications: Should be handled by backend when comments are created');
}

// =====================================================
// PREFERENCES
// =====================================================

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences[]> {
  return apiGetNotificationPreferences();
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: NotificationPreferences[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiUpdateNotificationPreferences(preferences);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update preferences' };
  }
}

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

/**
 * Subscribe to notification updates via Socket.io
 * Note: Real-time updates should use Socket.io connection
 */
export function subscribeToNotifications(
  callback: (notification: Notification) => void
): () => void {
  // TODO: Implement Socket.io subscription
  console.warn('subscribeToNotifications: Socket.io subscription not yet implemented');
  return () => {}; // Return unsubscribe function
}

/**
 * Unsubscribe from notification updates
 */
export function unsubscribeFromNotifications(): void {
  // TODO: Implement Socket.io unsubscription
}
