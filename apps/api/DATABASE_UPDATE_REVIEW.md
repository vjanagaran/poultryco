# Database Update Review

## Current Implementation

### Database Update Logic

The `updateAccountStatus` method is called in several places:

1. **QR Code Event** (`qr`):
   - Updates status to `'warming'`
   - Stores QR code and generation timestamp

2. **Authenticated Event** (`authenticated`):
   - Updates status to `'authenticating'`
   - Stores `lastConnectedAt`

3. **Ready Event** (`ready`):
   - Updates status to `'active'`
   - **Stores phone number and push name** ✅
   - Stores `lastConnectedAt`

4. **Auth Failure** (`auth_failure`):
   - Updates status to `'inactive'`
   - Stores error message in notes

5. **Disconnected** (`disconnected`):
   - Updates status to `'inactive'`
   - Stores `lastDisconnectedAt` and reason

### Phone Number Update Flow

```typescript
// In ready event handler
client.on('ready', async () => {
  const clientInfo = client.info;
  if (clientInfo && clientInfo.wid && clientInfo.wid.user) {
    const phoneNumber = clientInfo.wid.user;
    const pushName = clientInfo.pushname || null;

    // Update database
    await this.updateAccountStatus(accountId, 'active', {
      phoneNumber: phoneNumber,
      pushName: pushName,
      lastConnectedAt: new Date().toISOString(),
    });
  }
});
```

### Enhanced Logging Added

Added detailed logging to track database updates:

1. **Before Update**: Logs what data is being updated
2. **After Update**: Confirms successful update
3. **On Error**: Logs detailed error information

## Potential Issues

### 1. Client Info Availability

The `client.info` might not be immediately available when `ready` event fires. The clean implementation doesn't have retry logic.

### 2. Missing Retry Logic

The old implementation had periodic checks to extract phone number if `ready` event didn't fire properly. The clean implementation relies solely on the `ready` event.

### 3. No Fallback Mechanism

If `client.info` is not available, the account is marked as `active` but without phone number.

## Recommendations

### Option 1: Add Retry Logic (Like Old Implementation)

```typescript
client.on('ready', async () => {
  // Try to extract phone number with retries
  let retries = 5;
  let phoneNumber = null;
  let pushName = null;

  while (retries > 0 && !phoneNumber) {
    try {
      const clientInfo = client.info;
      if (clientInfo && clientInfo.wid && clientInfo.wid.user) {
        phoneNumber = clientInfo.wid.user;
        pushName = clientInfo.pushname || null;
        break;
      }
    } catch (error) {
      this.logger.warn(`Attempt ${6 - retries} failed to get client info:`, error);
    }
    
    if (retries > 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    retries--;
  }

  // Update database
  await this.updateAccountStatus(accountId, 'active', {
    phoneNumber: phoneNumber,
    pushName: pushName,
    lastConnectedAt: new Date().toISOString(),
  });
});
```

### Option 2: Add Periodic Check (Like Old Implementation)

Add a periodic check in the `authenticated` event to extract phone number if `ready` event doesn't fire properly.

### Option 3: Keep Simple (Current)

Keep the simple implementation and rely on `ready` event. If phone number is not extracted, use the manual update endpoint.

## Testing

To verify database updates are working:

1. **Check Logs**:
   ```bash
   tail -f /tmp/api-debug.log | grep -E "Updating account|Successfully updated|Phone number"
   ```

2. **Check Database**:
   ```sql
   SELECT id, account_name, phone_number, push_name, status, last_connected_at 
   FROM mkt_wap_accounts 
   WHERE id = '<account-id>';
   ```

3. **Monitor Events**:
   - Watch for `ready` event
   - Check if phone number is logged
   - Verify database update logs

## Current Status

- ✅ Database update method exists
- ✅ Phone number extraction in ready event
- ✅ Enhanced logging added
- ⚠️ No retry logic (relies on ready event only)
- ⚠️ No fallback if client.info unavailable

