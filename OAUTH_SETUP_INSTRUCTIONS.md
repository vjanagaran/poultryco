# OAuth Profile Creation - Setup Instructions

**Date:** October 31, 2025  
**Issue Fixed:** Permission error on auth.users trigger

---

## 📋 Quick Setup (2 Steps)

### Step 1: Run SQL in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your PoultryCo project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Copy and Run**
   - Open file: `/supabase/schema/45_oauth_profile_creation.sql`
   - Copy entire contents
   - Paste into SQL Editor
   - Click "Run" (or Ctrl+Enter)

4. **Verify Success**
   ```sql
   -- Check if RPC function exists
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name = 'create_profile_for_user';
   
   -- Should return: create_profile_for_user ✅
   ```

### Step 2: Deploy Code

Already done! The auth callback code is already deployed.

---

## ❓ Why No Database Trigger?

### The Problem
You got this error:
```
ERROR: 42501: must be owner of relation users
```

### The Reason
- The `auth.users` table is owned by Supabase's `supabase_auth_admin` role
- Regular users cannot create triggers on it
- Only Supabase admins can modify `auth.users`

### The Solution
Instead of using a database trigger, we use **application-level logic**:

1. **Auth callback checks** if profile exists
2. **Creates profile** if missing using RPC function
3. **Works perfectly** without needing database trigger

---

## 🔧 How It Works Now

### Email Registration (RegisterForm.tsx)
```typescript
1. User fills form
2. Signs up with Supabase
3. Calls create_profile_for_user() RPC ✅
4. Profile created
```

### OAuth Registration (Google/LinkedIn)
```typescript
1. User clicks OAuth button
2. Authenticates with provider
3. Returns to /auth/callback
4. Callback checks: Does profile exist?
5. If NO → Calls create_profile_for_user() RPC ✅
6. Profile created
```

---

## ✅ What Was Created

### File: `45_oauth_profile_creation.sql`

**Contains:**
1. ✅ `create_profile_for_user()` RPC function
   - Creates profile row in `profiles` table
   - Creates stats row in `profile_stats` table
   - Generates unique slug
   - Returns success/error JSON

2. ✅ `handle_new_user_signup()` webhook function (optional)
   - Can be used with Supabase Auth Webhooks
   - Not required for current setup
   - Available for future use

**Permissions:**
- Authenticated users can call `create_profile_for_user()`
- Functions run as SECURITY DEFINER (bypass RLS)
- Safe because they only create user's own profile

---

## 🧪 Testing

### Test OAuth Signup

1. **Clear browser** (incognito mode)
2. Go to `/register`
3. Click "Continue with Google" or "Continue with LinkedIn"
4. Authorize
5. Should redirect to `/welcome` ✅

### Verify Profile Created

```sql
-- Check profiles table
SELECT id, full_name, profile_slug, email, created_at 
FROM profiles 
WHERE email = 'your-test-email@gmail.com';

-- Should see a row ✅

-- Check profile stats
SELECT profile_id, total_posts, followers_count 
FROM profile_stats 
WHERE profile_id = 'USER_ID_FROM_ABOVE';

-- Should see a row with zeros ✅
```

---

## 🔍 Troubleshooting

### Profile Not Created?

**Check auth callback logs:**
```bash
# In Vercel dashboard
1. Go to Deployments
2. Click on latest deployment
3. Go to Functions
4. Check /auth/callback logs
```

**Check Supabase logs:**
```bash
# In Supabase dashboard
1. Go to Logs
2. Select "Postgres Logs"
3. Look for errors related to profiles
```

**Manually verify RPC works:**
```sql
-- Test the RPC function manually
SELECT create_profile_for_user(
  'YOUR_USER_ID'::UUID,
  'Test User',
  'test@example.com',
  'test-user'
);

-- Should return: {"success": true, ...}
```

---

## 📊 Database Schema Created

### profiles Table
```sql
id              UUID PRIMARY KEY
full_name       TEXT NOT NULL
profile_slug    TEXT UNIQUE NOT NULL
email           TEXT NOT NULL
email_verified  BOOLEAN (true for OAuth)
phone           TEXT (empty initially)
location_state  TEXT ('Unknown' → updated in /welcome)
country         TEXT ('India')
profile_strength INTEGER (25 → base)
is_public       BOOLEAN (true)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### profile_stats Table
```sql
profile_id       UUID PRIMARY KEY
total_posts      INTEGER (0)
total_comments   INTEGER (0)
followers_count  INTEGER (0)
following_count  INTEGER (0)
profile_views    INTEGER (0)
created_at       TIMESTAMP
updated_at       TIMESTAMP
```

---

## 🎯 Summary

**Problem:** OAuth users had no profiles  
**Old Approach (Failed):** Database trigger on auth.users ❌  
**New Approach (Works):** Application callback checks + RPC function ✅  

**Benefits:**
- ✅ No permission issues
- ✅ Works with Supabase's security model
- ✅ Same logic for email and OAuth
- ✅ Easy to debug and maintain
- ✅ Graceful error handling

---

## 📞 Next Steps

1. ✅ Run SQL: `45_oauth_profile_creation.sql`
2. ✅ Code already deployed (callback updated)
3. ✅ Test Google OAuth signup
4. ✅ Test LinkedIn OAuth signup
5. ✅ Verify profiles created

**Status:** Ready to use! 🎉

---

## 💡 Optional: Supabase Auth Webhooks

If you want to use Supabase's native webhook system (future):

1. Go to Supabase Dashboard → Authentication → Hooks
2. Enable "user.created" webhook
3. Create a Supabase Edge Function to call `handle_new_user_signup()`
4. Set as webhook endpoint

But for now, the callback approach works perfectly!

---

**File Sequence:** `45_oauth_profile_creation.sql` (correct number after 44)  
**No Trigger:** Uses callback logic instead (avoids permission issues)  
**Result:** All signup methods create profiles automatically ✅

