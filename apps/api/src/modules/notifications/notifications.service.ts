import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { ntfNotifications, ntfPreferences, profiles } from '@/database/schema';

@Injectable()
export class NotificationsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  /**
   * Get notifications for a user
   */
  async getNotifications(profileId: string, params?: { limit?: number; unreadOnly?: boolean }) {
    const { limit = 50, unreadOnly = false } = params || {};

    let whereConditions = [eq(ntfNotifications.recipientId, profileId)];

    if (unreadOnly) {
      whereConditions.push(eq(ntfNotifications.isRead, false));
    }

    const notifications = await this.db.query.ntfNotifications.findMany({
      where: and(...whereConditions),
      limit,
      orderBy: [desc(ntfNotifications.createdAt)],
      with: {
        sender: {
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            slug: true,
            profilePhoto: true,
          },
        },
        notificationType: true,
      },
    });

    return notifications;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(profileId: string) {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(ntfNotifications)
      .where(and(eq(ntfNotifications.recipientId, profileId), eq(ntfNotifications.isRead, false)));

    return { count: Number(result[0]?.count || 0) };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, profileId: string) {
    const notification = await this.db.query.ntfNotifications.findFirst({
      where: and(eq(ntfNotifications.id, notificationId), eq(ntfNotifications.recipientId, profileId)),
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (!notification.isRead) {
      await this.db
        .update(ntfNotifications)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(eq(ntfNotifications.id, notificationId));
    }

    return { success: true };
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(profileId: string) {
    await this.db
      .update(ntfNotifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(and(eq(ntfNotifications.recipientId, profileId), eq(ntfNotifications.isRead, false)));

    return { success: true };
  }

  /**
   * Get notification preferences
   */
  async getPreferences(profileId: string) {
    const preferences = await this.db.query.ntfPreferences.findMany({
      where: eq(ntfPreferences.profileId, profileId),
      with: {
        notificationType: true,
      },
    });

    return preferences;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(profileId: string, preferences: any[]) {
    // Delete existing preferences
    await this.db.delete(ntfPreferences).where(eq(ntfPreferences.profileId, profileId));

    // Insert new preferences
    if (preferences.length > 0) {
      await this.db.insert(ntfPreferences).values(
        preferences.map((pref) => ({
          profileId,
          notificationTypeId: pref.notificationTypeId,
          enableInApp: pref.enableInApp ?? true,
          enableEmail: pref.enableEmail ?? true,
          enablePush: pref.enablePush ?? true,
          enableSms: pref.enableSms ?? false,
          frequency: pref.frequency || 'instant',
        })),
      );
    }

    return this.getPreferences(profileId);
  }
}
