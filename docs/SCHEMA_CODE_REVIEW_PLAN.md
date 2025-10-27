# 🔍 SCHEMA-CODE MISMATCH REVIEW PLAN
**Date**: 2025-10-27  
**Priority**: CRITICAL  
**Estimated Time**: 2-3 hours

---

## 🎯 OBJECTIVE
Identify and fix ALL mismatches between:
1. **Database Schema** (supabase/dump/livetables.sql)
2. **TypeScript Types** (packages/types/src/)
3. **API Queries** (apps/web/src/lib/api/)
4. **Components** (apps/web/src/components/)

---

## 📋 REVIEW PLAN (8 STEPS)

### **STEP 1: Profile System** ⭐ CRITICAL
**Scope**: Personal profiles, discovery, member listing

**Schema Issues Found**:
- ✅ `profiles.is_active` exists (line 1628)
- ❌ `profiles.is_verified` DOES NOT EXIST
- ✅ `profiles.location_state` is nullable (line 1606)
- ✅ `profiles.phone` is nullable (line 1610)

**Files to Review**:
- [ ] `apps/web/src/lib/api/discovery.ts` (Member search)
- [ ] `packages/types/src/profiles.ts` (Type definitions)
- [ ] `apps/web/src/components/discovery/cards/MemberCard.tsx`
- [ ] `apps/web/src/components/profile/ProfileView.tsx`

**Expected Issues**:
- Using `is_verified` field that doesn't exist
- Should use `verification_level` instead ('basic', 'verified', 'trusted')

---

### **STEP 2: Business Profiles** ⭐ CRITICAL
**Scope**: Business discovery, creation, management

**Schema Reality** (from livetables.sql):
```sql
business_profiles:
- business_type (CHECK constraint, not business_type_id initially)
- business_type_id uuid (line 273) ✅
- is_verified boolean (line 269) ✅
- owner_id uuid (line 268) ✅
```

**Files to Review**:
- [ ] `apps/web/src/lib/api/discovery.ts` (Business search)
- [ ] `packages/types/src/business.ts`
- [ ] `apps/web/src/app/(platform)/com/create/page.tsx`
- [ ] `apps/web/src/components/business/BusinessView.tsx`
- [ ] `apps/web/src/components/discovery/cards/BusinessCard.tsx`

**Expected Issues**:
- Field name mismatches in queries
- Type mismatches in components

---

### **STEP 3: Organization Profiles** ⭐ CRITICAL
**Scope**: Organization discovery, events, membership

**Schema Reality**:
```sql
organizations:
- organization_type (CHECK constraint)
- organization_type_id uuid (line 1166) ✅
- is_verified boolean (line 1162) ✅
- creator_id uuid (line 1161) ✅
```

**Files to Review**:
- [ ] `apps/web/src/lib/api/discovery.ts` (Organization search)
- [ ] `packages/types/src/organization.ts`
- [ ] `apps/web/src/app/(platform)/org/create/page.tsx`
- [ ] `apps/web/src/components/organization/OrganizationView.tsx`

---

### **STEP 4: Products & Marketplace** 
**Scope**: Product listing, search, categories

**Schema Reality**:
```sql
business_products:
- primary_category_id uuid (line 243) ✅
- category_path uuid[] (line 244) ✅
- product_category text (CHECK constraint, line 224)
- is_available boolean (line 233) ✅
- is_published boolean (line 237) ✅
```

**Files to Review**:
- [ ] `apps/web/src/lib/api/discovery.ts` (Product search)
- [ ] `packages/types/src/product.ts`
- [ ] `apps/web/src/components/business/ProductsList.tsx`
- [ ] `apps/web/src/components/discovery/cards/ProductCard.tsx`

---

### **STEP 5: Events & Jobs**
**Scope**: Event listings, job postings

**Schema Reality**:
```sql
organization_events:
- event_type_id uuid (line 962) ✅
- event_type text (CHECK constraint, line 932)
- location_place_id varchar (line 963) ✅
- location_coordinates (USER-DEFINED, line 967) ✅

business_jobs:
- job_type_id uuid (line 187) ✅
- job_type text (CHECK constraint, line 160)
- location_coordinates (USER-DEFINED, line 192) ✅
```

**Files to Review**:
- [ ] `apps/web/src/lib/api/discovery.ts` (Events, Jobs search)
- [ ] `packages/types/src/events.ts`
- [ ] `packages/types/src/jobs.ts`

---

### **STEP 6: Messaging System**
**Scope**: Conversations, messages, participants

**Schema Reality**: ✅ **Looks correct** (no immediate issues found)

**Quick Verify**:
- [ ] `apps/web/src/lib/api/messages.ts`
- [ ] `packages/types/src/messaging.ts`

---

### **STEP 7: Stream (Social Feed)**
**Scope**: Posts, comments, likes, shares

**Schema Reality**: ✅ **Looks correct** (no immediate issues found)

**Quick Verify**:
- [ ] `apps/web/src/lib/api/stream.ts`
- [ ] `packages/types/src/posts.ts`

---

### **STEP 8: Notifications**
**Scope**: Notification system, preferences

**Schema Reality**: ✅ **Looks correct** (no immediate issues found)

**Quick Verify**:
- [ ] `apps/web/src/lib/api/notifications.ts`
- [ ] `packages/types/src/notifications.ts`

---

## 🔧 EXECUTION STRATEGY

### **Phase 1: Quick Scan (30 mins)**
Run automated checks:
```bash
# Search for common mismatch patterns
grep -r "is_verified" apps/web/src/
grep -r "\.verified" apps/web/src/
grep -r "business_type_id" apps/web/src/
grep -r "organization_type_id" apps/web/src/
```

### **Phase 2: Systematic Review (90 mins)**
For each step above:
1. Read the actual schema from livetables.sql
2. Check TypeScript types match
3. Check API queries match
4. Check components use correct fields
5. Document all mismatches

### **Phase 3: Fix All Issues (60 mins)**
Create fixes:
1. Update TypeScript types first
2. Update API queries
3. Update components
4. Test each module

---

## 📊 TRACKING TEMPLATE

```markdown
### Module: [NAME]
**Status**: 🔴 Issues Found / 🟡 In Progress / 🟢 Fixed

**Schema Fields** (from livetables.sql):
- field_name: type (nullable/not null)

**Type Definition** (packages/types):
- field_name: TypeScriptType

**Mismatches Found**:
1. Issue description
   - File: path/to/file.ts
   - Line: 123
   - Fix: What needs to change

**Test Cases**:
- [ ] Query returns data
- [ ] UI displays correctly
- [ ] No console errors
```

---

## 🎯 IMMEDIATE ACTION (First 5 Issues to Fix)

### 1. ❌ **profiles.is_verified** - DOES NOT EXIST
**Replace with**: `verification_level` ('basic', 'verified', 'trusted')

**Files to fix**:
- `apps/web/src/lib/api/discovery.ts` - Remove any is_verified checks
- `apps/web/src/components/discovery/cards/MemberCard.tsx` - Use verification_level
- Any badges/verified icons - Check verification_level !== 'basic'

### 2. ❌ **Discovery API using wrong fields**
**Files**:
- `apps/web/src/lib/api/discovery.ts`

### 3. ✅ **profiles.is_active** - EXISTS (line 1628)
- Already fixed in code

### 4. ❌ **Business profiles RLS** - Still blocking
- Already created FIX_DISCOVERY_AND_BUSINESS.sql

### 5. ❌ **Type definitions out of sync**
**Files**:
- `packages/types/src/profiles.ts`
- `packages/types/src/business.ts`
- `packages/types/src/organization.ts`

---

## 🚀 OUTPUT DELIVERABLES

After review completion:
1. ✅ **SCHEMA_REVIEW_REPORT.md** - All findings documented
2. ✅ **FIX_ALL_SCHEMA_MISMATCHES.sql** - Any DB changes needed
3. ✅ **Updated TypeScript types** - All type files corrected
4. ✅ **Updated API queries** - All queries corrected
5. ✅ **Test script** - Verify all modules work

---

## ⏱️ ESTIMATED TIME BREAKDOWN

| Phase | Time | Description |
|-------|------|-------------|
| Setup & Planning | 15 min | Read schema, understand structure |
| Step 1: Profiles | 30 min | Most critical, affects everything |
| Step 2: Business | 25 min | Second priority |
| Step 3: Organizations | 20 min | Third priority |
| Step 4-5: Products/Events | 30 min | Medium priority |
| Step 6-8: Quick verify | 20 min | Low priority (likely OK) |
| **Phase 1 Total** | **2h 20min** | **Discovery & Documentation** |
| Create fixes | 45 min | Write all fixes |
| Testing | 30 min | Verify fixes work |
| **Phase 2 Total** | **1h 15min** | **Implementation & Testing** |
| **GRAND TOTAL** | **~3.5 hours** | **Complete review & fix** |

---

## 🎬 LET'S START?

**Option A**: I start immediately with automated scans  
**Option B**: You want to review the plan first  
**Option C**: You want to prioritize specific modules only

What's your preference?

