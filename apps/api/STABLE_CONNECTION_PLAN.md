# Stable WhatsApp Connection Plan

## Current Issues Identified

1. **"Test Account" stuck in "warming" status** - QR generated but never completed
2. **Phone numbers are NULL** - "ready" event may not be firing or phone extraction failing
3. **Session paths exist but not being used** - "Marketing No" has session path but status is "inactive"

## Root Cause Analysis

### Issue 1: "ready" Event Not Firing
- QR codes are scanned successfully
- But `client.on('ready')` event handler may not be executing
- Possible causes:
  - Browser process crashing before ready
  - Authentication completing but ready event not triggered
  - Client info not available when ready fires

### Issue 2: Session Not Persisting
- Session files are created in filesystem
- But phone number not saved to database
- Status not updating to "active"

## Stable Solution Implementation

### 1. Add Retry Logic for Phone Number Extraction
```typescript
// Wait a bit after ready event before extracting phone
setTimeout(async () => {
  const clientInfo = client.info;
  // Try multiple times if needed
}, 2000);
```

### 2. Add Health Check Endpoint
- Check if client is actually connected
- Verify phone number can be retrieved
- Manual trigger for phone update

### 3. Add Manual Phone Update API
```typescript
@Post('accounts/:id/update-phone')
async updatePhoneManually(@Param('id') id: string) {
  // Force phone number extraction from active client
}
```

### 4. Improve Error Handling
- Catch and log all errors in ready handler
- Don't fail silently
- Emit errors via WebSocket

### 5. Add Periodic Health Checks
- Every 30 seconds, check if phone number is missing
- If client is ready but phone is NULL, retry extraction

## Immediate Actions

1. ✅ Reset stuck accounts (warming → inactive)
2. ✅ Clean up lock files
3. ⏳ Add retry logic for phone extraction
4. ⏳ Add manual phone update endpoint
5. ⏳ Add health check endpoint

