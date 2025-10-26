# Messaging System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         PoultryCo Messaging                       │
│                      Performance & Offline Ready                  │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture Layers

```
┌──────────────────────────── UI Layer ────────────────────────────┐
│  MessagesContainer → ChatList → ChatArea → MessageBubble         │
│  NewConversationModal │ GroupCreationModal │ MessageSearch       │
└────────────────────────────┬──────────────────────────────────────┘
                             │
┌──────────────────────── Services Layer ──────────────────────────┐
│  messagingUtils.ts         │  mediaStorageService.ts             │
│  offlineStorageService.ts  │                                      │
└────────────────────────────┬──────────────────────────────────────┘
                             │
┌────────────────────── Database & Storage ────────────────────────┐
│  PostgreSQL (Supabase)     │  CDN (Supabase Storage)             │
│  IndexedDB (Browser)       │                                      │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Online Message Flow

```
User Types Message
       │
       ▼
┌──────────────┐
│ MessageInput │
│  Component   │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ messagingUtils   │
│  sendMessage()   │
└────────┬─────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌────────────────┐  ┌─────────────────┐
│   PostgreSQL   │  │  Realtime Pub   │
│  INSERT INTO   │  │   Broadcast     │
│    messages    │  │                 │
└────────┬───────┘  └────────┬────────┘
         │                   │
         │                   ▼
         │          ┌──────────────────┐
         │          │  Other Users'    │
         │          │   Devices        │
         │          └──────────────────┘
         ▼
┌────────────────────┐
│  offlineStorage    │
│  cacheMessage()    │
└────────────────────┘
```

### Offline Message Flow

```
User Types Message (OFFLINE)
       │
       ▼
┌──────────────┐
│ MessageInput │
│  Component   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────┐
│  offlineStorage         │
│  addPendingMessage()    │
│  addToSyncQueue()       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   IndexedDB             │
│   pending_messages      │
│   sync_queue            │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Display with           │
│  "Pending" indicator    │
└─────────────────────────┘

       (User comes ONLINE)
              │
              ▼
┌──────────────────────────┐
│  Sync Queue Processor    │
│  processPendingMessages()│
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Send to PostgreSQL     │
│  Update UI              │
│  Remove from queue      │
└─────────────────────────┘
```

### Media Upload Flow

```
User Selects File
       │
       ▼
┌──────────────────────┐
│  FileInput           │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  mediaStorageService │
│  uploadMediaFile()   │
└──────┬───────────────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
┌──────────────┐  ┌─────────────┐  ┌────────────────┐
│  Validate    │  │  Compress   │  │   Generate     │
│  Size/Type   │  │  to WebP    │  │  Thumbnail     │
└──────┬───────┘  └──────┬──────┘  └────────┬───────┘
       │                 │                   │
       └────────┬────────┴───────────────────┘
                │
                ▼
┌────────────────────────────────┐
│  Upload to CDN                 │
│  chats/direct/{users}/images/  │
│  or groups/{id}/images/        │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  Return URLs                   │
│  url: cdn-poultryco/.../x.webp │
│  thumb: .../x_thumb.webp       │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│  Store in message              │
│  media_urls: [...URLs]         │
│  media_metadata: {...}         │
└────────────────────────────────┘
```

### Media Cache Flow

```
Display Message with Media
       │
       ▼
┌──────────────────────┐
│  Check IndexedDB     │
│  media_cache         │
└──────┬───────────────┘
       │
       ├─── Cached? ────┐
       │                │
      YES              NO
       │                │
       ▼                ▼
┌──────────────┐  ┌─────────────────┐
│  Load Blob   │  │  Fetch from CDN │
│  from IDB    │  │                 │
└──────┬───────┘  └────────┬────────┘
       │                   │
       │                   ▼
       │          ┌─────────────────┐
       │          │  Cache in IDB   │
       │          │  media_cache    │
       │          └────────┬────────┘
       │                   │
       └──────────┬────────┘
                  │
                  ▼
          ┌──────────────┐
          │ Display      │
          │ Media        │
          └──────────────┘
```

## Database Schema Relationships

```
┌─────────────────────┐
│   conversations     │
│ ─────────────────── │
│  id (PK)            │
│  is_group           │
│  group_name         │
│  last_message_at    │
│  total_storage_bytes│ ← NEW
│  total_media_count  │ ← NEW
└─────────┬───────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────────┐
│ conversation_participants   │
│ ─────────────────────────── │
│  id (PK)                    │
│  conversation_id (FK)       │
│  user_id (FK)               │
│  unread_count               │
│  last_read_at               │
│  is_archived               │ ← NEW
└─────────┬───────────────────┘
          │
          │ 1:N
          ▼
┌─────────────────────────┐
│      messages           │
│ ─────────────────────── │
│  id (PK)                │
│  conversation_id (FK)   │
│  sender_id (FK)         │
│  content                │
│  media_urls[]           │
│  media_metadata (JSONB) │ ← NEW
│  message_size_bytes     │ ← NEW
│  read_by[]              │
│  delivered_to[]         │
└─────────┬───────────────┘
          │
          ├─────────────┬──────────────┐
          │             │              │
          │ 1:N         │ 1:N         │ 1:N
          ▼             ▼              ▼
┌────────────────┐ ┌──────────────┐ ┌───────────────┐
│ read_receipts  │ │  reactions   │ │offline_queue  │ ← NEW
│ ────────────── │ │ ──────────── │ │ ──────────── │
│  message_id    │ │  message_id  │ │  temp_id     │
│  user_id       │ │  user_id     │ │  status      │
│  read_at       │ │  reaction    │ │  retry_count │
└────────────────┘ └──────────────┘ └───────────────┘
```

## CDN Storage Structure

```
cdn-poultryco/
│
├── chats/
│   ├── direct/                           ← 1:1 conversations
│   │   ├── user123_user456/             ← Sorted user IDs
│   │   │   ├── images/
│   │   │   │   ├── 1730000001_msgABC.webp        ← compressed
│   │   │   │   ├── 1730000001_msgABC_thumb.webp  ← thumbnail
│   │   │   │   └── 1730000050_msgXYZ.webp
│   │   │   ├── videos/
│   │   │   │   ├── 1730000100_msgDEF.mp4
│   │   │   │   └── 1730000100_msgDEF_thumb.jpg
│   │   │   ├── documents/
│   │   │   │   └── 1730000200_msgGHI_report.pdf
│   │   │   └── audio/
│   │   │       └── 1730000300_msgJKL.mp3
│   │   │
│   │   └── user789_user012/
│   │       └── ... (same structure)
│   │
│   ├── groups/                           ← Group conversations
│   │   ├── groupUUID1/
│   │   │   ├── images/
│   │   │   ├── videos/
│   │   │   ├── documents/
│   │   │   └── audio/
│   │   │
│   │   └── groupUUID2/
│   │       └── ... (same structure)
│   │
│   └── temp/                             ← Temporary uploads
│       └── user123/
│           └── 1730000400_tempABC.jpg   ← Auto-cleanup after 24h
│
└── group-photos/                         ← Group profile photos
    ├── groupUUID1/
    │   ├── original.webp
    │   └── thumbnail.webp
    │
    └── groupUUID2/
        ├── original.webp
        └── thumbnail.webp
```

## IndexedDB Structure

```
poultryco_messaging (Database)
│
├── conversations (Store)
│   ├── id (key)
│   ├── is_group
│   ├── participants
│   ├── unread_count
│   ├── cached_at
│   │
│   └── Indexes:
│       ├── by-cached-at
│       └── by-last-message
│
├── messages (Store)
│   ├── id (key)
│   ├── conversation_id
│   ├── content
│   ├── media_urls
│   ├── sender
│   ├── cached_at
│   │
│   └── Indexes:
│       ├── by-conversation
│       ├── by-conversation-date
│       └── by-cached-at
│
├── media_cache (Store)                  ← Up to 500MB
│   ├── url (key)
│   ├── blob (Blob)                      ← Actual file data
│   ├── size
│   ├── cached_at
│   ├── last_accessed                    ← For LRU eviction
│   │
│   └── Indexes:
│       ├── by-conversation
│       ├── by-size
│       └── by-last-accessed
│
├── pending_messages (Store)              ← Offline queue
│   ├── temp_id (key)
│   ├── conversation_id
│   ├── content
│   ├── media_files
│   ├── retry_count
│   │
│   └── Indexes:
│       ├── by-conversation
│       └── by-created-at
│
└── sync_queue (Store)                    ← Sync actions
    ├── id (key, auto-increment)
    ├── action
    ├── payload
    ├── retry_count
    │
    └── Indexes:
        └── by-action
```

## Performance Indexes

```
PostgreSQL Indexes (12 total):
│
├── Conversation Queries
│   ├── idx_conversation_participants_user_unread_last_message
│   │   → Fast: User's conversations sorted by unread/recent
│   └── idx_conversations_storage
│       → Fast: Storage analytics
│
├── Message Queries
│   ├── idx_messages_conversation_created_not_deleted
│   │   → Fast: Paginate messages (50-100ms)
│   ├── idx_messages_content_search (GIN)
│   │   → Fast: Full-text search (100ms vs 2000ms)
│   └── idx_messages_media
│       → Fast: Shared media gallery
│
├── Read Receipts
│   └── idx_message_read_receipts_message_read_at
│       → Fast: Check read status
│
└── Cleanup
    ├── idx_messages_size
    │   → Fast: Storage analytics
    └── idx_conversation_participants_archived
        → Fast: Archived conversations
```

## Cache Management Strategy

```
Cache Priority System:
│
├── Tier 1: Always Cache (Hot Data)
│   ├── Last 7 days conversations
│   ├── Last 100 messages per conversation
│   └── Recently viewed media
│
├── Tier 2: Selective Cache (Warm Data)
│   ├── Conversations with unread messages
│   ├── Pinned conversations
│   └── Messages with attachments
│
├── Tier 3: On-Demand Cache (Cold Data)
│   ├── Older conversations (> 30 days)
│   ├── Archived conversations
│   └── Large media files
│
└── Eviction Strategy (LRU)
    ├── When cache > 450MB → Remove oldest 50MB
    ├── When item > 30 days → Remove
    └── When accessed < 3 times → Low priority
```

## Sync Queue Processing

```
Sync Queue State Machine:
│
├── PENDING
│   │ ↓ (Online detected)
│   │
├── SYNCING
│   │ ↓ (API call in progress)
│   │
│   ├─→ SUCCESS → REMOVE from queue
│   │
│   └─→ FAILED
│       │ ↓ (retry_count < 3)
│       │
│       ├─→ RETRY (with exponential backoff)
│       │   ↓
│       │   SYNCING (retry)
│       │
│       └─→ PERMANENT_FAILURE
│           ↓
│           NOTIFY user → REMOVE from queue
```

## Performance Monitoring

```
Metrics Collection Points:
│
├── Database Layer
│   ├── Query execution time
│   ├── Index hit rate
│   └── Storage per conversation
│
├── CDN Layer
│   ├── Upload speed
│   ├── Download speed
│   └── Cache hit rate
│
├── IndexedDB Layer
│   ├── Cache size
│   ├── Cache hit rate
│   └── Eviction frequency
│
└── Sync Layer
    ├── Pending message count
    ├── Sync success rate
    └── Average retry count
```

## Legend

```
Symbol Key:
├─  Branch
└─  End branch
│   Vertical line
─   Horizontal line
→   Flow direction
←   Reference/Origin
▼   Downward flow
(FK) Foreign Key
(PK) Primary Key
[]   Array type
{}   JSON type
```

---

**Created**: October 26, 2025  
**Version**: 1.1  
**Status**: Production Architecture ✅
