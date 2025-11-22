# 📋 NECC Schema Changes Summary

**Date:** January 2025  
**Status:** Refactored per requirements

---

## ✅ CHANGES IMPLEMENTED

### 1. **Separated Engagement System** ✅
- **New File:** `51_shared_engagement_system.sql`
- **Removed from:** `50_necc_system.sql`
- **Rationale:** Better organization, reusable across all modules

### 2. **Entity Types as Separate Table** ✅
- **Table:** `entity_types` (type TEXT PRIMARY KEY, description, module)
- **FK Reference:** All engagement tables reference `entity_types(type)`
- **Benefits:**
  - Centralized type definitions
  - Easy to add new entity types
  - Self-documenting with descriptions
  - Module grouping for better organization

### 3. **Removed Feature Flags Table** ✅
- **Removed:** `feature_flags` table and all related code
- **Rationale:** Dev progress tracking, not needed in production
- **Alternative:** Control via environment variables if needed

### 4. **Migration Strategy** ✅
- **New File:** `52_migrate_posts_to_engagement.sql`
- **Purpose:** Migrate existing `post_likes`, `post_comments`, `post_shares` to shared system
- **Process:**
  1. Migrate data to new tables
  2. Verify migration success
  3. Drop old tables and triggers

---

## 📁 FILE STRUCTURE

### New Files
1. **`51_shared_engagement_system.sql`**
   - Entity types table
   - Entity likes table
   - Entity comments table
   - Entity shares table
   - Triggers for post engagement counts
   - RLS policies

2. ~~`52_migrate_posts_to_engagement.sql`~~ (Removed - no data to migrate in new system)

### Updated Files
1. **`50_necc_system.sql`**
   - Removed engagement system (moved to 51)
   - Removed feature flags
   - Only NECC-specific tables now

---

## 🔄 SETUP PROCESS

### Step 1: Apply New Schema
```sql
-- Run in order:
1. 51_shared_engagement_system.sql (creates engagement system + drops old post_* tables)
2. 50_necc_system.sql (NECC-specific tables)
```

### Step 2: Update Application Code
- Update API functions to use `entity_likes`, `entity_comments`, `entity_shares`
- Update queries to use `entity_type` and `entity_id`
- Remove references to old `post_likes`, `post_comments`, `post_shares` tables

---

## 🎯 KEY IMPROVEMENTS

### 1. Entity Types Table
**Before:**
```sql
entity_type TEXT NOT NULL CHECK (entity_type IN ('post', 'necc_annotation', ...))
```

**After:**
```sql
entity_type TEXT NOT NULL REFERENCES entity_types(type)
```

**Benefits:**
- ✅ Centralized definitions
- ✅ Easy to add new types
- ✅ Self-documenting
- ✅ Module grouping

### 2. Unified Engagement System
**Before:**
- `post_likes`, `post_comments`, `post_shares` (module-specific)
- Separate tables for each module

**After:**
- `entity_likes`, `entity_comments`, `entity_shares` (shared)
- Single set of tables for all modules

**Benefits:**
- ✅ Consistent API across modules
- ✅ Unified analytics
- ✅ Easier maintenance
- ✅ Scalable for future modules

### 3. Removed Feature Flags
**Before:**
- Database table for feature flags
- Queries to check flags

**After:**
- Environment variables for control
- UI updates directly as features complete

**Benefits:**
- ✅ Simpler schema
- ✅ No unnecessary queries
- ✅ Direct control via code

---

## 📊 ENTITY TYPES DEFINED

| Type | Description | Module |
|------|-------------|--------|
| `post` | Social media posts | posts |
| `post_comment` | Comments on posts | posts |
| `necc_annotation` | Expert annotations | necc |
| `necc_prediction` | Price predictions | necc |
| `necc_blog_post` | Blog posts | necc |
| `breed_standard` | Breed standards | breed_standards |
| `native_bird` | Native birds | native_birds |
| `medication` | Medications | medications |
| `organic_alternative` | Organic alternatives | organic_alternatives |
| `global_data` | Global data | global_data |

---

## ⚠️ BREAKING CHANGES

### Application Code Updates Required

1. **API Functions:**
   - Update all queries from `post_likes` → `entity_likes WHERE entity_type = 'post'`
   - Update all queries from `post_comments` → `entity_comments WHERE entity_type = 'post'`
   - Update all queries from `post_shares` → `entity_shares WHERE entity_type = 'post'`

2. **Component Updates:**
   - Update `PostCard` component to use new engagement system
   - Update comment components
   - Update like/share buttons

3. **Scraper Function:**
   - Removed feature flag check
   - Now uses environment variable `NECC_SCRAPER_ENABLED`

---

## ✅ VERIFICATION CHECKLIST

- [ ] Schema files created (51, 50 updated)
- [ ] Entity types table populated
- [ ] Engagement tables created
- [ ] Old post_* tables dropped
- [ ] Triggers for post counts working
- [ ] RLS policies applied
- [ ] Application code updated
- [ ] Scraper function updated

---

## 📝 NEXT STEPS

1. **Review schemas** - Ensure all requirements met
2. **Apply schemas** - Run 51 then 50 in Supabase SQL Editor
3. **Update application code** - Use new engagement system
4. **Deploy** - Apply to production

---

**Status:** ✅ Ready for Review  
**Next:** Apply schemas and test migration

