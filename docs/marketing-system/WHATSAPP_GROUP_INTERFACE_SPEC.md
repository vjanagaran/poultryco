# WhatsApp Group Management Interface Specification

## Overview
Build a WhatsApp Web-like interface for managing groups, contacts, and messaging within the PoultryCo admin platform.

---

## 1. Account Linking (Step 1)

### Current Status
- ✅ Backend WebSocket gateway ready
- ✅ QR code generation working
- ⏳ Frontend WebSocket integration pending

### Requirements
- Real-time QR code display with countdown
- Auto-refresh QR codes
- Connection status updates
- Phone number auto-detection

---

## 2. WhatsApp Web-Like Interface (Step 2)

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Header: WhatsApp Management                            │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  LEFT PANEL  │         RIGHT PANEL                      │
│  (Groups)    │         (Group Details / Chat)           │
│              │                                          │
│  [Filters]   │  [Group Info / Message Composer]         │
│  [Search]    │                                          │
│              │                                          │
│  Group List  │                                          │
│  - Group 1   │                                          │
│  - Group 2   │                                          │
│  - Group 3   │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### Left Panel: Group List

#### Filters
- **Status**: All / Active / Inactive
- **Persona**: Filter by mapped persona
- **Tags**: Filter by tags
- **Region**: Filter by region/state/district
- **Account**: Filter by WhatsApp account
- **Search**: Search by group name

#### Group List Items
Each group shows:
- Group name
- Member count (e.g., "245 members")
- Last activity indicator
- Unread indicator (if applicable)
- Status badge (Active/Inactive)
- Persona badge (if mapped)
- Tags (if any)

---

## 3. Group Detail Panel (Step 3)

### Group Metadata Display

#### Header Section
- Group name
- Group description
- Profile picture
- Account name (which WhatsApp account)
- Connection status

#### Statistics Section
- **Total Contacts**: Total number of members
- **First Connected**: Date when group was first discovered/connected
- **Last Message Sent**: Date/time of last message sent from our system
- **Mapped Contacts**: Number of contacts mapped to our persona system
- **New Contacts**: Number of new contacts since last scrape

#### Action Buttons
1. **Scrape Contacts**: Extract all contacts from group
2. **Send from Content Library**: Browse and send content from marketing content library
3. **Create Custom Message**: Open message composer (WhatsApp Web-style)

#### Persona & Tags Section
- **Mapped Persona**: Display and edit persona mapping
- **Tags**: Display and manage tags for filtering

#### Contact List (Optional)
- List of contacts in group
- Show which are mapped to our system
- Show which are new since last scrape

---

## 4. Message Composer (Step 3)

### WhatsApp Web-Style Composer

#### Features
- Text input with emoji picker
- Media attachment (image, video, document)
- Link preview
- Content library integration
- Scheduled sending
- Campaign assignment

#### Content Library Integration
- Browse marketing content
- Filter by content type
- Preview content before sending
- Select and send

---

## 5. Persona Mapping & Tags (Step 4)

### Persona Mapping
- Link group to persona(s)
- Multi-persona support (if group has mixed personas)
- Persona confidence score
- Auto-suggest personas based on group name/members

### Tags System
- Add/remove tags
- Tag suggestions
- Tag-based filtering
- Tag analytics

### Database Schema Updates Needed

```sql
-- Group persona mapping (many-to-many)
CREATE TABLE IF NOT EXISTS mkt_wap_group_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES mkt_wap_groups(id) ON DELETE CASCADE,
  persona_id UUID NOT NULL REFERENCES mkt_persona_contacts(id) ON DELETE CASCADE,
  confidence_score DECIMAL(5,2) NOT NULL DEFAULT 0, -- 0-100
  mapped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mapped_by UUID REFERENCES usr_users(id),
  UNIQUE(group_id, persona_id)
);

-- Group tags
CREATE TABLE IF NOT EXISTS mkt_wap_group_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES mkt_wap_groups(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES usr_users(id),
  UNIQUE(group_id, tag)
);

-- Group metadata tracking
ALTER TABLE mkt_wap_groups ADD COLUMN IF NOT EXISTS first_connected_at TIMESTAMPTZ;
ALTER TABLE mkt_wap_groups ADD COLUMN IF NOT EXISTS last_message_sent_at TIMESTAMPTZ;
ALTER TABLE mkt_wap_groups ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMPTZ;
ALTER TABLE mkt_wap_groups ADD COLUMN IF NOT EXISTS mapped_contacts_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE mkt_wap_groups ADD COLUMN IF NOT EXISTS new_contacts_since_scrape INTEGER NOT NULL DEFAULT 0;
```

---

## 6. Data Storage Strategy (Step 5)

### What to Save
✅ **Group Metadata**
- Group ID, name, description
- Member count
- Profile picture URL
- Region, state, district
- Account association
- Persona mappings
- Tags
- Connection dates
- Statistics

✅ **Our Sent Messages**
- Message ID
- Content (text, media URLs)
- Sent timestamp
- Delivery status
- Campaign association
- Content library reference

✅ **Contact Mappings**
- Contact phone numbers
- Contact names
- Persona mappings
- Group memberships
- Scrape history

### What NOT to Save
❌ **Group Conversations**
- Incoming messages from others
- Group chat history
- Real-time conversation threads

### Database Tables

```sql
-- Our sent messages (already exists: mkt_wap_messages)
-- Just ensure we're only saving our sent messages, not incoming

-- Group metadata updates
-- Update mkt_wap_groups on scrape, message send, etc.
```

---

## Implementation Order

### Phase 1: Complete Account Linking
1. Frontend WebSocket client
2. QR code modal with countdown
3. Real-time status updates

### Phase 2: Group List Interface
1. Left panel with filters
2. Group list component
3. Search functionality
4. Filter implementation

### Phase 3: Group Detail Panel
1. Group metadata display
2. Statistics section
3. Action buttons
4. Persona & tags section

### Phase 4: Message Composer
1. WhatsApp Web-style composer
2. Content library integration
3. Media attachment
4. Scheduled sending

### Phase 5: Persona & Tags
1. Persona mapping UI
2. Tags management UI
3. Filter integration

### Phase 6: Data Storage
1. Ensure only metadata and sent messages are saved
2. Update group statistics on actions
3. Track scrape history

---

## UI/UX Requirements

### Design Style
- WhatsApp Web-inspired
- Clean, modern interface
- Responsive layout
- Real-time updates

### Color Scheme
- WhatsApp green accents
- Clean white/gray backgrounds
- Status indicators (green/yellow/red)
- Persona color coding

### Interactions
- Smooth transitions
- Real-time updates via WebSocket
- Loading states
- Error handling
- Success notifications

---

## API Endpoints Needed

```
GET    /v1/whatsapp/groups                    # List groups with filters
GET    /v1/whatsapp/groups/:id                # Get group details
GET    /v1/whatsapp/groups/:id/contacts       # Get group contacts
POST   /v1/whatsapp/groups/:id/scrape         # Scrape contacts
POST   /v1/whatsapp/groups/:id/persona        # Map persona
DELETE /v1/whatsapp/groups/:id/persona/:pid    # Unmap persona
POST   /v1/whatsapp/groups/:id/tags           # Add tag
DELETE /v1/whatsapp/groups/:id/tags/:tag       # Remove tag
POST   /v1/whatsapp/groups/:id/message        # Send message to group
GET    /v1/whatsapp/groups/:id/messages        # Get our sent messages
GET    /v1/marketing/content/library          # Get content library for selection
```

---

## Next Steps

1. ✅ Complete account linking (WebSocket frontend)
2. ✅ Build group list interface
3. ✅ Build group detail panel
4. ✅ Implement message composer
5. ✅ Add persona mapping & tags
6. ✅ Ensure proper data storage

