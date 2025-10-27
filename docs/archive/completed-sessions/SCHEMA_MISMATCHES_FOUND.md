# 🔴 CRITICAL SCHEMA MISMATCHES FOUND

**Date**: 2025-10-27  
**Status**: IMMEDIATE ACTION REQUIRED

---

## ❌ ISSUE #1: `profiles.is_verified` DOES NOT EXIST

### **Database Reality** (from livetables.sql line 1599-1631):
```sql
profiles:
- verification_level TEXT ('basic', 'verified', 'trusted') ✅ EXISTS (line 1616)
- is_verified ❌ DOES NOT EXIST
```

### **Files Using Wrong Field** (9 files):
1. ✅ `apps/web/src/lib/api/discovery.ts` - Type definition (line 24)
2. ❌ `apps/web/src/lib/api/discovery.ts` - Filter query (line 162)
3. ❌ `apps/web/src/lib/api/discovery.ts` - Sort query (line 175)
4. `apps/web/src/components/discovery/cards/MemberCard.tsx`
5. `apps/web/src/components/discovery/cards/BusinessCard.tsx`
6. `apps/web/src/components/discovery/cards/OrganizationCard.tsx`
7. `apps/web/src/components/discovery/cards/JobCard.tsx`
8. `apps/web/src/components/business/BusinessProfileView.tsx`
9. `apps/web/src/components/organization/OrganizationProfileView.tsx`

### **Fix Required**:
Replace all `is_verified` with `verification_level`:
- Filter: `verification_level != 'basic'` (means verified or trusted)
- Display: Show badge if `verification_level === 'verified' || verification_level === 'trusted'`

---

## ❌ ISSUE #2: Business & Organization Schema Mismatches

### **Business Profiles** (livetables.sql line 254-280):
```sql
business_profiles:
✅ is_verified boolean (line 269) - EXISTS
✅ business_type_id uuid (line 273) - EXISTS
✅ owner_id uuid (line 268) - EXISTS
```
**Status**: ✅ Schema is correct, RLS is the issue (already have fix SQL)

### **Organizations** (livetables.sql line 1146-1170):
```sql
organizations:
✅ is_verified boolean (line 1162) - EXISTS
✅ organization_type_id uuid (line 1166) - EXISTS
✅ creator_id uuid (line 1161) - EXISTS
```
**Status**: ✅ Schema is correct

---

## ✅ ISSUE #3: Fields That ARE Correct

### **profiles table**:
- ✅ `is_active` boolean (line 1628) - EXISTS
- ✅ `location_state` nullable (line 1606) - EXISTS
- ✅ `phone` nullable (line 1610) - EXISTS
- ✅ `cover_photo_url` (line 1622) - EXISTS

---

## 🔧 IMMEDIATE FIXES NEEDED

### **FIX 1: Update MemberResult Type**
```typescript
// apps/web/src/lib/api/discovery.ts
export interface MemberResult {
  id: string;
  full_name: string;
  headline: string | null;
  profile_slug: string;
  profile_photo_url: string | null;
  location_city: string | null;
  location_state: string | null;
  current_role: string | null;
  verification_level: 'basic' | 'verified' | 'trusted'; // ✅ CHANGE THIS
  connections_count?: number;
  followers_count?: number;
  rating?: number;
  review_count?: number;
}
```

### **FIX 2: Update Search Filters**
```typescript
// In searchMembers function
if (filters.verified) {
  // OLD: queryBuilder = queryBuilder.eq('is_verified', true);
  // NEW:
  queryBuilder = queryBuilder.in('verification_level', ['verified', 'trusted']);
}
```

### **FIX 3: Update Sort Logic**
```typescript
// OLD:
queryBuilder = queryBuilder.order('is_verified', { ascending: false });

// NEW:
queryBuilder = queryBuilder.order('verification_level', { ascending: false });
```

### **FIX 4: Update UI Components**
```typescript
// In MemberCard, BusinessCard, etc.
// OLD:
{member.is_verified && <VerifiedBadge />}

// NEW:
{(member.verification_level === 'verified' || member.verification_level === 'trusted') && (
  <VerifiedBadge level={member.verification_level} />
)}
```

---

## 📊 SCAN RESULTS SUMMARY

| Module | Issues Found | Priority | Status |
|--------|--------------|----------|--------|
| Profiles (Members) | ❌ is_verified field | 🔴 CRITICAL | Not Fixed |
| Business Profiles | ✅ Schema OK, RLS issue | 🟡 HIGH | SQL Ready |
| Organizations | ✅ Schema OK | 🟢 LOW | OK |
| Products | Not Scanned | 🟡 MEDIUM | Pending |
| Events | Not Scanned | 🟡 MEDIUM | Pending |
| Jobs | ❌ is_verified in company | 🔴 CRITICAL | Not Fixed |
| Messaging | Not Scanned | 🟢 LOW | Likely OK |
| Stream | Not Scanned | 🟢 LOW | Likely OK |

---

## 🎯 NEXT ACTIONS

### **Option A: Fix Critical Issues Only (30 mins)**
1. Fix profiles.is_verified → verification_level (9 files)
2. Execute FIX_DISCOVERY_AND_BUSINESS.sql
3. Test member listing
4. Test business creation

### **Option B: Complete Review (3 hours)**
Follow full SCHEMA_CODE_REVIEW_PLAN.md

### **Option C: I Fix Everything Now (1 hour)**
I systematically fix all 9 files + create comprehensive fixes

---

## ⚠️ RECOMMENDATION

**Start with Option C** - Let me fix all the critical issues now:
1. Update all type definitions
2. Update all queries
3. Update all components
4. Test each module
5. Document everything

This will save you from debugging one issue at a time.

**Your call - which option?**

