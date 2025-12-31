import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq, isNull } from 'drizzle-orm';
import { mktWapAccounts } from '../../database/schema/whatsapp';
import { WhatsAppGateway } from './whatsapp.gateway';
import { WhatsAppLoggerService } from './whatsapp-logger.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Clean WhatsApp Account Service - Based on Official Examples
 * 
 * This is a minimal, clean implementation following whatsapp-web.js foundation:
 * 1. Minimal Puppeteer configuration
 * 2. Essential event handlers only
 * 3. Simple session management
 * 4. No over-engineering
 */
@Injectable()
export class WhatsAppAccountService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppAccountService.name);
  private clients: Map<string, Client> = new Map();
  private currentQRCodes: Map<string, string> = new Map();
  private phoneExtractionPolling: Map<string, ReturnType<typeof setInterval>> = new Map();
  
  // Error message constants
  private readonly ERROR_MESSAGES = {
    PHONE_EXTRACTION_TIMEOUT: 'Phone number could not be extracted automatically. Please use the "Update Phone" button to manually update your phone number.',
    PHONE_EXTRACTION_FAILED: 'Unable to extract phone number. The account may need to be re-initialized.',
    CLIENT_NOT_READY: 'WhatsApp client is not ready yet. Please wait a few moments and try again.',
  };

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => WhatsAppGateway))
    private readonly gateway: WhatsAppGateway,
    private readonly whatsappLogger: WhatsAppLoggerService,
  ) {}

  async onModuleInit() {
    this.logger.log('WhatsApp Account Service initialized');
    
    // Load and restore active accounts on startup
    try {
      await this.loadActiveAccounts();
    } catch (error) {
      this.logger.warn('Could not load active accounts on startup:', error instanceof Error ? error.message : String(error));
      // Don't fail module initialization if table doesn't exist or other errors
    }
    
    // Start continuous monitoring for connected accounts without phone numbers
    this.startContinuousPhoneExtraction();
  }

  /**
   * Load and restore active accounts on startup
   * This restores sessions for accounts that were active before server restart
   */
  private async loadActiveAccounts(): Promise<void> {
    try {
      const activeAccounts = await this.db
        .select()
        .from(mktWapAccounts)
        .where(eq(mktWapAccounts.status, 'active'));

      if (activeAccounts.length === 0) {
        this.logger.log('No active accounts to restore');
        return;
      }

      this.logger.log(`Restoring ${activeAccounts.length} active account(s) on startup...`);

      for (const account of activeAccounts) {
        try {
          // Check if session files exist
          const sessionPath = this.getSessionPath(account.id);
          const absoluteSessionPath = path.isAbsolute(sessionPath)
            ? sessionPath
            : path.resolve(process.cwd(), sessionPath);

          if (fs.existsSync(absoluteSessionPath)) {
            this.logger.log(`Restoring account ${account.accountName} (${account.id})...`);
            // Initialize the account - this will restore the session
            await this.initializeAccount(account.id);
          } else {
            this.logger.warn(`Session files not found for account ${account.accountName} - marking as inactive`);
            // Mark as inactive if session doesn't exist
            await this.updateAccountStatus(account.id, 'inactive', {
              notes: 'Session files not found on startup',
            });
          }
        } catch (error) {
          this.logger.error(`Error restoring account ${account.accountName}:`, error);
          // Mark as inactive if restoration fails
          await this.updateAccountStatus(account.id, 'inactive', {
            notes: `Failed to restore: ${error instanceof Error ? error.message : String(error)}`,
          }).catch(err => {
            this.logger.error(`Error updating account status:`, err);
          });
        }
      }
    } catch (error) {
      this.logger.error('Error loading active accounts:', error);
      throw error;
    }
  }

  /**
   * Continuously monitor connected accounts and extract phone numbers
   * Runs every 30 seconds to check for connected accounts without phone numbers
   */
  private startContinuousPhoneExtraction(): void {
    setInterval(async () => {
      try {
        // Find all accounts without phone numbers
        const accounts = await this.db
          .select()
          .from(mktWapAccounts)
          .where(isNull(mktWapAccounts.phoneNumber));
        
        for (const account of accounts) {
          const client = this.clients.get(account.id);
          if (client) {
            try {
              const state = await client.getState();
              if (state === 'CONNECTED') {
                // Try extraction with fewer retries (since we run frequently)
                const phoneNumber = await this.extractPhoneNumberWithRetry(client, account.id, 3);
                if (phoneNumber) {
                  this.logger.log(`✅ Phone number extracted via continuous monitoring for account ${account.id}: ${phoneNumber}`);
                  this.whatsappLogger.log(`✅ Phone number extracted via continuous monitoring for account ${account.id}: ${phoneNumber}`, account.id);
                }
              }
            } catch (error) {
              // Silently continue - don't spam logs
            }
          }
        }
      } catch (error) {
        // Silently continue
      }
    }, 30000); // Every 30 seconds
  }

  async onModuleDestroy() {
    this.logger.log('Destroying all WhatsApp clients...');
    
    // Clear all polling intervals
    for (const [accountId, interval] of this.phoneExtractionPolling.entries()) {
      clearInterval(interval);
      this.phoneExtractionPolling.delete(accountId);
    }
    
    for (const [accountId, client] of this.clients.entries()) {
      try {
        await client.destroy();
        this.logger.log(`Destroyed client for account ${accountId}`);
      } catch (error) {
        this.logger.error(`Error destroying client for account ${accountId}:`, error);
      }
    }
    this.clients.clear();
    this.currentQRCodes.clear();
  }

  /**
   * Initialize WhatsApp account - Clean implementation
   */
  async initializeAccount(accountId: string): Promise<void> {
    // Destroy existing client if any
    if (this.clients.has(accountId)) {
      this.logger.warn(`Account ${accountId} already initialized - destroying existing client`);
      try {
        const existingClient = this.clients.get(accountId);
        if (existingClient) {
          await existingClient.destroy();
        }
        this.clients.delete(accountId);
        // Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(`Error destroying existing client:`, error);
      }
    }

    // Get or create session path
    const sessionPath = this.getSessionPath(accountId);
    const absoluteSessionPath = path.isAbsolute(sessionPath)
      ? sessionPath
      : path.resolve(process.cwd(), sessionPath);

    // Ensure session directory exists
    if (!fs.existsSync(absoluteSessionPath)) {
      fs.mkdirSync(absoluteSessionPath, { recursive: true });
      this.logger.log(`Created session directory: ${absoluteSessionPath}`);
    }

    // Create client with MINIMAL configuration
    // Get Chromium path from whatsapp-web.js's bundled Puppeteer
    let chromiumPath: string | undefined;
    try {
      // Use puppeteer-core's executablePath() - most reliable method
      const puppeteerCore = require('whatsapp-web.js/node_modules/puppeteer-core');
      chromiumPath = puppeteerCore.executablePath();
      
      const fs = require('fs');
      if (fs.existsSync(chromiumPath)) {
        this.logger.log(`✅ Found Chromium at: ${chromiumPath}`);
      } else {
        // If not found, try constructing path from project root (go up from apps/api)
        const projectRoot = path.resolve(process.cwd(), '..', '..');
        const chromiumPathCandidate = path.join(
          projectRoot,
          'node_modules',
          'whatsapp-web.js',
          'node_modules',
          'puppeteer-core',
          '.local-chromium',
          'mac-1045629',
          'chrome-mac',
          'Chromium.app',
          'Contents',
          'MacOS',
          'Chromium'
        );
        
        if (fs.existsSync(chromiumPathCandidate)) {
          chromiumPath = chromiumPathCandidate;
          this.logger.log(`✅ Found Chromium at (constructed): ${chromiumPath}`);
        } else {
          this.logger.error(`❌ Chromium not found at: ${chromiumPath}`);
          this.logger.error(`   Also tried: ${chromiumPathCandidate}`);
          chromiumPath = undefined;
        }
      }
    } catch (error) {
      this.logger.error(`❌ Error getting Chromium path:`, error);
      chromiumPath = undefined;
    }

    const client = new Client({
      authStrategy: new LocalAuth({
        dataPath: absoluteSessionPath,
      }),
      // Minimal Puppeteer config
      puppeteer: {
        headless: true,
        ...(chromiumPath ? { executablePath: chromiumPath } : {}), // Only set if found
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      },
      // No webVersionCache - let library handle it automatically
    });

    // Set up event handlers BEFORE initialize
    this.setupEventHandlers(client, accountId);

    // Store client
    this.clients.set(accountId, client);

    // Initialize client
    try {
      this.logger.log(`Initializing WhatsApp client for account ${accountId}...`);
      this.whatsappLogger.log(`Initializing WhatsApp client for account ${accountId}...`, accountId);
      await client.initialize();
      this.logger.log(`Client initialization started for account ${accountId}`);
      this.whatsappLogger.log(`Client initialization started for account ${accountId}`, accountId);
    } catch (error) {
      this.logger.error(`Error initializing client for account ${accountId}:`, error);
      this.whatsappLogger.error(`Error initializing client for account ${accountId}`, error, accountId);
      this.clients.delete(accountId);
      throw error;
    }
  }

  /**
   * Set up event handlers - Following official examples
   */
  private setupEventHandlers(client: Client, accountId: string): void {
    // QR Code event
    client.on('qr', (qr) => {
      this.logger.log(`QR Code generated for account ${accountId}`);
      this.whatsappLogger.log(`QR Code generated for account ${accountId}`, accountId);
      qrcode.generate(qr, { small: true });
      this.currentQRCodes.set(accountId, qr);

      // Update database
      this.updateAccountStatus(accountId, 'warming', {
        qrCode: qr,
        generatedAt: new Date().toISOString(),
      }).catch(err => this.logger.error(`Error updating account status:`, err));

      // Emit via WebSocket
      this.gateway.emitQRCode(accountId, qr, 20);
      this.gateway.emitStatus(accountId, 'qr_pending', { qrCode: qr });
    });

    // Ready event
    client.on('ready', async () => {
      this.logger.log(`✅ WhatsApp client ready for account ${accountId}`);
      this.whatsappLogger.log(`✅ WhatsApp client ready for account ${accountId}`, accountId);
      this.currentQRCodes.delete(accountId);
      
      // Stop any existing polling
      const existingPoll = this.phoneExtractionPolling.get(accountId);
      if (existingPoll) {
        clearInterval(existingPoll);
        this.phoneExtractionPolling.delete(accountId);
      }

      // Update status to active
      await this.updateAccountStatus(accountId, 'active', {
        lastConnectedAt: new Date(),
      }).catch(err => {
        this.logger.error(`Error updating account status:`, err);
      });
      this.gateway.emitStatus(accountId, 'active');
      this.gateway.emitConnectionState(accountId, 'connected');

      try {
        // Wait a bit for client.info to populate (sometimes it's not immediately available)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Log client.info state for debugging
        const clientInfo = client.info;
        this.logger.debug(`Client info in ready event:`, {
          hasInfo: !!clientInfo,
          hasWid: !!(clientInfo?.wid),
          hasUser: !!(clientInfo?.wid?.user),
          pushname: clientInfo?.pushname,
        });
        this.whatsappLogger.debug(`Client info in ready event: hasInfo=${!!clientInfo}, hasWid=${!!(clientInfo?.wid)}, hasUser=${!!(clientInfo?.wid?.user)}`, accountId);
        
        // Try to extract phone number with more retries
        const phoneNumber = await this.extractPhoneNumberWithRetry(client, accountId, 10);
        
        if (phoneNumber) {
          this.logger.log(`✅✅✅ Account ${accountId} ready and phone number extracted: ${phoneNumber}`);
          this.whatsappLogger.log(`✅✅✅ Account ${accountId} ready and phone number extracted: ${phoneNumber}`, accountId);
        } else {
          // Phone number not available - start polling as fallback
          this.logger.warn(`⚠️ Phone number not available in ready event for account ${accountId} - starting polling`);
          this.whatsappLogger.warn(`⚠️ Phone number not available in ready event for account ${accountId} - starting polling`, accountId);
          this.pollForPhoneNumber(accountId, client).catch(err => {
            this.logger.error(`Error in phone number polling:`, err);
            this.whatsappLogger.error(`Error in phone number polling`, err, accountId);
          });
        }
      } catch (error) {
        this.logger.error(`Error handling ready event for account ${accountId}:`, error);
        this.logger.error(`Error stack:`, error instanceof Error ? error.stack : error);
        this.whatsappLogger.error(`Error handling ready event for account ${accountId}`, error, accountId);
        // Start polling as fallback
        this.pollForPhoneNumber(accountId, client).catch(err => {
          this.logger.error(`Error in phone number polling:`, err);
          this.whatsappLogger.error(`Error in phone number polling`, err, accountId);
        });
      }
    });

    // Authenticated event
    client.on('authenticated', async () => {
      this.logger.log(`✅ Account ${accountId} authenticated`);
      this.whatsappLogger.log(`✅ Account ${accountId} authenticated - starting phone number polling`, accountId);
      await this.updateAccountStatus(accountId, 'authenticating', {
        lastConnectedAt: new Date(), // Use Date object
      }).catch(err => {
        this.logger.error(`Error updating account status:`, err);
        this.whatsappLogger.error(`Error updating account status`, err, accountId);
      });
      this.gateway.emitConnectionState(accountId, 'authenticated');
      this.gateway.emitStatus(accountId, 'authenticating');
      
      // Start aggressive polling for phone number extraction
      this.pollForPhoneNumber(accountId, client).catch(err => {
        this.logger.error(`Error in phone number polling:`, err);
        this.whatsappLogger.error(`Error in phone number polling`, err, accountId);
      });
    });

    // Authentication failure
    client.on('auth_failure', async (msg) => {
      this.logger.error(`❌ Authentication failure for account ${accountId}:`, msg);
      await this.updateAccountStatus(accountId, 'inactive', {
        notes: `Auth failure: ${msg}`,
      });
      this.gateway.emitError(accountId, 'Authentication failed', { message: msg });
      this.gateway.emitStatus(accountId, 'error', { error: msg });
      this.currentQRCodes.delete(accountId);
    });

    // Disconnected event
    client.on('disconnected', async (reason) => {
      this.logger.warn(`⚠️ Account ${accountId} disconnected:`, reason);
      await this.updateAccountStatus(accountId, 'inactive', {
        lastDisconnectedAt: new Date(), // Use Date object
        notes: `Disconnected: ${reason}`, // Store reason in notes field
      });
      this.gateway.emitConnectionState(accountId, 'disconnected', { reason });
      this.gateway.emitStatus(accountId, 'disconnected', { reason });
      this.currentQRCodes.delete(accountId);
    });

    // Loading screen
    client.on('loading_screen', (percent, message) => {
      this.logger.log(`📱 Account ${accountId} loading: ${percent}% - ${message}`);
      this.gateway.emitStatus(accountId, 'loading', { percent, message });
    });

    // Message event (for future use)
    client.on('message', async (msg: Message) => {
      // Handle incoming messages if needed
    });
  }

  /**
   * Get session path for account
   */
  private getSessionPath(accountId: string): string {
    return `./whatsapp-sessions/${accountId}`;
  }

  /**
   * Update account status in database
   */
  private async updateAccountStatus(
    accountId: string,
    status: string,
    updates: any = {},
  ): Promise<void> {
    try {
      // Build update data - only include fields that exist in schema
      // Note: updatedAt has defaultNow() in schema, but we'll set it explicitly
      const updateData: any = {
        status,
      };

      // Handle specific fields from updates
      if (updates.phoneNumber !== undefined) {
        updateData.phoneNumber = updates.phoneNumber;
      }
      if (updates.pushName !== undefined) {
        updateData.pushName = updates.pushName;
      }
      if (updates.notes !== undefined) {
        updateData.notes = updates.notes;
      }
      if (updates.lastConnectedAt !== undefined) {
        updateData.lastConnectedAt = updates.lastConnectedAt instanceof Date 
          ? updates.lastConnectedAt 
          : new Date(updates.lastConnectedAt);
      }
      if (updates.lastDisconnectedAt !== undefined) {
        updateData.lastDisconnectedAt = updates.lastDisconnectedAt instanceof Date 
          ? updates.lastDisconnectedAt 
          : new Date(updates.lastDisconnectedAt);
      }
      
      // Handle sessionData (for QR code storage) - only if qrCode is provided
      if (updates.qrCode !== undefined) {
        // Get existing sessionData first, then merge
        try {
          const existing = await this.db
            .select({ sessionData: mktWapAccounts.sessionData })
            .from(mktWapAccounts)
            .where(eq(mktWapAccounts.id, accountId))
            .limit(1);
          
          const existingData = existing[0]?.sessionData || {};
          updateData.sessionData = {
            ...existingData,
            qrCode: updates.qrCode,
            generatedAt: updates.generatedAt || new Date().toISOString(),
          };
        } catch (err) {
          // If we can't get existing data, just set new
          updateData.sessionData = {
            qrCode: updates.qrCode,
            generatedAt: updates.generatedAt || new Date().toISOString(),
          };
        }
      }

      // Filter out undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      this.logger.log(`💾 Updating account ${accountId} in database: status=${status}, updates=${JSON.stringify(Object.keys(updates))}`);
      await this.db
        .update(mktWapAccounts)
        .set(updateData)
        .where(eq(mktWapAccounts.id, accountId));
      this.logger.log(`✅ Successfully updated account ${accountId} in database`);
    } catch (error) {
      this.logger.error(`❌ Error updating account status for ${accountId}:`, error);
      this.logger.error(`Error details:`, error instanceof Error ? error.stack : error);
    }
  }

  /**
   * Get client for account
   */
  getClient(accountId: string): Client | undefined {
    return this.clients.get(accountId);
  }

  /**
   * Get account status
   */
  async getAccountStatus(accountId: string): Promise<any> {
    try {
      const account = await this.db
        .select()
        .from(mktWapAccounts)
        .where(eq(mktWapAccounts.id, accountId))
        .limit(1);

      if (account.length === 0) {
        return null;
      }

      const client = this.clients.get(accountId);
      const qrCode = this.currentQRCodes.get(accountId);

      return {
        ...account[0],
        isConnected: client ? true : false,
        hasClient: !!client,
        qrCode: qrCode || null,
      };
    } catch (error) {
      this.logger.error(`Error getting account status for ${accountId}:`, error);
      return null;
    }
  }

  /**
   * Disconnect account
   */
  async disconnectAccount(accountId: string): Promise<void> {
    const client = this.clients.get(accountId);
    if (client) {
      try {
        await client.destroy();
        this.logger.log(`Disconnected account ${accountId}`);
      } catch (error) {
        this.logger.error(`Error disconnecting account ${accountId}:`, error);
      }
      this.clients.delete(accountId);
      this.currentQRCodes.delete(accountId);
    }

    await this.updateAccountStatus(accountId, 'inactive', {
      lastDisconnectedAt: new Date(), // Use Date object
    });
  }

  /**
   * Increment daily usage count
   */
  async incrementDailyUsage(accountId: string): Promise<void> {
    try {
      const account = await this.db
        .select()
        .from(mktWapAccounts)
        .where(eq(mktWapAccounts.id, accountId))
        .limit(1);

      if (account.length > 0) {
        const currentCount = account[0].dailyUsageCount || 0;
        await this.db
          .update(mktWapAccounts)
          .set({
            dailyUsageCount: currentCount + 1,
            // updatedAt is handled by schema defaultNow()
          })
          .where(eq(mktWapAccounts.id, accountId));
      }
    } catch (error) {
      this.logger.error(`Error incrementing daily usage for ${accountId}:`, error);
    }
  }

  /**
   * Poll for phone number extraction after authentication
   * Checks client state every 1 second for up to 60 seconds
   */
  private async pollForPhoneNumber(accountId: string, client: Client): Promise<void> {
    // Clear any existing polling for this account
    const existingPoll = this.phoneExtractionPolling.get(accountId);
    if (existingPoll) {
      clearInterval(existingPoll);
    }

    const maxAttempts = 60; // 60 seconds
    let attempts = 0;
    
    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        // Check if already extracted
        const account = await this.db
          .select({ phoneNumber: mktWapAccounts.phoneNumber, status: mktWapAccounts.status })
          .from(mktWapAccounts)
          .where(eq(mktWapAccounts.id, accountId))
          .limit(1);
        
        if (account.length === 0) {
          this.logger.warn(`Account ${accountId} not found in database - stopping polling`);
          clearInterval(pollInterval);
          this.phoneExtractionPolling.delete(accountId);
          return;
        }
        
        if (account[0]?.phoneNumber) {
          this.logger.log(`✅ Phone number already extracted for account ${accountId} - stopping polling`);
          clearInterval(pollInterval);
          this.phoneExtractionPolling.delete(accountId);
          return;
        }
        
        // Check client state
        let state: string;
        try {
          state = await client.getState();
        } catch (error) {
          this.logger.warn(`Error getting client state (attempt ${attempts}/${maxAttempts}):`, error);
          state = 'UNKNOWN';
        }
        
        this.logger.log(`🔍 Polling attempt ${attempts}/${maxAttempts} for account ${accountId} - State: ${state}`);
        this.whatsappLogger.debug(`🔍 Polling attempt ${attempts}/${maxAttempts} for account ${accountId} - State: ${state}`, accountId);
        
        if (state === 'CONNECTED') {
          // Try to extract phone number with more retries during polling
          const phoneNumber = await this.extractPhoneNumberWithRetry(client, accountId, 3);
          if (phoneNumber) {
            this.logger.log(`✅ Phone number extracted via polling for account ${accountId}`);
            this.whatsappLogger.log(`✅ Phone number extracted via polling for account ${accountId}: ${phoneNumber}`, accountId);
            clearInterval(pollInterval);
            this.phoneExtractionPolling.delete(accountId);
            return;
          } else {
            // Log that we tried but failed
            this.whatsappLogger.debug(`Phone extraction attempt ${attempts} failed - will retry`, accountId);
          }
        } else if (state === 'OPENING') {
          this.whatsappLogger.debug(`Client still opening (attempt ${attempts})`, accountId);
        } else {
          this.whatsappLogger.debug(`Client state is ${state} (attempt ${attempts})`, accountId);
        }
        
        // Stop after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          this.phoneExtractionPolling.delete(accountId);
          this.logger.warn(`⚠️ Phone number extraction timeout for account ${accountId} after ${maxAttempts} attempts`);
          await this.updateAccountStatus(accountId, 'active', {
            notes: this.ERROR_MESSAGES.PHONE_EXTRACTION_TIMEOUT,
          });
          this.gateway.emitError(accountId, 'Phone Extraction Timeout', {
            message: this.ERROR_MESSAGES.PHONE_EXTRACTION_TIMEOUT,
            action: 'update_phone',
          });
        }
      } catch (error) {
        this.logger.error(`Error in phone number polling (attempt ${attempts}):`, error);
        // Continue polling even on error
      }
    }, 1000); // Check every 1 second
    
    this.phoneExtractionPolling.set(accountId, pollInterval);
  }

  /**
   * Extract phone number with exponential backoff retry
   * Uses multiple methods to get phone number from connected client
   * @param client WhatsApp client instance
   * @param accountId Account ID
   * @param maxRetries Maximum number of retry attempts (default: 5)
   * @returns Phone number if extracted, null otherwise
   */
  async extractPhoneNumberWithRetry(
    client: Client,
    accountId: string,
    maxRetries: number = 5
  ): Promise<string | null> {
    const delays = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff in milliseconds
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Wait before retry (except first attempt)
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));
        }
        
        // Method 1: Try client.info directly
        try {
          const clientInfo = client.info;
          const debugInfo = {
            hasInfo: !!clientInfo,
            hasWid: !!(clientInfo?.wid),
            hasUser: !!(clientInfo?.wid?.user),
            pushname: clientInfo?.pushname,
            infoType: typeof clientInfo,
            infoKeys: clientInfo ? Object.keys(clientInfo) : [],
            widType: typeof clientInfo?.wid,
            widKeys: clientInfo?.wid ? Object.keys(clientInfo.wid) : [],
          };
          
          this.logger.debug(`Client info check (attempt ${attempt + 1}):`, JSON.stringify(debugInfo, null, 2));
          this.whatsappLogger.debug(`Client info check (attempt ${attempt + 1}): ${JSON.stringify(debugInfo)}`, accountId);
          
          if (clientInfo?.wid?.user) {
            const phoneNumber = clientInfo.wid.user;
            const pushName = clientInfo.pushname || null;
            
            this.logger.log(`📱 Phone number extracted via client.info (attempt ${attempt + 1}/${maxRetries}): ${phoneNumber}, Push name: ${pushName}`);
            this.whatsappLogger.log(`📱 Phone number extracted via client.info (attempt ${attempt + 1}/${maxRetries}): ${phoneNumber}, Push name: ${pushName}`, accountId);
            
            // Update database
            await this.savePhoneNumberToDatabase(accountId, phoneNumber, pushName);
            
            return phoneNumber;
          } else {
            // Log why extraction failed
            if (!clientInfo) {
              this.logger.debug(`client.info is null/undefined (attempt ${attempt + 1})`);
            } else if (!clientInfo.wid) {
              this.logger.debug(`client.info.wid is null/undefined (attempt ${attempt + 1})`);
            } else if (!clientInfo.wid.user) {
              this.logger.debug(`client.info.wid.user is null/undefined (attempt ${attempt + 1}), wid: ${JSON.stringify(clientInfo.wid)}`);
            }
          }
        } catch (infoError) {
          this.logger.warn(`client.info access failed (attempt ${attempt + 1}):`, infoError);
          this.whatsappLogger.warn(`client.info access failed (attempt ${attempt + 1}): ${infoError instanceof Error ? infoError.message : String(infoError)}`, accountId);
        }
        
        // Method 2: Try getting number from browser page directly via Puppeteer
        try {
          const state = await client.getState();
          if (state === 'CONNECTED') {
            // Try accessing the page directly to get phone number
            // Access the Puppeteer page from the client - try multiple ways
            let puppeteer: any = null;
            
            // Method 1: Try client.pupPage (most common)
            if ((client as any).pupPage) {
              puppeteer = (client as any).pupPage;
            }
            // Method 2: Try client.pupBrowser
            else if ((client as any).pupBrowser) {
              try {
                const browser = (client as any).pupBrowser;
                const pages = await browser.pages();
                puppeteer = pages && pages.length > 0 ? pages[0] : null;
              } catch (e) {
                this.logger.debug(`Could not get pages from browser:`, e);
              }
            }
            // Method 3: Try private property
            else if ((client as any)._pupPage) {
              puppeteer = (client as any)._pupPage;
            }
            // Method 4: Try via client.puppeteer
            else if ((client as any).puppeteer) {
              puppeteer = (client as any).puppeteer.page || (client as any).puppeteer;
            }
            // Method 5: Try client.browser
            else if ((client as any).browser) {
              try {
                const browser = (client as any).browser;
                const pages = await browser.pages();
                puppeteer = pages && pages.length > 0 ? pages[0] : null;
              } catch (e) {
                this.logger.debug(`Could not get pages from client.browser:`, e);
              }
            }
            
            if (puppeteer) {
              try {
                // Wait a bit for page to be ready
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Try to get phone number from window.Store.Me (WhatsApp Web's internal store)
                const phoneData = await puppeteer.evaluate(() => {
                  try {
                    // Method 1: Try window.Store.Me (most reliable)
                    if ((window as any).Store && (window as any).Store.Me) {
                      const me = (window as any).Store.Me;
                      const wid = me.wid || me.id;
                      if (wid) {
                        const phoneNumber = wid.user || wid._serialized?.split('@')[0];
                        if (phoneNumber) {
                          return {
                            wid: phoneNumber,
                            pushname: me.pushname || me.name || me.formattedName || null,
                            source: 'Store.Me',
                          };
                        }
                      }
                    }
                    
                    // Method 2: Try window.Store.Conn
                    if ((window as any).Store && (window as any).Store.Conn) {
                      const conn = (window as any).Store.Conn;
                      if (conn.wid) {
                        const phoneNumber = conn.wid.user || conn.wid._serialized?.split('@')[0];
                        if (phoneNumber) {
                          return {
                            wid: phoneNumber,
                            pushname: conn.pushname || null,
                            source: 'Store.Conn',
                          };
                        }
                      }
                    }
                    
                    // Method 3: Try localStorage
                    try {
                      const storage = (window as any).localStorage;
                      for (let i = 0; i < storage.length; i++) {
                        const key = storage.key(i);
                        if (key && (key.includes('wid') || key.includes('me') || key.includes('user'))) {
                          const value = storage.getItem(key);
                          if (value) {
                            try {
                              const parsed = JSON.parse(value);
                              if (parsed.wid || parsed.user || parsed.id) {
                                const wid = parsed.wid || parsed.user || parsed.id;
                                const phoneNumber = wid?.user || wid?._serialized?.split('@')[0] || wid;
                                if (phoneNumber && /^\d+$/.test(phoneNumber)) {
                                  return {
                                    wid: phoneNumber,
                                    pushname: parsed.pushname || parsed.name || null,
                                    source: 'localStorage',
                                  };
                                }
                              }
                            } catch (e) {
                              // Not JSON, skip
                            }
                          }
                        }
                      }
                    } catch (storageError) {
                      // localStorage access failed
                    }
                    
                    return null;
                  } catch (error) {
                    return { error: String(error) };
                  }
                });
                
                if (phoneData && phoneData.wid && !phoneData.error) {
                  const phoneNumber = phoneData.wid;
                  const pushName = phoneData.pushname || null;
                  
                  this.logger.log(`📱 Phone number extracted via page evaluation (${phoneData.source}) (attempt ${attempt + 1}/${maxRetries}): ${phoneNumber}, Push name: ${pushName}`);
                  this.whatsappLogger.log(`📱 Phone number extracted via page evaluation (${phoneData.source}) (attempt ${attempt + 1}/${maxRetries}): ${phoneNumber}, Push name: ${pushName}`, accountId);
                  
                  await this.savePhoneNumberToDatabase(accountId, phoneNumber, pushName);
                  
                  return phoneNumber;
                } else if (phoneData?.error) {
                  this.logger.debug(`Page evaluation returned error (attempt ${attempt + 1}): ${phoneData.error}`);
                }
              } catch (pageError) {
                this.logger.debug(`Page evaluation failed (attempt ${attempt + 1}):`, pageError);
                this.whatsappLogger.debug(`Page evaluation failed (attempt ${attempt + 1}): ${pageError instanceof Error ? pageError.message : String(pageError)}`, accountId);
              }
            }
            
            // Fallback: Try accessing info again after state check with longer wait
            await new Promise(resolve => setTimeout(resolve, 1000));
            const clientInfo = client.info;
            if (clientInfo?.wid?.user) {
              const phoneNumber = clientInfo.wid.user;
              const pushName = clientInfo.pushname || null;
              
              this.logger.log(`📱 Phone number extracted after state check (attempt ${attempt + 1}/${maxRetries}): ${phoneNumber}, Push name: ${pushName}`);
              this.whatsappLogger.log(`📱 Phone number extracted after state check (attempt ${attempt + 1}/${maxRetries}): ${phoneNumber}, Push name: ${pushName}`, accountId);
              
              await this.savePhoneNumberToDatabase(accountId, phoneNumber, pushName);
              
              return phoneNumber;
            }
          }
        } catch (stateError) {
          this.logger.debug(`State check failed (attempt ${attempt + 1}):`, stateError);
        }
        
        // Method 3: Try extracting from session files as last resort
        try {
          const sessionPath = this.getSessionPath(accountId);
          const absoluteSessionPath = path.isAbsolute(sessionPath)
            ? sessionPath
            : path.resolve(process.cwd(), sessionPath);
          
          // Check if session files exist
          if (fs.existsSync(absoluteSessionPath)) {
            // Try to read phone number from session metadata if available
            // This is a fallback - session files may not contain phone number
            // But we can check localStorage dump or session data
            const sessionDataFile = path.join(absoluteSessionPath, 'session.data');
            if (fs.existsSync(sessionDataFile)) {
              // Note: session.data is binary, hard to parse
              // This is just a placeholder for future implementation
              this.logger.debug(`Session file exists but parsing binary data is complex`);
            }
          }
        } catch (sessionError) {
          this.logger.debug(`Session file extraction failed (attempt ${attempt + 1}):`, sessionError);
        }
        
        // Method 4: Try accessing info with additional wait
        try {
          // Sometimes info needs more time to populate
          await new Promise(resolve => setTimeout(resolve, 2000));
          const clientInfo = client.info;
          if (clientInfo?.wid?.user) {
            const phoneNumber = clientInfo.wid.user;
            const pushName = clientInfo.pushname || null;
            
            this.logger.log(`📱 Phone number extracted with additional wait (attempt ${attempt + 1}/${maxRetries}): ${phoneNumber}, Push name: ${pushName}`);
            this.whatsappLogger.log(`📱 Phone number extracted with additional wait (attempt ${attempt + 1}/${maxRetries}): ${phoneNumber}, Push name: ${pushName}`, accountId);
            
            await this.savePhoneNumberToDatabase(accountId, phoneNumber, pushName);
            
            return phoneNumber;
          }
        } catch (waitError) {
          this.logger.debug(`Additional wait method failed (attempt ${attempt + 1}):`, waitError);
        }
        
        this.logger.log(`⏳ Phone number not yet available (attempt ${attempt + 1}/${maxRetries})`);
        this.whatsappLogger.debug(`⏳ Phone number not yet available (attempt ${attempt + 1}/${maxRetries})`, accountId);
      } catch (error) {
        this.logger.warn(`Error extracting phone number (attempt ${attempt + 1}/${maxRetries}):`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.whatsappLogger.error(`Error extracting phone number (attempt ${attempt + 1}/${maxRetries}): ${errorMessage}`, error, accountId);
      }
    }
    
    this.logger.warn(`⚠️ Could not extract phone number for account ${accountId} after ${maxRetries} attempts`);
    this.whatsappLogger.warn(`⚠️ Could not extract phone number for account ${accountId} after ${maxRetries} attempts`, accountId);
    return null;
  }

  /**
   * Save phone number and push name to database
   * Centralized method to ensure consistent database updates
   */
  private async savePhoneNumberToDatabase(
    accountId: string,
    phoneNumber: string,
    pushName: string | null
  ): Promise<void> {
    try {
      this.logger.log(`💾 Saving phone number to database for account ${accountId}: phone=${phoneNumber}, pushName=${pushName}`);
      
      await this.updateAccountStatus(accountId, 'active', {
        phoneNumber: phoneNumber,
        pushName: pushName,
        lastConnectedAt: new Date(),
      });
      
      this.logger.log(`✅✅✅ Phone number saved to database for account ${accountId}`);
      this.whatsappLogger.log(`✅✅✅ Phone number saved to database for account ${accountId}: ${phoneNumber}`, accountId);
      
      // Emit via WebSocket
      this.gateway.emitStatus(accountId, 'active', { phoneNumber, pushName });
      this.gateway.emitPhoneNumber(accountId, phoneNumber, pushName || undefined);
      this.gateway.emitConnectionState(accountId, 'connected', { phoneNumber, pushName });
    } catch (error) {
      this.logger.error(`❌ Error saving phone number to database for account ${accountId}:`, error);
      this.whatsappLogger.error(`❌ Error saving phone number to database for account ${accountId}`, error, accountId);
      throw error;
    }
  }
}

