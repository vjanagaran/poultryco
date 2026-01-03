import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq, and, desc } from 'drizzle-orm';
import { mktWapGroups, mktWapAccounts } from '../../database/schema/whatsapp';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { Client, GroupChat } from 'whatsapp-web.js';

@Injectable()
export class WhatsAppGroupService {
  private readonly logger = new Logger(WhatsAppGroupService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly accountService: WhatsAppAccountService,
  ) {}

  async discoverGroups(accountId: string) {
    const client = this.accountService.getClient(accountId);
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    try {
      const chats = await client.getChats();
      const groups = chats.filter(chat => chat.isGroup) as GroupChat[];

      const discoveredGroups = [];

      for (const group of groups) {
        const groupData = {
          groupId: group.id._serialized,
          name: group.name,
          description: group.description || null,
          memberCount: group.participants.length,
          accountId,
        };

        // Check if group already exists
        const existing = await this.db
          .select()
          .from(mktWapGroups)
          .where(eq(mktWapGroups.groupId, groupData.groupId))
          .limit(1);

        if (existing.length === 0) {
          // Insert new group
          const inserted = await this.db
            .insert(mktWapGroups)
            .values(groupData)
            .returning();
          discoveredGroups.push(inserted[0]);
        } else {
          // Update existing group
          await this.db
            .update(mktWapGroups)
            .set({
              name: groupData.name,
              description: groupData.description,
              memberCount: groupData.memberCount,
              updatedAt: new Date(),
            })
            .where(eq(mktWapGroups.id, existing[0].id));
          discoveredGroups.push(existing[0]);
        }
      }

      return discoveredGroups;
    } catch (error) {
      this.logger.error(`Error discovering groups for account ${accountId}:`, error);
      throw error;
    }
  }

  async getGroups(filters?: {
    accountId?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = this.db.select().from(mktWapGroups);

    // Note: accountId filter removed - use getAccountGroups() instead which joins with mkt_wap_group_accounts
    // if (filters?.accountId) {
    //   query = query.where(eq(mktWapGroups.accountId, filters.accountId));
    // }

    if (filters?.isActive !== undefined) {
      query = query.where(eq(mktWapGroups.isActive, filters.isActive));
    }

    query = query.orderBy(desc(mktWapGroups.createdAt));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return query;
  }

  async getGroupById(groupId: string) {
    const groups = await this.db
      .select()
      .from(mktWapGroups)
      .where(eq(mktWapGroups.id, groupId))
      .limit(1);

    if (groups.length === 0) {
      throw new Error('Group not found');
    }

    return groups[0];
  }

  async updateGroup(groupId: string, updates: {
    name?: string;
    description?: string;
    region?: string;
    state?: string;
    district?: string;
    segmentTags?: string[];
    isActive?: boolean;
    notes?: string;
  }) {
    await this.db
      .update(mktWapGroups)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(mktWapGroups.id, groupId));

    return this.getGroupById(groupId);
  }

  async scrapeContactsFromGroup(groupId: string, accountId: string) {
    const client = this.accountService.getClient(accountId);
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    const group = await this.getGroupById(groupId);
    const chat = await client.getChatById(group.groupId);

    if (!chat.isGroup) {
      throw new Error('Not a group chat');
    }

    const groupChat = chat as GroupChat;
    const participants = groupChat.participants;

    // Import contacts service (will create next)
    // For now, return participants data
    return participants.map((p: any) => ({
      phoneNumber: p.id?.user || p.id || null,
      name: (p as any).name || (p as any).pushname || null,
      isAdmin: (p as any).isAdmin || false,
      isSuperAdmin: (p as any).isSuperAdmin || false,
    }));
  }
}

