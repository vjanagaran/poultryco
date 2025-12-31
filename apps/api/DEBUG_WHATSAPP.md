# WhatsApp Account Debugging Guide

## Current Issues
1. QR codes scanned but phone numbers not updating
2. Status stuck in "warming" or "inactive"
3. Need to verify database state and session storage

## Steps to Debug

### 1. Check API Server Logs
```bash
tail -f /tmp/api-debug.log | grep -E "WhatsApp|ready|authenticated|phone|Account"
```

### 2. Check Database State
Run this SQL query:
```sql
SELECT 
  id,
  account_name,
  phone_number,
  status,
  session_storage_path,
  session_data,
  last_connected_at
FROM mkt_wap_accounts
ORDER BY created_at DESC;
```

### 3. Check Session Files
```bash
ls -la ./whatsapp-sessions/*/.wwebjs_auth/
```

### 4. Expected Log Messages After QR Scan
- "WhatsApp client ready for account {id}"
- "Client info for account {id}: ..."
- "Updating account {id} with phone: ..."
- "✅ Account {id} updated: phone=..."

### 5. If "ready" Event Not Firing
- Check if QR code was actually scanned successfully
- Verify WhatsApp Web client is connecting
- Check for authentication errors in logs

## Database Connection
The API uses `DATABASE_URL` from `.env.local` (gitignored).
Please share the DATABASE_URL so I can query the database directly.

