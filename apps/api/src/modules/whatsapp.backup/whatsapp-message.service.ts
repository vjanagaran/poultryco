import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq, and, desc } from 'drizzle-orm';
import { mktWapMessages, mktWapAccounts, mktWapGroups, mktWapContacts } from '../../database/schema/whatsapp';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { Client, MessageSendOptions } from 'whatsapp-web.js';

@Injectable()
export class WhatsAppMessageService {
  private readonly logger = new Logger(WhatsAppMessageService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly accountService: WhatsAppAccountService,
  ) {}

  async sendMessage(data: {
    accountId: string;
    campaignId: string;
    contentId?: string;
    messageType: 'text' | 'image' | 'video' | 'document' | 'link';
    messageText?: string;
    mediaUrl?: string;
    linkUrl?: string;
    channelType: 'group' | 'individual' | 'broadcast';
    targetGroupId?: string;
    targetContactId?: string;
    scheduledAt?: Date;
  }) {
    // Validate account
    const account = await this.db
      .select()
      .from(mktWapAccounts)
      .where(eq(mktWapAccounts.id, data.accountId))
      .limit(1);

    if (account.length === 0) {
      throw new NotFoundException('WhatsApp account not found');
    }

    if (account[0].status !== 'active') {
      throw new BadRequestException('WhatsApp account is not active');
    }

    // Check rate limits
    if (account[0].dailyUsageCount >= account[0].dailyUsageLimit) {
      throw new BadRequestException('Daily usage limit reached');
    }

    // Get client
    const client = this.accountService.getClient(data.accountId);
    if (!client) {
      throw new BadRequestException('WhatsApp client not initialized');
    }

    // Create message record
    const messageRecord = await this.db
      .insert(mktWapMessages)
      .values({
        campaignId: data.campaignId,
        contentId: data.contentId,
        messageType: data.messageType,
        messageText: data.messageText,
        mediaUrl: data.mediaUrl,
        linkUrl: data.linkUrl,
        channelType: data.channelType,
        targetGroupId: data.targetGroupId,
        targetContactId: data.targetContactId,
        accountId: data.accountId,
        status: data.scheduledAt ? 'pending' : 'queued',
        scheduledAt: data.scheduledAt,
      })
      .returning();

    const messageId = messageRecord[0].id;

    // Send message if not scheduled
    if (!data.scheduledAt) {
      try {
        await this.executeSend(messageId, client, data);
      } catch (error) {
        this.logger.error(`Error sending message ${messageId}:`, error);
        await this.updateMessageStatus(messageId, 'failed', { errorMessage: error.message });
        throw error;
      }
    }

    return messageRecord[0];
  }

  private async executeSend(messageId: string, client: Client, data: any) {
    let sentMessage: any;

    try {
      // Determine target
      let target: string;
      if (data.channelType === 'group') {
        // Get group ID from database
        const group = await this.db
          .select()
          .from(mktWapGroups)
          .where(eq(mktWapGroups.id, data.targetGroupId))
          .limit(1);
        
        if (group.length === 0) {
          throw new NotFoundException('Group not found');
        }
        target = group[0].groupId;
      } else {
        // Get contact phone number
        const contact = await this.db
          .select()
          .from(mktWapContacts)
          .where(eq(mktWapContacts.id, data.targetContactId))
          .limit(1);
        
        if (contact.length === 0) {
          throw new NotFoundException('Contact not found');
        }
        target = `${contact[0].phoneNumber}@c.us`;
      }

      // Send based on message type
      let messageContent: string;
      let options: any = {};

      switch (data.messageType) {
        case 'text':
          messageContent = data.messageText || '';
          break;
        case 'image':
        case 'video':
        case 'document':
          messageContent = data.mediaUrl || '';
          if (data.messageText) {
            options.caption = data.messageText;
          }
          break;
        case 'link':
          messageContent = data.linkUrl || '';
          break;
        default:
          throw new BadRequestException('Invalid message type');
      }

      if (!messageContent) {
        throw new BadRequestException('Message content is required');
      }

      sentMessage = await client.sendMessage(target, messageContent, options);

      // Update message status
      await this.updateMessageStatus(messageId, 'sent', {
        sentAt: new Date(),
      });

      // Increment account usage
      await this.accountService.incrementDailyUsage(data.accountId);

      // Set up delivery tracking
      sentMessage.on('delivery', async () => {
        await this.updateMessageStatus(messageId, 'delivered', {
          deliveredAt: new Date(),
          deliveryConfirmations: 1,
        });
      });

      sentMessage.on('read', async () => {
        await this.updateMessageStatus(messageId, 'read', {
          readAt: new Date(),
          readConfirmations: 1,
        });
      });

    } catch (error) {
      this.logger.error(`Error executing send for message ${messageId}:`, error);
      await this.updateMessageStatus(messageId, 'failed', {
        errorMessage: error.message,
        retryCount: 1,
      });
      throw error;
    }
  }

  private async updateMessageStatus(
    messageId: string,
    status: string,
    updates: any = {},
  ) {
    await this.db
      .update(mktWapMessages)
      .set({
        status: status as any,
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(mktWapMessages.id, messageId));
  }

  async getMessages(filters?: {
    campaignId?: string;
    accountId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.db.select().from(mktWapMessages);

    if (filters?.campaignId) {
      query = query.where(eq(mktWapMessages.campaignId, filters.campaignId));
    }

    if (filters?.accountId) {
      query = query.where(eq(mktWapMessages.accountId, filters.accountId));
    }

    if (filters?.status) {
      query = query.where(eq(mktWapMessages.status, filters.status));
    }

    query = query.orderBy(desc(mktWapMessages.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return query;
  }

  async getMessageById(messageId: string) {
    const messages = await this.db
      .select()
      .from(mktWapMessages)
      .where(eq(mktWapMessages.id, messageId))
      .limit(1);

    if (messages.length === 0) {
      throw new NotFoundException('Message not found');
    }

    return messages[0];
  }

  async retryMessage(messageId: string) {
    const message = await this.getMessageById(messageId);

    if (message.status !== 'failed') {
      throw new BadRequestException('Can only retry failed messages');
    }

    if (message.retryCount >= 3) {
      throw new BadRequestException('Maximum retry attempts reached');
    }

    const account = await this.db
      .select()
      .from(mktWapAccounts)
      .where(eq(mktWapAccounts.id, message.accountId))
      .limit(1);

    if (account.length === 0) {
      throw new NotFoundException('Account not found');
    }

    const client = this.accountService.getClient(message.accountId);
    if (!client) {
      throw new BadRequestException('Client not initialized');
    }

    await this.updateMessageStatus(messageId, 'queued', {
      retryCount: message.retryCount + 1,
      errorMessage: null,
    });

    try {
      await this.executeSend(messageId, client, message);
    } catch (error) {
      await this.updateMessageStatus(messageId, 'failed', {
        errorMessage: error.message,
      });
      throw error;
    }
  }
}

