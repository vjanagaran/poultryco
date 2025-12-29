# Supabase to REST API Migration - Status Report

**Date:** January 2025  
**Status:** In Progress (Critical Files Migrated)

## Summary

This document tracks the migration from Supabase to REST API for `apps/web` and `apps/admin`.

## ✅ Completed Migrations

### apps/admin
- ✅ **Blog CMS** - Posts, categories, tags migrated to REST API
- ✅ **Content Tags** - Migrated to REST API
- ✅ **Image Uploads** - Migrated to S3 via API
- ✅ **NECC Module** - Dashboard, zones, prices pages migrated
- ✅ **Admin Auth** - Migrated to JWT via API
- ✅ **NECC API Routes** - All admin API routes migrated (`/api/admin/necc/*`)
- ✅ **NECC Scraper** - Deprecated, now uses API endpoint

### apps/web
- ✅ **Image Uploads** - `imageUtils.ts`, `storageUtils.ts`, `mediaStorageService.ts`
- ✅ **Newsletter** - Footer component migrated
- ✅ **Dashboard** - `DashboardContent.tsx` migrated to use API
- ✅ **Welcome Flow** - `WelcomeFlow.tsx` migrated to use API
- ✅ **Supabase Client Stub** - Created to prevent build errors

## 🔄 Remaining Files (Require API Endpoints)

### apps/web (High Priority)
These files need API endpoints to be implemented first:

1. **Discovery/Search** (`src/lib/api/discovery.ts`)
   - Needs: `/users/search`, `/businesses/search`, `/products/search`, etc.
   - Status: API endpoints not yet implemented

2. **Notifications** (`src/lib/notificationService.ts`)
   - Needs: `/notifications/*` endpoints
   - Status: API endpoints not yet implemented (TODO in controller)

3. **Messaging** (`src/lib/messagingUtils.ts`)
   - Needs: `/messages/*` endpoints
   - Status: API endpoints not yet implemented (TODO in controller)

4. **Stream/Posts** (`src/lib/streamUtils.tsx`, `streamSyncService.ts`)
   - Needs: `/social/posts/*` endpoints
   - Status: API endpoints not yet implemented (TODO in controller)

5. **Email Preferences** (`src/lib/api/email-preferences.ts`)
   - Needs: `/users/me/email-preferences` endpoint
   - Status: API endpoint not yet implemented

6. **Connection Stats** (`src/hooks/useConnectionStats.ts`)
   - Needs: `/social/connections/stats` endpoint
   - Status: API endpoint not yet implemented

### apps/web (Components - 60+ files)
Many components still use Supabase but can be migrated once API endpoints are available:
- Profile components
- Business components
- Organization components
- Message components
- Connection components

### apps/admin (Remaining)
1. **Marketing Pages** - Pillars, ideas, content pages
   - Needs: Marketing API endpoints
   - Status: Some endpoints exist, need to verify

2. **Blog Edit Page** - Still uses Supabase
   - Needs: Blog API endpoints (should exist)
   - Status: Verify and migrate

3. **Content Campaigns Hook** - `useContentCampaigns.ts`
   - Needs: Campaign API endpoints
   - Status: Verify and migrate

## 📦 Package Cleanup

### Removed
- ✅ `supabase` package from root `package.json`

### To Remove (After Migration Complete)
- `@supabase/supabase-js` (if installed in any workspace)
- `@supabase/ssr` (if installed in any workspace)

## 🗑️ Files to Delete (After Migration Complete)

### apps/web
- `src/lib/supabase/client.ts` (currently a stub)
- `src/lib/supabase/server.ts`
- `src/lib/supabase/storage.ts`
- `src/lib/supabase.ts`

### apps/admin
- Any Supabase client files (if they exist)

## 📋 Next Steps

### Phase 1: Implement Missing API Endpoints
1. **Discovery/Search** - Implement search endpoints in API
2. **Notifications** - Implement notification endpoints
3. **Messaging** - Implement message endpoints
4. **Social/Stream** - Implement post/stream endpoints
5. **Email Preferences** - Implement email preferences endpoint

### Phase 2: Migrate Remaining Files
1. Migrate discovery API client
2. Migrate notification service
3. Migrate messaging utils
4. Migrate stream utils
5. Migrate all component files

### Phase 3: Cleanup
1. Remove Supabase packages
2. Delete Supabase client files
3. Update documentation
4. Test all functionality

## 🔍 How to Check Migration Status

```bash
# Find all Supabase references in apps/web
grep -r "supabase\|@supabase\|createClient" apps/web/src --include="*.ts" --include="*.tsx" | wc -l

# Find all Supabase references in apps/admin
grep -r "supabase\|@supabase\|createClient" apps/admin/src --include="*.ts" --include="*.tsx" | wc -l
```

## 📝 Notes

- The Supabase client stub in `apps/web/src/lib/supabase/client.ts` prevents build errors during migration
- Many files can be migrated once API endpoints are implemented
- Focus on implementing API endpoints first, then migrate files systematically
- Test each migration incrementally

