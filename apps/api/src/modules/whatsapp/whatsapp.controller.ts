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
  HttpException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { WhatsAppMessageService } from './whatsapp-message.service';
import { WhatsAppGroupService } from './whatsapp-group.service';
import { WhatsAppLoggerService } from './whatsapp-logger.service';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq, inArray } from 'drizzle-orm';
import { mktWapAccounts, mktWapGroups, mktWapContacts, mktWapMessages, mktWapGroupContacts } from '../../database/schema/whatsapp';

@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly accountService: WhatsAppAccountService,
    private readonly messageService: WhatsAppMessageService,
    private readonly groupService: WhatsAppGroupService,
    private readonly whatsappLogger: WhatsAppLoggerService,
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
    try {
      // Force phone number extraction from active client
      const account = await this.accountService.getAccountStatus(id);
      if (!account) {
        throw new Error('Account not found');
      }
      
      const client = this.accountService.getClient(id);
      if (!client) {
        throw new Error('Client not initialized. Please initialize the account first.');
      }
      
      // Check client state first
      let state: string;
      try {
        state = await client.getState();
      } catch (error) {
        throw new Error(`Cannot get client state: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      if (state !== 'CONNECTED') {
        throw new Error(`Client is not connected. Current state: ${state}. Please wait for the account to connect.`);
      }
      
      // Use the improved extraction method with more retries
      const phoneNumber = await this.accountService.extractPhoneNumberWithRetry(client, id, 10);
      
      if (phoneNumber) {
        // Get updated account to get pushName
        const updatedAccount = await this.accountService.getAccountStatus(id);
        return { 
          success: true, 
          phoneNumber,
          pushName: updatedAccount?.pushName || null,
          message: 'Phone number updated successfully' 
        };
      } else {
        // Try to get detailed error info
        try {
          const clientInfo = client.info;
          const debugInfo = {
            hasInfo: !!clientInfo,
            hasWid: !!(clientInfo?.wid),
            hasUser: !!(clientInfo?.wid?.user),
            infoKeys: clientInfo ? Object.keys(clientInfo) : [],
          };
          throw new Error(`Could not extract phone number. Debug info: ${JSON.stringify(debugInfo)}. The client may not be fully ready.`);
        } catch (debugError) {
          throw new Error(`Could not extract phone number. The client may not be fully ready. Please try again in a few seconds. Error: ${debugError instanceof Error ? debugError.message : String(debugError)}`);
        }
      }
    } catch (error: any) {
      console.error(`Error in updatePhoneManually for account ${id}:`, error);
      this.logger.error(`Error in updatePhoneManually for account ${id}:`, error);
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
  async getGroups(@Query() filters: {
    accountId?: string;
    isActive?: boolean;
    includeHidden?: boolean;
    limit?: number;
    offset?: number;
  }) {
    return this.groupService.getGroups(filters);
  }

  @Get('accounts/:accountId/groups')
  async getAccountGroups(
    @Param('accountId') accountId: string,
    @Query('includeHidden') includeHidden?: string
  ) {
    return this.groupService.getAccountGroups(
      accountId,
      includeHidden === 'true'
    );
  }

  @Get('groups/:id')
  async getGroup(@Param('id') id: string) {
    return this.groupService.getGroupById(id);
  }

  @Get('groups/:id/contacts')
  async getGroupContacts(
    @Param('id') id: string,
    @Query('includeLeft') includeLeft?: string
  ) {
    return this.groupService.getGroupContacts(
      id,
      includeLeft === 'true'
    );
  }

  @Get('accounts/:accountId/groups/live')
  async getLiveGroups(@Param('accountId') accountId: string) {
    try {
      this.logger.log(`Get live groups request for account ${accountId}`);
      const result = await this.groupService.getLiveGroups(accountId);
      this.logger.log(`Successfully retrieved ${result.length} live groups for account ${accountId}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Error getting live groups for account ${accountId}:`, error);
      this.logger.error(`Error stack:`, error?.stack);
      this.whatsappLogger.error(`Error getting live groups for account ${accountId}`, error, accountId);
      
      const errorMessage = error?.message || 'Unknown error';
      
      // If it's already an HttpException, re-throw it
      if (error instanceof HttpException) {
        throw error;
      }
      
      // Check if it's a session/connection error - return 503 (Service Unavailable) instead of 500
      if (errorMessage.includes('not available') || 
          errorMessage.includes('not connected') || 
          errorMessage.includes('not ready') ||
          errorMessage.includes('not initialized') ||
          errorMessage.includes('reconnect')) {
        throw new HttpException(
          {
            statusCode: 503,
            message: errorMessage,
            error: 'Service Unavailable',
            code: 'WHATSAPP_SESSION_UNAVAILABLE',
          },
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      
      // For other errors, return 500
      throw new HttpException(
        {
          statusCode: 500,
          message: errorMessage,
          error: 'Internal Server Error',
          code: 'UNKNOWN_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('accounts/:accountId/groups/:whatsappGroupId/save')
  async saveSingleGroup(
    @Param('accountId') accountId: string,
    @Param('whatsappGroupId') whatsappGroupId: string
  ) {
    try {
      this.logger.log(`Save single group request for account ${accountId}, group ${whatsappGroupId}`);
      const result = await this.groupService.saveSingleGroup(accountId, whatsappGroupId);
      this.logger.log(`Successfully saved group ${whatsappGroupId} for account ${accountId}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Error saving single group for account ${accountId}:`, error);
      this.whatsappLogger.error(`Error saving single group for account ${accountId}`, error, accountId);
      throw {
        statusCode: 500,
        message: error?.message || 'Error saving group',
        error: 'Internal Server Error',
      };
    }
  }

  @Post('accounts/:accountId/groups/discover')
  async discoverGroups(@Param('accountId') accountId: string) {
    try {
      this.logger.log(`Discover groups request for account ${accountId}`);
      
      // Check if database tables exist first
      const dbCheck = await this.groupService.checkDatabaseTables();
      if (!dbCheck.exists) {
        this.logger.error(`Database tables missing: ${dbCheck.error}`);
        throw {
          statusCode: 500,
          message: dbCheck.error || 'Database migration required',
          error: 'Database Error',
        };
      }
      
      const result = await this.groupService.discoverGroups(accountId);
      this.logger.log(`Successfully discovered groups for account ${accountId}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Error discovering groups for account ${accountId}:`, error);
      this.logger.error(`Error stack:`, error?.stack);
      this.whatsappLogger.error(`Error discovering groups for account ${accountId}`, error, accountId);
      
      // Return detailed error for debugging
      const errorMessage = error?.message || 'Unknown error';
      const errorCode = error?.code || 'UNKNOWN_ERROR';
      
      this.logger.error(`Error details - message: ${errorMessage}, code: ${errorCode}`);
      
      // Re-throw with proper HTTP exception
      if (error?.statusCode) {
        throw error;
      }
      
      throw {
        statusCode: 500,
        message: errorMessage,
        error: 'Internal Server Error',
        code: errorCode,
      };
    }
  }

  @Put('groups/:id')
  async updateGroup(@Param('id') id: string, @Body() updates: {
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
    return this.groupService.updateGroup(id, updates);
  }

  @Put('groups/:id/hide')
  async hideGroup(
    @Param('id') id: string,
    @Body() data: { isHidden: boolean }
  ) {
    return this.groupService.hideGroup(id, data.isHidden);
  }

  @Delete('groups/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroup(@Param('id') id: string) {
    try {
      await this.groupService.deleteGroup(id);
      // Don't return anything for 204 No Content
    } catch (error: any) {
      this.logger.error(`Error deleting group ${id}: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Failed to delete group',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('groups/:id/contacts/live')
  async getLiveContacts(@Param('id') id: string, @Query('accountId') accountId: string, @Query('whatsappGroupId') whatsappGroupId?: string) {
    try {
      this.logger.log(`Get live contacts request for group ${id}, whatsappGroupId: ${whatsappGroupId || 'none'}`);
      if (!accountId) {
        throw new BadRequestException('accountId query parameter is required');
      }
      // If whatsappGroupId is provided, use it directly (for unsaved groups)
      // Otherwise, use the database group id (for saved groups)
      const result = whatsappGroupId 
        ? await this.groupService.getLiveContactsByWhatsAppGroupId(whatsappGroupId, accountId)
        : await this.groupService.getLiveContacts(id, accountId);
      this.logger.log(`Successfully retrieved ${result.length} live contacts for group ${id}`);
      return result;
    } catch (error: any) {
      this.logger.error(`Error getting live contacts for group ${id}:`, error);
      this.whatsappLogger.error(`Error getting live contacts for group ${id}`, error, accountId);
      
      const errorMessage = error?.message || 'Unknown error';
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      if (errorMessage.includes('not available') || 
          errorMessage.includes('not connected') || 
          errorMessage.includes('not ready') ||
          errorMessage.includes('not initialized') ||
          errorMessage.includes('reconnect')) {
        throw new HttpException(
          {
            statusCode: 503,
            message: errorMessage,
            error: 'Service Unavailable',
            code: 'WHATSAPP_SESSION_UNAVAILABLE',
          },
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      
      throw new HttpException(
        {
          statusCode: 500,
          message: errorMessage,
          error: 'Internal Server Error',
          code: 'UNKNOWN_ERROR',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('groups/:id/scrape-contacts')
  async scrapeContacts(@Param('id') groupId: string, @Body() data: { accountId: string }) {
    try {
      const result = await this.groupService.scrapeContactsFromGroup(groupId, data.accountId);
      return result;
    } catch (error: any) {
      this.logger.error(`Error scraping contacts for group ${groupId}:`, error);
      this.whatsappLogger.error(`Error scraping contacts for group ${groupId}`, error, data.accountId);
      
      const errorMessage = error?.message || 'Error scraping contacts';
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      if (errorMessage.includes('not available') || 
          errorMessage.includes('not connected') || 
          errorMessage.includes('detached Frame')) {
        throw new HttpException(
          {
            statusCode: 503,
            message: errorMessage,
            error: 'Service Unavailable',
            code: 'WHATSAPP_SESSION_UNAVAILABLE',
          },
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
      
      throw new HttpException(
        {
          statusCode: 500,
          message: errorMessage,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // =====================================================
  // CONTACTS
  // =====================================================

  @Get('contacts')
  async getContacts(@Query() filters: any) {
    try {
      if (filters.groupId) {
        // Filter by group membership - join with group_contacts table
        // Get contact IDs for this group
        const groupContactIds = await this.db
          .select({ contactId: mktWapGroupContacts.contactId })
          .from(mktWapGroupContacts)
          .where(eq(mktWapGroupContacts.groupId, filters.groupId));
        
        const contactIds = groupContactIds.map((gc: any) => gc.contactId);
        
        if (contactIds.length > 0) {
          const contacts = await this.db
            .select()
            .from(mktWapContacts)
            .where(inArray(mktWapContacts.id, contactIds));
          return contacts;
        } else {
          // No contacts in this group, return empty array
          return [];
        }
      }

      // Return all contacts if no groupId filter
      const contacts = await this.db
        .select()
        .from(mktWapContacts);
      return contacts;
    } catch (error: any) {
      this.logger.error(`Error fetching contacts: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Failed to fetch contacts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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

  @Get('logs')
  async getLogs(
    @Query('lines') lines: string = '100',
    @Query('accountId') accountId?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
  ) {
    try {
      // Use WhatsAppLoggerService
      const logs = this.whatsappLogger.getLogs({
        accountId,
        level,
        search,
        limit: parseInt(lines) || 100,
      });
      
      const stats = this.whatsappLogger.getStats();
      
      return {
        logs: logs.map(log => ({
          timestamp: log.timestamp,
          level: log.level,
          message: log.message,
          accountId: log.accountId,
        })),
        stats,
        timestamp: new Date().toISOString(),
      };
      
      // Fallback to file-based logging
      const fs = require('fs');
      const logFile = '/tmp/api-debug.log';
      
      if (!fs.existsSync(logFile)) {
        return { 
          logs: [], 
          error: 'Log file not found. WhatsAppLoggerService may not be initialized.',
          note: 'Logs are being captured in memory. Try accessing logs after some WhatsApp activity.'
        };
      }

      const logContent = fs.readFileSync(logFile, 'utf-8');
      const logLines = logContent.split('\n');
      const lineCount = parseInt(lines) || 100;
      const recentLogs = logLines.slice(-lineCount).filter((line: string) => line.trim());

      // Filter for WhatsApp-related logs
      const whatsappLogs = recentLogs.filter((line: string) => 
        line.toLowerCase().includes('whatsapp') ||
        line.toLowerCase().includes('qr') ||
        line.toLowerCase().includes('authenticated') ||
        line.toLowerCase().includes('ready') ||
        line.toLowerCase().includes('phone') ||
        line.toLowerCase().includes('account') ||
        line.toLowerCase().includes('error') ||
        line.toLowerCase().includes('initialize')
      );

      return {
        logs: whatsappLogs,
        totalLines: recentLogs.length,
        filteredLines: whatsappLogs.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        logs: [],
        error: error.message || 'Failed to read logs',
      };
    }
  }

  @Get('stats')
  async getStats() {
    const [accounts, groups, contacts, messages] = await Promise.all([
      this.db.select().from(mktWapAccounts),
      this.db.select().from(mktWapGroups),
      this.db.select().from(mktWapContacts),
      this.db.select().from(mktWapMessages),
    ]);

    // Count groups that are saved (in DB) and not hidden
    // All groups in mktWapGroups are saved, so we just need to filter by isHidden
    const savedNonHiddenGroups = groups.filter((g: any) => !g.isHidden);

    return {
      accounts: {
        total: accounts.length,
        active: accounts.filter((a: any) => a.status === 'active').length,
      },
      groups: {
        total: groups.length,
        active: savedNonHiddenGroups.length, // Show count of saved, non-hidden groups
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

