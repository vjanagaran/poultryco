/**
 * Notifications API - Replaces Supabase notification queries
 */

import { apiClient } from './client';

export interface Notification {
  id: string;
  recipientId: string;
  senderId?: string | null;
  notificationTypeId: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  imageUrl?: string | null;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  expiresAt?: string | null;
  
  // Joined data
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    profilePhoto?: string | null;
  };
  notificationType?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface NotificationPreferences {
  id: string;
  profileId: string;
  notificationTypeId: string;
  enableInApp: boolean;
  enableEmail: boolean;
  enablePush: boolean;
  enableSms: boolean;
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
  notificationType?: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Fetch notifications for current user
 */
export async function fetchNotifications(
  limit: number = 20,
  offset: number = 0,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append('limit', limit.toString());
  if (offset) queryParams.append('offset', offset.toString());
  if (unreadOnly) queryParams.append('unreadOnly', 'true');

  return apiClient.get<Notification[]>(`/notifications?${queryParams.toString()}`);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  return apiClient.get<{ count: number }>('/notifications/unread-count');
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
  return apiClient.put<{ success: boolean }>(`/notifications/${notificationId}/read`);
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean }> {
  return apiClient.put<{ success: boolean }>('/notifications/read-all');
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences[]> {
  return apiClient.get<NotificationPreferences[]>('/notifications/preferences');
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: NotificationPreferences[]
): Promise<NotificationPreferences[]> {
  return apiClient.post<NotificationPreferences[]>('/notifications/preferences', preferences);
}

