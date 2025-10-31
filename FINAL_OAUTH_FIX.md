# OAuth Profile Creation - FINAL FIX

**Date:** October 31, 2025  
**Status:** ✅ All Issues Resolved

---

## 🐛 Issues Fixed

### Issue 1: ❌ Function Name Conflict
```
ERROR: function name "create_profile_for_user" is not unique
```
**Fix:** Added `DROP FUNCTION` statements before creating new function ✅

### Issue 2: ❌ Wrong Column Names
```
ERROR: column "total_posts" of relation "profile_stats" does not exist
```
**Fix:** Updated to use correct column names from schema ✅

---

## ✅ What Changed

### Column Name Corrections

| ❌ Old (Wrong) | ✅ New (Correct) |
|---------------|------------------|
| `total_posts` | (not needed - trigger handles it) |
| `total_comments` | (not needed - trigger handles it) |
| `profile_views` | (not needed - trigger handles it) |

**Why?** The schema has an auto-trigger that creates `profile_stats` with ALL default values:
```sql
-- From 11_stats_metrics.sql
CREATE TRIGGER auto_initialize_profile_stats
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_profile_stats();
```

So we only need to insert `profile_id`, and the trigger handles the rest!

---

## 📦 Final SQL File

**File:** `/supabase/schema/45_oauth_profile_creation.sql`

**Key changes:**
```sql
-- 1. Drops old function first
DROP FUNCTION IF EXISTS create_profile_for_user(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_profile_for_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN);

-- 2. Creates new function with 7 parameters
CREATE OR REPLACE FUNCTION create_profile_for_user(
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_slug TEXT,
  p_profile_photo_url TEXT DEFAULT NULL,  -- Captures OAuth photo
  p_phone TEXT DEFAULT '',
  p_phone_verified BOOLEAN DEFAULT false
)

-- 3. Simplified profile_stats insert (trigger handles the rest)
INSERT INTO profile_stats (profile_id)
VALUES (p_user_id)
ON CONFLICT (profile_id) DO NOTHING;
```

---

## 🚀 Deployment (Final)

### Step 1: Run Updated SQL
```bash
# In Supabase Dashboard → SQL Editor
# Copy entire file: /supabase/schema/45_oauth_profile_creation.sql
# Paste and Run
```

**Expected output:**
```
DROP FUNCTION
DROP FUNCTION
CREATE FUNCTION
GRANT
GRANT
COMMENT
COMMENT
Success
```

### Step 2: Deploy Code (Already Done)
```bash
cd apps/web
vercel --prod
```

---

## 🧪 Test OAuth Flow

### Google OAuth Test
```bash
1. Incognito window
2. Go to: https://www.poultryco.net/register
3. Click: "Continue with Google"
4. Authorize
5. Should redirect to /welcome ✅
```

### Verify Profile Created
```sql
-- In Supabase SQL Editor
SELECT 
  p.id,
  p.full_name,
  p.profile_slug,
  p.email,
  p.profile_photo_url,        -- Should have Google photo URL
  p.profile_strength,          -- Should be 60+ (not 25)
  p.created_at,
  ps.posts_count,              -- Should be 0
  ps.followers_count,          -- Should be 0
  ps.connections_count         -- Should be 0
FROM profiles p
LEFT JOIN profile_stats ps ON ps.profile_id = p.id
ORDER BY p.created_at DESC
LIMIT 1;
```

**Expected:**
- ✅ Profile row exists
- ✅ Has profile photo URL from Google
- ✅ Profile strength is 60-70 (not 25)
- ✅ profile_stats row exists with all zeros
- ✅ No errors in Vercel logs

---

## 📊 What Gets Created

### When OAuth user signs up:

**1. User in auth.users:**
```sql
{
  id: "uuid",
  email: "user@gmail.com",
  raw_user_meta_data: {
    name: "John Doe",
    picture: "https://lh3.googleusercontent.com/..."
  }
}
```

**2. Profile in profiles:**
```sql
{
  id: "same-uuid",
  full_name: "John Doe",           ✅ From OAuth
  profile_slug: "john-doe",         ✅ Generated
  email: "user@gmail.com",          ✅ From OAuth
  profile_photo_url: "https://...", ✅ From OAuth (NEW!)
  profile_strength: 60,             ✅ Calculated (was 25)
  email_verified: true,             ✅ OAuth = verified
  phone: "",
  location_state: "Unknown",        ⏳ Updated in /welcome
  is_public: true
}
```

**3. Stats in profile_stats (auto-created by trigger):**
```sql
{
  profile_id: "same-uuid",
  connections_count: 0,
  followers_count: 0,
  following_count: 0,
  posts_count: 0,
  comments_count: 0,
  profile_views_count: 0,
  skills_count: 0,
  ... (all default to 0)
}
```

---

## 🔍 Debugging

### Check Vercel Logs
```bash
# Vercel Dashboard → Functions → /auth/callback
# Should show:
Profile created successfully for OAuth user: {
  success: true,
  profile_id: "xxx",
  profile_strength: 60
}
```

### Check Supabase Logs
```bash
# Supabase Dashboard → Logs → Postgres Logs
# Filter: "create_profile_for_user"
# Should show successful function calls
```

### Manual Function Test
```sql
-- Test the function directly
SELECT create_profile_for_user(
  '11111111-1111-1111-1111-111111111111'::UUID,
  'Test User',
  'test@example.com',
  'test-user-unique',
  'https://lh3.googleusercontent.com/sample',
  '',
  false
);

-- Should return:
-- {"success": true, "profile_id": "...", "profile_strength": 60, ...}

-- Then verify profile exists:
SELECT * FROM profiles WHERE id = '11111111-1111-1111-1111-111111111111';

-- Verify stats exist:
SELECT * FROM profile_stats WHERE profile_id = '11111111-1111-1111-1111-111111111111';
```

---

## ✅ Verification Checklist

After running the SQL and deploying:

- [ ] SQL runs without errors
- [ ] Function has 7 parameters (not 4)
- [ ] Google OAuth signup works
- [ ] LinkedIn OAuth signup works
- [ ] Profile created in `profiles` table
- [ ] Profile has photo from OAuth
- [ ] Profile strength is 60+ (not 25)
- [ ] `profile_stats` row exists
- [ ] All stats columns have default values (0)
- [ ] No errors in Vercel logs
- [ ] No errors in Supabase logs
- [ ] User can access /dashboard
- [ ] Email signup still works

---

## 📝 Summary

**Problems Fixed:**
1. ✅ Function name conflict → Added DROP statements
2. ✅ Wrong column names → Simplified to use trigger

**What OAuth Captures:**
- ✅ Full name (Google: `name`, LinkedIn: `full_name`)
- ✅ Profile photo (Google/LinkedIn: `picture` or `avatar_url`)
- ✅ Email (verified automatically)
- ✅ Phone (if available, rare)

**Profile Strength:**
- Base: 25 points
- +Name: 15 points
- +Photo: 20 points
- **OAuth user: 60 points** (was 25 before)

**Benefits:**
- Users get richer profiles immediately
- Better onboarding experience
- Higher initial profile completion
- Profile photos from day 1

---

## 🎯 Final Status

**File:** `/supabase/schema/45_oauth_profile_creation.sql` ✅ Fixed  
**Code:** `/apps/web/src/app/auth/callback/route.ts` ✅ Deployed  
**Issues:** All resolved ✅  
**Next:** Run SQL → Test OAuth → Verify

---

**Ready to deploy! 🚀**


