import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq, and, desc, isNull, or, sql, notInArray, inArray } from 'drizzle-orm';
import { 
  mktWapGroups, 
  mktWapAccounts, 
  mktWapContacts,
  mktWapGroupAccountAccess,
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

    // Check if client is ready/connected
    let state: string;
    try {
      state = await client.getState();
      this.logger.debug(`Client state for account ${accountId}: ${state}`);
    } catch (stateError: any) {
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
      const chats = await client.getChats();
      const groups = chats.filter(chat => chat.isGroup) as GroupChat[];
      
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

      const groupData = {
        groupId: group.id._serialized,
        name: group.name,
        description: group.description || null,
        memberCount: group.participants.length,
        accountId,
        profilePicUrl: profilePicUrl || null,
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
        return inserted[0];
      } else {
        // Update existing group
        await this.db
          .update(mktWapGroups)
          .set({
            name: groupData.name,
            description: groupData.description,
            memberCount: groupData.memberCount,
            profilePicUrl: groupData.profilePicUrl,
            updatedAt: new Date(),
          })
          .where(eq(mktWapGroups.id, existing[0].id));
        return existing[0];
      }
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

        const groupData = {
          groupId: group.id._serialized,
          name: group.name,
          description: group.description || null,
          memberCount: group.participants.length,
          accountId,
          profilePicUrl: profilePicUrl || null,
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
              profilePicUrl: groupData.profilePicUrl,
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
    includeHidden?: boolean;
    limit?: number;
    offset?: number;
  }) {
    let query = this.db.select().from(mktWapGroups);

    if (filters?.accountId) {
      query = query.where(eq(mktWapGroups.accountId, filters.accountId));
    }

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
      
      // Step 5: Delete all group-account access records for this group
      const groupAccountAccess = await this.db
        .select()
        .from(mktWapGroupAccountAccess)
        .where(eq(mktWapGroupAccountAccess.groupId, groupId));
      
      if (groupAccountAccess.length > 0) {
        this.logger.log(`Deleting ${groupAccountAccess.length} group-account access records`);
        await this.db
          .delete(mktWapGroupAccountAccess)
          .where(eq(mktWapGroupAccountAccess.groupId, groupId));
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

    // Check client state
    try {
      const state = await client.getState();
      if (state !== 'CONNECTED') {
        throw new Error(`WhatsApp session is not connected (state: ${state}). Please reconnect the account.`);
      }
    } catch (stateError: any) {
      this.logger.error(`Could not get client state for account ${accountId}: ${stateError.message}`);
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

    // Check client state
    try {
      const state = await client.getState();
      if (state !== 'CONNECTED') {
        throw new Error(`WhatsApp session is not connected (state: ${state}). Please reconnect the account.`);
      }
    } catch (stateError: any) {
      this.logger.error(`Could not get client state for account ${accountId}: ${stateError.message}`);
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

    // Check client state
    try {
      const state = await client.getState();
      if (state !== 'CONNECTED') {
        throw new Error(`WhatsApp session is not connected (state: ${state}). Please reconnect the account.`);
      }
    } catch (stateError: any) {
      this.logger.error(`Could not get client state for account ${accountId}: ${stateError.message}`);
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
    return this.getGroups({ accountId, includeHidden });
  }

  async checkDatabaseTables(): Promise<{ exists: boolean; error?: string }> {
    try {
      // Try to query the new table
      await this.db
        .select()
        .from(mktWapGroupAccountAccess)
        .limit(1);
      return { exists: true };
    } catch (error: any) {
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        return { 
          exists: false, 
          error: 'Table mkt_wap_group_account_access does not exist. Please run migration 79_mkt_whatsapp_groups_enhancements.sql' 
        };
      }
      return { exists: false, error: error?.message || 'Unknown database error' };
    }
  }
}

