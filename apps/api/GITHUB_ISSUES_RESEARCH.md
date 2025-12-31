# WhatsApp-Web.js GitHub Issues Research

## Common Issues Found

### 1. "Protocol error (Runtime.callFunctionOn): Session closed"
**Issue:** Browser session closes prematurely, causing connection failures.

**Common Causes:**
- `--single-process` flag causing instability
- Missing or incorrect Puppeteer configuration
- WhatsApp Web detecting automation

**Solutions from Community:**
1. Remove `--single-process` flag
2. Add proper user agent
3. Use `webVersionCache` with remote version
4. Add anti-detection flags

### 2. "Couldn't link device" Error
**Issue:** WhatsApp mobile app shows "Couldn't link device - Try again later"

**Common Causes:**
- Browser session crashes before QR scan completes
- WhatsApp Web version mismatch
- Network/firewall issues
- Rate limiting from WhatsApp

**Solutions:**
1. Ensure stable browser session (no crashes)
2. Use correct WhatsApp Web version via `webVersionCache`
3. Add proper error handling and retries
4. Clear old sessions before retry

### 3. QR Code Not Loading
**Issue:** QR code doesn't appear or expires immediately

**Common Causes:**
- Browser not launching properly
- Session conflicts
- Puppeteer executable issues

**Solutions:**
1. Clean up lock files before initialization
2. Kill stale browser processes
3. Use absolute paths for session storage
4. Ensure Puppeteer is properly installed

## Recommended Configuration

Based on community fixes and working examples:

```typescript
client = new Client({
  authStrategy: new LocalAuth({
    dataPath: finalSessionPath, // Absolute path
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
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51-beta.html',
  },
});
```

## Key Fixes Applied

1. ✅ Removed `--single-process` (causes crashes)
2. ✅ Removed `--no-zygote` (not needed)
3. ✅ Added `--disable-blink-features=AutomationControlled` (anti-detection)
4. ✅ Added proper user agent string
5. ✅ Added `webVersionCache` with remote version
6. ✅ Clean up lock files before initialization
7. ✅ Kill stale browser processes
8. ✅ Use absolute paths for session storage

## Testing Checklist

- [ ] Browser launches without errors
- [ ] QR code appears within 5 seconds
- [ ] QR code doesn't expire prematurely
- [ ] Mobile app can scan QR code
- [ ] Connection completes successfully
- [ ] Phone number updates in database
- [ ] No "Session closed" errors in logs
- [ ] Session persists after restart

## If Issues Persist

1. **Check Puppeteer version:** Should be compatible with whatsapp-web.js
2. **Clear all sessions:** Delete `whatsapp-sessions` folder completely
3. **Check WhatsApp Web version:** May need to update `remotePath` in `webVersionCache`
4. **Try different account:** Some accounts may be rate-limited
5. **Check network:** Ensure no firewall blocking WhatsApp Web
6. **Review logs:** Look for specific error messages

## References

- GitHub: https://github.com/pedroslopez/whatsapp-web.js
- Issues: Search for "Protocol error", "Session closed", "Couldn't link device"
- Community: Discord, Stack Overflow, Reddit

