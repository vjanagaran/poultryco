# Whapi.Cloud Detailed Implementation Guide
## Based on Dashboard Analysis & Public Documentation

## Overview

This document provides a detailed implementation guide for replicating Whapi.Cloud's WhatsApp integration architecture for PoultryCo's marketing system. The analysis is based on:
- Dashboard UI screenshots and user flows
- Public API documentation
- Architecture patterns from GitHub repositories
- Best practices for WhatsApp web.js integration

---

## 1. Channel Connection Flow (4-Step Process)

### Step 1: Start Channel
- **Action**: Create a new channel/account
- **Input**: Channel name
- **Output**: Channel ID (e.g., `SPDRMN-Z46B9`)
- **Status**: Channel created, not connected

### Step 2: Channel Connection
- **Action**: Initialize connection and generate QR code
- **UI Elements**:
  - QR code display (large, centered)
  - Countdown timer: "QR code will reload in 0:43" (20-second countdown)
  - "Link with phone number" alternative option
- **Instructions Displayed**:
  1. Open WhatsApp on your phone
  2. Click Menu or Settings and select Linked devices
  3. Click Bind Device
  4. Point your phone at this screen to read the QR code
- **Real-time Updates**: 
  - QR code auto-refreshes every 20 seconds
  - Status updates: `qr_pending` → `authenticating` → `connecting` → `active`
  - Phone number auto-detected after scan

### Step 3: Confirm Detail
- **Action**: Verify connection details
- **Displays**: Phone number, account name, connection status
- **Options**: Edit account name, verify phone number

### Step 4: Finish Settings (Optionally)
- **Webhooks Configuration**:
  - URL input: `https://your-domain.cloud/webhook-path`
  - Refresh/sync button
  - Event type tags: `messages.post`, `statuses.post` (purple pill-shaped tags)
  - Settings icon for advanced configuration
  - "Add another URL +" for multiple webhooks
  - "Persistent webhook" toggle (on/off)
- **Auto Download Settings**:
  - Toggle switches for each media type:
    - Image
    - Audio
    - Voice
    - Video
    - Document
    - Sticker
- **Individual Proxy Port**:
  - Input: `socks5://login:password@ip:port`
  - For advanced connection management

---

## 2. Webhook System Architecture

### Webhook Event Types

#### `messages.post`
- **Trigger**: Incoming message received
- **Payload Structure**:
```json
{
  "event": "messages.post",
  "channel_id": "SPDRMN-Z46B9",
  "timestamp": "2025-12-30T12:00:00Z",
  "data": {
    "message_id": "msg_123",
    "from": "1234567890@c.us",
    "to": "0987654321@c.us",
    "type": "text|image|video|document|audio|voice|location|sticker",
    "body": "Message content",
    "media_url": "https://...",
    "caption": "Media caption",
    "is_group": false,
    "group_id": null,
    "contact": {
      "name": "John Doe",
      "phone": "1234567890"
    }
  }
}
```

#### `statuses.post`
- **Trigger**: Message delivery status update
- **Payload Structure**:
```json
{
  "event": "statuses.post",
  "channel_id": "SPDRMN-Z46B9",
  "timestamp": "2025-12-30T12:00:00Z",
  "data": {
    "message_id": "msg_123",
    "status": "sent|delivered|read|failed",
    "timestamp": "2025-12-30T12:00:00Z",
    "error": null
  }
}
```

### Webhook Configuration Features

1. **Multiple Webhook URLs**: Support for multiple endpoints
2. **Event Type Selection**: Choose which events to receive
3. **Persistent Webhooks**: Retry failed deliveries
4. **Webhook Testing**: Test webhook endpoints before going live
5. **Webhook Logs**: View delivery history and failures

---

## 3. Real-Time Connection Management

### Connection States

1. **`inactive`**: Channel created but not initialized
2. **`initializing`**: Client being created, Puppeteer starting
3. **`qr_pending`**: QR code generated, waiting for scan
4. **`qr_expiring`**: QR code about to expire (18 seconds)
5. **`authenticating`**: QR scanned, authenticating with WhatsApp
6. **`connecting`**: Establishing connection
7. **`active`**: Connected and ready
8. **`disconnected`**: Connection lost
9. **`error`**: Error occurred during connection

### WebSocket Events

#### Client → Server
```typescript
// Subscribe to account updates
socket.emit('subscribe:account', accountId);

// Unsubscribe from account updates
socket.emit('unsubscribe:account', accountId);
```

#### Server → Client
```typescript
// QR Code Event
{
  type: 'qr:code',
  accountId: 'uuid',
  qrCode: 'qr_code_string',
  expiresIn: 20, // seconds
  timestamp: 1234567890
}

// Status Update
{
  type: 'status:update',
  accountId: 'uuid',
  status: 'qr_pending|authenticating|active|...',
  data: { ... },
  timestamp: 1234567890
}

// Connection State
{
  type: 'connection:state',
  accountId: 'uuid',
  state: 'initializing|authenticated|connected|disconnected',
  details: { ... },
  timestamp: 1234567890
}

// Phone Number Detected
{
  type: 'phone:detected',
  accountId: 'uuid',
  phoneNumber: '1234567890',
  pushName: 'John Doe',
  timestamp: 1234567890
}

// Error Event
{
  type: 'error',
  accountId: 'uuid',
  error: 'Error message',
  details: { ... },
  timestamp: 1234567890
}
```

---

## 4. Auto-Download Feature

### Implementation

```typescript
interface AutoDownloadSettings {
  accountId: string;
  image: boolean;
  audio: boolean;
  voice: boolean;
  video: boolean;
  document: boolean;
  sticker: boolean;
}

// When message received
client.on('message', async (msg: Message) => {
  const settings = await getAutoDownloadSettings(msg.from);
  
  if (msg.hasMedia) {
    if (
      (msg.type === 'image' && settings.image) ||
      (msg.type === 'video' && settings.video) ||
      (msg.type === 'audio' && settings.audio) ||
      (msg.type === 'voice' && settings.voice) ||
      (msg.type === 'document' && settings.document) ||
      (msg.type === 'sticker' && settings.sticker)
    ) {
      const media = await msg.downloadMedia();
      // Upload to S3 or local storage
      await saveMedia(media, msg.id);
    }
  }
});
```

---

## 5. Database Schema Enhancements

### Webhook Configuration Table

```sql
CREATE TABLE mkt_wap_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  event_types TEXT[] NOT NULL, -- ['messages.post', 'statuses.post']
  is_persistent BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  secret_token TEXT, -- For webhook signature verification
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id, url)
);
```

### Auto-Download Settings Table

```sql
CREATE TABLE mkt_wap_auto_download (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  image BOOLEAN NOT NULL DEFAULT false,
  audio BOOLEAN NOT NULL DEFAULT false,
  voice BOOLEAN NOT NULL DEFAULT false,
  video BOOLEAN NOT NULL DEFAULT false,
  document BOOLEAN NOT NULL DEFAULT false,
  sticker BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id)
);
```

### Proxy Configuration Table

```sql
CREATE TABLE mkt_wap_proxies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  proxy_url TEXT NOT NULL, -- socks5://login:password@ip:port
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(account_id)
);
```

---

## 6. API Endpoints Structure

### Channel/Account Management

```
POST   /v1/whatsapp/accounts              # Create account
GET    /v1/whatsapp/accounts              # List all accounts
GET    /v1/whatsapp/accounts/:id         # Get account details
PATCH  /v1/whatsapp/accounts/:id         # Update account
DELETE /v1/whatsapp/accounts/:id         # Delete account
POST   /v1/whatsapp/accounts/:id/initialize  # Initialize connection
POST   /v1/whatsapp/accounts/:id/disconnect   # Disconnect
GET    /v1/whatsapp/accounts/:id/qr       # Get QR code
GET    /v1/whatsapp/accounts/:id/status   # Get connection status
```

### Webhook Management

```
GET    /v1/whatsapp/accounts/:id/webhooks     # List webhooks
POST   /v1/whatsapp/accounts/:id/webhooks     # Create webhook
PATCH  /v1/whatsapp/webhooks/:id              # Update webhook
DELETE /v1/whatsapp/webhooks/:id              # Delete webhook
POST   /v1/whatsapp/webhooks/:id/test          # Test webhook
GET    /v1/whatsapp/webhooks/:id/logs         # Webhook delivery logs
```

### Settings Management

```
GET    /v1/whatsapp/accounts/:id/auto-download  # Get auto-download settings
PATCH  /v1/whatsapp/accounts/:id/auto-download  # Update auto-download settings
GET    /v1/whatsapp/accounts/:id/proxy          # Get proxy settings
PATCH  /v1/whatsapp/accounts/:id/proxy          # Update proxy settings
```

### Messages

```
POST   /v1/whatsapp/messages                    # Send message
GET    /v1/whatsapp/messages                    # List messages
GET    /v1/whatsapp/messages/:id                # Get message details
GET    /v1/whatsapp/messages/:id/status         # Get delivery status
```

### Groups

```
GET    /v1/whatsapp/groups                      # List groups
GET    /v1/whatsapp/groups/:id                 # Get group details
POST   /v1/whatsapp/accounts/:id/groups/discover  # Discover groups
POST   /v1/whatsapp/groups                      # Create group
PATCH  /v1/whatsapp/groups/:id                 # Update group
DELETE /v1/whatsapp/groups/:id                 # Delete group
```

---

## 7. Frontend UI Components

### QR Code Modal Component

```tsx
<QRCodeModal>
  <QRCodeDisplay>
    {qrCode ? (
      <QRCodeSVG value={qrCode} size={300} />
    ) : (
      <LoadingSpinner />
    )}
  </QRCodeDisplay>
  
  <CountdownTimer>
    QR code will reload in {countdown}s
  </CountdownTimer>
  
  <Instructions>
    1. Open WhatsApp on your phone
    2. Settings → Linked devices
    3. Link a device
    4. Scan this QR code
  </Instructions>
  
  <Actions>
    <Button onClick={refreshQR}>Refresh QR Code</Button>
    <Button onClick={linkWithPhone}>Link with Phone Number</Button>
    <Button onClick={close}>Close</Button>
  </Actions>
</QRCodeModal>
```

### Webhook Configuration Component

```tsx
<WebhookSettings>
  <WebhookURL>
    <Input 
      placeholder="https://your-domain.cloud/webhook-path"
      value={webhookUrl}
    />
    <RefreshButton onClick={testWebhook} />
  </WebhookURL>
  
  <EventTypes>
    <Tag onClick={toggleEvent('messages.post')}>
      messages.post
    </Tag>
    <Tag onClick={toggleEvent('statuses.post')}>
      statuses.post
    </Tag>
    <SettingsIcon onClick={openAdvancedSettings} />
  </EventTypes>
  
  <AddAnotherURL onClick={addWebhook} />
  
  <PersistentWebhook>
    <Toggle 
      checked={persistent}
      onChange={setPersistent}
    />
    <HelpIcon />
  </PersistentWebhook>
</WebhookSettings>
```

### Auto-Download Settings Component

```tsx
<AutoDownloadSettings>
  <MediaType>
    <Icon type="image" />
    <Label>Image</Label>
    <Toggle checked={image} onChange={setImage} />
  </MediaType>
  
  <MediaType>
    <Icon type="audio" />
    <Label>Audio</Label>
    <Toggle checked={audio} onChange={setAudio} />
  </MediaType>
  
  {/* ... other media types ... */}
</AutoDownloadSettings>
```

---

## 8. Implementation Priority

### Phase 1: Core Connection (✅ Completed)
- [x] WebSocket gateway
- [x] QR code generation
- [x] Real-time status updates
- [x] Connection state management

### Phase 2: Frontend Integration (In Progress)
- [ ] WebSocket client in admin app
- [ ] QR modal with countdown timer
- [ ] Real-time status indicators
- [ ] Connection health dashboard

### Phase 3: Webhook System
- [ ] Webhook configuration UI
- [ ] Webhook delivery system
- [ ] Event type filtering
- [ ] Webhook logs and retry logic

### Phase 4: Advanced Features
- [ ] Auto-download settings
- [ ] Proxy configuration
- [ ] Message delivery tracking
- [ ] Analytics dashboard

---

## 9. Key Differences from Current Implementation

| Feature | Current | Whapi.Cloud Style | Status |
|---------|---------|-------------------|--------|
| QR Refresh | Manual | Auto (20s countdown) | ✅ Backend ready, ⏳ Frontend pending |
| Status Updates | Polling | WebSocket real-time | ✅ Backend ready, ⏳ Frontend pending |
| Webhooks | None | Full webhook system | ⏳ Pending |
| Auto-Download | None | Per-media-type toggles | ⏳ Pending |
| Proxy Support | None | Individual proxy per account | ⏳ Pending |
| Connection States | Basic | Granular (9 states) | ✅ Completed |
| UI/UX | Basic | Polished with countdown | ⏳ Pending |

---

## 10. Next Steps

1. **Complete Frontend Integration** (High Priority)
   - Implement WebSocket client
   - Add QR modal with countdown
   - Real-time status updates

2. **Webhook System** (Medium Priority)
   - Database schema
   - API endpoints
   - Delivery system
   - UI configuration

3. **Auto-Download** (Medium Priority)
   - Settings UI
   - Media processing
   - Storage integration

4. **Proxy Support** (Low Priority)
   - Configuration UI
   - Puppeteer proxy integration

---

## References

- Whapi.Cloud Documentation: https://whapi.cloud/docs
- Whapi.Cloud GitHub: https://github.com/Whapi-Cloud
- WhatsApp Web.js: https://github.com/pedroslopez/whatsapp-web.js
- Dashboard Screenshots: Provided by user

