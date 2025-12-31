import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject, forwardRef } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq, and, isNull } from 'drizzle-orm';
import { mktWapAccounts } from '../../database/schema/whatsapp';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { WhatsAppLoggerService } from './whatsapp-logger.service';

@Injectable()
export class WhatsAppHealthCheckService {
  private readonly logger = new Logger(WhatsAppHealthCheckService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    @Inject(forwardRef(() => WhatsAppAccountService))
    private readonly accountService: WhatsAppAccountService,
    private readonly whatsappLogger: WhatsAppLoggerService,
  ) {}

  /**
   * Run every 2 minutes to check connected accounts without phone numbers
   * Attempts to extract phone numbers for accounts that are connected but don't have phone number
   */
  @Cron('*/2 * * * *') // Every 2 minutes (more frequent)
  async checkAccountsWithoutPhoneNumbers() {
    this.logger.log('🔍 Running health check for accounts without phone numbers...');
    this.whatsappLogger.log('🔍 Running health check for accounts without phone numbers...');
    
    try {
      // Find accounts that are connected but don't have phone numbers
      // Check both 'active' and 'warming'/'authenticating' status accounts
      const accounts = await this.db
        .select()
        .from(mktWapAccounts)
        .where(
          and(
            // Status can be active, warming, or authenticating
            // We'll check client connection status separately
            isNull(mktWapAccounts.phoneNumber)
          )
        );
      
      if (accounts.length === 0) {
        this.logger.log('✅ No accounts found without phone numbers');
        this.whatsappLogger.log('✅ No accounts found without phone numbers');
        return;
      }
      
      this.logger.log(`⚠️ Found ${accounts.length} active account(s) without phone numbers`);
      this.whatsappLogger.log(`⚠️ Found ${accounts.length} active account(s) without phone numbers`);
      
      for (const account of accounts) {
        try {
          this.logger.log(`🔧 Attempting to extract phone number for account ${account.id} (${account.accountName})...`);
          this.whatsappLogger.log(`🔧 Attempting to extract phone number for account ${account.id} (${account.accountName})...`, account.id);
          
          const client = this.accountService.getClient(account.id);
          if (!client) {
            // Skip accounts without clients - they need to be initialized first
            continue;
          }
          
          try {
            const state = await client.getState();
            this.logger.debug(`Account ${account.id} (${account.accountName}) state: ${state}`);
            
            if (state === 'CONNECTED') {
              // Try to extract phone number with more retries
              this.logger.log(`🔧 Attempting phone extraction for connected account ${account.id} (${account.accountName})...`);
              const phoneNumber = await this.accountService.extractPhoneNumberWithRetry(client, account.id, 10);
              if (phoneNumber) {
                this.logger.log(`✅ Successfully extracted phone number for account ${account.id}: ${phoneNumber}`);
                this.whatsappLogger.log(`✅ Successfully extracted phone number for account ${account.id}: ${phoneNumber}`, account.id);
              } else {
                this.logger.warn(`⚠️ Could not extract phone number for account ${account.id} (${account.accountName}) - client.info may not be populated yet`);
                this.whatsappLogger.warn(`⚠️ Could not extract phone number for account ${account.id} - will retry in next health check`, account.id);
                
                // Log detailed info for debugging
                try {
                  const clientInfo = client.info;
                  this.logger.debug(`Client info for ${account.id}:`, {
                    hasInfo: !!clientInfo,
                    hasWid: !!(clientInfo?.wid),
                    hasUser: !!(clientInfo?.wid?.user),
                    infoKeys: clientInfo ? Object.keys(clientInfo) : [],
                  });
                } catch (infoError) {
                  this.logger.debug(`Could not access client.info:`, infoError);
                }
              }
            } else if (state === 'OPENING') {
              this.logger.debug(`Account ${account.id} is still opening - will check again next cycle`);
            } else {
              this.logger.debug(`Account ${account.id} state is ${state} - not connected yet`);
            }
          } catch (error) {
            this.logger.error(`Error checking client state for account ${account.id}:`, error);
            this.whatsappLogger.error(`Error checking client state for account ${account.id}`, error, account.id);
          }
        } catch (error) {
          this.logger.error(`Error processing account ${account.id} in health check:`, error);
          this.whatsappLogger.error(`Error processing account ${account.id} in health check`, error, account.id);
        }
      }
      
      this.logger.log('✅ Health check completed');
      this.whatsappLogger.log('✅ Health check completed');
    } catch (error) {
      this.logger.error('❌ Error in health check:', error);
      this.whatsappLogger.error('❌ Error in health check', error);
    }
  }
}

