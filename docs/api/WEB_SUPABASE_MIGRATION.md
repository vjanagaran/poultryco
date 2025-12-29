# Web App Supabase to REST API Migration

**Date:** December 27, 2025  
**Status:** In Progress

---

## Overview

This document tracks the migration of `apps/web` from Supabase to the REST API.

---

## Migration Progress

### ✅ Completed

1. **API Client Infrastructure**
   - ✅ `lib/api/client.ts` - Base API client
   - ✅ `lib/api/upload.ts` - Upload functions
   - ✅ `lib/api/users.ts` - User/profile functions
   - ✅ `lib/api/messages.ts` - Messaging functions
   - ✅ `lib/api/connections.ts` - Connection functions
   - ✅ `lib/api/social.ts` - Social feed functions
   - ✅ `lib/api/discovery.ts` - Discovery functions
   - ✅ `lib/api/necc-prices.ts` - NECC price functions
   - ✅ `lib/api/necc-zones.ts` - NECC zone functions

2. **Storage Utilities**
   - ✅ `lib/storage/imageUtils.ts` - Updated to use API
   - ✅ `lib/storageUtils.ts` - Updated to use API

### 🚧 In Progress

3. **Media Storage Service**
   - ⏳ `lib/mediaStorageService.ts` - Needs update

### ⏳ Pending

3. **Auth & User Management**
   - ⏳ `lib/auth/cognito.ts` - Already uses Cognito
   - ⏳ `contexts/AuthContext.tsx` - May need updates
   - ⏳ Components using `supabase.auth.getUser()`

4. **Messaging**
   - ⏳ `lib/messagingUtils.ts` - Partially migrated
   - ⏳ `components/messages/*` - Need review

5. **Notifications**
   - ⏳ `lib/notificationService.ts` - Needs update

6. **Stream/Feed**
   - ⏳ `lib/streamUtils.tsx` - Needs update
   - ⏳ `lib/streamSyncService.ts` - Needs update
   - ⏳ `components/stream/*` - Need review

7. **Discovery**
   - ⏳ `lib/api/discovery.ts` - Already has API client, but may need updates
   - ⏳ `components/discovery/*` - Need review

8. **Components**
   - ⏳ `components/welcome/WelcomeFlow.tsx`
   - ⏳ `components/dashboard/DashboardContent.tsx`
   - ⏳ `components/profile/*`
   - ⏳ `components/connections/*`
   - ⏳ All other components using Supabase

9. **Cleanup**
    - ⏳ Remove `lib/supabase/` directory
    - ⏳ Remove Supabase from `package.json`
    - ⏳ Update `.env.example`

---

## Migration Patterns

### Pattern 1: Replace Supabase Storage
```typescript
// Before
const supabase = createClient();
const { error } = await supabase.storage
  .from('bucket')
  .upload(path, file);

// After
import { uploadProfilePhoto, uploadCoverPhoto, uploadPostMedia } from '@/lib/api/upload';
const result = await uploadProfilePhoto(file);
// result.url or result.cdnUrl
```

### Pattern 2: Replace Supabase Auth
```typescript
// Before
const { data: { user } } = await supabase.auth.getUser();

// After
import { apiClient } from '@/lib/api/client';
const user = await apiClient.get('/auth/me');
```

### Pattern 3: Replace Supabase Database Queries
```typescript
// Before
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('field', value);

// After
import { getFunction } from '@/lib/api/module';
const data = await getFunction(params);
```

---

## Files Requiring Migration

### High Priority (Core Functionality)

1. `lib/mediaStorageService.ts` - Media uploads for messaging
2. `lib/messagingUtils.ts` - Message sending/receiving
3. `lib/notificationService.ts` - Notifications
4. `lib/streamUtils.tsx` - Stream/feed operations
5. `lib/streamSyncService.ts` - Stream sync

### Medium Priority (Components)

6. `components/welcome/WelcomeFlow.tsx`
7. `components/dashboard/DashboardContent.tsx`
8. `components/profile/*` - Profile management
9. `components/connections/*` - Connection management
10. `components/messages/*` - Messaging UI
11. `components/stream/*` - Stream/feed UI
12. `components/discovery/*` - Discovery UI

### Low Priority (Utilities)

13. `lib/api/discovery.ts` - May already be migrated
14. `lib/api/email-preferences.ts` - Email preferences
15. `hooks/useConnectionStats.ts` - Connection stats hook

---

## Next Steps

1. ✅ Complete `mediaStorageService.ts` migration
2. ✅ Create `.env.example`
3. Update messaging utilities (`lib/messagingUtils.ts`)
4. Update notification service (`lib/notificationService.ts`)
5. Update stream utilities (`lib/streamUtils.tsx`, `lib/streamSyncService.ts`)
6. Update components systematically (all components using Supabase)
7. Remove Supabase dependencies from `package.json`
8. Remove `lib/supabase/` directory

---

**Last Updated:** December 27, 2025

