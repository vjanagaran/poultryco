# OAuth Profile Creation - Debug Guide

**Date:** October 31, 2025  
**Status:** Enhanced with full OAuth data capture

---

## 🔍 Step-by-Step Debugging

### Step 1: Re-run the Updated SQL

The SQL file has been updated to:
- ✅ Accept profile photo URL
- ✅ Accept phone number
- ✅ Calculate profile strength dynamically
- ✅ Handle duplicates gracefully (ON CONFLICT DO NOTHING)

**Action:**
1. Open Supabase Dashboard → SQL Editor
2. Copy `/supabase/schema/45_oauth_profile_creation.sql`
3. Run it (it will UPDATE the existing function)

**Verify:**
```sql
-- Check function signature
SELECT 
  routine_name,
  string_agg(parameter_name || ' ' || data_type, ', ' ORDER BY ordinal_position) as parameters
FROM information_schema.parameters
WHERE specific_name IN (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'create_profile_for_user'
)
GROUP BY routine_name;

-- Should show: p_user_id, p_full_name, p_email, p_slug, p_profile_photo_url, p_phone, p_phone_verified
```

---

### Step 2: Deploy Updated Callback Code

The callback now:
- ✅ Extracts name from Google/LinkedIn metadata
- ✅ Extracts profile photo (Google: picture, LinkedIn: picture/avatar_url)
- ✅ Extracts phone if available
- ✅ Logs success/error messages

**Action:**
```bash
cd apps/web
npm run build
vercel --prod
```

---

### Step 3: Test OAuth Flow with Logging

1. **Open browser console** (F12)
2. Go to `/register`
3. Click "Continue with Google" or "Continue with LinkedIn"
4. Authorize
5. **Watch console and Vercel logs**

---

### Step 4: Check What OAuth Provider Sends

**For Google OAuth:**
```javascript
user_metadata: {
  name: "John Doe",          // Full name
  email: "john@gmail.com",   // Email
  picture: "https://...",    // Profile photo URL
  sub: "google-id",
  email_verified: true
}
```

**For LinkedIn OAuth:**
```javascript
user_metadata: {
  full_name: "John Doe",     // Full name
  email: "john@linkedin.com",
  picture: "https://...",    // Profile photo URL
  avatar_url: "https://...", // Alternative photo URL
  sub: "linkedin-id"
}
```

---

### Step 5: Manual Test of RPC Function

Test the function directly in Supabase SQL Editor:

```sql
-- Test with sample data
SELECT create_profile_for_user(
  '00000000-0000-0000-0000-000000000001'::UUID,  -- Replace with real user ID
  'Test User',
  'test@example.com',
  'test-user-unique',
  'https://lh3.googleusercontent.com/a/sample-photo',
  '+919876543210',
  false
);

-- Should return:
-- {"success": true, "profile_id": "...", "profile_strength": 70, "message": "Profile created successfully"}
```

**Then check if profile was created:**
```sql
SELECT id, full_name, profile_slug, email, profile_photo_url, profile_strength
FROM profiles
WHERE id = '00000000-0000-0000-0000-000000000001';
```

---

### Step 6: Check Vercel Logs

After OAuth signup attempt:

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments" → Latest → "Functions"
4. Find `/auth/callback`
5. Look for logs:

**Success logs:**
```
Profile created successfully for OAuth user: {
  success: true,
  profile_id: "xxx",
  profile_strength: 70
}
```

**Error logs:**
```
RPC Error creating profile: {...}
Profile creation failed: {...}
```

---

### Step 7: Check Supabase Logs

1. Go to Supabase Dashboard
2. Click "Logs" → "Postgres Logs"
3. Filter by "create_profile_for_user"
4. Look for errors:

**Common errors:**
- Permission denied → RLS policy issue
- Duplicate key → Slug already exists
- Column doesn't exist → Function not updated
- Function not found → SQL not run

---

### Step 8: Verify Profile Structure

After OAuth signup, check database:

```sql
-- Get the latest user from auth.users
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;

-- Check if profile exists for that user
SELECT 
  p.id,
  p.full_name,
  p.profile_slug,
  p.email,
  p.profile_photo_url,
  p.phone,
  p.profile_strength,
  p.created_at
FROM profiles p
WHERE p.id = 'USER_ID_FROM_ABOVE';

-- Check if profile_stats exists
SELECT *
FROM profile_stats
WHERE profile_id = 'USER_ID_FROM_ABOVE';
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Profile Still Not Created

**Possible Causes:**

**A. RPC Function Not Updated**
```sql
-- Check function parameters
SELECT routine_name, parameter_name, data_type
FROM information_schema.parameters
WHERE specific_name IN (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'create_profile_for_user'
)
ORDER BY ordinal_position;

-- Should show 7 parameters (not 4)
```

**Solution:** Re-run the SQL file

**B. Code Not Deployed**
```bash
# Check if callback has latest code
# Look for: p_profile_photo_url in the RPC call

# Redeploy
cd apps/web
vercel --prod
```

**C. RLS Policy Blocking**
```sql
-- Check if policy allows insert
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles' AND cmd = 'INSERT';

-- Should show: "Users can insert own profile"
```

**Solution:** Run RLS fix:
```sql
-- Ensure INSERT policy exists
CREATE POLICY IF NOT EXISTS "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());
```

---

### Issue 2: Profile Created But No Photo

**Check what OAuth sent:**
```sql
-- Look at user metadata
SELECT 
  id,
  email,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'picture' as google_picture,
  raw_user_meta_data->>'avatar_url' as linkedin_avatar,
  raw_user_meta_data
FROM auth.users
WHERE email = 'your-test-email@gmail.com';
```

**If metadata has photo but profile doesn't:**
- Check callback logs for what was passed
- RPC function might not have been updated
- Re-run SQL and redeploy code

---

### Issue 3: Duplicate Slug Error

**Check for duplicates:**
```sql
SELECT profile_slug, COUNT(*)
FROM profiles
GROUP BY profile_slug
HAVING COUNT(*) > 1;
```

**Solution:** The updated function handles this with ON CONFLICT, but if you still have duplicates:
```sql
-- Fix existing duplicates
UPDATE profiles
SET profile_slug = profile_slug || '-' || substring(id::text, 1, 6)
WHERE id IN (
  SELECT id FROM profiles
  WHERE profile_slug IN (
    SELECT profile_slug FROM profiles
    GROUP BY profile_slug HAVING COUNT(*) > 1
  )
);
```

---

### Issue 4: Function Returns Success But No Row

**Check for conflict:**
```sql
-- See if profile already exists
SELECT id, full_name, created_at
FROM profiles
WHERE id = 'USER_ID';

-- If exists, ON CONFLICT prevented insert (this is OK)
```

**If not exists:**
- Check RLS policies
- Check if user has permission
- Run function with RAISE NOTICE for debugging

---

## 🧪 Testing Checklist

After deployment:

- [ ] SQL function updated (7 parameters)
- [ ] Code deployed to Vercel
- [ ] Google OAuth creates profile
- [ ] LinkedIn OAuth creates profile
- [ ] Profile has photo from OAuth
- [ ] Profile has name from OAuth
- [ ] Profile has email from OAuth
- [ ] Profile strength calculated (40-70)
- [ ] profile_stats row created
- [ ] No duplicate slugs
- [ ] Logs show success messages
- [ ] Email registration still works

---

## 📊 What Data Gets Captured

### Google OAuth Provides:
```javascript
{
  name: "Full Name",           → profiles.full_name
  email: "user@gmail.com",     → profiles.email
  picture: "https://...",      → profiles.profile_photo_url
  email_verified: true,        → profiles.email_verified
  sub: "google-user-id"
}
```

### LinkedIn OAuth Provides:
```javascript
{
  full_name: "Full Name",      → profiles.full_name
  email: "user@email.com",     → profiles.email
  picture: "https://...",      → profiles.profile_photo_url
  avatar_url: "https://...",   → profiles.profile_photo_url (fallback)
  sub: "linkedin-user-id"
}
```

### What We Don't Get from OAuth:
- ❌ Phone number (rare)
- ❌ Location/address
- ❌ Bio/headline
- ❌ Company/role

**These are collected during `/welcome` onboarding**

---

## 🎯 Expected Profile Strength

After OAuth signup:
- **Base:** 25 points
- **Has name:** +15 points
- **Has photo:** +20 points
- **Has phone:** +10 points (rare from OAuth)

**Typical OAuth profile:** 60 points (25 + 15 + 20)
**After onboarding:** 80-100 points

---

## 📝 Debug Checklist

If profile not created:

1. ✅ SQL function exists and has 7 parameters
2. ✅ Code deployed with latest callback
3. ✅ RLS policies allow insert
4. ✅ User exists in auth.users
5. ✅ Check Vercel logs for callback execution
6. ✅ Check Supabase logs for RPC calls
7. ✅ Test RPC function manually
8. ✅ Verify user_metadata has expected data
9. ✅ Check for error messages in console
10. ✅ Verify no RLS blocking

---

## 🚀 Quick Fix Commands

**Re-run SQL:**
```bash
# In Supabase SQL Editor
# Copy-paste entire 45_oauth_profile_creation.sql
```

**Redeploy Code:**
```bash
cd apps/web
npm run build && vercel --prod
```

**Test Function:**
```sql
SELECT create_profile_for_user(
  auth.uid(),
  'Your Name',
  'your@email.com',
  'your-unique-slug',
  'https://photo-url.com/photo.jpg',
  '',
  false
);
```

**Check Logs:**
- Vercel: Dashboard → Project → Functions → `/auth/callback`
- Supabase: Dashboard → Logs → Postgres Logs

---

## ✅ Success Indicators

You know it's working when:

1. **Vercel logs show:**
   ```
   Profile created successfully for OAuth user: {success: true, ...}
   ```

2. **Database has row:**
   ```sql
   SELECT * FROM profiles WHERE email = 'oauth-user@gmail.com';
   -- Returns 1 row ✅
   ```

3. **Profile has photo:**
   ```sql
   SELECT profile_photo_url FROM profiles WHERE ...;
   -- Returns URL ✅
   ```

4. **User can access dashboard:**
   - No errors
   - Shows profile data
   - Shows profile photo
   - Profile strength > 50

---

**Next Steps:**
1. ✅ Re-run updated SQL
2. ✅ Redeploy code
3. ✅ Test OAuth signup
4. ✅ Check logs
5. ✅ Verify profile created with photo


