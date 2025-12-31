import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { WhatsAppMessageService } from './whatsapp-message.service';
import { WhatsAppGroupService } from './whatsapp-group.service';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq } from 'drizzle-orm';
import { mktWapAccounts, mktWapGroups, mktWapContacts, mktWapMessages } from '../../database/schema/whatsapp';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly accountService: WhatsAppAccountService,
    private readonly messageService: WhatsAppMessageService,
    private readonly groupService: WhatsAppGroupService,
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  // =====================================================
  // ACCOUNTS
  // =====================================================

  @Get('accounts')
  async getAccounts() {
    try {
      const accounts = await this.db
        .select()
        .from(mktWapAccounts)
        .orderBy(mktWapAccounts.createdAt);

      // Get connection status for each (with error handling)
      const accountsWithStatus = await Promise.all(
        accounts.map(async (account: any) => {
          try {
            const status = await this.accountService.getAccountStatus(account.id);
            // If status is null, return the account data with default status
            return status || {
              ...account,
              isConnected: false,
              hasClient: false,
              qrCode: null,
            };
          } catch (error) {
            // If getAccountStatus fails, return account with error info
            console.error(`Error getting status for account ${account.id}:`, error);
            return {
              ...account,
              isConnected: false,
              hasClient: false,
              qrCode: null,
              error: error?.message || 'Unknown error',
            };
          }
        }),
      );

      return accountsWithStatus;
    } catch (error) {
      console.error('Error in getAccounts:', error);
      throw error;
    }
  }

  @Get('accounts/:id')
  async getAccount(@Param('id') id: string) {
    return this.accountService.getAccountStatus(id);
  }

  @Post('accounts')
  async createAccount(@Body() data: { accountName: string }) {
    const account = await this.db
      .insert(mktWapAccounts)
      .values({
        phoneNumber: null, // Will be set after QR scan
        accountName: data.accountName,
        status: 'inactive',
      })
      .returning();

    // Initialize the account (phone number will be retrieved after authentication)
    // Don't fail the request if initialization fails - account is still created
    try {
      await this.accountService.initializeAccount(account[0].id);
    } catch (error) {
      // Log error but don't fail the request
      // The account is created, user can manually initialize later
      console.error('Error initializing WhatsApp account:', error);
    }

    return account[0];
  }

  @Post('accounts/:id/initialize')
  async initializeAccount(@Param('id') id: string) {
    try {
      const account = await this.db
        .select()
        .from(mktWapAccounts)
        .where(eq(mktWapAccounts.id, id))
        .limit(1);

      if (account.length === 0) {
        return { error: 'Account not found' };
      }

      console.log(`🚀 Initialize request received for account ${id}`);
      await this.accountService.initializeAccount(id);
      console.log(`✅ Initialize request completed for account ${id}`);
      return { success: true, message: 'Account initialization started' };
    } catch (error: any) {
      console.error(`❌ Error initializing account ${id}:`, error);
      // Return user-friendly error message
      return { 
        error: 'Failed to initialize account', 
        message: error.message || 'Unknown error',
        details: error.stack 
      };
    }
  }

  @Put('accounts/:id/rate-limits')
  async updateRateLimits(
    @Param('id') id: string,
    @Body() data: {
      messagesPerMinute?: number;
      messagesPerHour?: number;
      messagesPerDay?: number;
      groupsPerDay?: number;
      contactsPerDay?: number;
      cooldownAfterError?: number;
    },
  ) {
    const account = await this.db
      .select()
      .from(mktWapAccounts)
      .where(eq(mktWapAccounts.id, id))
      .limit(1);

    if (account.length === 0) {
      throw new Error('Account not found');
    }

    // Get existing config or use defaults
    const existingConfig = account[0].rateLimitConfig || {
      messages_per_minute: 20,
      messages_per_hour: 200,
      messages_per_day: 1000,
      groups_per_day: 50,
      contacts_per_day: 100,
      cooldown_after_error: 300,
    };

    // Merge with new values
    const updatedConfig = {
      ...existingConfig,
      ...(data.messagesPerMinute !== undefined && { messages_per_minute: data.messagesPerMinute }),
      ...(data.messagesPerHour !== undefined && { messages_per_hour: data.messagesPerHour }),
      ...(data.messagesPerDay !== undefined && { messages_per_day: data.messagesPerDay }),
      ...(data.groupsPerDay !== undefined && { groups_per_day: data.groupsPerDay }),
      ...(data.contactsPerDay !== undefined && { contacts_per_day: data.contactsPerDay }),
      ...(data.cooldownAfterError !== undefined && { cooldown_after_error: data.cooldownAfterError }),
    };

    await this.db
      .update(mktWapAccounts)
      .set({
        rateLimitConfig: updatedConfig,
        updatedAt: new Date(),
      })
      .where(eq(mktWapAccounts.id, id));

    const updated = await this.db
      .select()
      .from(mktWapAccounts)
      .where(eq(mktWapAccounts.id, id))
      .limit(1);

    return updated[0];
  }

  @Post('accounts/:id/disconnect')
  async disconnectAccount(@Param('id') id: string) {
    await this.accountService.disconnectAccount(id);
    return { success: true, message: 'Account disconnected' };
  }

  @Post('accounts/:id/update-phone')
  async updatePhoneManually(@Param('id') id: string) {
    // Force phone number extraction from active client
    const account = await this.accountService.getAccountStatus(id);
    if (!account) {
      throw new Error('Account not found');
    }
    
    const client = this.accountService.getClient(id);
    if (!client) {
      throw new Error('Client not initialized. Please initialize the account first.');
    }
    
    try {
      // Wait a bit for client info to be available
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const clientInfo = client.info;
      if (clientInfo && clientInfo.wid && clientInfo.wid.user) {
        const phoneNumber = clientInfo.wid.user;
        const pushName = clientInfo.pushname || null;
        
        await this.db
          .update(mktWapAccounts)
          .set({
            phoneNumber: phoneNumber,
            pushName: pushName,
            status: 'active',
            lastConnectedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(mktWapAccounts.id, id));
        
        return { 
          success: true, 
          phoneNumber,
          pushName,
          message: 'Phone number updated successfully' 
        };
      } else {
        throw new Error('Client info not available. Account may not be ready yet. Try again in a few seconds.');
      }
    } catch (error: any) {
      throw new Error(`Failed to update phone number: ${error.message}`);
    }
  }

  @Get('accounts/:id/qr')
  async getQRCode(@Param('id') id: string) {
    const account = await this.accountService.getAccountStatus(id);
    if (!account) {
      return { qrCode: null, error: 'Account not found' };
    }
    // QR code is stored in session data
    return { qrCode: account.qrCode || null };
  }

  // =====================================================
  // GROUPS
  // =====================================================

  @Get('groups')
  async getGroups(@Query() filters: any) {
    return this.groupService.getGroups(filters);
  }

  @Get('groups/:id')
  async getGroup(@Param('id') id: string) {
    return this.groupService.getGroupById(id);
  }

  @Post('accounts/:accountId/groups/discover')
  async discoverGroups(@Param('accountId') accountId: string) {
    return this.groupService.discoverGroups(accountId);
  }

  @Put('groups/:id')
  async updateGroup(@Param('id') id: string, @Body() updates: any) {
    return this.groupService.updateGroup(id, updates);
  }

  @Post('groups/:id/scrape-contacts')
  async scrapeContacts(@Param('id') groupId: string, @Body() data: { accountId: string }) {
    return this.groupService.scrapeContactsFromGroup(groupId, data.accountId);
  }

  // =====================================================
  // CONTACTS
  // =====================================================

  @Get('contacts')
  async getContacts(@Query() filters: any) {
    let query = this.db.select().from(mktWapContacts);

    if (filters.groupId) {
      // Filter by group membership
      query = query.where(
        // This would need a proper join or subquery
        // Simplified for now
      );
    }

    return query;
  }

  @Get('contacts/:id')
  async getContact(@Param('id') id: string) {
    const contacts = await this.db
      .select()
      .from(mktWapContacts)
      .where(eq(mktWapContacts.id, id))
      .limit(1);

    if (contacts.length === 0) {
      return { error: 'Contact not found' };
    }

    return contacts[0];
  }

  // =====================================================
  // MESSAGES
  // =====================================================

  @Post('messages')
  async sendMessage(@Body() data: any) {
    return this.messageService.sendMessage(data);
  }

  @Get('messages')
  async getMessages(@Query() filters: any) {
    return this.messageService.getMessages(filters);
  }

  @Get('messages/:id')
  async getMessage(@Param('id') id: string) {
    return this.messageService.getMessageById(id);
  }

  @Post('messages/:id/retry')
  async retryMessage(@Param('id') id: string) {
    return this.messageService.retryMessage(id);
  }

  // =====================================================
  // STATS
  // =====================================================

  @Get('stats')
  async getStats() {
    const [accounts, groups, contacts, messages] = await Promise.all([
      this.db.select().from(mktWapAccounts),
      this.db.select().from(mktWapGroups),
      this.db.select().from(mktWapContacts),
      this.db.select().from(mktWapMessages),
    ]);

    return {
      accounts: {
        total: accounts.length,
        active: accounts.filter((a: any) => a.status === 'active').length,
      },
      groups: {
        total: groups.length,
        active: groups.filter((g: any) => g.isActive).length,
      },
      contacts: {
        total: contacts.length,
      },
      messages: {
        total: messages.length,
        sent: messages.filter((m: any) => m.status === 'sent').length,
        delivered: messages.filter((m: any) => m.status === 'delivered').length,
        failed: messages.filter((m: any) => m.status === 'failed').length,
      },
    };
  }
}

