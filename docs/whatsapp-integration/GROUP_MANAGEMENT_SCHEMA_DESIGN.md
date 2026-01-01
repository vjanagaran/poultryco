# WhatsApp Group Management - Schema Design Review

**Date:** December 31, 2025  
**Status:** Architecture Review & Schema Design  
**Purpose:** Design database schema for WhatsApp group management, contact scraping, and deduplication

---

## 📋 Requirements Analysis

### Core Requirements:
1. ✅ List groups connected to an account
2. ✅ Hide/show groups (filter personal vs relevant)
3. ✅ Show contacts in group with admin status
4. ✅ Group metadata form (name, description, profile icon, segment, region, tags, internal descriptions)
5. ✅ Scrape contacts and save to `mkt_wap_contacts` (unique)
6. ✅ Map contacts to groups with admin status
7. ✅ Track last scraped date and contact count
8. ✅ Mark contacts as "left" (don't remove)
9. ✅ Identify same group across accounts (deduplication)
10. ✅ Track group security settings (is admin only, can add contacts, can post, etc.)

---

## 🏗️ Current Schema Analysis

### Existing Tables:

#### `mkt_wap_groups`
- ✅ `id` (UUID, PK)
- ✅ `group_id` (TEXT, UNIQUE) - WhatsApp group ID
- ✅ `name`, `description`, `profile_pic_url`
- ✅ `member_count`, `is_active`
- ✅ `region`, `state`, `district`
- ✅ `segment_tags` (TEXT[])
- ⚠️ `account_id` (UUID) - **Issue:** Only tracks one account, but same group can exist in multiple accounts
- ❌ Missing: `last_scraped_at`
- ❌ Missing: `contacts_count_at_last_scrape`
- ❌ Missing: `is_hidden` (for personal/non-relevant groups)
- ❌ Missing: `is_admin_only_group`
- ❌ Missing: `internal_description`

#### `mkt_wap_contacts`
- ✅ `id` (UUID, PK)
- ✅ `phone_number` (TEXT, UNIQUE)
- ✅ `name`, `profile_pic_url`
- ⚠️ `group_memberships` (UUID[]) - **Issue:** Denormalized, should use junction table
- ❌ Missing: Proper group-contact mapping with admin status

#### Missing Tables:
- ❌ `mkt_wap_group_contacts` - Junction table for group-contact mapping
- ❌ `mkt_wap_group_account_access` - Junction table for group-account access with permissions

---

## 🎯 Schema Design Solution

### 1. **Group-Contact Mapping Table** (`mkt_wap_group_contacts`)

**Purpose:** Track which contacts are in which groups, with admin status and membership state.

```sql
CREATE TABLE mkt_wap_group_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  group_id UUID NOT NULL REFERENCES mkt_wap_groups(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES mkt_wap_contacts(id) ON DELETE CASCADE,
  
  -- Membership Details
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_super_admin BOOLEAN NOT NULL DEFAULT false,
  is_left BOOLEAN NOT NULL DEFAULT false, -- Contact left the group
  
  -- Timestamps
  joined_at TIMESTAMPTZ, -- When contact joined (from WhatsApp)
  left_at TIMESTAMPTZ, -- When contact left (if applicable)
  first_scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- First time we scraped this contact
  last_seen_at TIMESTAMPTZ, -- Last time we saw this contact in group
  
  -- Metadata
  scraped_by_account_id UUID REFERENCES mkt_wap_accounts(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(group_id, contact_id)
);
```

**Key Features:**
- ✅ Tracks admin status (`is_admin`, `is_super_admin`)
- ✅ Tracks if contact left (`is_left`, `left_at`)
- ✅ Tracks when contact was first scraped
- ✅ Tracks which account scraped the contact
- ✅ Unique constraint prevents duplicates

---

### 2. **Group-Account Access Table** (`mkt_wap_group_account_access`)

**Purpose:** Track which accounts have access to which groups, with permissions and admin status.

```sql
CREATE TABLE mkt_wap_group_account_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  group_id UUID NOT NULL REFERENCES mkt_wap_groups(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES mkt_wap_accounts(id) ON DELETE CASCADE,
  
  -- Account's Role in Group
  is_account_admin BOOLEAN NOT NULL DEFAULT false, -- Is our account an admin?
  is_account_super_admin BOOLEAN NOT NULL DEFAULT false,
  
  -- Group Permissions (from WhatsApp)
  can_add_contacts BOOLEAN NOT NULL DEFAULT false, -- Can account add new members?
  can_post_messages BOOLEAN NOT NULL DEFAULT true, -- Can account post messages?
  can_edit_group_info BOOLEAN NOT NULL DEFAULT false, -- Can account edit group name/description?
  
  -- Group Settings (from WhatsApp)
  is_admin_only_group BOOLEAN NOT NULL DEFAULT false, -- Is group admin-only?
  
  -- Discovery
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When account discovered this group
  last_accessed_at TIMESTAMPTZ, -- Last time account accessed this group
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(group_id, account_id)
);
```

**Key Features:**
- ✅ Tracks which accounts have access to which groups
- ✅ Tracks account's admin status in the group
- ✅ Tracks group permissions (can add contacts, can post, etc.)
- ✅ Tracks group settings (is admin only)
- ✅ Enables deduplication: Same group across multiple accounts

---

### 3. **Enhanced `mkt_wap_groups` Table**

**New Columns:**
```sql
ALTER TABLE mkt_wap_groups ADD COLUMN IF NOT EXISTS last_scraped_at TIMESTAMPTZ;
ALTER TABLE mkt_wap_groups ADD COLUMN IF NOT EXISTS contacts_count_at_last_scrape INTEGER NOT NULL DEFAULT 0;
ALTER TABLE mkt_wap_groups ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE mkt_wap_groups ADD COLUMN IF NOT EXISTS is_admin_only_group BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE mkt_wap_groups ADD COLUMN IF NOT EXISTS internal_description TEXT;
```

**Schema Changes:**
- ⚠️ **Remove `account_id` from `mkt_wap_groups`**: Use `mkt_wap_group_account_access` instead
- ✅ Keep `group_id` as UNIQUE (enables deduplication)
- ✅ Add scraping tracking fields
- ✅ Add visibility flag (`is_hidden`)

---

### 4. **Enhanced `mkt_wap_contacts` Table**

**Changes:**
- ⚠️ **Remove `group_memberships` array**: Use `mkt_wap_group_contacts` junction table instead
- ✅ Keep `phone_number` as UNIQUE (ensures no duplicates)
- ✅ Keep `scraped_from_groups` array for quick reference (optional, can be computed)

---

## 🔄 Data Flow & Relationships

### Group Discovery Flow:
1. Account discovers groups → Create/update `mkt_wap_groups` (if new `group_id`)
2. Create entry in `mkt_wap_group_account_access` (link account to group)
3. Update group metadata (name, description, member count)

### Contact Scraping Flow:
1. User selects group → Scrape contacts from WhatsApp
2. For each contact:
   - Insert/update `mkt_wap_contacts` (unique by phone_number)
   - Insert/update `mkt_wap_group_contacts` (link contact to group)
3. Update `mkt_wap_groups`:
   - `last_scraped_at` = NOW()
   - `contacts_count_at_last_scrape` = current member count
4. Mark contacts that left: Set `is_left = true`, `left_at = NOW()`

### Deduplication Logic:
- **Same group across accounts**: `group_id` is UNIQUE, so same group_id = same group
- **Multiple accounts access same group**: Multiple rows in `mkt_wap_group_account_access` with same `group_id`
- **Contact deduplication**: `phone_number` is UNIQUE in `mkt_wap_contacts`
- **Group-contact mapping**: `UNIQUE(group_id, contact_id)` prevents duplicate mappings

---

## 📊 Schema Relationships

```
mkt_wap_accounts (1) ──< (N) mkt_wap_group_account_access (N) >── (1) mkt_wap_groups
                                                                         │
                                                                         │ (1)
                                                                         │
                                                                         │ (N)
                                                                         ▼
                                                          mkt_wap_group_contacts
                                                                         │
                                                                         │ (N)
                                                                         │
                                                                         │ (1)
                                                                         ▼
                                                          mkt_wap_contacts
```

**Key Relationships:**
- **Account ↔ Group**: Many-to-Many via `mkt_wap_group_account_access`
- **Group ↔ Contact**: Many-to-Many via `mkt_wap_group_contacts`
- **Account → Contact**: Indirect via groups

---

## 🎯 Query Patterns

### 1. Get Groups for Account (with hidden filter):
```sql
SELECT g.*, gaa.is_account_admin, gaa.can_post_messages
FROM mkt_wap_groups g
JOIN mkt_wap_group_account_access gaa ON g.id = gaa.group_id
WHERE gaa.account_id = $1
  AND g.is_hidden = false  -- Filter out hidden groups
ORDER BY g.name;
```

### 2. Get Contacts in Group (with admin status):
```sql
SELECT c.*, gc.is_admin, gc.is_left, gc.joined_at
FROM mkt_wap_contacts c
JOIN mkt_wap_group_contacts gc ON c.id = gc.contact_id
WHERE gc.group_id = $1
  AND gc.is_left = false  -- Only active members
ORDER BY gc.is_admin DESC, c.name;
```

### 3. Scrape Contacts (upsert logic):
```sql
-- For each contact:
INSERT INTO mkt_wap_contacts (phone_number, name, profile_pic_url)
VALUES ($1, $2, $3)
ON CONFLICT (phone_number) DO UPDATE
SET name = EXCLUDED.name, updated_at = NOW()
RETURNING id;

-- Link to group:
INSERT INTO mkt_wap_group_contacts (group_id, contact_id, is_admin, scraped_by_account_id)
VALUES ($group_id, $contact_id, $is_admin, $account_id)
ON CONFLICT (group_id, contact_id) DO UPDATE
SET is_admin = EXCLUDED.is_admin,
    is_left = false,  -- Reset if contact rejoined
    left_at = NULL,
    last_seen_at = NOW(),
    updated_at = NOW();
```

### 4. Mark Contacts as Left:
```sql
-- After scraping, mark contacts that are no longer in group:
UPDATE mkt_wap_group_contacts
SET is_left = true,
    left_at = NOW(),
    updated_at = NOW()
WHERE group_id = $1
  AND contact_id NOT IN ($2, $3, ...)  -- List of current contact IDs
  AND is_left = false;
```

### 5. Find Same Group Across Accounts:
```sql
-- Get all accounts that have access to the same group:
SELECT gaa.account_id, a.account_name, a.phone_number
FROM mkt_wap_group_account_access gaa
JOIN mkt_wap_accounts a ON gaa.account_id = a.id
WHERE gaa.group_id = (
  SELECT id FROM mkt_wap_groups WHERE group_id = $whatsapp_group_id
);
```

---

## ✅ Benefits of This Design

### 1. **Deduplication**:
- ✅ Same group across accounts: `group_id` is UNIQUE
- ✅ Same contact across groups: `phone_number` is UNIQUE
- ✅ No duplicate group-contact mappings: `UNIQUE(group_id, contact_id)`

### 2. **Flexibility**:
- ✅ Multiple accounts can access same group
- ✅ Track account-specific permissions per group
- ✅ Track contact admin status per group

### 3. **Data Integrity**:
- ✅ Foreign key constraints ensure referential integrity
- ✅ Unique constraints prevent duplicates
- ✅ Cascade deletes handle cleanup

### 4. **Performance**:
- ✅ Indexed foreign keys for fast joins
- ✅ Denormalized `member_count` for quick access
- ✅ Indexed `group_id` for deduplication lookups

### 5. **Audit Trail**:
- ✅ Track when contacts were scraped
- ✅ Track when contacts left
- ✅ Track which account discovered/scraped groups

---

## 🚀 Migration Strategy

### Phase 1: Create New Tables
1. Create `mkt_wap_group_contacts`
2. Create `mkt_wap_group_account_access`

### Phase 2: Migrate Existing Data
1. Migrate `account_id` from `mkt_wap_groups` to `mkt_wap_group_account_access`
2. Migrate `group_memberships` from `mkt_wap_contacts` to `mkt_wap_group_contacts` (if data exists)

### Phase 3: Add New Columns
1. Add `last_scraped_at`, `contacts_count_at_last_scrape` to `mkt_wap_groups`
2. Add `is_hidden`, `is_admin_only_group`, `internal_description` to `mkt_wap_groups`

### Phase 4: Remove Deprecated Columns
1. Remove `account_id` from `mkt_wap_groups` (after migration)
2. Remove `group_memberships` from `mkt_wap_contacts` (after migration)

---

## 📝 Next Steps

1. ✅ **Schema Design** (This document)
2. ⏳ **Create Migration SQL** (`79_mkt_whatsapp_groups_enhancements.sql`)
3. ⏳ **Update Drizzle ORM Schema** (`apps/api/src/database/schema/whatsapp.ts`)
4. ⏳ **Update Service Layer** (`whatsapp-group.service.ts`)
5. ⏳ **Update API Endpoints** (`whatsapp.controller.ts`)
6. ⏳ **Update Frontend** (Admin UI for group management)

---

**Status:** ✅ Architecture Review Complete  
**Next:** Create Migration SQL File

---

**Last Updated:** December 31, 2025

