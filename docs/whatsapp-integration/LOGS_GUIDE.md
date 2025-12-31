# WhatsApp Integration Logs - User Guide

**Date:** December 31, 2025  
**Status:** ✅ Logging System Implemented

---

## 📊 Logging System Overview

A new in-memory logging system has been implemented to track all WhatsApp integration activities. Logs are captured in real-time and can be accessed via the API.

---

## 🔗 Accessing Logs

### **API Endpoint:**
```
GET /v1/whatsapp/logs
```

### **Query Parameters:**
- `lines` (optional): Number of log lines to return (default: 100)
- `accountId` (optional): Filter logs by specific account ID
- `level` (optional): Filter by log level (`log`, `warn`, `error`, `debug`)
- `search` (optional): Search logs by keyword

### **Examples:**

```bash
# Get last 100 logs
curl 'http://localhost:3002/v1/whatsapp/logs'

# Get last 50 logs for specific account
curl 'http://localhost:3002/v1/whatsapp/logs?lines=50&accountId=1d52efa4-0154-4ea9-a24e-226103b3d896'

# Search for "phone" related logs
curl 'http://localhost:3002/v1/whatsapp/logs?search=phone'

# Get only error logs
curl 'http://localhost:3002/v1/whatsapp/logs?level=error'
```

---

## 📝 Log Response Format

```json
{
  "logs": [
    {
      "timestamp": "2025-12-31T12:00:00.000Z",
      "level": "log",
      "message": "✅ Account {id} authenticated",
      "accountId": "1d52efa4-0154-4ea9-a24e-226103b3d896"
    }
  ],
  "stats": {
    "total": 150,
    "byLevel": {
      "log": 100,
      "warn": 30,
      "error": 20
    },
    "oldest": "2025-12-31T11:00:00.000Z",
    "newest": "2025-12-31T12:00:00.000Z"
  },
  "timestamp": "2025-12-31T12:00:00.000Z"
}
```

---

## 🔍 What Gets Logged

### **Account Initialization:**
- ✅ `Initializing WhatsApp client for account {id}...`
- ✅ `Client initialization started for account {id}`
- ✅ `QR Code generated for account {id}`

### **Authentication Events:**
- ✅ `✅ Account {id} authenticated - starting phone number polling`
- ✅ `✅ WhatsApp client ready for account {id}`
- ❌ `❌ Authentication failure for account {id}`

### **Phone Number Extraction:**
- 🔍 `🔍 Polling attempt X/60 for account {id} - State: CONNECTED`
- 📱 `📱 Phone number extracted (attempt X/5): {phone}, Push name: {name}`
- ✅ `✅✅✅ Account {id} ready and phone number extracted: {phone}`
- ✅ `✅ Phone number extracted via polling for account {id}: {phone}`

### **Health Check:**
- 🔍 `🔍 Running health check for accounts without phone numbers...`
- ⚠️ `⚠️ Found X active account(s) without phone numbers`
- 🔧 `🔧 Attempting to extract phone number for account {id}...`
- ✅ `✅ Successfully extracted phone number for account {id}: {phone}`

### **Errors:**
- ❌ `Error initializing client for account {id}`
- ❌ `Error in phone number polling`
- ❌ `Error handling ready event for account {id}`

---

## 📊 Current Account Status

Based on the last check:

### **Marketing No** (Most Active)
- **Account ID:** `1d52efa4-0154-4ea9-a24e-226103b3d896`
- **Status:** `warming`
- **Client:** ✅ Connected
- **Phone Number:** ❌ NULL
- **Last QR:** Generated at 12:01:32

**Expected Logs:**
- Should see `authenticated` event if QR was scanned
- Should see polling attempts if authenticated
- Should see phone extraction attempts

---

## 🎯 How to Check Logs

### **Step 1: Get All Recent Logs**
```bash
curl 'http://localhost:3002/v1/whatsapp/logs?lines=100'
```

### **Step 2: Filter by Account**
```bash
curl 'http://localhost:3002/v1/whatsapp/logs?accountId=1d52efa4-0154-4ea9-a24e-226103b3d896'
```

### **Step 3: Check for Errors**
```bash
curl 'http://localhost:3002/v1/whatsapp/logs?level=error'
```

### **Step 4: Search for Specific Events**
```bash
# Search for authentication events
curl 'http://localhost:3002/v1/whatsapp/logs?search=authenticated'

# Search for phone extraction
curl 'http://localhost:3002/v1/whatsapp/logs?search=phone'
```

---

## 🔄 Log Flow Example

### **Successful Connection:**
```
[12:00:00] [log] Initializing WhatsApp client for account {id}...
[12:00:05] [log] QR Code generated for account {id}
[12:00:30] [log] ✅ Account {id} authenticated - starting phone number polling
[12:00:31] [debug] 🔍 Polling attempt 1/60 for account {id} - State: CONNECTED
[12:00:32] [log] 📱 Phone number extracted (attempt 1/5): 1234567890, Push name: John
[12:00:32] [log] ✅✅✅ Account {id} ready and phone number extracted: 1234567890
```

### **With Polling:**
```
[12:00:30] [log] ✅ Account {id} authenticated - starting phone number polling
[12:00:31] [debug] 🔍 Polling attempt 1/60 for account {id} - State: CONNECTED
[12:00:32] [debug] 🔍 Polling attempt 2/60 for account {id} - State: CONNECTED
[12:00:33] [debug] 🔍 Polling attempt 3/60 for account {id} - State: CONNECTED
[12:00:34] [log] 📱 Phone number extracted (attempt 2/5): 1234567890, Push name: John
[12:00:34] [log] ✅ Phone number extracted via polling for account {id}: 1234567890
```

### **Health Check:**
```
[12:05:00] [log] 🔍 Running health check for accounts without phone numbers...
[12:05:00] [log] ⚠️ Found 1 active account(s) without phone numbers
[12:05:00] [log] 🔧 Attempting to extract phone number for account {id} (Marketing No)...
[12:05:01] [log] ✅ Successfully extracted phone number for account {id}: 1234567890
```

---

## ⚠️ Important Notes

1. **Logs are in-memory** - They will be cleared when the server restarts
2. **Maximum 1000 logs** - Oldest logs are automatically removed
3. **Real-time capture** - Logs are captured as events happen
4. **No file storage** - Logs are not persisted to disk (for now)

---

## 🚀 Next Steps

1. **Trigger WhatsApp Activity:**
   - Initialize an account
   - Scan QR code
   - Check logs for events

2. **Monitor Health Check:**
   - Wait 5 minutes
   - Check logs for health check execution
   - Verify phone extraction attempts

3. **Test Manual Phone Update:**
   ```bash
   curl -X POST 'http://localhost:3002/v1/whatsapp/accounts/1d52efa4-0154-4ea9-a24e-226103b3d896/update-phone'
   ```
   - Check logs for extraction attempts

---

## 📋 Quick Reference

| Event | Log Message | Level |
|-------|-------------|-------|
| QR Generated | `QR Code generated for account {id}` | log |
| Authenticated | `✅ Account {id} authenticated` | log |
| Ready | `✅ WhatsApp client ready for account {id}` | log |
| Phone Extracted | `📱 Phone number extracted: {phone}` | log |
| Polling | `🔍 Polling attempt X/60` | debug |
| Health Check | `🔍 Running health check...` | log |
| Error | `Error: {message}` | error |

---

**Last Updated:** December 31, 2025  
**Status:** ✅ Ready to Use

