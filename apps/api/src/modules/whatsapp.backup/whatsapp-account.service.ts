import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq } from 'drizzle-orm';
import { mktWapAccounts } from '../../database/schema/whatsapp';
import { WhatsAppGateway } from './whatsapp.gateway';

@Injectable()
export class WhatsAppAccountService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppAccountService.name);
  private clients: Map<string, Client> = new Map();
  private sessionPaths: Map<string, string> = new Map();
  private qrRefreshTimers: Map<string, NodeJS.Timeout> = new Map();
  private currentQRCodes: Map<string, string> = new Map(); // accountId -> QR code

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => WhatsAppGateway))
    private readonly gateway: WhatsAppGateway,
  ) { }

  async onModuleInit() {
    // Load and initialize all active accounts
    try {
      await this.loadActiveAccounts();
    } catch (error) {
      this.logger.warn('Could not load active accounts on startup (table may not exist yet):', error.message);
      // Don't fail module initialization if table doesn't exist
    }
  }

  async onModuleDestroy() {
    // Cleanup all clients
    for (const [accountId, client] of this.clients.entries()) {
      try {
        await client.destroy();
        this.logger.log(`Destroyed client for account ${accountId}`);
      } catch (error) {
        this.logger.error(`Error destroying client ${accountId}:`, error);
      }
    }
    this.clients.clear();
  }

  private async loadActiveAccounts() {
    try {
      const accounts = await this.db
        .select()
        .from(mktWapAccounts)
        .where(eq(mktWapAccounts.status, 'active'));

      for (const account of accounts) {
        try {
          await this.initializeAccount(account.id);
        } catch (error) {
          this.logger.error(`Error initializing account ${account.id}:`, error);
        }
      }
    } catch (error) {
      // If table doesn't exist, log warning but don't throw
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        this.logger.warn('WhatsApp accounts table does not exist yet. Run database migrations first.');
      } else {
        this.logger.error('Error loading active accounts:', error);
        throw error; // Re-throw if it's a different error
      }
    }
  }

  async initializeAccount(accountId: string): Promise<void> {
    if (this.clients.has(accountId)) {
      this.logger.warn(`Account ${accountId} already initialized - destroying existing client first`);
      try {
        const existingClient = this.clients.get(accountId);
        if (existingClient) {
          await existingClient.destroy();
        }
        this.clients.delete(accountId);
        this.clearQRRefreshTimer(accountId);
        this.currentQRCodes.delete(accountId);
        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        this.logger.error(`Error destroying existing client:`, error);
      }
    }

    // Get session path - prefer from database if exists, otherwise generate new
    let sessionPath = this.getSessionPath(accountId);
    try {
      const account = await this.db
        .select()
        .from(mktWapAccounts)
        .where(eq(mktWapAccounts.id, accountId))
        .limit(1);

      if (account.length > 0 && account[0].sessionStoragePath) {
        sessionPath = account[0].sessionStoragePath;
        this.logger.log(`📂 Using stored session path for ${accountId}: ${sessionPath}`);
      } else {
        // Save new session path to database
        await this.db
          .update(mktWapAccounts)
          .set({ sessionStoragePath: sessionPath })
          .where(eq(mktWapAccounts.id, accountId));
        this.logger.log(`💾 Saved new session path for ${accountId}: ${sessionPath}`);
      }
    } catch (error) {
      this.logger.warn(`Could not load session path from database for ${accountId}, using default:`, error);
    }

    this.sessionPaths.set(accountId, sessionPath);

    let client: Client;
    try {
      // Get Puppeteer executable path if available
      const puppeteer = require('puppeteer');
      const executablePath = puppeteer.executablePath();

      // Clean up any existing lock files and stale browser processes
      const fs = require('fs');
      const path = require('path');
      const { execSync } = require('child_process');

      // Convert relative path to absolute
      const absoluteSessionPath = path.isAbsolute(sessionPath)
        ? sessionPath
        : path.resolve(process.cwd(), sessionPath);

      // Clean up lock files in multiple possible locations
      const lockFiles = [
        path.join(absoluteSessionPath, 'session', 'SingletonLock'),
        path.join(absoluteSessionPath, 'SingletonLock'),
        path.join(absoluteSessionPath, '.wwebjs_auth', 'SingletonLock'),
      ];

      for (const lockFile of lockFiles) {
        if (fs.existsSync(lockFile)) {
          try {
            fs.unlinkSync(lockFile);
            this.logger.log(`🧹 Cleaned up lock file: ${lockFile}`);
          } catch (error) {
            this.logger.warn(`Could not remove lock file ${lockFile}: ${error}`);
          }
        }
      }

      // Kill any existing Chrome/Puppeteer processes for this session
      try {
        const sessionDir = path.basename(absoluteSessionPath);
        execSync(`pkill -9 -f "chrome.*${sessionDir}" 2>/dev/null || true`, { stdio: 'ignore' });
        execSync(`pkill -9 -f "Chromium.*${sessionDir}" 2>/dev/null || true`, { stdio: 'ignore' });
        this.logger.log(`🧹 Killed any stale browser processes for ${sessionDir}`);
        // Wait a bit for processes to fully terminate
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        // Ignore errors - process might not exist
      }

      // Remove entire session subdirectory if it exists (contains lock files)
      const sessionSubDir = path.join(absoluteSessionPath, 'session');
      if (fs.existsSync(sessionSubDir)) {
        try {
          fs.rmSync(sessionSubDir, { recursive: true, force: true });
          this.logger.log(`🧹 Removed session subdirectory: ${sessionSubDir}`);
        } catch (error) {
          this.logger.warn(`Could not remove session subdirectory: ${error}`);
        }
      }

      // Ensure session directory exists
      if (!fs.existsSync(absoluteSessionPath)) {
        fs.mkdirSync(absoluteSessionPath, { recursive: true });
        this.logger.log(`📁 Created session directory: ${absoluteSessionPath}`);
      }

      // Use absolute path for LocalAuth
      const finalSessionPath = absoluteSessionPath;

      client = new Client({
        authStrategy: new LocalAuth({
          dataPath: finalSessionPath,
        }),
        puppeteer: {
          headless: true,
          executablePath: executablePath || undefined,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--disable-gpu',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled',
            '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          ],
        },
        webVersionCache: {
          type: 'none',
        },
      });
    } catch (error: any) {
      this.logger.error(`Error creating WhatsApp client for account ${accountId}:`, error);
      await this.updateAccountStatus(accountId, 'inactive', {
        notes: error?.message || error?.toString() || 'Failed to create client',
      });
      throw error;
    }

    // Store QR code for retrieval
    let currentQRCode: string | null = null;

    // Event handlers
    client.on('qr', async (qr) => {
      this.logger.log(`QR Code generated for account ${accountId}`);
      qrcode.generate(qr, { small: true });
      currentQRCode = qr;
      this.currentQRCodes.set(accountId, qr);

      // Store QR code and session path in database
      const sessionPath = this.getSessionPath(accountId);
      await this.updateAccountStatus(accountId, 'warming', {
        sessionStoragePath: sessionPath,
        sessionData: {
          qrCode: qr,
          generatedAt: new Date().toISOString(),
        },
      });
      this.logger.log(`💾 Saved session path to database: ${sessionPath}`);

      // Emit QR code via WebSocket with 20-second expiration
      this.logger.log(`📡 Emitting QR code via WebSocket for account ${accountId}`);
      this.gateway.emitQRCode(accountId, qr, 20);
      this.gateway.emitStatus(accountId, 'qr_pending', { qrCode: qr });
      this.logger.log(`✅ QR code emitted for account ${accountId}`);

      // Set up QR refresh timer (QR codes expire after ~20 seconds)
      this.setupQRRefreshTimer(accountId);
    });

    client.on('ready', async () => {
      this.logger.log(`✅ WhatsApp client ready for account ${accountId}`);

      // Clear QR refresh timer as connection is established
      this.clearQRRefreshTimer(accountId);
      this.currentQRCodes.delete(accountId);

      // Wait a bit for client info to be fully available
      // Sometimes client.info is not immediately available after ready event
      const extractPhoneNumber = async (retries = 3, delay = 2000) => {
        for (let i = 0; i < retries; i++) {
          try {
            if (i > 0) {
              this.logger.log(`Retrying phone number extraction (attempt ${i + 1}/${retries})...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }

            const clientInfo = client.info;
            this.logger.log(`Client info for account ${accountId} (attempt ${i + 1}):`, JSON.stringify({
              hasInfo: !!clientInfo,
              hasWid: !!(clientInfo && clientInfo.wid),
              wid: clientInfo?.wid,
              pushname: clientInfo?.pushname,
            }));

            if (clientInfo && clientInfo.wid && clientInfo.wid.user) {
              const phoneNumber = clientInfo.wid.user;
              const pushName = clientInfo.pushname || null;

              this.logger.log(`📱 Extracted phone number: ${phoneNumber}, pushName: ${pushName}`);

              // Get session path for storage
              const sessionPath = this.getSessionPath(accountId);

              // Read session files and store in database
              const fs = require('fs');
              const path = require('path');
              let sessionData: any = {};

              try {
                // LocalAuth stores session in .wwebjs_auth and .wwebjs_cache directories
                const authPath = path.join(sessionPath, '.wwebjs_auth');
                const cachePath = path.join(sessionPath, '.wwebjs_cache');

                if (fs.existsSync(authPath)) {
                  const authFiles = fs.readdirSync(authPath);
                  sessionData.authFiles = authFiles;
                  this.logger.log(`✅ Found ${authFiles.length} auth files`);
                } else {
                  this.logger.warn(`⚠️  Auth path does not exist: ${authPath}`);
                }

                if (fs.existsSync(cachePath)) {
                  const cacheFiles = fs.readdirSync(cachePath);
                  sessionData.cacheFiles = cacheFiles;
                }

                // Store session metadata
                sessionData.sessionPath = sessionPath;
                sessionData.lastSyncedAt = new Date().toISOString();
              } catch (sessionError) {
                this.logger.warn(`Could not read session files for ${accountId}:`, sessionError);
              }

              await this.updateAccountStatus(accountId, 'active', {
                phoneNumber: phoneNumber,
                pushName: pushName,
                sessionStoragePath: sessionPath,
                sessionData: sessionData,
                lastConnectedAt: new Date().toISOString(),
              });

              this.logger.log(`✅✅✅ Account ${accountId} UPDATED: phone=${phoneNumber}, status=active`);

              // Emit status updates via WebSocket
              this.gateway.emitStatus(accountId, 'active', {
                phoneNumber,
                pushName,
              });
              this.gateway.emitPhoneNumber(accountId, phoneNumber, pushName || undefined);
              this.gateway.emitConnectionState(accountId, 'connected', {
                phoneNumber,
                pushName,
              });

              return; // Success, exit retry loop
            } else {
              this.logger.warn(`Client info incomplete (attempt ${i + 1}/${retries}):`, {
                hasInfo: !!clientInfo,
                hasWid: !!(clientInfo && clientInfo.wid),
                hasUser: !!(clientInfo?.wid?.user),
              });
            }
          } catch (error) {
            this.logger.error(`Error extracting phone number (attempt ${i + 1}):`, error);
            if (i === retries - 1) {
              // Last attempt failed
              throw error;
            }
          }
        }

        // All retries failed
        this.logger.warn(`⚠️  Could not extract phone number after ${retries} attempts`);
        // Still mark as active
        await this.updateAccountStatus(accountId, 'active', {
          lastConnectedAt: new Date().toISOString(),
        });
        this.gateway.emitStatus(accountId, 'active');
      };

      // Start extraction with retries
      extractPhoneNumber().catch((error) => {
        this.logger.error(`❌ Failed to extract phone number for account ${accountId}:`, error);
        this.logger.error(`Error stack:`, (error as Error).stack);
      });
    });

    client.on('authenticated', async () => {
      this.logger.log(`✅ Account ${accountId} authenticated - waiting for ready event...`);

      // Update database status
      await this.updateAccountStatus(accountId, 'authenticating', {
        lastConnectedAt: new Date().toISOString(),
      });

      // Save session immediately after authentication
      const sessionPath = this.getSessionPath(accountId);
      const fs = require('fs');
      const path = require('path');

      try {
        // Check if auth files exist
        const authPath = path.join(sessionPath, '.wwebjs_auth');
        if (fs.existsSync(authPath)) {
          const authFiles = fs.readdirSync(authPath);
          this.logger.log(`✅ Auth files created after authentication: ${authFiles.length} files`);

          // Save session path to database
          await this.updateAccountStatus(accountId, 'authenticating', {
            sessionStoragePath: sessionPath,
            sessionData: {
              authFiles: authFiles,
              authenticatedAt: new Date().toISOString(),
            },
          });
        } else {
          this.logger.warn(`⚠️  Auth path does not exist yet: ${authPath}`);
        }
      } catch (error) {
        this.logger.error(`Error saving session after authentication:`, error);
      }

      this.gateway.emitConnectionState(accountId, 'authenticated');
      this.gateway.emitStatus(accountId, 'authenticating');

      // Set up periodic checks for phone number extraction (every 2 seconds for 30 seconds)
      // This handles cases where ready event doesn't fire but client is actually ready
      let checkCount = 0;
      const maxChecks = 30; // 30 checks * 2 seconds = 60 seconds

      const checkInterval = setInterval(async () => {
        checkCount++;
        this.logger.log(`🔍 Checking client state for account ${accountId} (check ${checkCount}/${maxChecks})...`);

        try {
          // Check if account is still authenticating
          const account = await this.db
            .select()
            .from(mktWapAccounts)
            .where(eq(mktWapAccounts.id, accountId))
            .limit(1);

          if (account.length === 0) {
            clearInterval(checkInterval);
            return;
          }

          // If status changed to active, stop checking
          if (account[0].status === 'active' && account[0].phoneNumber) {
            this.logger.log(`✅ Account ${accountId} already active with phone ${account[0].phoneNumber}, stopping checks`);
            clearInterval(checkInterval);
            return;
          }

          // Try to get client state
          try {
            const clientState = await client.getState();
            this.logger.log(`📱 Client state for account ${accountId}: ${clientState}`);

            // If client is CONNECTED, try to extract phone
            if (clientState === 'CONNECTED') {
              this.logger.log(`✅ Client is CONNECTED, attempting phone extraction...`);

              const clientInfo = client.info;
              if (clientInfo && clientInfo.wid && clientInfo.wid.user) {
                const phoneNumber = clientInfo.wid.user;
                const pushName = clientInfo.pushname || null;

                this.logger.log(`📱 Extracted phone: ${phoneNumber}, pushName: ${pushName}`);

                await this.updateAccountStatus(accountId, 'active', {
                  phoneNumber: phoneNumber,
                  pushName: pushName,
                  lastConnectedAt: new Date().toISOString(),
                });

                this.gateway.emitStatus(accountId, 'active', { phoneNumber, pushName });
                this.gateway.emitPhoneNumber(accountId, phoneNumber, pushName || undefined);
                this.gateway.emitConnectionState(accountId, 'connected', { phoneNumber, pushName });
                this.logger.log(`✅✅✅ Account ${accountId} UPDATED via periodic check: phone=${phoneNumber}, status=active`);

                clearInterval(checkInterval);
                return;
              } else {
                this.logger.warn(`⚠️  Client is CONNECTED but client.info is not ready yet (check ${checkCount})`);
              }
            } else if (clientState === 'OPENING') {
              this.logger.log(`⏳ Client is still OPENING (check ${checkCount})`);
            } else {
              this.logger.warn(`⚠️  Client state is ${clientState} (check ${checkCount})`);
            }
          } catch (stateError) {
            this.logger.warn(`Could not get client state (check ${checkCount}):`, stateError);
          }

          // Stop after max checks
          if (checkCount >= maxChecks) {
            this.logger.warn(`⚠️  Account ${accountId} still in "authenticating" after ${maxChecks * 2}s - ready event may not fire`);
            clearInterval(checkInterval);

            // Final attempt to extract phone
            try {
              const clientInfo = client.info;
              if (clientInfo && clientInfo.wid && clientInfo.wid.user) {
                const phoneNumber = clientInfo.wid.user;
                const pushName = clientInfo.pushname || null;

                await this.updateAccountStatus(accountId, 'active', {
                  phoneNumber: phoneNumber,
                  pushName: pushName,
                  lastConnectedAt: new Date().toISOString(),
                });

                this.gateway.emitStatus(accountId, 'active', { phoneNumber, pushName });
                this.gateway.emitPhoneNumber(accountId, phoneNumber, pushName || undefined);
                this.logger.log(`✅✅✅ Account ${accountId} FINALLY updated: phone=${phoneNumber}`);
              } else {
                this.logger.error(`❌ Could not extract phone after ${maxChecks * 2}s - client.info not available`);
              }
            } catch (error) {
              this.logger.error(`Error in final phone extraction attempt:`, error);
            }
          }
        } catch (error) {
          this.logger.error(`Error in periodic check (check ${checkCount}):`, error);
          if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
          }
        }
      }, 2000); // Check every 2 seconds
    });

    client.on('auth_failure', async (msg) => {
      this.logger.error(`Authentication failure for account ${accountId}:`, msg);
      await this.updateAccountStatus(accountId, 'inactive', {
        error: msg,
      });
      this.gateway.emitError(accountId, 'Authentication failed', { message: msg });
      this.gateway.emitStatus(accountId, 'error', { error: msg });
      this.clearQRRefreshTimer(accountId);
    });

    client.on('disconnected', async (reason) => {
      this.logger.warn(`Account ${accountId} disconnected:`, reason);
      await this.updateAccountStatus(accountId, 'inactive', {
        lastDisconnectedAt: new Date().toISOString(),
        disconnectReason: reason,
      });
      this.gateway.emitConnectionState(accountId, 'disconnected', { reason });
      this.gateway.emitStatus(accountId, 'disconnected', { reason });
      this.clearQRRefreshTimer(accountId);
      this.currentQRCodes.delete(accountId);
      this.clients.delete(accountId);
    });

    // Add loading event handler (fires before ready)
    client.on('loading_screen', (percent, message) => {
      this.logger.log(`📱 Account ${accountId} loading: ${percent}% - ${message}`);
      this.gateway.emitStatus(accountId, 'loading', { percent, message });
    });

    // Handle page errors that might cause session closure
    client.on('change_state', (state) => {
      this.logger.log(`📱 Account ${accountId} state changed to: ${state}`);
      if (state === 'CONFLICT' || state === 'UNPAIRED') {
        this.logger.warn(`⚠️  Account ${accountId} in ${state} state - may need re-authentication`);
      }
    });

    client.on('message', async (msg: Message) => {
      // Handle incoming messages (can be extended for auto-reply, etc.)
      this.logger.debug(`Message received on account ${accountId}:`, msg.from);
    });

    this.clients.set(accountId, client);

    try {
      this.gateway.emitConnectionState(accountId, 'initializing');
      this.gateway.emitStatus(accountId, 'initializing');
      await client.initialize();
    } catch (error: any) {
      this.logger.error(`Error initializing account ${accountId}:`, error);
      this.clients.delete(accountId);
      this.clearQRRefreshTimer(accountId);
      await this.updateAccountStatus(accountId, 'inactive', {
        notes: error?.message || error?.toString() || 'Initialization failed',
      });
      this.gateway.emitError(accountId, 'Initialization failed', {
        message: error?.message || error?.toString(),
      });
      this.gateway.emitStatus(accountId, 'error', { error: error?.message });
      throw error; // Re-throw so caller knows initialization failed
    }
  }

  async disconnectAccount(accountId: string): Promise<void> {
    const client = this.clients.get(accountId);
    if (client) {
      try {
        await client.logout();
        await client.destroy();
        this.clients.delete(accountId);
        await this.updateAccountStatus(accountId, 'inactive');
        this.logger.log(`Account ${accountId} disconnected`);
      } catch (error) {
        this.logger.error(`Error disconnecting account ${accountId}:`, error);
        throw error;
      }
    }
  }

  getClient(accountId: string): Client | null {
    return this.clients.get(accountId) || null;
  }

  async getAccountStatus(accountId: string): Promise<any> {
    try {
      // Explicitly select only the columns that exist in the schema
      const account = await this.db
        .select({
          id: mktWapAccounts.id,
          phoneNumber: mktWapAccounts.phoneNumber,
          accountName: mktWapAccounts.accountName,
          pushName: mktWapAccounts.pushName,
          status: mktWapAccounts.status,
          healthScore: mktWapAccounts.healthScore,
          dailyUsageCount: mktWapAccounts.dailyUsageCount,
          dailyUsageLimit: mktWapAccounts.dailyUsageLimit,
          sessionData: mktWapAccounts.sessionData,
          sessionStoragePath: mktWapAccounts.sessionStoragePath,
          lastConnectedAt: mktWapAccounts.lastConnectedAt,
          lastDisconnectedAt: mktWapAccounts.lastDisconnectedAt,
          isRateLimited: mktWapAccounts.isRateLimited,
          rateLimitUntil: mktWapAccounts.rateLimitUntil,
          rateLimitConfig: mktWapAccounts.rateLimitConfig,
          notes: mktWapAccounts.notes,
          createdAt: mktWapAccounts.createdAt,
          updatedAt: mktWapAccounts.updatedAt,
        })
        .from(mktWapAccounts)
        .where(eq(mktWapAccounts.id, accountId))
        .limit(1);

      if (account.length === 0) {
        return null;
      }

      const client = this.clients.get(accountId);
      let isConnected = false;
      if (client) {
        try {
          const state = await client.getState();
          isConnected = state === 'CONNECTED';
        } catch (error) {
          // Client might be in a bad state, just mark as not connected
          isConnected = false;
          this.logger.warn(`Could not get client state for account ${accountId}:`, error);
        }
      }

      // Extract QR code from session data if available
      const qrCode = account[0].sessionData?.qrCode || null;

      return {
        ...account[0],
        isConnected,
        hasClient: !!client,
        qrCode,
      };
    } catch (error: any) {
      this.logger.error(`Error in getAccountStatus for account ${accountId}:`, error);
      // Return a safe default instead of throwing
      return {
        id: accountId,
        status: 'inactive',
        isConnected: false,
        hasClient: false,
        qrCode: null,
        error: error?.message || 'Unknown error',
      };
    }
  }

  private setupQRRefreshTimer(accountId: string) {
    // Clear existing timer if any
    this.clearQRRefreshTimer(accountId);

    // Set timer to notify frontend that QR is expiring (after 18 seconds)
    // The whatsapp-web.js library will automatically emit a new QR code
    const timer = setTimeout(() => {
      this.logger.log(`QR code expiring soon for account ${accountId}`);
      this.gateway.emitStatus(accountId, 'qr_expiring', {
        message: 'QR code will refresh soon'
      });
      this.qrRefreshTimers.delete(accountId);
    }, 18000) as unknown as NodeJS.Timeout; // 18 seconds (2 seconds before 20-second expiration)

    this.qrRefreshTimers.set(accountId, timer);
  }

  private clearQRRefreshTimer(accountId: string) {
    const timer = this.qrRefreshTimers.get(accountId);
    if (timer) {
      clearTimeout(timer);
      this.qrRefreshTimers.delete(accountId);
    }
  }

  getCurrentQRCode(accountId: string): string | null {
    return this.currentQRCodes.get(accountId) || null;
  }

  private async updateAccountStatus(
    accountId: string,
    status: string,
    updates: any = {},
  ): Promise<void> {
    try {
      // Filter out any invalid fields that don't exist in the schema
      const validUpdates: any = {
        status: status as any,
        updatedAt: new Date(),
      };

      // Only include valid fields from updates
      const allowedFields = [
        'phoneNumber', 'pushName', 'healthScore', 'dailyUsageCount', 'dailyUsageLimit',
        'sessionData', 'sessionStoragePath', 'lastConnectedAt', 'lastDisconnectedAt',
        'isRateLimited', 'rateLimitUntil', 'rateLimitConfig', 'notes'
      ];

      for (const key of allowedFields) {
        if (key in updates) {
          validUpdates[key] = updates[key];
        }
      }

      await this.db
        .update(mktWapAccounts)
        .set(validUpdates)
        .where(eq(mktWapAccounts.id, accountId));
    } catch (error) {
      this.logger.error(`Error updating account status for ${accountId}:`, error);
      // Don't throw - log and continue
    }
  }

  private getSessionPath(accountId: string): string {
    const basePath = this.configService.get('WHATSAPP_SESSION_PATH') || './whatsapp-sessions';
    return `${basePath}/${accountId}`;
  }

  async updateHealthScore(accountId: string, score: number): Promise<void> {
    const current = await this.db
      .select()
      .from(mktWapAccounts)
      .where(eq(mktWapAccounts.id, accountId))
      .limit(1);

    if (current.length > 0) {
      await this.db
        .update(mktWapAccounts)
        .set({
          healthScore: score,
          updatedAt: new Date(),
        })
        .where(eq(mktWapAccounts.id, accountId));
    }
  }

  async incrementDailyUsage(accountId: string): Promise<void> {
    const current = await this.db
      .select()
      .from(mktWapAccounts)
      .where(eq(mktWapAccounts.id, accountId))
      .limit(1);

    if (current.length > 0) {
      await this.db
        .update(mktWapAccounts)
        .set({
          dailyUsageCount: (current[0].dailyUsageCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(mktWapAccounts.id, accountId));
    }
  }
}

