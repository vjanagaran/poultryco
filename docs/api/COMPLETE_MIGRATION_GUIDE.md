# Complete Supabase to REST API Migration Guide

**Date:** January 2025  
**Status:** Core Migration Complete, Component Migration In Progress

## Migration Pattern

All Supabase references should be replaced with REST API calls following this pattern:

### 1. Replace Imports
```typescript
// Before
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// After
import { apiClient } from '@/lib/api/client';
// or use specific API functions
import { getBusinessBySlug } from '@/lib/api/businesses';
```

### 2. Replace Queries
```typescript
// Before
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', id)
  .single();

// After
const data = await apiClient.get(`/endpoint/${id}`);
```

### 3. Replace Auth Calls
```typescript
// Before
const { data: { user } } = await supabase.auth.getUser();

// After
const { user } = useAuth(); // Use context
// or
const user = await apiClient.get('/auth/me');
```

## Remaining Files to Migrate

### Web App Components (31 files)

#### Business Components (14 files)
- `apps/web/src/components/business/BusinessProfileView.tsx` - Partially migrated
- `apps/web/src/components/business/BusinessEditContent.tsx`
- `apps/web/src/components/business/BusinessCreationWizard.tsx`
- `apps/web/src/components/business/sections/BusinessHeader.tsx`
- `apps/web/src/components/business/sections/BusinessContactSection.tsx`
- `apps/web/src/components/business/modals/InviteTeamMemberModal.tsx`
- `apps/web/src/components/business/modals/EditTeamMemberModal.tsx`
- `apps/web/src/components/business/modals/EditProductModal.tsx`
- `apps/web/src/components/business/modals/EditLocationModal.tsx`
- `apps/web/src/components/business/modals/EditCertificationModal.tsx`
- `apps/web/src/components/business/modals/AssignContactPersonModal.tsx`
- `apps/web/src/components/business/modals/AddProductModal.tsx`
- `apps/web/src/components/business/modals/AddLocationModal.tsx`
- `apps/web/src/components/business/modals/AddCertificationModal.tsx`

#### Organization Components (3 files)
- `apps/web/src/components/organization/OrganizationProfileView.tsx`
- `apps/web/src/components/organization/OrganizationEditContent.tsx`
- `apps/web/src/components/organization/OrganizationCreationWizard.tsx`

#### Profile Components (2 files)
- `apps/web/src/components/profile/ProfileWizard.tsx`
- `apps/web/src/components/profile/steps/PhotoHeadlineStep.tsx`

#### Other Components (12 files)
- `apps/web/src/components/messages/MessageSearch.tsx`
- `apps/web/src/components/messages/GroupCreationModal.tsx`
- `apps/web/src/components/messages/ContactInfo.tsx`
- `apps/web/src/components/connections/PendingConnectionsList.tsx`
- `apps/web/src/components/forms/EarlyAccessForm.tsx`
- `apps/web/src/components/forms/ContactForm.tsx`
- Plus 6 more files

### Admin App Components (13 files)
- `apps/admin/src/lib/hooks/useContentCampaigns.ts`
- `apps/admin/src/app/(dashboard)/marketing/ideas/new/page.tsx`
- `apps/admin/src/app/(dashboard)/blog/new/page.tsx`
- `apps/admin/src/app/(dashboard)/blog/[id]/edit/page.tsx`
- `apps/admin/src/app/(dashboard)/marketing/pillars/new/page.tsx`
- `apps/admin/src/app/(dashboard)/marketing/pillars/[id]/page.tsx`
- `apps/admin/src/app/(dashboard)/marketing/ideas/[id]/page.tsx`
- `apps/admin/src/app/(dashboard)/marketing/content/new/page.tsx`
- `apps/admin/src/app/(dashboard)/marketing/content/[id]/page.tsx`
- `apps/admin/src/app/(dashboard)/marketing/calendar/new/page.tsx`
- `apps/admin/src/app/(dashboard)/marketing/calendar/[id]/page.tsx`
- `apps/admin/src/app/(dashboard)/email-campaigns/templates/new/page.tsx`
- `apps/admin/src/app/(dashboard)/email-campaigns/new/page.tsx`

## API Endpoints Available

All necessary endpoints are implemented:
- `/users/*` - User profiles, search, preferences
- `/businesses/*` - Business profiles, search, CRUD
- `/organizations/*` - Organization profiles, search, CRUD
- `/messages/*` - Conversations, messages
- `/notifications/*` - Notifications, preferences
- `/social/*` - Posts, connections, feed
- `/marketplace/*` - Products, categories
- `/events/*` - Events, registrations
- `/jobs/*` - Job postings, applications

## Migration Checklist

- [x] Core API clients migrated
- [x] Service files migrated
- [x] Hooks migrated
- [x] Message components migrated
- [x] Member directory migrated
- [x] Layout components migrated
- [ ] Business components (14 files)
- [ ] Organization components (3 files)
- [ ] Profile components (2 files)
- [ ] Other components (12 files)
- [ ] Admin components (13 files)
- [ ] Remove Supabase packages

## Next Steps

1. Continue migrating components incrementally
2. Test each migrated component
3. Remove Supabase packages after all migrations complete
4. Delete `apps/web/src/lib/supabase/` directory
5. Delete `apps/admin/src/lib/supabase/` directory (if exists)

