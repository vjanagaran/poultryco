# OAuth Profile Photo Fix

**Date:** October 31, 2025  
**Issue:** Profile created but missing Google/LinkedIn photo

---

## 🐛 Problem

Profile gets created for OAuth users, but `profile_photo_url` is NULL even though Google/LinkedIn provides a photo.

**Possible causes:**
1. Photo URL not being extracted from metadata
2. Photo URL being passed as NULL
3. Existing profiles created before code update
4. Google scopes not requesting profile photo

---

## ✅ Solution (2 Parts)

### Part 1: Fix New OAuth Signups

**Updated:** `/apps/web/src/app/auth/callback/route.ts`

**Changes:**
1. ✅ Added debug logging to see what OAuth sends
2. ✅ Extracts photo from `metadata.picture` or `metadata.avatar_url`
3. ✅ Updates existing profiles if they have no photo

**New behavior:**
- For **new users:** Creates profile with photo from OAuth
- For **existing users:** Updates photo if missing and OAuth has one

### Part 2: Fix Existing Profiles

**Created:** `/supabase/schema/46_update_existing_oauth_profiles.sql`

**What it does:**
- Finds all profiles without photos
- Checks if user has photo in `auth.users.raw_user_meta_data`
- Updates profile with photo
- Increases profile strength by 20 points

---

## 🚀 Deployment Steps

### Step 1: Deploy Code (Updated Callback)

```bash
cd apps/web
npm run build
vercel --prod
```

**What this enables:**
- ✅ New OAuth signups get photos automatically
- ✅ Existing users without photos get them on next login
- ✅ Debug logs show what metadata OAuth provides

### Step 2: Fix Existing Profiles (One-Time)

```bash
# In Supabase Dashboard → SQL Editor
# Copy: /supabase/schema/46_update_existing_oauth_profiles.sql
# Paste and Run
```

**Expected output:**
```
NOTICE: Updated profile user@gmail.com (uuid) with photo: https://...
NOTICE: Updated profile user2@gmail.com (uuid) with photo: https://...
NOTICE: Total profiles updated: 2
```

---

## 🔍 Debug: Check What OAuth Sends

### Step 1: Check Vercel Logs

After OAuth login, check Vercel logs:

```javascript
// Should see logs like:
OAuth metadata: {
  provider: 'google',
  has_picture: true,
  has_avatar_url: false,
  picture_url: 'https://lh3.googleusercontent.com/a/...',
  name: 'John Doe',
  email: 'john@gmail.com'
}

Creating profile with data: {
  user_id: 'uuid',
  full_name: 'John Doe',
  slug: 'john-doe',
  profile_photo: 'https://lh3.googleusercontent.com/a/...',
  phone: ''
}

Profile created successfully for OAuth user: {
  success: true,
  profile_id: 'uuid',
  profile_strength: 60
}
```

### Step 2: Check Supabase Auth Metadata

```sql
-- See what Google/LinkedIn sent
SELECT 
  id,
  email,
  raw_user_meta_data,
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'picture' as google_picture,
  raw_user_meta_data->>'avatar_url' as linkedin_avatar,
  raw_user_meta_data->>'full_name' as linkedin_name
FROM auth.users
WHERE email = 'your-test-email@gmail.com';
```

**Expected for Google:**
```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "picture": "https://lh3.googleusercontent.com/a/ACg8ocK...",
  "email_verified": true,
  "sub": "google-user-id"
}
```

**Expected for LinkedIn:**
```json
{
  "full_name": "John Doe",
  "email": "john@email.com",
  "picture": "https://media.licdn.com/dms/image/...",
  "sub": "linkedin-user-id"
}
```

### Step 3: Check Profile Table

```sql
-- Check if photo URL was saved
SELECT 
  id,
  full_name,
  profile_photo_url,
  profile_strength,
  created_at
FROM profiles
WHERE email = 'your-test-email@gmail.com';
```

**If photo_url is NULL:**
- Check Vercel logs for what was passed
- Check if RPC function received the photo
- Check for RPC errors

---

## 🔧 Troubleshooting

### Issue: Photo Still NULL After New Signup

**Check 1: What did OAuth send?**
```sql
-- Look at raw metadata
SELECT raw_user_meta_data 
FROM auth.users 
WHERE email = 'user@gmail.com';
```

**Check 2: Check Vercel logs**
Look for: "Creating profile with data:"
- Is `profile_photo` NULL or has URL?

**Check 3: Check for RPC errors**
Look for: "RPC Error creating profile"
- What error was returned?

**Check 4: Google OAuth Scopes**
Verify in Google Cloud Console:
- Scope `email` ✅
- Scope `profile` ✅ (needed for photo!)
- Scope `openid` ✅

**If `profile` scope is missing:**
```typescript
// In auth forms, update OAuth call:
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: '...',
    scopes: 'email profile openid'  // Ensure profile scope
  }
});
```

### Issue: Existing Profiles Without Photos

**Solution:** Run the backfill script:
```sql
-- Run: 46_update_existing_oauth_profiles.sql
-- This updates all existing profiles with photos from auth metadata
```

---

## 📊 Expected Results

### After Code Deployment

**New Google/LinkedIn signup:**
1. User clicks "Continue with Google"
2. Authorizes
3. Callback logs show:
   ```
   OAuth metadata: { has_picture: true, picture_url: 'https://...' }
   Creating profile with data: { profile_photo: 'https://...' }
   Profile created successfully
   ```
4. Profile in database has photo URL ✅

**Existing user logs in again:**
1. User with no photo logs in via OAuth
2. Callback logs show:
   ```
   Updating existing profile with OAuth photo: https://...
   Profile photo updated successfully
   ```
3. Profile now has photo URL ✅

---

## 🧪 Testing Scenarios

### Test 1: Brand New Google User
```bash
1. Clear browser/incognito
2. /register → "Continue with Google"
3. Use NEW Google account (never signed up before)
4. Authorize
5. Check database:

SELECT profile_photo_url FROM profiles WHERE email = 'new-user@gmail.com';
-- Should have URL ✅
```

### Test 2: Existing Profile Without Photo
```bash
1. Login with Google account that already has profile
2. Check Vercel logs for "Updating existing profile"
3. Check database - photo should be added ✅
```

### Test 3: Manual Backfill
```bash
# In Supabase SQL Editor
# Run: 46_update_existing_oauth_profiles.sql
# Check how many profiles updated
```

---

## 📝 Verification Queries

### See All OAuth Users
```sql
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'provider' as provider,
  p.full_name,
  p.profile_photo_url,
  p.profile_strength,
  CASE 
    WHEN p.profile_photo_url IS NULL AND au.raw_user_meta_data->>'picture' IS NOT NULL 
    THEN 'MISSING - Can be fixed'
    WHEN p.profile_photo_url IS NOT NULL 
    THEN 'HAS PHOTO ✅'
    ELSE 'No photo available'
  END as photo_status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.raw_user_meta_data->>'provider' IS NOT NULL
ORDER BY au.created_at DESC;
```

### Count Profiles Missing Photos
```sql
SELECT 
  COUNT(*) as total_oauth_users,
  COUNT(p.profile_photo_url) as has_photo,
  COUNT(*) - COUNT(p.profile_photo_url) as missing_photo
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.raw_user_meta_data->>'provider' IS NOT NULL;
```

---

## 🎯 Expected Profile Data

### Google OAuth Profile:
```sql
{
  full_name: "John Doe",                              ✅ From OAuth
  email: "john@gmail.com",                            ✅ From OAuth
  profile_photo_url: "https://lh3.googleusercontent.com/a/...", ✅ From OAuth
  profile_slug: "john-doe",                           ✅ Generated
  email_verified: true,                               ✅ OAuth = verified
  profile_strength: 60,                               ✅ (25 + 15 + 20)
  location_state: "Unknown",                          ⏳ Set in /welcome
  is_public: true
}
```

### LinkedIn OAuth Profile:
```sql
{
  full_name: "Jane Smith",                            ✅ From OAuth
  email: "jane@email.com",                            ✅ From OAuth
  profile_photo_url: "https://media.licdn.com/dms/image/...", ✅ From OAuth
  profile_slug: "jane-smith",                         ✅ Generated
  email_verified: true,                               ✅ OAuth = verified
  profile_strength: 60,                               ✅ (25 + 15 + 20)
  location_state: "Unknown",                          ⏳ Set in /welcome
  is_public: true
}
```

---

## 🔐 Google OAuth Scopes

Make sure Google OAuth requests the `profile` scope to get the photo.

### Check Current Scopes in Supabase:

1. **Supabase Dashboard** → **Authentication** → **Providers**
2. Click on **Google**
3. Check **"Scopes"** field

**Should include:**
```
email profile openid
```

**If missing `profile`:**
- Add it to the scopes field
- Save
- Test again

---

## 📋 Deployment Checklist

### Database:
- [ ] Run `45_oauth_profile_creation.sql` (creates RPC function)
- [ ] Run `46_update_existing_oauth_profiles.sql` (fixes existing users)
- [ ] Verify function exists and has 7 parameters

### Code:
- [ ] Deploy updated callback to Vercel
- [ ] Verify build succeeds ✅
- [ ] Check Vercel logs for debug messages

### Google OAuth:
- [ ] Verify scopes include `email profile openid`
- [ ] Update consent screen with privacy/terms URLs

### Testing:
- [ ] Test new Google signup → has photo
- [ ] Test new LinkedIn signup → has photo
- [ ] Existing user login → gets photo added
- [ ] Check database → photo URLs present

---

## 💡 Why Photo Might Be Missing

### Reason 1: Scopes Not Requested
**Fix:** Add `profile` scope in Supabase Google provider settings

### Reason 2: User Created Before Code Update
**Fix:** Run backfill script or wait for user to login again (auto-updates)

### Reason 3: Metadata Key Name Different
**Fix:** Check logs to see what key Google/LinkedIn uses
```javascript
// Logs will show:
OAuth metadata: {
  has_picture: true/false,     // Check this
  picture_url: '...' or null   // Check this
}
```

### Reason 4: RPC Function Not Receiving Photo
**Fix:** Check logs for "Creating profile with data"
- Is `profile_photo` null or has URL?

---

## 🚀 Quick Fix for Existing Users

### Option 1: Run Backfill Script (Immediate)
```sql
-- In Supabase SQL Editor
-- Run: 46_update_existing_oauth_profiles.sql
-- Updates all existing OAuth profiles at once
```

### Option 2: Wait for Next Login (Automatic)
```typescript
// Updated callback now checks on every login:
if (profilePhoto && !existingProfile.profile_photo_url) {
  // Updates profile with photo automatically
}
```

Users will get their photos added next time they login with OAuth.

---

## 📊 Profile Strength Impact

**Before (no photo):**
- Base: 25
- Name: +15
- **Total: 40 points**

**After (with photo):**
- Base: 25
- Name: +15
- Photo: +20
- **Total: 60 points**

**After onboarding:**
- +Location: +10
- +Headline: +15
- +Bio: +15
- **Total: 80-100 points**

---

## ✅ Success Verification

### Step 1: Check Vercel Logs
After OAuth signup/login:
```
OAuth metadata: { has_picture: true, picture_url: 'https://...' } ✅
Creating profile with data: { profile_photo: 'https://...' } ✅
Profile created successfully ✅
```

### Step 2: Check Database
```sql
SELECT 
  full_name,
  profile_photo_url,
  profile_strength
FROM profiles
WHERE email = 'test-user@gmail.com';

-- Should show:
-- John Doe | https://lh3.googleusercontent.com/... | 60
```

### Step 3: Check UI
1. User logs in
2. Goes to /dashboard
3. Profile photo displays in header ✅
4. Profile page shows photo ✅

---

## 🎯 Summary

**Problem:** Profile photo not captured from OAuth  
**Cause:** Multiple factors (scopes, timing, metadata extraction)  
**Solution:** 
1. ✅ Enhanced callback with logging and update logic
2. ✅ Created backfill script for existing users
3. ✅ Auto-updates on next login

**Files:**
- ✅ `/apps/web/src/app/auth/callback/route.ts` - Enhanced
- ✅ `/supabase/schema/46_update_existing_oauth_profiles.sql` - Backfill

**Next Steps:**
1. Deploy code to Vercel
2. Test new OAuth signup → check logs
3. Run backfill for existing users
4. Verify scopes in Google provider settings

---

**Status:** Ready to deploy and test! 🚀


