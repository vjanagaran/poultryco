import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq, and, desc, isNull, or, sql, notInArray, inArray } from 'drizzle-orm';
import { 
  mktWapGroups, 
  mktWapAccounts, 
  mktWapContacts,
  mktWapGroupAccounts,
  mktWapGroupContacts
} from '../../database/schema/whatsapp';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { Client, GroupChat } from 'whatsapp-web.js';

@Injectable()
export class WhatsAppGroupService {
  private readonly logger = new Logger(WhatsAppGroupService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly accountService: WhatsAppAccountService,
  ) {}

  async getLiveGroups(accountId: string): Promise<any[]> {
    const client = this.accountService.getClient(accountId);
    if (!client) {
      this.logger.error(`WhatsApp client not found for account ${accountId}`);
      throw new Error('WhatsApp client not initialized. Please initialize the account first.');
    }

    // Validate client before using it
    const isValid = await this.accountService.validateClient(accountId);
    if (!isValid) {
      this.logger.warn(`Client for account ${accountId} is invalid - cleaning up`);
      await this.accountService.cleanupInvalidClient(accountId);
      throw new Error('WhatsApp session is not available. The browser session was closed. Please reconnect the account.');
    }

    // Check if client is ready/connected
    let state: string;
    try {
      // First check if client.info exists (quick check without accessing Puppeteer)
      if (!client.info) {
        this.logger.warn(`WhatsApp client for account ${accountId} has no info - likely not ready`);
        throw new Error('WhatsApp session is not available. The client may be disconnected. Please reconnect the account.');
      }

      // Try to get state - this may fail if Puppeteer frame is detached
      state = await client.getState();
      this.logger.debug(`Client state for account ${accountId}: ${state}`);
    } catch (stateError: any) {
      // Check if it's a detached frame error
      if (stateError.message && (
        stateError.message.includes('detached Frame') ||
        stateError.message.includes('Target closed') ||
        stateError.message.includes('Session closed')
      )) {
        this.logger.error(`WhatsApp client for account ${accountId} has a detached frame - cleaning up`);
        // Clean up the invalid client
        await this.accountService.cleanupInvalidClient(accountId);
        throw new Error('WhatsApp session is not available. The browser session was closed. Please reconnect the account.');
      }
      
      // If getState() itself fails, the client is likely not ready or disconnected
      this.logger.error(`Could not get client state for account ${accountId}: ${stateError.message}`, stateError.stack);
      throw new Error('WhatsApp session is not available. The client may be disconnected. Please reconnect the account.');
    }

    if (state !== 'CONNECTED') {
      this.logger.warn(`WhatsApp client for account ${accountId} is not connected - state: ${state}`);
      throw new Error(`WhatsApp session is not connected (current state: ${state}). Please reconnect the account.`);
    }
    
    // Also check if client.info is available (optional check, but helps with debugging)
    if (!client.info || !client.info.wid) {
      this.logger.warn(`WhatsApp client for account ${accountId} is connected but info not available yet`);
      // Don't throw here - info might not be available immediately after connection
      // But log it for debugging
    }

    try {
      // Get chats with retry logic for timeout errors
      let chats: any[] | undefined;
      let retries = 0;
      const maxRetries = 2;
      
      while (retries <= maxRetries) {
        try {
          this.logger.debug(`Fetching chats for account ${accountId} (attempt ${retries + 1}/${maxRetries + 1})`);
          chats = await client.getChats();
          break; // Success, exit retry loop
        } catch (chatError: any) {
          if (chatError?.message?.includes('timeout') && retries < maxRetries) {
            retries++;
            this.logger.warn(`Timeout fetching chats (attempt ${retries}), retrying in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          throw chatError; // Re-throw if not a timeout or max retries reached
        }
      }
      
      if (!chats) {
        throw new Error('Failed to fetch chats after retries');
      }
      
      const groups = chats.filter(chat => chat.isGroup) as GroupChat[];
      this.logger.log(`Found ${groups.length} groups for account ${accountId}`);
      
      const liveGroups = [];
      
      for (const group of groups) {
        // Get profile picture URL from WhatsApp
        // Skip profile picture if frame is detached to avoid errors
        let profilePicUrl = null;
        try {
          // Check if client is still connected before trying to get profile picture
          if (client.info && client.info.wid) {
            profilePicUrl = await (group as any).getProfilePicUrl();
          }
        } catch (error: any) {
          // Handle detached frame error specifically
          if (error?.message?.includes('detached Frame') || error?.message?.includes('Session closed')) {
            this.logger.debug(`Skipping profile picture for group ${group.name} - frame detached`);
          } else {
            // Profile picture might not be available for other reasons
            this.logger.debug(`Could not get profile picture for group ${group.name}: ${error.message}`);
          }
        }

        liveGroups.push({
          groupId: group.id._serialized,
          name: group.name,
          description: group.description || null,
          memberCount: group.participants?.length || 0,
          profilePicUrl: profilePicUrl || null,
        });
      }

      return liveGroups;
    } catch (error: any) {
      // Handle detached frame error at the top level
      if (error?.message?.includes('detached Frame') || error?.message?.includes('Session closed')) {
        this.logger.warn(`WhatsApp frame detached for account ${accountId}, returning groups without profile pictures`);
        // Try to get groups without profile pictures
        try {
          const chats = await client.getChats();
          const groups = chats.filter(chat => chat.isGroup) as GroupChat[];
          return groups.map((group) => ({
            groupId: group.id._serialized,
            name: group.name,
            description: group.description || null,
            memberCount: group.participants?.length || 0,
            profilePicUrl: null, // Skip profile pictures if frame is detached
          }));
        } catch (retryError: any) {
          this.logger.error(`Error getting groups after frame detachment: ${retryError.message}`);
          throw new Error('WhatsApp session is not available. Please reconnect the account.');
        }
      }
      
      // Handle other errors
      if (error?.message?.includes('not ready') || error?.message?.includes('not available')) {
        throw error; // Re-throw session errors as-is
      }
      
      this.logger.error(`Error getting live groups for account ${accountId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async saveSingleGroup(accountId: string, whatsappGroupId: string) {
    const client = this.accountService.getClient(accountId);
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    try {
      const chat = await client.getChatById(whatsappGroupId);
      if (!chat.isGroup) {
        throw new Error('Not a group chat');
      }

      const group = chat as GroupChat;

      // Get profile picture URL - skip if frame is detached
      let profilePicUrl = null;
      try {
        // Check if client is still connected before trying to get profile picture
        if (client.info && client.info.wid) {
          profilePicUrl = await (group as any).getProfilePicUrl();
        }
      } catch (error: any) {
        // Handle detached frame error specifically
        if (error?.message?.includes('detached Frame') || error?.message?.includes('Session closed')) {
          this.logger.debug(`Skipping profile picture for group ${group.name} - frame detached`);
        } else {
          this.logger.debug(`Could not get profile picture for group ${group.name}: ${error.message}`);
        }
      }

      const groupWhatsappId = group.id._serialized;
      
      // Determine account's role in the group
      const accountParticipant = group.participants.find((p: any) => {
        const participantId = p.id?._serialized || p.id;
        const accountInfo = client.info;
        return participantId === accountInfo?.wid?._serialized || participantId === accountInfo?.wid;
      });
      
      const isAccountAdmin = (accountParticipant as any)?.isAdmin || false;
      const isAccountSuperAdmin = (accountParticipant as any)?.isSuperAdmin || false;

      // Check if group already exists globally (by WhatsApp group ID)
      const existingGroup = await this.db
        .select()
        .from(mktWapGroups)
        .where(eq(mktWapGroups.groupId, groupWhatsappId))
        .limit(1);

      let groupRecord;
      
      if (existingGroup.length === 0) {
        // Group doesn't exist - create new global group record (NO accountId)
        const inserted = await this.db
          .insert(mktWapGroups)
          .values({
            groupId: groupWhatsappId,
            name: group.name,
            description: group.description || null,
            memberCount: group.participants.length,
            profilePicUrl: profilePicUrl || null,
            isAdminOnlyGroup: (group as any).restrict || false,
          })
          .returning();
        groupRecord = inserted[0];
        this.logger.log(`Created new global group record: ${groupRecord.id} for WhatsApp group ${groupWhatsappId}`);
      } else {
        // Group exists - update global metadata (affects all accounts)
        await this.db
          .update(mktWapGroups)
          .set({
            name: group.name,
            description: group.description || null,
            memberCount: group.participants.length,
            profilePicUrl: profilePicUrl || null,
            isAdminOnlyGroup: (group as any).restrict || false,
            updatedAt: new Date(),
          })
          .where(eq(mktWapGroups.id, existingGroup[0].id));
        groupRecord = existingGroup[0];
        this.logger.log(`Updated existing global group: ${groupRecord.id} for WhatsApp group ${groupWhatsappId}`);
      }

      // Create or update account-group mapping
      const existingMapping = await this.db
        .select()
        .from(mktWapGroupAccounts)
        .where(
          and(
            eq(mktWapGroupAccounts.groupId, groupRecord.id),
            eq(mktWapGroupAccounts.accountId, accountId)
          )
        )
        .limit(1);

      if (existingMapping.length === 0) {
        // Create new account mapping
        await this.db
          .insert(mktWapGroupAccounts)
          .values({
            groupId: groupRecord.id,
            accountId: accountId,
            isAccountAdmin,
            isAccountSuperAdmin,
            isAdminOnlyGroup: (group as any).restrict || false,
            discoveredAt: new Date(),
          });
        this.logger.log(`Created account mapping: Account ${accountId} → Group ${groupRecord.id}`);
      } else {
        // Update existing mapping (refresh permissions)
        await this.db
          .update(mktWapGroupAccounts)
          .set({
            isAccountAdmin,
            isAccountSuperAdmin,
            isAdminOnlyGroup: (group as any).restrict || false,
            lastAccessedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(mktWapGroupAccounts.id, existingMapping[0].id));
        this.logger.log(`Updated account mapping: Account ${accountId} → Group ${groupRecord.id}`);
      }

      return groupRecord;
    } catch (error: any) {
      this.logger.error(`Error saving single group for account ${accountId}: ${error.message}`, error.stack);
      throw error;
    }
  }

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
        // Get profile picture URL
        let profilePicUrl = null;
        try {
          profilePicUrl = await (group as any).getProfilePicUrl();
        } catch (error: any) {
          // Profile picture might not be available, continue without it
          this.logger.debug(`Could not get profile picture for group ${group.name}`);
        }

        const whatsappGroupId = group.id._serialized;
        
        // Determine account's role in the group
        const accountParticipant = group.participants.find((p: any) => {
          const participantId = p.id?._serialized || p.id;
          const accountInfo = client.info;
          return participantId === accountInfo?.wid?._serialized || participantId === accountInfo?.wid;
        });
        
        const isAccountAdmin = (accountParticipant as any)?.isAdmin || false;
        const isAccountSuperAdmin = (accountParticipant as any)?.isSuperAdmin || false;

        // Check if group already exists globally (by WhatsApp group ID)
        const existingGroup = await this.db
          .select()
          .from(mktWapGroups)
          .where(eq(mktWapGroups.groupId, whatsappGroupId))
          .limit(1);

        let groupRecord;
        
        if (existingGroup.length === 0) {
          // Group doesn't exist - create new global group record (NO accountId)
          const inserted = await this.db
            .insert(mktWapGroups)
            .values({
              groupId: whatsappGroupId,
              name: group.name,
              description: group.description || null,
              memberCount: group.participants.length,
              profilePicUrl: profilePicUrl || null,
              isAdminOnlyGroup: (group as any).restrict || false,
            })
            .returning();
          groupRecord = inserted[0];
        } else {
          // Group exists - update global metadata (affects all accounts)
          await this.db
            .update(mktWapGroups)
            .set({
              name: group.name,
              description: group.description || null,
              memberCount: group.participants.length,
              profilePicUrl: profilePicUrl || null,
              isAdminOnlyGroup: (group as any).restrict || false,
              updatedAt: new Date(),
            })
            .where(eq(mktWapGroups.id, existingGroup[0].id));
          groupRecord = existingGroup[0];
        }

        // Create or update account-group mapping (if not exists)
        const existingMapping = await this.db
          .select()
          .from(mktWapGroupAccounts)
          .where(
            and(
              eq(mktWapGroupAccounts.groupId, groupRecord.id),
              eq(mktWapGroupAccounts.accountId, accountId)
            )
          )
          .limit(1);

        if (existingMapping.length === 0) {
          // Create new account mapping
          await this.db
            .insert(mktWapGroupAccounts)
            .values({
              groupId: groupRecord.id,
              accountId: accountId,
              isAccountAdmin,
              isAccountSuperAdmin,
              isAdminOnlyGroup: (group as any).restrict || false,
              discoveredAt: new Date(),
            });
        } else {
          // Update existing mapping (refresh permissions)
          await this.db
            .update(mktWapGroupAccounts)
            .set({
              isAccountAdmin,
              isAccountSuperAdmin,
              isAdminOnlyGroup: (group as any).restrict || false,
              lastAccessedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(mktWapGroupAccounts.id, existingMapping[0].id));
        }

        discoveredGroups.push(groupRecord);
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
    includeHidden?: boolean;
    limit?: number;
    offset?: number;
  }) {
    // If accountId is provided, join with account mapping table
    if (filters?.accountId) {
      let query = this.db
        .select({
          // Group fields
          id: mktWapGroups.id,
          groupId: mktWapGroups.groupId,
          name: mktWapGroups.name,
          description: mktWapGroups.description,
          memberCount: mktWapGroups.memberCount,
          isActive: mktWapGroups.isActive,
          region: mktWapGroups.region,
          state: mktWapGroups.state,
          district: mktWapGroups.district,
          segmentTags: mktWapGroups.segmentTags,
          profilePicUrl: mktWapGroups.profilePicUrl,
          notes: mktWapGroups.notes,
          lastScrapedAt: mktWapGroups.lastScrapedAt,
          contactsCountAtLastScrape: mktWapGroups.contactsCountAtLastScrape,
          isHidden: mktWapGroups.isHidden,
          isFavorite: mktWapGroups.isFavorite,
          isAdminOnlyGroup: mktWapGroups.isAdminOnlyGroup,
          internalDescription: mktWapGroups.internalDescription,
          discoveredAt: mktWapGroups.discoveredAt,
          createdAt: mktWapGroups.createdAt,
          updatedAt: mktWapGroups.updatedAt,
          // Account mapping fields
          accountId: mktWapGroupAccounts.accountId,
          isAccountAdmin: mktWapGroupAccounts.isAccountAdmin,
          isAccountSuperAdmin: mktWapGroupAccounts.isAccountSuperAdmin,
          canAddContacts: mktWapGroupAccounts.canAddContacts,
          canPostMessages: mktWapGroupAccounts.canPostMessages,
          canEditGroupInfo: mktWapGroupAccounts.canEditGroupInfo,
        })
        .from(mktWapGroups)
        .innerJoin(mktWapGroupAccounts, eq(mktWapGroups.id, mktWapGroupAccounts.groupId))
        .where(eq(mktWapGroupAccounts.accountId, filters.accountId));

      if (filters?.isActive !== undefined) {
        query = query.where(eq(mktWapGroups.isActive, filters.isActive));
      }

      if (filters?.includeHidden !== true) {
        query = query.where(eq(mktWapGroups.isHidden, false));
      }

      query = query.orderBy(desc(mktWapGroups.createdAt));

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.offset(filters.offset);
      }

      return query;
    } else {
      // No accountId filter - return all groups (for admin views)
      let query = this.db.select().from(mktWapGroups);

      if (filters?.isActive !== undefined) {
        query = query.where(eq(mktWapGroups.isActive, filters.isActive));
      }

      if (filters?.includeHidden !== true) {
        query = query.where(eq(mktWapGroups.isHidden, false));
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
    isHidden?: boolean;
    isFavorite?: boolean;
    internalDescription?: string;
    profilePicUrl?: string;
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

  async hideGroup(groupId: string, isHidden: boolean) {
    await this.db
      .update(mktWapGroups)
      .set({
        isHidden,
        updatedAt: new Date(),
      })
      .where(eq(mktWapGroups.id, groupId));

    return this.getGroupById(groupId);
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      // Get the group first to verify it exists
      const group = await this.getGroupById(groupId);
      
      this.logger.log(`Deleting group ${groupId} (${group.name})`);
      
      // Step 1: Get all contacts associated with this group
      const groupContacts = await this.db
        .select()
        .from(mktWapGroupContacts)
        .where(eq(mktWapGroupContacts.groupId, groupId));
      
      const contactIds = groupContacts.map((gc: any) => gc.contactId);
      
      // Step 2: Find contacts that are ONLY in this group (not in other groups)
      let contactsToDelete: string[] = [];
      
      if (contactIds.length > 0) {
        // Get all group-contact mappings for these contacts
        const allGroupContactsForContacts = await this.db
          .select()
          .from(mktWapGroupContacts)
          .where(inArray(mktWapGroupContacts.contactId, contactIds));
        
        // Group by contactId to see which groups each contact belongs to
        const contactGroupMap = new Map<string, Set<string>>();
        
        allGroupContactsForContacts.forEach((gc: any) => {
          if (!contactGroupMap.has(gc.contactId)) {
            contactGroupMap.set(gc.contactId, new Set());
          }
          contactGroupMap.get(gc.contactId)!.add(gc.groupId);
        });
        
        // Find contacts that are only in this group
        contactIds.forEach((contactId: string) => {
          const groups = contactGroupMap.get(contactId);
          if (groups && groups.size === 1 && groups.has(groupId)) {
            contactsToDelete.push(contactId);
          }
        });
      }
      
      // Step 3: Delete contacts that are only in this group
      if (contactsToDelete.length > 0) {
        this.logger.log(`Deleting ${contactsToDelete.length} contacts that are only in this group`);
        await this.db
          .delete(mktWapContacts)
          .where(inArray(mktWapContacts.id, contactsToDelete));
      }
      
      // Step 4: Delete all group-contact mappings for this group
      this.logger.log(`Deleting ${groupContacts.length} group-contact mappings`);
      if (groupContacts.length > 0) {
        await this.db
          .delete(mktWapGroupContacts)
          .where(eq(mktWapGroupContacts.groupId, groupId));
      }
      
      // Step 5: Delete all group-account mappings for this group
      const groupAccountMappings = await this.db
        .select()
        .from(mktWapGroupAccounts)
        .where(eq(mktWapGroupAccounts.groupId, groupId));
      
      if (groupAccountMappings.length > 0) {
        this.logger.log(`Deleting ${groupAccountMappings.length} group-account mappings`);
        await this.db
          .delete(mktWapGroupAccounts)
          .where(eq(mktWapGroupAccounts.groupId, groupId));
      }
      
      // Step 6: Delete the group itself
      this.logger.log(`Deleting group ${groupId}`);
      await this.db
        .delete(mktWapGroups)
        .where(eq(mktWapGroups.id, groupId));
      
      this.logger.log(`Successfully deleted group ${groupId}`);
    } catch (error: any) {
      this.logger.error(`Error deleting group ${groupId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getLiveContactsByWhatsAppGroupId(whatsappGroupId: string, accountId: string): Promise<any[]> {
    const client = this.accountService.getClient(accountId);
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    // Validate client before using it
    const isValid = await this.accountService.validateClient(accountId);
    if (!isValid) {
      this.logger.warn(`Client for account ${accountId} is invalid - cleaning up`);
      await this.accountService.cleanupInvalidClient(accountId);
      throw new Error('WhatsApp session is not available. The browser session was closed. Please reconnect the account.');
    }

    // Check if client is ready/connected
    let clientState: string;
    try {
      // First check if client.info exists (quick check without accessing Puppeteer)
      if (!client.info) {
        throw new Error('WhatsApp session is not available. The client may be disconnected. Please reconnect the account.');
      }

      clientState = await client.getState();
      if (clientState !== 'CONNECTED') {
        throw new Error(`WhatsApp session is not connected (state: ${clientState}). Please reconnect the account.`);
      }
    } catch (stateError: any) {
      // Check if it's a detached frame error
      if (stateError.message && (
        stateError.message.includes('detached Frame') ||
        stateError.message.includes('Target closed') ||
        stateError.message.includes('Session closed')
      )) {
        this.logger.warn(`Client for account ${accountId} has detached frame - cleaning up`);
        await this.accountService.cleanupInvalidClient(accountId);
        throw new Error('WhatsApp session is not available. The browser session was closed. Please reconnect the account.');
      }
      // Re-throw if it's already our error message
      if (stateError.message && (stateError.message.includes('not available') || stateError.message.includes('not connected'))) {
        throw stateError;
      }
      throw new Error('WhatsApp session is not available. Please reconnect the account.');
    }
    
    try {
      const chat = await client.getChatById(whatsappGroupId);
      if (!chat.isGroup) {
        throw new Error('Not a group chat');
      }

      const groupChat = chat as GroupChat;
      const participants = groupChat.participants;

      const contacts = [];
      const participantCount = participants.length;
      this.logger.log(`Processing ${participantCount} participants for group ${whatsappGroupId}`);
      
      // For large groups, process faster by skipping individual contact lookups
      // Just extract data directly from participant objects
      for (const participant of participants) {
        try {
          const participantId = participant.id as any;
          const phoneNumber = participantId?.user || participantId?._serialized?.split('@')[0];
          
          if (!phoneNumber) {
            this.logger.warn(`Could not extract phone number from participant`);
            continue;
          }

          // Extract name directly from participant object (fastest method)
          // Skip individual contact lookups to avoid timeout for large groups
          const name = (participant as any).name || (participant as any).pushname || null;

          contacts.push({
            phoneNumber,
            name: name || null,
            profilePicUrl: null, // Skip profile pictures during live fetch - too slow
            isAdmin: (participant as any).isAdmin || false,
            isSuperAdmin: (participant as any).isSuperAdmin || false,
            isLeft: false, // Live contacts are always active
          });
        } catch (error: any) {
          // Handle detached frame errors gracefully
          if (error?.message?.includes('detached Frame')) {
            this.logger.warn(`Skipping contact due to detached frame - continuing with available contacts`);
            continue;
          }
          this.logger.error(`Error processing participant: ${error.message}`);
          // Continue with next participant
        }
      }
      
      this.logger.log(`Successfully processed ${contacts.length} contacts for group ${whatsappGroupId}`);

      return contacts;
    } catch (error: any) {
      // Handle detached frame errors
      if (error?.message?.includes('detached Frame') || error?.message?.includes('Session closed')) {
        this.logger.error(`WhatsApp frame detached while fetching contacts for group ${whatsappGroupId}`);
        throw new Error('WhatsApp session is not available. Please reconnect the account.');
      }
      throw error;
    }
  }

  async getLiveContacts(groupId: string, accountId: string): Promise<any[]> {
    const client = this.accountService.getClient(accountId);
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    // Validate client before using it
    const isValid = await this.accountService.validateClient(accountId);
    if (!isValid) {
      this.logger.warn(`Client for account ${accountId} is invalid - cleaning up`);
      await this.accountService.cleanupInvalidClient(accountId);
      throw new Error('WhatsApp session is not available. The browser session was closed. Please reconnect the account.');
    }

    // Check if client is ready/connected
    let state: string;
    try {
      // First check if client.info exists (quick check without accessing Puppeteer)
      if (!client.info) {
        throw new Error('WhatsApp session is not available. The client may be disconnected. Please reconnect the account.');
      }

      state = await client.getState();
      if (state !== 'CONNECTED') {
        throw new Error(`WhatsApp session is not connected (state: ${state}). Please reconnect the account.`);
      }
    } catch (stateError: any) {
      // Check if it's a detached frame error
      if (stateError.message && (
        stateError.message.includes('detached Frame') ||
        stateError.message.includes('Target closed') ||
        stateError.message.includes('Session closed')
      )) {
        this.logger.warn(`Client for account ${accountId} has detached frame - cleaning up`);
        await this.accountService.cleanupInvalidClient(accountId);
        throw new Error('WhatsApp session is not available. The browser session was closed. Please reconnect the account.');
      }
      // Re-throw if it's already our error message
      if (stateError.message && (stateError.message.includes('not available') || stateError.message.includes('not connected'))) {
        throw stateError;
      }
      throw new Error('WhatsApp session is not available. Please reconnect the account.');
    }

    const group = await this.getGroupById(groupId);
    
    try {
      const chat = await client.getChatById(group.groupId);
      if (!chat.isGroup) {
        throw new Error('Not a group chat');
      }

      const groupChat = chat as GroupChat;
      const participants = groupChat.participants;

      const contacts = [];
      const participantCount = participants.length;
      this.logger.log(`Processing ${participantCount} participants for group ${groupId}`);
      
      // For large groups, process faster by skipping individual contact lookups
      // Just extract data directly from participant objects
      for (const participant of participants) {
        try {
          const participantId = participant.id as any;
          const phoneNumber = participantId?.user || participantId?._serialized?.split('@')[0];
          
          if (!phoneNumber) {
            this.logger.warn(`Could not extract phone number from participant`);
            continue;
          }

          // Extract name directly from participant object (fastest method)
          // Skip individual contact lookups to avoid timeout for large groups
          const name = (participant as any).name || (participant as any).pushname || null;

          contacts.push({
            phoneNumber,
            name: name || null,
            profilePicUrl: null, // Skip profile pictures during live fetch - too slow
            isAdmin: (participant as any).isAdmin || false,
            isSuperAdmin: (participant as any).isSuperAdmin || false,
            isLeft: false, // Live contacts are always active
          });
        } catch (error: any) {
          // Handle detached frame errors gracefully
          if (error?.message?.includes('detached Frame')) {
            this.logger.warn(`Skipping contact due to detached frame - continuing with available contacts`);
            continue;
          }
          this.logger.error(`Error processing participant: ${error.message}`);
          // Continue with next participant
        }
      }
      
      this.logger.log(`Successfully processed ${contacts.length} contacts for group ${groupId}`);

      return contacts;
    } catch (error: any) {
      // Handle detached frame errors
      if (error?.message?.includes('detached Frame') || error?.message?.includes('Session closed')) {
        this.logger.error(`WhatsApp frame detached while fetching contacts for group ${groupId}`);
        throw new Error('WhatsApp session is not available. Please reconnect the account.');
      }
      throw error;
    }
  }

  async scrapeContactsFromGroup(groupId: string, accountId: string) {
    const client = this.accountService.getClient(accountId);
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    // Check if client is ready/connected
    let state: string;
    try {
      // First check if client.info exists (quick check without accessing Puppeteer)
      if (!client.info) {
        throw new Error('WhatsApp session is not available. The client may be disconnected. Please reconnect the account.');
      }

      state = await client.getState();
      if (state !== 'CONNECTED') {
        throw new Error(`WhatsApp session is not connected (state: ${state}). Please reconnect the account.`);
      }
    } catch (stateError: any) {
      // Check if it's a detached frame error
      if (stateError.message && (
        stateError.message.includes('detached Frame') ||
        stateError.message.includes('Target closed') ||
        stateError.message.includes('Session closed')
      )) {
        throw new Error('WhatsApp session is not available. The browser session was closed. Please reconnect the account.');
      }
      // Re-throw if it's already our error message
      if (stateError.message && (stateError.message.includes('not available') || stateError.message.includes('not connected'))) {
        throw stateError;
      }
      throw new Error('WhatsApp session is not available. Please reconnect the account.');
    }

    const group = await this.getGroupById(groupId);
    
    let chat: any;
    try {
      chat = await client.getChatById(group.groupId);
    } catch (error: any) {
      if (error?.message?.includes('detached Frame') || error?.message?.includes('Session closed')) {
        this.logger.error(`WhatsApp frame detached while getting chat for group ${groupId}`);
        throw new Error('WhatsApp session is not available. Please reconnect the account.');
      }
      throw error;
    }

    if (!chat.isGroup) {
      throw new Error('Not a group chat');
    }

    const groupChat = chat as GroupChat;
    const participants = groupChat.participants;

    let scrapedCount = 0;
    const now = new Date();

    // Get existing contacts in this group to mark as left if they're not in current participants
    const existingGroupContacts = await this.db
      .select()
      .from(mktWapGroupContacts)
      .where(eq(mktWapGroupContacts.groupId, groupId));

    // Get all existing contacts by phone numbers for batch lookup
    const participantPhones: string[] = [];
    const participantDataMap = new Map<string, {
      phoneNumber: string;
      name: string | null;
      profilePicUrl: string | null;
      isAdmin: boolean;
      isSuperAdmin: boolean;
    }>();

    // Step 1: Extract all phone numbers and participant data (skip profile pictures for now - too slow)
    for (const participant of participants) {
      try {
        const participantId = participant.id as any;
        const phoneNumber = participantId?.user || participantId?._serialized?.split('@')[0];
        
        if (!phoneNumber) {
          this.logger.warn(`Could not extract phone number from participant`);
          continue;
        }

        participantPhones.push(phoneNumber);
        participantDataMap.set(phoneNumber, {
          phoneNumber,
          name: (participant as any).name || (participant as any).pushname || null,
          profilePicUrl: null, // Skip profile pictures for performance - can be updated later
          isAdmin: (participant as any).isAdmin || false,
          isSuperAdmin: (participant as any).isSuperAdmin || false,
        });
      } catch (error: any) {
        this.logger.error(`Error extracting participant data: ${error.message}`);
        continue;
      }
    }

    if (participantPhones.length === 0) {
      this.logger.warn(`No valid participants found for group ${groupId}`);
      return {
        groupId,
        scrapedCount: 0,
        totalContacts: 0,
      };
    }

    // Step 2: Batch fetch all existing contacts by phone numbers
    const existingContacts = await this.db
      .select()
      .from(mktWapContacts)
      .where(inArray(mktWapContacts.phoneNumber, participantPhones));

    const existingContactsMap = new Map<string, any>();
    existingContacts.forEach((contact: any) => {
      existingContactsMap.set(contact.phoneNumber, contact);
    });

    // Step 3: Prepare batch inserts and updates
    const contactsToInsert: any[] = [];
    const contactsToUpdate: any[] = [];
    const contactIdMap = new Map<string, string>(); // phoneNumber -> contactId

    for (const phoneNumber of participantPhones) {
      const participantData = participantDataMap.get(phoneNumber)!;
      const existingContact = existingContactsMap.get(phoneNumber);

      if (existingContact) {
        // Update existing contact
        contactIdMap.set(phoneNumber, existingContact.id);
        contactsToUpdate.push({
          id: existingContact.id,
          name: participantData.name || existingContact.name,
          profilePicUrl: existingContact.profilePicUrl, // Keep existing profile pic
          updatedAt: now,
        });
      } else {
        // Prepare for batch insert
        contactsToInsert.push({
          phoneNumber,
          name: participantData.name,
          profilePicUrl: null,
          source: 'whatsapp_group',
          scrapedFromGroups: [groupId],
        });
      }
    }

    // Step 4: Batch insert new contacts
    if (contactsToInsert.length > 0) {
      const insertedContacts = await this.db
        .insert(mktWapContacts)
        .values(contactsToInsert)
        .returning();
      
      scrapedCount = insertedContacts.length;
      insertedContacts.forEach((contact: any) => {
        contactIdMap.set(contact.phoneNumber, contact.id);
      });
    }

    // Step 5: Batch update existing contacts
    if (contactsToUpdate.length > 0) {
      // Update contacts in batches (PostgreSQL has limits on IN clause size)
      const batchSize = 100;
      for (let i = 0; i < contactsToUpdate.length; i += batchSize) {
        const batch = contactsToUpdate.slice(i, i + batchSize);
        const contactIds = batch.map(c => c.id);
        
        // Use a transaction or individual updates for each batch
        for (const contact of batch) {
          await this.db
            .update(mktWapContacts)
            .set({
              name: contact.name,
              profilePicUrl: contact.profilePicUrl,
              updatedAt: contact.updatedAt,
            })
            .where(eq(mktWapContacts.id, contact.id));
        }
      }
    }

    // Step 6: Get existing group-contact mappings for batch lookup
    const contactIds = Array.from(contactIdMap.values());
    const existingGroupContactsMap = new Map<string, any>();
    
    if (contactIds.length > 0) {
      const existingMappings = await this.db
        .select()
        .from(mktWapGroupContacts)
        .where(
          and(
            eq(mktWapGroupContacts.groupId, groupId),
            inArray(mktWapGroupContacts.contactId, contactIds)
          )
        );
      
      existingMappings.forEach((mapping: any) => {
        existingGroupContactsMap.set(mapping.contactId, mapping);
      });
    }

    // Step 7: Prepare batch inserts and updates for group-contact mappings
    const groupContactsToInsert: any[] = [];
    const groupContactsToUpdate: any[] = [];

    for (const phoneNumber of participantPhones) {
      const contactId = contactIdMap.get(phoneNumber);
      if (!contactId) continue;

      const participantData = participantDataMap.get(phoneNumber)!;
      const existingMapping = existingGroupContactsMap.get(contactId);

      if (existingMapping) {
        // Update existing mapping
        groupContactsToUpdate.push({
          id: existingMapping.id,
          isAdmin: participantData.isAdmin,
          isSuperAdmin: participantData.isSuperAdmin,
          isLeft: false,
          lastSeenAt: now,
          updatedAt: now,
        });
      } else {
        // Prepare for batch insert
        groupContactsToInsert.push({
          groupId,
          contactId,
          isAdmin: participantData.isAdmin,
          isSuperAdmin: participantData.isSuperAdmin,
          isLeft: false,
          firstScrapedAt: now,
          lastSeenAt: now,
          scrapedByAccountId: accountId,
        });
      }
    }

    // Step 8: Batch insert new group-contact mappings
    if (groupContactsToInsert.length > 0) {
      await this.db
        .insert(mktWapGroupContacts)
        .values(groupContactsToInsert);
    }

    // Step 9: Batch update existing group-contact mappings
    if (groupContactsToUpdate.length > 0) {
      for (const mapping of groupContactsToUpdate) {
        await this.db
          .update(mktWapGroupContacts)
          .set({
            isAdmin: mapping.isAdmin,
            isSuperAdmin: mapping.isSuperAdmin,
            isLeft: false,
            lastSeenAt: mapping.lastSeenAt,
            updatedAt: mapping.updatedAt,
          })
          .where(eq(mktWapGroupContacts.id, mapping.id));
      }
    }

    // Step 10: Mark contacts as left if they're not in current participants
    const currentParticipantPhones = new Set(participantPhones);
    const leftContactIds: string[] = [];

    for (const existingGroupContact of existingGroupContacts) {
      // Get contact phone number
      const contact = await this.db
        .select()
        .from(mktWapContacts)
        .where(eq(mktWapContacts.id, existingGroupContact.contactId))
        .limit(1);

      if (contact.length > 0 && !currentParticipantPhones.has(contact[0].phoneNumber)) {
        leftContactIds.push(existingGroupContact.id);
      }
    }

    // Batch update left contacts
    if (leftContactIds.length > 0) {
      for (const id of leftContactIds) {
        await this.db
          .update(mktWapGroupContacts)
          .set({
            isLeft: true,
            leftAt: now,
            updatedAt: now,
          })
          .where(eq(mktWapGroupContacts.id, id));
      }
    }

    // Update group's last scraped info
    await this.db
      .update(mktWapGroups)
      .set({
        lastScrapedAt: now,
        contactsCountAtLastScrape: participants.length,
        updatedAt: now,
      })
      .where(eq(mktWapGroups.id, groupId));

    return {
      groupId,
      scrapedCount,
      totalContacts: participants.length,
    };
  }

  async getGroupContacts(groupId: string, includeLeft: boolean = false) {
    const group = await this.getGroupById(groupId);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Build where conditions
    const whereConditions = [eq(mktWapGroupContacts.groupId, groupId)];
    if (!includeLeft) {
      whereConditions.push(eq(mktWapGroupContacts.isLeft, false));
    }

    // Fetch contacts from mkt_wap_group_contacts table
    const contacts = await this.db
      .select({
        id: mktWapGroupContacts.id,
        groupId: mktWapGroupContacts.groupId,
        contactId: mktWapGroupContacts.contactId,
        isAdmin: mktWapGroupContacts.isAdmin,
        isSuperAdmin: mktWapGroupContacts.isSuperAdmin,
        isLeft: mktWapGroupContacts.isLeft,
        joinedAt: mktWapGroupContacts.joinedAt,
        leftAt: mktWapGroupContacts.leftAt,
        firstScrapedAt: mktWapGroupContacts.firstScrapedAt,
        lastSeenAt: mktWapGroupContacts.lastSeenAt,
        scrapedByAccountId: mktWapGroupContacts.scrapedByAccountId,
        createdAt: mktWapGroupContacts.createdAt,
        updatedAt: mktWapGroupContacts.updatedAt,
        // Contact details
        contactPhoneNumber: mktWapContacts.phoneNumber,
        contactName: mktWapContacts.name,
        contactProfilePicUrl: mktWapContacts.profilePicUrl,
      })
      .from(mktWapGroupContacts)
      .innerJoin(mktWapContacts, eq(mktWapGroupContacts.contactId, mktWapContacts.id))
      .where(and(...whereConditions));

    // Map to WhatsAppGroupContact format
    return contacts.map((c: any) => ({
      id: c.id,
      groupId: c.groupId,
      contactId: c.contactId,
      isAdmin: c.isAdmin,
      isSuperAdmin: c.isSuperAdmin,
      isLeft: c.isLeft,
      joinedAt: c.joinedAt,
      leftAt: c.leftAt,
      firstScrapedAt: c.firstScrapedAt,
      lastSeenAt: c.lastSeenAt,
      scrapedByAccountId: c.scrapedByAccountId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      // Include contact details
      contact: {
        id: c.contactId,
        phoneNumber: c.contactPhoneNumber,
        name: c.contactName,
        profilePicUrl: c.contactProfilePicUrl,
      },
    }));
  }

  async getAccountGroups(accountId: string, includeHidden: boolean = false) {
    // Return only groups that have mappings for this account (saved groups)
    // The frontend will merge with live groups separately
    return this.getGroups({ accountId, includeHidden });
  }

  async checkDatabaseTables(): Promise<{ exists: boolean; error?: string }> {
    try {
      // Try to query the account mapping table
      await this.db
        .select()
        .from(mktWapGroupAccounts)
        .limit(1);
      return { exists: true };
    } catch (error: any) {
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        return { 
          exists: false, 
          error: 'Table mkt_wap_group_accounts does not exist. Please run migration 80_mkt_whatsapp_multi_account_groups.sql' 
        };
      }
      return { exists: false, error: error?.message || 'Unknown database error' };
    }
  }

  /**
   * Auto-map groups that are already saved by other accounts to the current account
   * This improves UX by avoiding duplicate work
   */
  async autoMapExistingGroups(accountId: string, whatsappGroupIds: string[]): Promise<number> {
    try {
      if (!whatsappGroupIds || whatsappGroupIds.length === 0) {
        return 0;
      }

      this.logger.log(`Auto-mapping groups for account ${accountId}, checking ${whatsappGroupIds.length} WhatsApp group IDs`);

      // Find groups that exist globally but don't have mapping for this account
      const existingGroups = await this.db
        .select({
          id: mktWapGroups.id,
          groupId: mktWapGroups.groupId,
        })
        .from(mktWapGroups)
        .where(inArray(mktWapGroups.groupId, whatsappGroupIds));

      if (existingGroups.length === 0) {
        this.logger.log(`No existing groups found for auto-mapping`);
        return 0;
      }

      this.logger.log(`Found ${existingGroups.length} existing groups globally`);

      // Get existing mappings for this account
      const existingMappings = await this.db
        .select({ groupId: mktWapGroupAccounts.groupId })
        .from(mktWapGroupAccounts)
        .where(eq(mktWapGroupAccounts.accountId, accountId));

      const mappedGroupIds = new Set(existingMappings.map((m: any) => m.groupId));
      this.logger.log(`Account ${accountId} already has ${mappedGroupIds.size} group mappings`);

      // Find groups that need mapping
      const groupsToMap = existingGroups.filter((g: any) => !mappedGroupIds.has(g.id));

      if (groupsToMap.length === 0) {
        this.logger.log(`All existing groups already mapped for account ${accountId}`);
        return 0;
      }

      this.logger.log(`Auto-mapping ${groupsToMap.length} groups to account ${accountId}`);

      // Create mappings for groups that don't have one yet
      // Note: We can't determine permissions without the client, so use defaults
      const mappingsToInsert = groupsToMap.map((group: any) => ({
        groupId: group.id,
        accountId: accountId,
        isAccountAdmin: false, // Will be updated when group is actually saved
        isAccountSuperAdmin: false,
        canAddContacts: false,
        canPostMessages: true, // Default to true
        canEditGroupInfo: false,
        discoveredAt: new Date(),
      }));

      // Insert mappings, ignoring conflicts (race conditions)
      let insertedCount = 0;
      for (const mapping of mappingsToInsert) {
        try {
          await this.db
            .insert(mktWapGroupAccounts)
            .values(mapping);
          insertedCount++;
        } catch (error: any) {
          // Ignore unique constraint violations (already mapped)
          if (error?.code === '23505' || error?.message?.includes('unique constraint')) {
            this.logger.debug(`Group ${mapping.groupId} already mapped to account ${accountId}, skipping`);
            continue;
          }
          this.logger.error(`Error inserting mapping for group ${mapping.groupId}: ${error.message}`);
          throw error;
        }
      }

      this.logger.log(`Successfully auto-mapped ${insertedCount} existing groups to account ${accountId}`);
      return insertedCount;
    } catch (error: any) {
      this.logger.error(`Error auto-mapping groups for account ${accountId}: ${error.message}`, error.stack);
      return 0;
    }
  }
}

