# WhatsApp Account Linking - Debugging Steps

## Current Status
- Server restarted cleanly ✅
- WebSocket gateway working ✅
- Client subscription working ✅

## Issue
User reports "no response" - QR code not appearing, stuck at "authenticating"

## Debugging Checklist

### 1. Check if Initialize Endpoint is Called
```bash
tail -f /tmp/api-debug.log | grep -E "Initialize request|initializeAccount"
```

**Expected:**
- `🚀 Initialize request received for account {id}`
- `🚀 Starting client initialization for account {id}...`

### 2. Check if QR Code is Generated
```bash
tail -f /tmp/api-debug.log | grep -E "QR Code generated|Emit.*QR|qr:code"
```

**Expected:**
- `QR Code generated for account {id}`
- `📡 Emitting QR code via WebSocket for account {id}`
- `QR code emitted for account {id}`

### 3. Check WebSocket Emission
```bash
tail -f /tmp/api-debug.log | grep -E "QR code emitted|emitQRCode"
```

**Expected:**
- `QR code emitted for account {id}` (from gateway)

### 4. Check Client State After Authentication
```bash
tail -f /tmp/api-debug.log | grep -E "authenticated|Checking client state|Client state|CONNECTED"
```

**Expected:**
- `✅ Account {id} authenticated - waiting for ready event...`
- `🔍 Checking client state for account {id} (check 1/15)...`
- `📱 Client state for account {id}: CONNECTED`
- `✅ Client is CONNECTED, attempting phone extraction...`

### 5. Check Frontend Console
In browser console, look for:
- `QR code event received: {accountId: '...', hasQR: true}`
- `Setting QR code for account: ...`

## Common Issues

### Issue 1: QR Code Emitted Before Subscription
**Symptom:** QR code generated but frontend doesn't receive it
**Fix:** Gateway should store last QR code and send it on subscription

### Issue 2: Client Not Initializing
**Symptom:** No "QR Code generated" log
**Fix:** Check browser/Puppeteer issues, session directory permissions

### Issue 3: Ready Event Not Firing
**Symptom:** Stuck at "authenticating"
**Fix:** Periodic checks should detect CONNECTED state and extract phone

## Next Steps

1. Try initializing an account
2. Watch logs in real-time
3. Check which step is failing
4. Apply appropriate fix

