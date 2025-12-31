# WhatsApp Integration - Production-Grade Fix Implementation Guide

**Date:** December 2025  
**Purpose:** Step-by-step guide to fix all identified issues and achieve production-grade system  
**Estimated Timeline:** 3-4 weeks

---

## 📋 Overview

This guide provides detailed, actionable steps to fix all critical issues in the WhatsApp integration system. Each fix is broken down into specific implementation tasks with code examples, testing requirements, and acceptance criteria.

---

## 🎯 Implementation Phases

### **Phase 1: Critical Fixes (Week 1)**
Fix the most critical issues that prevent basic functionality.

### **Phase 2: Integration Improvements (Week 2)**
Complete integrations and improve user experience.

### **Phase 3: Production Readiness (Week 3-4)**
Add testing, monitoring, and documentation.

---

## 🔴 Phase 1: Critical Fixes

### **Fix #1: Phone Number Extraction**

#### **Problem Statement**
After QR scan and authentication, `phone_number` remains NULL in database. The `ready` event often doesn't fire, and fallback polling is unreliable.

#### **Solution Approach**
1. Implement aggressive polling after authentication
2. Add background health check job
3. Improve error messages
4. Add manual recovery option

---

#### **Step 1.1: Add Aggressive Polling Mechanism**

**File:** `apps/api/src/modules/whatsapp/whatsapp-account.service.ts`

**Implementation:**

```typescript
/**
 * Poll for phone number extraction after authentication
 * Checks client state every 1 second for up to 60 seconds
 */
private async pollForPhoneNumber(accountId: string, client: Client): Promise<void> {
  const maxAttempts = 60; // 60 seconds
  let attempts = 0;
  
  const pollInterval = setInterval(async () => {
    attempts++;
    
    try {
      // Check if already extracted
      const account = await this.db
        .select({ phoneNumber: mktWapAccounts.phoneNumber })
        .from(mktWapAccounts)
        .where(eq(mktWapAccounts.id, accountId))
        .limit(1);
      
      if (account[0]?.phoneNumber) {
        this.logger.log(`✅ Phone number already extracted for account ${accountId}`);
        clearInterval(pollInterval);
        return;
      }
      
      // Check client state
      const state = await client.getState();
      this.logger.log(`🔍 Polling attempt ${attempts}/${maxAttempts} - State: ${state}`);
      
      if (state === 'CONNECTED') {
        // Try to extract phone number
        const phoneNumber = await this.extractPhoneNumberWithRetry(client, accountId);
        if (phoneNumber) {
          clearInterval(pollInterval);
          return;
        }
      }
      
      // Stop after max attempts
      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        this.logger.warn(`⚠️ Phone number extraction timeout for account ${accountId}`);
        await this.updateAccountStatus(accountId, 'inactive', {
          notes: 'Phone number extraction timeout - please use manual update',
        });
      }
    } catch (error) {
      this.logger.error(`Error in phone number polling:`, error);
    }
  }, 1000); // Check every 1 second
}
```

**Update `authenticated` event handler:**

```typescript
// Authenticated event
client.on('authenticated', async () => {
  this.logger.log(`✅ Account ${accountId} authenticated`);
  await this.updateAccountStatus(accountId, 'authenticating', {
    lastConnectedAt: new Date(),
  });
  this.gateway.emitConnectionState(accountId, 'authenticated');
  this.gateway.emitStatus(accountId, 'authenticating');
  
  // Start aggressive polling for phone number
  this.pollForPhoneNumber(accountId, client).catch(err => {
    this.logger.error(`Error in phone number polling:`, err);
  });
});
```

**Testing:**
- ✅ Test with successful QR scan
- ✅ Test with delayed phone number availability
- ✅ Test timeout scenario (60 seconds)

---

#### **Step 1.2: Improve Phone Extraction with Retry Logic**

**File:** `apps/api/src/modules/whatsapp/whatsapp-account.service.ts`

**Implementation:**

```typescript
/**
 * Extract phone number with exponential backoff retry
 */
private async extractPhoneNumberWithRetry(
  client: Client,
  accountId: string,
  maxRetries: number = 5
): Promise<string | null> {
  const delays = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Wait before retry (except first attempt)
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt - 1]));
      }
      
      const clientInfo = client.info;
      if (clientInfo?.wid?.user) {
        const phoneNumber = clientInfo.wid.user;
        const pushName = clientInfo.pushname || null;
        
        this.logger.log(`✅ Phone number extracted (attempt ${attempt + 1}): ${phoneNumber}`);
        
        // Update database
        await this.updateAccountStatus(accountId, 'active', {
          phoneNumber: phoneNumber,
          pushName: pushName,
          lastConnectedAt: new Date(),
        });
        
        // Emit via WebSocket
        this.gateway.emitStatus(accountId, 'active', { phoneNumber, pushName });
        this.gateway.emitPhoneNumber(accountId, phoneNumber, pushName);
        this.gateway.emitConnectionState(accountId, 'connected', { phoneNumber, pushName });
        
        return phoneNumber;
      } else {
        this.logger.log(`⏳ Client info not yet available (attempt ${attempt + 1}/${maxRetries})`);
      }
    } catch (error) {
      this.logger.warn(`Error extracting phone number (attempt ${attempt + 1}):`, error);
    }
  }
  
  return null;
}
```

**Testing:**
- ✅ Test with immediate phone availability
- ✅ Test with delayed availability (2-3 seconds)
- ✅ Test with maximum retries exhausted

---

#### **Step 1.3: Create Background Health Check Job**

**File:** `apps/api/src/modules/whatsapp/whatsapp-health-check.service.ts` (NEW)

**Implementation:**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../../database/database.module';
import { eq, and } from 'drizzle-orm';
import { mktWapAccounts } from '../../database/schema/whatsapp';
import { WhatsAppAccountService } from './whatsapp-account.service';

@Injectable()
export class WhatsAppHealthCheckService {
  private readonly logger = new Logger(WhatsAppHealthCheckService.name);

  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly accountService: WhatsAppAccountService,
  ) {}

  /**
   * Run every 5 minutes to check accounts without phone numbers
   */
  @Cron('*/5 * * * *') // Every 5 minutes
  async checkAccountsWithoutPhoneNumbers() {
    this.logger.log('🔍 Running health check for accounts without phone numbers...');
    
    try {
      // Find active accounts without phone numbers
      const accounts = await this.db
        .select()
        .from(mktWapAccounts)
        .where(
          and(
            eq(mktWapAccounts.status, 'active'),
            eq(mktWapAccounts.phoneNumber, null)
          )
        );
      
      for (const account of accounts) {
        this.logger.log(`⚠️ Account ${account.id} is active but has no phone number - attempting extraction...`);
        
        const client = this.accountService.getClient(account.id);
        if (client) {
          try {
            const state = await client.getState();
            if (state === 'CONNECTED') {
              // Try to extract phone number
              const phoneNumber = await this.accountService.extractPhoneNumberWithRetry(client, account.id);
              if (phoneNumber) {
                this.logger.log(`✅ Successfully extracted phone number for account ${account.id}`);
              }
            }
          } catch (error) {
            this.logger.error(`Error checking account ${account.id}:`, error);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error in health check:', error);
    }
  }
}
```

**Register in module:**

```typescript
// whatsapp.module.ts
import { ScheduleModule } from '@nestjs/schedule';
import { WhatsAppHealthCheckService } from './whatsapp-health-check.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    // ... existing providers
    WhatsAppHealthCheckService,
  ],
})
export class WhatsAppModule {}
```

**Testing:**
- ✅ Verify job runs every 5 minutes
- ✅ Test with account without phone number
- ✅ Verify phone extraction works

---

#### **Step 1.4: Improve Error Messages**

**File:** `apps/api/src/modules/whatsapp/whatsapp-account.service.ts`

**Implementation:**

```typescript
// Add error message constants
const ERROR_MESSAGES = {
  PHONE_EXTRACTION_TIMEOUT: 'Phone number could not be extracted automatically. Please use the "Update Phone" button to manually update your phone number.',
  PHONE_EXTRACTION_FAILED: 'Unable to extract phone number. The account may need to be re-initialized.',
  CLIENT_NOT_READY: 'WhatsApp client is not ready yet. Please wait a few moments and try again.',
};

// Update error handling
if (attempts >= maxAttempts) {
  clearInterval(pollInterval);
  this.logger.warn(`⚠️ Phone number extraction timeout for account ${accountId}`);
  await this.updateAccountStatus(accountId, 'inactive', {
    notes: ERROR_MESSAGES.PHONE_EXTRACTION_TIMEOUT,
  });
  this.gateway.emitError(accountId, 'Phone Extraction Timeout', {
    message: ERROR_MESSAGES.PHONE_EXTRACTION_TIMEOUT,
    action: 'update_phone',
  });
}
```

**Testing:**
- ✅ Verify error messages are user-friendly
- ✅ Test error display in UI
- ✅ Verify action suggestions work

---

### **Fix #2: Status Stuck States**

#### **Problem Statement**
Accounts get stuck in `warming` or `authenticating` status after QR scan, with no automatic recovery.

#### **Solution Approach**
1. Add timeout mechanism
2. Add reset functionality
3. Improve status messages
4. Add automatic retry

---

#### **Step 2.1: Add Timeout Mechanism**

**File:** `apps/api/src/modules/whatsapp/whatsapp-account.service.ts`

**Implementation:**

```typescript
private stuckAccountTimeouts: Map<string, NodeJS.Timeout> = new Map();

/**
 * Set timeout for account activation
 * If account doesn't become active within 5 minutes, reset to inactive
 */
private setActivationTimeout(accountId: string): void {
  // Clear existing timeout if any
  const existingTimeout = this.stuckAccountTimeouts.get(accountId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }
  
  // Set new timeout (5 minutes)
  const timeout = setTimeout(async () => {
    try {
      const account = await this.db
        .select({ status: mktWapAccounts.status })
        .from(mktWapAccounts)
        .where(eq(mktWapAccounts.id, accountId))
        .limit(1);
      
      if (account[0] && (account[0].status === 'warming' || account[0].status === 'authenticating')) {
        this.logger.warn(`⏰ Account ${accountId} stuck in ${account[0].status} - resetting to inactive`);
        
        await this.updateAccountStatus(accountId, 'inactive', {
          notes: 'Account activation timeout - please try initializing again',
        });
        
        this.gateway.emitError(accountId, 'Activation Timeout', {
          message: 'Account activation took too long. Please try initializing again.',
          action: 'retry_initialize',
        });
        
        // Disconnect client if exists
        const client = this.clients.get(accountId);
        if (client) {
          try {
            await client.destroy();
          } catch (error) {
            this.logger.error(`Error destroying client:`, error);
          }
          this.clients.delete(accountId);
        }
      }
      
      this.stuckAccountTimeouts.delete(accountId);
    } catch (error) {
      this.logger.error(`Error in activation timeout handler:`, error);
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  this.stuckAccountTimeouts.set(accountId, timeout);
}

// Call this when QR is generated
client.on('qr', (qr) => {
  // ... existing code ...
  this.setActivationTimeout(accountId); // Start timeout
});

// Clear timeout when account becomes active
client.on('ready', async () => {
  // ... existing code ...
  const existingTimeout = this.stuckAccountTimeouts.get(accountId);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
    this.stuckAccountTimeouts.delete(accountId);
  }
});
```

**Testing:**
- ✅ Test timeout after 5 minutes
- ✅ Test timeout cancellation when account activates
- ✅ Verify status reset to inactive

---

#### **Step 2.2: Add Reset Account API Endpoint**

**File:** `apps/api/src/modules/whatsapp/whatsapp.controller.ts`

**Implementation:**

```typescript
@Post('accounts/:id/reset')
async resetAccount(@Param('id') id: string) {
  try {
    const account = await this.db
      .select()
      .from(mktWapAccounts)
      .where(eq(mktWapAccounts.id, id))
      .limit(1);

    if (account.length === 0) {
      throw new NotFoundException('Account not found');
    }

    // Disconnect existing client
    const client = this.accountService.getClient(id);
    if (client) {
      try {
        await client.destroy();
      } catch (error) {
        this.logger.warn(`Error destroying client during reset:`, error);
      }
    }

    // Update status to inactive
    await this.db
      .update(mktWapAccounts)
      .set({
        status: 'inactive',
        phoneNumber: null,
        pushName: null,
        lastDisconnectedAt: new Date(),
        notes: 'Account reset by user',
        updatedAt: new Date(),
      })
      .where(eq(mktWapAccounts.id, id));

    return {
      success: true,
      message: 'Account reset successfully. You can now initialize it again.',
    };
  } catch (error: any) {
    this.logger.error(`Error resetting account ${id}:`, error);
    throw new BadRequestException(error.message || 'Failed to reset account');
  }
}
```

**Testing:**
- ✅ Test reset endpoint
- ✅ Verify client is destroyed
- ✅ Verify status updated to inactive
- ✅ Test reset with active account

---

#### **Step 2.3: Add Reset Button in Admin UI**

**File:** `apps/admin/src/app/(dashboard)/marketing/whatsapp/accounts/[id]/page.tsx`

**Implementation:**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { resetWhatsAppAccount } from '@/lib/api/whatsapp';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function ResetAccountButton({ accountId, accountStatus }: { accountId: string; accountStatus: string }) {
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetWhatsAppAccount(accountId);
      router.refresh();
      // Show success toast
    } catch (error) {
      // Show error toast
    } finally {
      setIsResetting(false);
    }
  };

  // Only show reset button if account is stuck
  if (accountStatus !== 'warming' && accountStatus !== 'authenticating') {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isResetting}>
          {isResetting ? 'Resetting...' : 'Reset Account'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset WhatsApp Account?</AlertDialogTitle>
          <AlertDialogDescription>
            This will disconnect the account and reset it to inactive status. You will need to scan the QR code again to reconnect.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} disabled={isResetting}>
            Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**Add to API client:**

```typescript
// apps/admin/src/lib/api/whatsapp.ts
export async function resetWhatsAppAccount(accountId: string): Promise<void> {
  return apiClient.post(`/whatsapp/accounts/${accountId}/reset`);
}
```

**Testing:**
- ✅ Test reset button appears for stuck accounts
- ✅ Test reset confirmation dialog
- ✅ Verify account resets after confirmation

---

#### **Step 2.4: Improve Status Messages**

**File:** `apps/admin/src/app/(dashboard)/marketing/whatsapp/accounts/[id]/page.tsx`

**Implementation:**

```tsx
const STATUS_MESSAGES = {
  inactive: {
    title: 'Account Inactive',
    description: 'Account is not connected. Click "Initialize" to connect your WhatsApp account.',
    color: 'text-gray-600',
  },
  warming: {
    title: 'Connecting...',
    description: 'Please scan the QR code with your WhatsApp mobile app. This usually takes 10-30 seconds.',
    color: 'text-yellow-600',
  },
  authenticating: {
    title: 'Authenticating...',
    description: 'Your QR code has been scanned. We are verifying your account. This usually takes 5-15 seconds.',
    color: 'text-blue-600',
  },
  active: {
    title: 'Account Active',
    description: 'Your WhatsApp account is connected and ready to send messages.',
    color: 'text-green-600',
  },
  banned: {
    title: 'Account Banned',
    description: 'This account has been banned by WhatsApp. Please contact support.',
    color: 'text-red-600',
  },
};

// Use in component
const statusInfo = STATUS_MESSAGES[account.status] || STATUS_MESSAGES.inactive;
```

**Testing:**
- ✅ Verify status messages are clear
- ✅ Test all status states
- ✅ Verify color coding

---

### **Fix #3: Session Persistence**

#### **Problem Statement**
Session files are created but not loaded on server restart. Users must re-scan QR codes frequently.

#### **Solution Approach**
1. Implement session loading on startup
2. Add session validation
3. Handle expired sessions
4. Add session backup

---

#### **Step 3.1: Implement loadActiveAccounts()**

**File:** `apps/api/src/modules/whatsapp/whatsapp-account.service.ts`

**Implementation:**

```typescript
async onModuleInit() {
  this.logger.log('WhatsApp Account Service initialized');
  // Load active accounts on startup
  await this.loadActiveAccounts();
}

/**
 * Load all active accounts and restore their sessions
 */
private async loadActiveAccounts(): Promise<void> {
  try {
    this.logger.log('🔄 Loading active accounts from database...');
    
    const accounts = await this.db
      .select()
      .from(mktWapAccounts)
      .where(eq(mktWapAccounts.status, 'active'));
    
    this.logger.log(`Found ${accounts.length} active accounts to load`);
    
    for (const account of accounts) {
      try {
        // Check if session files exist
        const sessionPath = this.getSessionPath(account.id);
        const absoluteSessionPath = path.isAbsolute(sessionPath)
          ? sessionPath
          : path.resolve(process.cwd(), sessionPath);
        
        if (!fs.existsSync(absoluteSessionPath)) {
          this.logger.warn(`Session path does not exist for account ${account.id}: ${absoluteSessionPath}`);
          // Update status to inactive
          await this.updateAccountStatus(account.id, 'inactive', {
            notes: 'Session files not found on server restart',
          });
          continue;
        }
        
        // Check if session is expired (14+ days old)
        if (account.lastConnectedAt) {
          const daysSinceConnection = (Date.now() - new Date(account.lastConnectedAt).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceConnection > 14) {
            this.logger.warn(`Session expired for account ${account.id} (${daysSinceConnection.toFixed(1)} days old)`);
            await this.updateAccountStatus(account.id, 'inactive', {
              notes: `Session expired (${daysSinceConnection.toFixed(1)} days old) - please re-initialize`,
            });
            continue;
          }
        }
        
        // Load session
        this.logger.log(`Loading session for account ${account.id}...`);
        await this.initializeAccount(account.id);
        
        // Wait a bit for connection to establish
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Verify connection
        const client = this.clients.get(account.id);
        if (client) {
          const state = await client.getState();
          if (state === 'CONNECTED') {
            this.logger.log(`✅ Successfully restored session for account ${account.id}`);
          } else {
            this.logger.warn(`⚠️ Account ${account.id} loaded but state is ${state}`);
          }
        }
      } catch (error) {
        this.logger.error(`Error loading account ${account.id}:`, error);
        // Update status to inactive on error
        await this.updateAccountStatus(account.id, 'inactive', {
          notes: `Error loading session: ${error.message}`,
        });
      }
    }
    
    this.logger.log('✅ Finished loading active accounts');
  } catch (error) {
    this.logger.error('Error in loadActiveAccounts:', error);
  }
}
```

**Testing:**
- ✅ Test with active accounts on restart
- ✅ Test with missing session files
- ✅ Test with expired sessions
- ✅ Verify accounts reconnect automatically

---

#### **Step 3.2: Add Session Validation**

**File:** `apps/api/src/modules/whatsapp/whatsapp-account.service.ts`

**Implementation:**

```typescript
/**
 * Validate session files exist and are not corrupted
 */
private async validateSession(accountId: string): Promise<boolean> {
  try {
    const sessionPath = this.getSessionPath(accountId);
    const absoluteSessionPath = path.isAbsolute(sessionPath)
      ? sessionPath
      : path.resolve(process.cwd(), sessionPath);
    
    if (!fs.existsSync(absoluteSessionPath)) {
      return false;
    }
    
    // Check for required session files
    const requiredFiles = ['session.data', 'Local Storage'];
    for (const file of requiredFiles) {
      const filePath = path.join(absoluteSessionPath, file);
      if (!fs.existsSync(filePath)) {
        this.logger.warn(`Required session file missing: ${filePath}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    this.logger.error(`Error validating session for account ${accountId}:`, error);
    return false;
  }
}

// Use in loadActiveAccounts
const isValid = await this.validateSession(account.id);
if (!isValid) {
  this.logger.warn(`Invalid session for account ${account.id}`);
  await this.updateAccountStatus(account.id, 'inactive', {
    notes: 'Session files invalid or corrupted',
  });
  continue;
}
```

**Testing:**
- ✅ Test with valid session files
- ✅ Test with missing files
- ✅ Test with corrupted files

---

## 🟡 Phase 2: Integration Improvements

### **Fix #4: Complete WebSocket Frontend Integration**

#### **Step 4.1: Audit All Pages**

**Action Items:**
1. Check `apps/admin/src/app/(dashboard)/marketing/whatsapp/accounts/page.tsx`
2. Check `apps/admin/src/app/(dashboard)/marketing/whatsapp/groups/page.tsx`
3. Check `apps/admin/src/app/(dashboard)/marketing/whatsapp/messages/page.tsx`
4. Ensure all use `useWhatsAppWebSocket` hook

**Implementation:**

```tsx
// Example for accounts page
'use client';

import { useWhatsAppWebSocket } from '@/lib/hooks/useWhatsAppWebSocket';
import { useEffect, useState } from 'react';

export default function AccountsPage() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const { 
    qrCode, 
    status, 
    connectionState, 
    phoneNumber,
    error 
  } = useWhatsAppWebSocket(selectedAccountId);
  
  // Use real-time data in component
  // ...
}
```

---

#### **Step 4.2: Add Connection Status Indicator**

**File:** `apps/admin/src/components/whatsapp/ConnectionStatus.tsx` (NEW)

**Implementation:**

```tsx
'use client';

import { useWhatsAppWebSocket } from '@/lib/hooks/useWhatsAppWebSocket';

export function ConnectionStatus() {
  const { isConnected, error } = useWhatsAppWebSocket(null);
  
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm">
      {isConnected ? (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-green-700">Connected</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-red-500 rounded-full" />
          <span className="text-red-700">Disconnected</span>
        </>
      )}
    </div>
  );
}
```

**Add to layout:**

```tsx
// apps/admin/src/app/(dashboard)/layout.tsx
import { ConnectionStatus } from '@/components/whatsapp/ConnectionStatus';

// In header
<ConnectionStatus />
```

---

## 🟢 Phase 3: Production Readiness

### **Fix #8: Comprehensive Testing**

#### **Step 8.1: Write Unit Tests**

**File:** `apps/api/src/modules/whatsapp/whatsapp-account.service.spec.ts` (NEW)

**Implementation:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { ConfigService } from '@nestjs/config';

describe('WhatsAppAccountService', () => {
  let service: WhatsAppAccountService;
  let mockDb: any;
  let mockGateway: any;

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    };

    mockGateway = {
      emitQRCode: jest.fn(),
      emitStatus: jest.fn(),
      emitPhoneNumber: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsAppAccountService,
        { provide: DATABASE_CONNECTION, useValue: mockDb },
        { provide: ConfigService, useValue: {} },
        { provide: WhatsAppGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<WhatsAppAccountService>(WhatsAppAccountService);
  });

  describe('getAccountStatus', () => {
    it('should return account status', async () => {
      mockDb.limit.mockResolvedValue([{ id: '123', status: 'active' }]);
      
      const result = await service.getAccountStatus('123');
      
      expect(result).toBeDefined();
      expect(result.status).toBe('active');
    });
  });
});
```

---

## 📊 Testing Checklist

### **Unit Tests**
- [ ] WhatsAppAccountService methods
- [ ] WhatsAppMessageService methods
- [ ] WhatsAppGroupService methods
- [ ] Error handling
- [ ] Rate limiting logic

### **Integration Tests**
- [ ] Account creation flow
- [ ] QR code generation
- [ ] Phone number extraction
- [ ] Message sending
- [ ] Group discovery

### **E2E Tests**
- [ ] Complete account setup flow
- [ ] Send message to group
- [ ] Discover and scrape contacts
- [ ] Session persistence on restart

---

## 🎯 Acceptance Criteria

### **Fix #1: Phone Number Extraction**
- ✅ Phone number extracted within 60 seconds of QR scan
- ✅ Health check job runs every 5 minutes
- ✅ Manual update option available
- ✅ Clear error messages displayed

### **Fix #2: Status Stuck States**
- ✅ Accounts timeout after 5 minutes if stuck
- ✅ Reset button available in UI
- ✅ Clear status messages displayed
- ✅ Automatic retry on failure

### **Fix #3: Session Persistence**
- ✅ Sessions loaded on server restart
- ✅ Expired sessions detected and handled
- ✅ Session validation working
- ✅ Accounts reconnect automatically

---

## 📝 Notes

- All fixes should be implemented incrementally
- Test each fix before moving to the next
- Keep detailed logs of changes
- Update documentation as you go
- Monitor error rates after each deployment

---

**Last Updated:** December 2025  
**Status:** Ready for Implementation

