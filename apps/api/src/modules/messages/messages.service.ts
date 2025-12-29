import { Injectable, NotFoundException, Inject, ForbiddenException } from '@nestjs/common';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { msgConversations, msgParticipants, msgMessages, profiles } from '@/database/schema';

@Injectable()
export class MessagesService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  /**
   * Get all conversations for a user
   */
  async getConversations(profileId: string) {
    // Get all participant records for this user
    const participants = await this.db.query.msgParticipants.findMany({
      where: and(
        eq(msgParticipants.profileId, profileId),
        isNull(msgParticipants.leftAt),
      ),
      with: {
        conversation: {
          with: {
            participants: {
              where: isNull(msgParticipants.leftAt),
              with: {
                profile: {
                  columns: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    slug: true,
                    profilePhoto: true,
                    headline: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Extract conversations and add unread count, then sort by lastMessageAt
    const conversations = participants
      .map((p: any) => {
        const conv = p.conversation;
        conv.unreadCount = p.unreadCount || 0;
        return conv;
      })
      .sort((a: any, b: any) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bTime - aTime;
      });

    return conversations;
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string, profileId: string) {
    // Check if user is a participant
    const participant = await this.db.query.msgParticipants.findFirst({
      where: and(
        eq(msgParticipants.conversationId, conversationId),
        eq(msgParticipants.profileId, profileId),
        isNull(msgParticipants.leftAt),
      ),
    });

    if (!participant) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    const conversation = await this.db.query.msgConversations.findFirst({
      where: eq(msgConversations.id, conversationId),
      with: {
        participants: {
          where: isNull(msgParticipants.leftAt),
          with: {
            profile: {
              columns: {
                id: true,
                firstName: true,
                lastName: true,
                slug: true,
                profilePhoto: true,
                headline: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  /**
   * Create a new conversation
   */
  async createConversation(creatorId: string, data: { type: string; participantIds: string[]; name?: string }) {
    const { type, participantIds, name } = data;

    // Create conversation
    const [conversation] = await this.db
      .insert(msgConversations)
      .values({
        conversationType: type,
        name,
        createdBy: creatorId,
      })
      .returning();

    // Add participants
    const participants = [
      { conversationId: conversation.id, profileId: creatorId, role: 'admin' },
      ...participantIds.map((id) => ({ conversationId: conversation.id, profileId: id, role: 'member' })),
    ];

    await this.db.insert(msgParticipants).values(participants);

    return this.getConversation(conversation.id, creatorId);
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(conversationId: string, profileId: string, params?: { limit?: number; before?: string }) {
    // Check if user is a participant
    const participant = await this.db.query.msgParticipants.findFirst({
      where: and(
        eq(msgParticipants.conversationId, conversationId),
        eq(msgParticipants.profileId, profileId),
        isNull(msgParticipants.leftAt),
      ),
    });

    if (!participant) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    const { limit = 50, before } = params || {};

    let whereConditions = [
      eq(msgMessages.conversationId, conversationId),
      isNull(msgMessages.deletedAt),
    ];

    if (before) {
      whereConditions.push(sql`${msgMessages.id} < ${before}`);
    }

    const messages = await this.db.query.msgMessages.findMany({
      where: and(...whereConditions),
      limit,
      orderBy: [desc(msgMessages.createdAt)],
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
      },
    });

    // Mark as read
    await this.db
      .update(msgParticipants)
      .set({
        lastReadAt: new Date(),
        unreadCount: 0,
      })
      .where(
        and(
          eq(msgParticipants.conversationId, conversationId),
          eq(msgParticipants.profileId, profileId),
        ),
      );

    return {
      data: messages.reverse(), // Return in chronological order
      hasMore: messages.length === limit,
    };
  }

  /**
   * Send a message
   */
  async sendMessage(conversationId: string, senderId: string, data: { content: string; messageType?: string; mediaUrl?: string }) {
    // Check if user is a participant
    const participant = await this.db.query.msgParticipants.findFirst({
      where: and(
        eq(msgParticipants.conversationId, conversationId),
        eq(msgParticipants.profileId, senderId),
        isNull(msgParticipants.leftAt),
      ),
    });

    if (!participant) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    // Create message
    const [message] = await this.db
      .insert(msgMessages)
      .values({
        conversationId,
        senderId,
        content: data.content,
        messageType: data.messageType || 'text',
        mediaUrl: data.mediaUrl,
      })
      .returning();

    // Update conversation last message
    await this.db
      .update(msgConversations)
      .set({
        lastMessageAt: new Date(),
        messagesCount: sql`${msgConversations.messagesCount} + 1`,
      })
      .where(eq(msgConversations.id, conversationId));

    // Increment unread count for other participants
    await this.db
      .update(msgParticipants)
      .set({
        unreadCount: sql`${msgParticipants.unreadCount} + 1`,
      })
      .where(
        and(
          eq(msgParticipants.conversationId, conversationId),
          sql`${msgParticipants.profileId} != ${senderId}`,
          isNull(msgParticipants.leftAt),
        ),
      );

    return this.db.query.msgMessages.findFirst({
      where: eq(msgMessages.id, message.id),
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
      },
    });
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string, profileId: string) {
    const message = await this.db.query.msgMessages.findFirst({
      where: eq(msgMessages.id, messageId),
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Update read status
    const readBy = message.readBy || [];
    if (!readBy.find((r: any) => r.profileId === profileId)) {
      readBy.push({ profileId, readAt: new Date().toISOString() });
      await this.db
        .update(msgMessages)
        .set({
          readBy,
          readAt: readBy.length === 1 ? new Date() : message.readAt,
        })
        .where(eq(msgMessages.id, messageId));
    }

    return { success: true };
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(conversationId: string, profileId: string) {
    await this.db
      .update(msgParticipants)
      .set({
        lastReadAt: new Date(),
        unreadCount: 0,
      })
      .where(
        and(
          eq(msgParticipants.conversationId, conversationId),
          eq(msgParticipants.profileId, profileId),
        ),
      );

    return { success: true };
  }
}
