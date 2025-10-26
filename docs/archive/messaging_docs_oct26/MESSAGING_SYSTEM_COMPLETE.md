# Messaging System - Complete Implementation

## Overview

The PoultryCo messaging system is a comprehensive WhatsApp-style chat solution designed specifically for the poultry industry. It enables one-on-one and group conversations with real-time delivery, media sharing, and industry-specific tools.

## Vision

Build a communication platform that:
- Provides instant, reliable messaging between poultry professionals
- Enables group discussions for farms, cooperatives, and industry networks
- Supports rich media sharing (photos of flocks, documents, reports)
- Offers industry-specific templates and tools within chats
- Encourages network building through invitations

## Architecture

### Database Schema

The messaging system uses three core tables:

#### 1. `conversations`
Stores conversation metadata for both 1-on-1 and group chats.

```sql
- id (UUID, PK)
- is_group (BOOLEAN) - Differentiates between direct messages and groups
- group_name (TEXT) - Name for group chats
- group_photo_url (TEXT) - Group avatar
- group_description (TEXT) - Group description (max 500 chars)
- created_by (UUID -> profiles) - Creator of the conversation
- last_message_at (TIMESTAMPTZ) - Timestamp of last message
- last_message_preview (TEXT) - Preview text (max 200 chars)
- created_at, updated_at (TIMESTAMPTZ)
```

#### 2. `conversation_participants`
Manages users in conversations with their roles and read status.

```sql
- id (UUID, PK)
- conversation_id (UUID -> conversations)
- user_id (UUID -> profiles)
- is_admin (BOOLEAN) - Admin status for groups
- is_active (BOOLEAN) - Active/left status
- joined_at (TIMESTAMPTZ)
- left_at (TIMESTAMPTZ)
- last_read_at (TIMESTAMPTZ) - For read receipts
- unread_count (INTEGER) - Unread message count
- is_muted (BOOLEAN) - Notification muting
- muted_until (TIMESTAMPTZ) - Temporary mute
```

#### 3. `messages`
Stores all messages with support for rich features.

```sql
- id (UUID, PK)
- conversation_id (UUID -> conversations)
- sender_id (UUID -> profiles)
- content (TEXT, max 5000 chars)
- message_type (TEXT) - text, image, video, document, audio, location, contact, system
- media_urls (TEXT[]) - Array of media URLs
- reply_to_message_id (UUID -> messages) - For threaded replies
- forwarded_from_message_id (UUID -> messages) - For forwarded messages
- edited (BOOLEAN) - Edit indicator
- edited_at (TIMESTAMPTZ)
- deleted (BOOLEAN) - Soft delete
- deleted_at (TIMESTAMPTZ)
- read_by (UUID[]) - Array of user IDs who read the message
- delivered_to (UUID[]) - Array of user IDs who received the message
- created_at, updated_at (TIMESTAMPTZ)
```

### Real-time Features

The system uses **Supabase Realtime** for live updates:

1. **New Messages**: Instant delivery via PostgreSQL change subscriptions
2. **Message Updates**: Edit/delete notifications
3. **Typing Indicators**: Presence API for "user is typing..."
4. **Online Status**: Last seen and online indicators
5. **Read Receipts**: Real-time read status updates

### Message Delivery Status

Messages have three delivery states with WhatsApp-style indicators:

- **Sent (✓)**: Message sent to server - Single gray checkmark
- **Delivered (✓✓)**: Message delivered to recipient's device - Double gray checkmarks
- **Read (✓✓)**: Message read by recipient - Double blue/green checkmarks

## UI Components

### 1. MessagesContainer
Main container implementing WhatsApp's 3-panel design:
- **Left Panel (420px)**: Chat list with search and unread badges
- **Middle Panel (flex)**: Active conversation area
- **Right Panel (360px, optional)**: Contact info and media gallery

**Location**: `/apps/web/src/components/messages/MessagesContainer.tsx`

**Features**:
- Responsive: Left panel hidden on mobile when chat is open
- URL state management: `/messages?conversation=<id>`
- Empty state when no conversation selected

### 2. ChatList
Displays all conversations with real-time updates.

**Location**: `/apps/web/src/components/messages/ChatList.tsx`

**Features**:
- Search conversations by name
- Unread badges with count
- Last message preview
- Relative timestamps (e.g., "5m ago", "Yesterday")
- Group avatar vs. user avatar
- Active conversation highlighting
- Skeleton loading states

**Real-time Subscriptions**:
- New messages
- Message updates
- Participant changes
- Conversation creation/deletion

### 3. ChatArea
The main messaging interface for active conversations.

**Location**: `/apps/web/src/components/messages/ChatArea.tsx`

**Features**:
- Message history with date grouping
- Scrollable message list
- Message input with media support
- Typing indicators
- Online/last seen status
- Reply functionality
- Message search toggle
- Contact info toggle
- WhatsApp-style background pattern

**Header**:
- Avatar (clickable to profile)
- Name and status
- Search and menu buttons
- Back button (mobile)

### 4. MessageBubble
Individual message display component.

**Location**: `/apps/web/src/components/messages/MessageBubble.tsx`

**Features**:
- Own vs. other message styling
  - Own: Green background (#d9fdd3), right-aligned
  - Other: White background, left-aligned
- Avatar display (conditional based on message grouping)
- Delivery status icons
- Reply preview (when replying to another message)
- Media attachments (single or grid layout)
- Message actions menu:
  - Reply
  - Forward
  - Copy text
  - Delete (own messages only)
- Quick action buttons (on hover)
- Edit indicator
- Forwarded message indicator
- Timestamp with format: "HH:MM AM/PM"

**Context Menu Actions**:
Right-click or long-press to open action menu with:
- Reply to message
- Forward message
- Copy message text
- Delete message (sender only)

### 5. MessageInput
Message composition area at the bottom of the chat.

**Location**: `/apps/web/src/components/messages/MessageInput.tsx`

**Features**:
- Auto-resizing textarea (max 120px height)
- Emoji picker with common emojis
- File attachment button
  - Supports: images, videos, PDFs, docs
  - Max 10 files per message
  - Preview before sending
- Reply preview bar (when replying)
- Send button (disabled when empty)
- Character count (shows when > 4500 chars, max 5000)
- Enter to send (Shift+Enter for new line)
- Attachment preview with remove option

**Emoji Picker**:
Quick access to common emojis: 😊 👍 ❤️ 😂 😢 🙏 🎉 🔥 💯 ✅

### 6. ContactInfo
Right sidebar showing contact/group details and shared media.

**Location**: `/apps/web/src/components/messages/ContactInfo.tsx`

**Features**:

**Profile Section**:
- Large avatar (96x96px)
- Name and headline
- Participant count (groups)
- Quick actions:
  - View profile
  - Mute notifications
  - Search messages

**Group Participants** (groups only):
- Scrollable list of members
- Admin badge
- Clickable to profile

**Media Tabs**:
- **Media**: Grid of shared photos/videos
- **Documents**: List of shared files
- **Links**: Shared URLs (placeholder)

**Settings**:
- Mute notifications
- Disappearing messages
- End-to-end encryption status

**Danger Zone**:
- Block contact
- Report contact
- Delete chat

## Utility Functions

**Location**: `/apps/web/src/lib/messagingUtils.ts`

### Core Functions

#### `sendMessage()`
Sends a new message with optional media and reply.

```typescript
async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  messageType: MessageType,
  mediaUrls?: string[],
  replyToMessageId?: string
): Promise<void>
```

**Features**:
- Inserts message into database
- Updates conversation's last message
- Increments unread count for participants
- Sets delivered_to array

#### `markConversationRead()`
Marks all messages in a conversation as read.

```typescript
async function markConversationRead(
  conversationId: string,
  userId: string
): Promise<void>
```

**Updates**:
- Sets `last_read_at` to current time
- Resets `unread_count` to 0
- Adds user to `read_by` array for all unread messages

#### `markMessageDelivered()`
Marks a specific message as delivered.

```typescript
async function markMessageDelivered(
  messageId: string,
  userId: string
): Promise<void>
```

#### `getMessageStatus()`
Determines the delivery status of a message.

```typescript
function getMessageStatus(
  message: Message,
  currentUserId: string,
  participantIds: string[]
): 'sending' | 'sent' | 'delivered' | 'read'
```

**Logic**:
- Sending: Not yet in database
- Sent: In database but not delivered
- Delivered: In `delivered_to` array for all participants
- Read: In `read_by` array for all participants

### Formatting Functions

#### `formatMessageTime()`
Formats message timestamps for display.

```typescript
function formatMessageTime(timestamp: string): string
```

**Format**: "h:mm A" (e.g., "3:45 PM")

#### `formatLastSeen()`
Formats last seen status.

```typescript
function formatLastSeen(lastSeen?: string): string
```

**Examples**:
- "last seen just now"
- "last seen 5 minutes ago"
- "last seen today at 3:45 PM"
- "last seen yesterday at 10:30 AM"
- "last seen 2 days ago"

#### `groupMessagesByDate()`
Groups messages by date for display.

```typescript
function groupMessagesByDate(messages: Message[]): Record<string, Message[]>
```

**Output**:
```javascript
{
  "Today": [...messages],
  "Yesterday": [...messages],
  "December 25, 2024": [...messages]
}
```

#### `isUserOnline()`
Checks if a user is currently online.

```typescript
function isUserOnline(lastSeen?: string): boolean
```

Returns `true` if last seen within 2 minutes.

## Technical Implementation

### State Management

**Local Component State**:
- Message arrays
- Loading states
- UI toggles (emoji picker, contact info)
- Reply-to state

**URL State** (via Next.js router):
- Selected conversation ID
- Preserves state on refresh

**Real-time State**:
- Supabase subscriptions for live updates
- Typing indicators via Presence API
- Automatic state sync

### Performance Optimizations

1. **Message Pagination**: Load messages in batches
2. **Virtual Scrolling**: For long conversation histories (future)
3. **Image Optimization**: WebP format, lazy loading
4. **Debounced Search**: 300ms delay on chat list search
5. **Memoization**: React.memo for message bubbles

### Security

**Row Level Security (RLS)**:
- Users can only access conversations they're participants in
- Messages are scoped to conversation participants
- Profile data requires authentication

**Data Validation**:
- Message content: Max 5000 characters
- Media URLs: Validated against CDN domain
- Group names: Max 100 characters
- Descriptions: Max 500 characters

### File Upload Flow

1. User selects file(s) via file input
2. Preview shown in attachment area
3. On send:
   - Files uploaded to Supabase Storage (`cdn-poultryco` bucket)
   - URLs added to `media_urls` array
   - Message sent with media references
4. Recipients load images from CDN

**Supported File Types**:
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, MOV
- Documents: PDF, DOC, DOCX
- Audio: MP3, WAV (future)

## User Flows

### Starting a Conversation

1. Navigate to user profile
2. Click "Message" button
3. System checks for existing conversation:
   - If exists: Navigate to conversation
   - If new: Create conversation and navigate

### Sending a Message

1. Type message in input field
2. Optionally add emojis or attachments
3. Press Enter or click Send button
4. Message appears immediately (optimistic UI)
5. Delivery status updates in real-time

### Replying to a Message

1. Click reply icon on message (hover or context menu)
2. Reply preview appears above input
3. Type reply and send
4. Original message referenced in bubble

### Creating a Group

1. Click "New Group" in chat list
2. Enter group name and description
3. Add participants from connections
4. Upload group photo (optional)
5. Create group
6. First message sent to initialize conversation

### Group Management

**Group Admins Can**:
- Edit group name and description
- Change group photo
- Add/remove participants
- Promote/demote admins
- Delete group

**All Members Can**:
- Send messages
- View shared media
- Leave group
- Mute notifications

## Industry-Specific Features

### Planned Enhancements

1. **Quick Actions**:
   - Share feed formula
   - Send farm report template
   - Share market prices
   - Schedule farm visit

2. **Message Templates**:
   - Daily flock report
   - Feed order request
   - Vaccination schedule
   - Egg production summary

3. **Data Integration**:
   - Attach farm data from dashboard
   - Share market prices from marketplace
   - Link to knowledge base articles

4. **Voice Messages**:
   - Record audio messages
   - Useful for farmers in field

5. **Location Sharing**:
   - Share farm location
   - Meet-up coordination

## Testing Strategy

### Unit Tests
- Message formatting functions
- Date grouping logic
- Status determination
- Validation functions

### Integration Tests
- Real-time subscription behavior
- Message send/receive flow
- Read receipt updates
- Conversation creation

### E2E Tests
- Complete messaging flow
- Group creation and management
- Media sharing
- Search functionality

## Deployment Checklist

- [x] Database schema applied
- [x] RLS policies configured
- [x] Supabase Storage bucket created
- [x] Real-time subscriptions enabled
- [x] Environment variables set
- [ ] File upload limits configured
- [ ] Rate limiting enabled
- [ ] Media CDN optimization
- [ ] Mobile responsiveness tested
- [ ] Cross-browser compatibility verified

## Known Limitations

1. **File Size Limits**: Not yet enforced (recommend 10MB per file)
2. **Message Search**: Basic implementation, needs full-text search
3. **Message History**: Unlimited pagination (may need virtual scrolling)
4. **Voice Messages**: Not yet implemented
5. **Video Calls**: Future feature
6. **Message Reactions**: Not yet implemented
7. **Link Previews**: Not yet implemented

## Future Roadmap

### Phase 1: Core Enhancements
- [ ] Message reactions (👍 ❤️ 😂 etc.)
- [ ] Link preview cards
- [ ] Voice messages
- [ ] Message pinning
- [ ] Archive conversations

### Phase 2: Advanced Features
- [ ] Video/voice calls
- [ ] Screen sharing
- [ ] Industry templates
- [ ] Scheduled messages
- [ ] Polls and surveys

### Phase 3: Business Tools
- [ ] Broadcast lists
- [ ] Business accounts
- [ ] Analytics dashboard
- [ ] Customer support integration
- [ ] Payment requests

### Phase 4: AI Integration
- [ ] Smart replies
- [ ] Language translation
- [ ] Content moderation
- [ ] Chatbots for common queries

## Performance Metrics

**Target Benchmarks**:
- Message send latency: < 200ms
- Message delivery: < 500ms
- Real-time update latency: < 1s
- Chat list load time: < 300ms
- Message history load: < 500ms
- Search response: < 200ms

## Support and Troubleshooting

### Common Issues

**Messages not delivering**:
- Check internet connection
- Verify real-time subscription active
- Check Supabase service status

**Can't see conversations**:
- Verify user is participant
- Check RLS policies
- Clear cache and reload

**Media not loading**:
- Check CDN bucket permissions
- Verify media_urls format
- Check file size limits

**Typing indicators not showing**:
- Verify Presence API enabled
- Check real-time subscription
- Ensure proper channel naming

## Contributing

When adding features to the messaging system:

1. Follow existing component structure
2. Add TypeScript types to `messagingUtils.ts`
3. Update this documentation
4. Add unit tests for utility functions
5. Test real-time behavior thoroughly
6. Consider mobile responsiveness
7. Update security policies if needed

## Related Documentation

- [Project Summary](/docs/PROJECT_SUMMARY_AND_NEXT_STEPS.md)
- [Stream Feature](/docs/platform/STREAM_FEATURE_COMPLETE.md)
- [Database Schema](/supabase/schema/17_messaging_system.sql)
- [Profile System](/docs/platform/PROFILE_SYSTEM_COMPLETE.md)

---

**Last Updated**: October 26, 2025
**Status**: ✅ MVP Complete
**Version**: 1.0.0

