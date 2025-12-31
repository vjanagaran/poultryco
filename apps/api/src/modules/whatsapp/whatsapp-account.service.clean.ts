import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq } from 'drizzle-orm';
import { mktWapAccounts } from '../../database/schema/whatsapp';
import { WhatsAppGateway } from './whatsapp.gateway';
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

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => WhatsAppGateway))
    private readonly gateway: WhatsAppGateway,
  ) {}

  async onModuleInit() {
    this.logger.log('WhatsApp Account Service initialized');
    // Optionally load active accounts on startup
    // await this.loadActiveAccounts();
  }

  async onModuleDestroy() {
    this.logger.log('Destroying all WhatsApp clients...');
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
    const client = new Client({
      authStrategy: new LocalAuth({
        dataPath: absoluteSessionPath,
      }),
      // Minimal Puppeteer config - only essential flags
      puppeteer: {
        headless: true,
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
      await client.initialize();
      this.logger.log(`Client initialization started for account ${accountId}`);
    } catch (error) {
      this.logger.error(`Error initializing client for account ${accountId}:`, error);
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
      this.currentQRCodes.delete(accountId);

      try {
        // Extract phone number
        const clientInfo = client.info;
        if (clientInfo && clientInfo.wid && clientInfo.wid.user) {
          const phoneNumber = clientInfo.wid.user;
          const pushName = clientInfo.pushname || null;

          this.logger.log(`📱 Phone number: ${phoneNumber}, Push name: ${pushName}`);

          // Update database
          await this.updateAccountStatus(accountId, 'active', {
            phoneNumber: phoneNumber,
            pushName: pushName,
            lastConnectedAt: new Date().toISOString(),
          });

          // Emit via WebSocket
          this.gateway.emitStatus(accountId, 'active', { phoneNumber, pushName });
          this.gateway.emitPhoneNumber(accountId, phoneNumber, pushName || undefined);
          this.gateway.emitConnectionState(accountId, 'connected', { phoneNumber, pushName });
        } else {
          this.logger.warn(`Client info not available for account ${accountId}`);
          await this.updateAccountStatus(accountId, 'active', {
            lastConnectedAt: new Date().toISOString(),
          });
          this.gateway.emitStatus(accountId, 'active');
        }
      } catch (error) {
        this.logger.error(`Error handling ready event for account ${accountId}:`, error);
      }
    });

    // Authenticated event
    client.on('authenticated', () => {
      this.logger.log(`✅ Account ${accountId} authenticated`);
      this.updateAccountStatus(accountId, 'authenticating', {
        lastConnectedAt: new Date().toISOString(),
      }).catch(err => this.logger.error(`Error updating account status:`, err));
      this.gateway.emitConnectionState(accountId, 'authenticated');
      this.gateway.emitStatus(accountId, 'authenticating');
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
        lastDisconnectedAt: new Date().toISOString(),
        disconnectReason: reason,
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
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString(),
        ...updates,
      };

      // Filter out undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await this.db
        .update(mktWapAccounts)
        .set(updateData)
        .where(eq(mktWapAccounts.id, accountId));
    } catch (error) {
      this.logger.error(`Error updating account status for ${accountId}:`, error);
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
      lastDisconnectedAt: new Date().toISOString(),
    });
  }
}

