# WhatsApp Connection - Restart & Monitor Guide

## ✅ Apps Restarted

Both applications have been restarted:

- **API Server**: Port 3002
- **Admin App**: Port 3001

## 🔧 Configuration Updates Applied

### 1. Puppeteer Configuration
- ✅ Removed `--single-process` (was causing crashes)
- ✅ Removed `--no-zygote` (not needed)
- ✅ Added `--disable-blink-features=AutomationControlled` (anti-detection)
- ✅ Added proper user agent string
- ✅ Added `--disable-web-security` for compatibility

### 2. Web Version Cache
- ✅ Restored `webVersionCache` to `'remote'` (was changed to `'none'`)
- ✅ Using remote WhatsApp Web version for compatibility

### 3. Session Management
- ✅ Clean up lock files before initialization
- ✅ Kill stale browser processes
- ✅ Use absolute paths for session storage

## 📊 Monitoring Logs

### Quick Log Check
```bash
# API logs
tail -f /tmp/api-debug.log

# Admin logs  
tail -f /tmp/admin-debug.log

# Filter for WhatsApp issues
tail -f /tmp/api-debug.log | grep -E "QR|qr|authenticated|ready|error|Error|ERROR|Protocol|Session"
```

### Use Monitor Script
```bash
./apps/api/MONITOR_LOGS.sh
```

## 🧪 Testing Steps

1. **Open Admin Panel**: http://localhost:3001
2. **Navigate to**: Marketing > WhatsApp > Accounts
3. **Click "Initialize"** on an account
4. **Watch for QR code** in the dialog
5. **Scan with WhatsApp mobile app**
6. **Monitor logs** for connection progress

## 🔍 What to Look For

### ✅ Success Indicators
- `QR Code generated for account...`
- `Account authenticated - waiting for ready event...`
- `WhatsApp client ready for account...`
- `Account UPDATED: phone=... status=active`

### ❌ Error Indicators
- `Protocol error (Runtime.callFunctionOn): Session closed`
- `Couldn't link device`
- `Authentication failure`
- `Error creating WhatsApp client`

## 🐛 Common Issues & Fixes

### Issue: "Session closed" errors
**Fix**: Already applied - removed `--single-process` flag

### Issue: QR code not loading
**Fix**: Check browser processes, clear lock files

### Issue: "Couldn't link device"
**Fix**: Ensure stable browser session, check web version cache

## 📝 GitHub Issues Research

Based on community fixes from whatsapp-web.js GitHub issues:

1. **Protocol Error Fix**: Remove `--single-process`, add proper user agent
2. **Connection Stability**: Use `webVersionCache` with remote version
3. **Anti-Detection**: Add `--disable-blink-features=AutomationControlled`
4. **Session Management**: Clean up lock files and stale processes

## 🔄 If Issues Persist

1. **Clear all sessions**: `rm -rf whatsapp-sessions/*`
2. **Check Puppeteer**: Ensure version is compatible
3. **Try different account**: Some may be rate-limited
4. **Review full logs**: Look for specific error patterns
5. **Check network**: Ensure no firewall blocking WhatsApp Web

## 📚 References

- **GitHub Issues**: Search for "Protocol error", "Session closed", "Couldn't link device"
- **Documentation**: See `GITHUB_ISSUES_RESEARCH.md`
- **Configuration**: See `WHATSAPP_CONNECTION_FIX.md`

