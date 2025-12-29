# Supabase to REST API Migration - Complete Status

**Date:** January 2025  
**Status:** In Progress

## Overview

This document tracks the complete migration from Supabase to the REST API for `apps/web` and `apps/admin`.

## Migration Progress

### ✅ Completed

#### apps/admin
- ✅ Blog posts, categories, tags (migrated to REST API)
- ✅ Content tags (migrated to REST API)
- ✅ Image uploads (migrated to S3 via API)
- ✅ NECC dashboard, zones, prices pages (migrated to REST API)
- ✅ Admin authentication (migrated to JWT via API)

#### apps/web
- ✅ Image uploads (`imageUtils.ts`, `storageUtils.ts`, `mediaStorageService.ts`)
- ✅ Newsletter subscription (Footer component)
- ✅ Supabase client stub created (prevents build errors)

### 🔄 In Progress

#### apps/web - Critical Files
- [ ] `src/components/dashboard/DashboardContent.tsx` - Uses Supabase for auth and profile
- [ ] `src/lib/api/discovery.ts` - Uses Supabase for search/discovery
- [ ] `src/lib/notificationService.ts` - Uses Supabase for notifications
- [ ] `src/lib/messagingUtils.ts` - Uses Supabase for messaging
- [ ] `src/lib/streamUtils.tsx` - Uses Supabase for stream/posts
- [ ] `src/lib/streamSyncService.ts` - Uses Supabase for stream sync
- [ ] `src/lib/api/email-preferences.ts` - Uses Supabase
- [ ] `src/hooks/useConnectionStats.ts` - Uses Supabase
- [ ] Multiple component files (71 files total)

#### apps/admin - Remaining Files
- [ ] `src/lib/scraper/necc-month-scraper.ts` - Deprecated, should be removed
- [ ] `src/lib/hooks/useContentCampaigns.ts` - Uses Supabase
- [ ] `src/app/api/admin/necc/*` - API routes using Supabase
- [ ] Marketing pages (pillars, ideas, content) - Uses Supabase
- [ ] Blog edit page - Uses Supabase

### 📋 Migration Strategy

1. **Priority 1: Core Services**
   - Auth (already using Cognito for web)
   - API client functions
   - Upload services

2. **Priority 2: Data Fetching**
   - Discovery/search
   - Notifications
   - Messaging
   - Stream/posts

3. **Priority 3: Components**
   - Dashboard
   - Profile pages
   - Business pages
   - Organization pages

4. **Priority 4: Cleanup**
   - Remove Supabase packages
   - Delete Supabase client files
   - Update documentation

## Files to Migrate

### apps/web (71 files)
See detailed list in migration tracking.

### apps/admin (26 files)
See detailed list in migration tracking.

## Next Steps

1. Migrate core services (discovery, notifications, messaging)
2. Migrate components systematically
3. Remove Supabase packages
4. Delete Supabase files
5. Update documentation

