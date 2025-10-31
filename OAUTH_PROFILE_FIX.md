# OAuth Profile Creation Fix

**Date:** October 31, 2025  
**Status:** ✅ Solution Ready

---

## 🐛 Problem

When users sign up with **Google or LinkedIn OAuth**, profiles are NOT automatically created, while **email registration** works fine.

**Symptoms:**
- Email signup: ✅ Creates profile
- Google/LinkedIn OAuth: ❌ No profile created
- Users land on dashboard with no profile data
- Queries fail because `profiles` table has no row

---

## 🔍 Root Cause

### Email Registration Flow
1. User fills form with name, email, password
2. `RegisterForm.tsx` calls `supabase.auth.signUp()`
3. **Explicitly calls `create_profile_for_user()` RPC function**
4. Profile created ✅

### OAuth Flow (Broken)
1. User clicks "Continue with Google/LinkedIn"
2. Redirects to OAuth provider
3. Returns to `/auth/callback`
4. `callback/route.ts` only calls `exchangeCodeForSession()`
5. **No profile creation logic** ❌
6. User has auth but no profile

### Missing Pieces
1. **No database trigger** to auto-create profiles for OAuth users
2. **No RPC function** `create_profile_for_user()` in database
3. **No fallback logic** in auth callback

---

## ✅ Solution (2-Layer Approach)

We implement **2 layers** of profile creation to ensure it never fails:

### Layer 1: Auth Callback Check (Primary)
Checks and creates profile during OAuth callback automatically

### Layer 2: RPC Function (Fallback)
Allows explicit profile creation if callback fails or for email registration

---

## 📦 Files Created/Modified

### 1. Database Schema (NEW)
**File:** `/supabase/schema/29_oauth_profile_creation.sql`

**What it does:**
- ✅ Creates `create_profile_for_user()` RPC function
- ✅ Creates `handle_new_user()` trigger function
- ✅ Creates trigger `on_auth_user_created` on `auth.users` table
- ✅ Auto-generates profile slug from name
- ✅ Creates `profile_stats` row automatically
- ✅ Handles duplicate slugs

**Key Features:**
```sql
-- Trigger fires AFTER INSERT on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 2. Auth Callback (MODIFIED)
**File:** `/apps/web/src/app/auth/callback/route.ts`

**What changed:**
- ✅ Now checks if profile exists after OAuth
- ✅ Creates profile if missing (fallback)
- ✅ Handles errors gracefully
- ✅ Uses same slug generation as email registration
- ✅ Calls `create_profile_for_user()` RPC

**Before:**
```typescript
if (code) {
  const supabase = await createClient(cookieStore);
  await supabase.auth.exchangeCodeForSession(code);
}
return NextResponse.redirect(new URL(next, request.url));
```

**After:**
```typescript
if (code) {
  const supabase = await createClient(cookieStore);
  const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

  if (session?.user) {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .single();

    // Create profile if missing
    if (!existingProfile) {
      // ... profile creation logic
    }
  }
}
```

---

## 🚀 Deployment Steps

### Step 1: Deploy Database Changes

1. **Open Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your PoultryCo project

2. **Go to SQL Editor:**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run the Schema File:**
   ```sql
   -- Copy entire contents of supabase/schema/29_oauth_profile_creation.sql
   -- Paste into SQL Editor
   -- Click "Run" or press Ctrl+Enter
   ```

4. **Verify:**
   ```sql
   -- Check if function exists
   SELECT routine_name 
   FROM information_schema.routines 
   WHERE routine_name = 'create_profile_for_user';

   -- Check if trigger exists
   SELECT trigger_name 
   FROM information_schema.triggers 
   WHERE trigger_name = 'on_auth_user_created';
   ```

   Should see both results ✅

### Step 2: Deploy Code Changes

```bash
# From workspace root
cd apps/web

# Build to check for errors
npm run build

# Deploy to Vercel
vercel --prod

# Or if using git deployment
git add .
git commit -m "fix: Auto-create profiles for OAuth users"
git push origin main
```

---

## 🧪 Testing Guide

### Test 1: New User - Google OAuth

1. **Clear browser data** or use incognito
2. Go to `/register`
3. Click "Continue with Google"
4. Authorize with Google
5. Should redirect to `/welcome`
6. **Check Database:**
   ```sql
   SELECT id, full_name, profile_slug, email, created_at 
   FROM profiles 
   WHERE email = 'your-test-email@gmail.com';
   ```
   Should see profile row ✅

### Test 2: New User - LinkedIn OAuth

1. **Clear browser data** or use incognito
2. Go to `/register`
3. Click "Continue with LinkedIn"
4. Authorize with LinkedIn
5. Should redirect to `/welcome`
6. **Check Database:**
   ```sql
   SELECT id, full_name, profile_slug, email, created_at 
   FROM profiles 
   WHERE email = 'your-test-email@linkedin.com';
   ```
   Should see profile row ✅

### Test 3: Existing Email User (No Regression)

1. Go to `/register`
2. Fill email, password, name
3. Click "Create My Account"
4. Should still work as before ✅
5. Profile created via RPC function

### Test 4: Dashboard Access

After OAuth signup:
1. Go to `/dashboard`
2. Should see profile data (not blank)
3. Profile strength should show (at least 25%)
4. No console errors ✅

---

## 🔧 How It Works

### Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ User clicks "Continue with Google/LinkedIn"             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ OAuth Provider (Google/LinkedIn)                        │
│ • User authorizes                                        │
│ • Provider returns authorization code                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Redirect to: /auth/callback?code=...&next=/welcome      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Auth Callback (route.ts)                                │
│ 1. Exchange code for session                            │
│ 2. User created in auth.users table                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Database Trigger Fires (LAYER 1)                        │
│ • handle_new_user() executes                            │
│ • Extracts name from user_metadata                      │
│ • Generates unique slug                                 │
│ • Creates profile row                                   │
│ • Creates profile_stats row                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼ (If trigger fails for any reason)
┌─────────────────────────────────────────────────────────┐
│ Callback Checks Profile (LAYER 2)                       │
│ • Query: SELECT id FROM profiles WHERE id = user.id     │
│ • If NOT found → Call create_profile_for_user()         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Redirect to /welcome                                    │
│ ✅ Profile exists                                        │
│ ✅ User can complete onboarding                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Profile Data Structure

### What Gets Created (Automatic)

```javascript
// Profile Row
{
  id: user.id,                           // From auth.users
  full_name: "Rajesh Kumar",             // From OAuth provider
  profile_slug: "rajesh-kumar",          // Generated
  email: "rajesh@gmail.com",             // From OAuth
  email_verified: true,                  // OAuth = verified
  phone: "",                             // Empty initially
  phone_verified: false,
  location_state: "Unknown",             // Updated in /welcome
  country: "India",
  profile_strength: 25,                  // Base strength
  is_public: true,
  created_at: "2025-10-31T...",
  updated_at: "2025-10-31T..."
}

// Profile Stats Row
{
  profile_id: user.id,
  total_posts: 0,
  total_comments: 0,
  followers_count: 0,
  following_count: 0,
  profile_views: 0
}
```

### Metadata Sources

**Google OAuth provides:**
- `user_metadata.name` → full_name
- `user_metadata.email` → email
- `user_metadata.avatar_url` → (not used yet)

**LinkedIn OAuth provides:**
- `user_metadata.full_name` → full_name
- `user_metadata.email` → email
- `user_metadata.avatar_url` → (not used yet)

---

## 🔍 Troubleshooting

### Issue: Profile still not created

**Check 1: RPC function exists?**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'create_profile_for_user';
```

**Check 2: RLS policies allow insert?**
```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'profiles' 
  AND cmd = 'INSERT';
```

Should see: `"Users can insert own profile"` ✅

**Check 3: User exists in auth.users?**
```sql
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'test@example.com';
```

**Check 4: Profile exists?**
```sql
SELECT id, full_name, profile_slug 
FROM profiles 
WHERE id = 'USER_ID_FROM_ABOVE';
```

### Issue: Duplicate slug error

This shouldn't happen with the new code, but if it does:

```sql
-- Find duplicates
SELECT profile_slug, COUNT(*) 
FROM profiles 
GROUP BY profile_slug 
HAVING COUNT(*) > 1;

-- Fix manually if needed
UPDATE profiles 
SET profile_slug = profile_slug || '-' || substring(id::text, 1, 4)
WHERE id = 'DUPLICATE_USER_ID';
```

### Issue: Email users affected

Email registration should still work because:
- `RegisterForm.tsx` still calls `create_profile_for_user()` directly
- Trigger won't fire twice (checks if profile exists)
- No breaking changes to email flow

---

## 📝 Additional Improvements (Optional)

### 1. Add Profile Photo from OAuth
```typescript
// In callback/route.ts, add:
profile_photo_url: session.user.user_metadata?.avatar_url || null
```

### 2. Extract More User Data
```typescript
// Google provides:
- locale (language)
- picture (photo URL)
- given_name, family_name

// LinkedIn provides:
- picture (photo URL)
- locale
```

### 3. Set Initial Location from IP
Use IP geolocation to set initial state:
```typescript
// Use service like ipapi.co
const ipData = await fetch('https://ipapi.co/json/');
const { region, country_name } = await ipData.json();
```

---

## ✅ Success Criteria

After deployment:

- [ ] New Google OAuth users have profiles automatically
- [ ] New LinkedIn OAuth users have profiles automatically
- [ ] Email registration still works
- [ ] No duplicate profile creation
- [ ] Slugs are unique
- [ ] `profile_stats` rows created
- [ ] Users can access `/dashboard` and `/welcome` without errors
- [ ] Profile data displays correctly

---

## 🔐 Security Considerations

**Trigger runs as SECURITY DEFINER:**
- Executes with owner privileges
- Bypasses RLS policies
- Safe because it only creates profiles for new users
- Cannot be exploited by users

**RPC function runs as SECURITY DEFINER:**
- Same as trigger
- Only callable by authenticated users
- Only allows creating your own profile (checks p_user_id)

**RLS Policies intact:**
- Users can still only update their own profiles
- Privacy settings still respected
- No security regressions

---

## 📚 Related Files

- `/supabase/schema/45_oauth_profile_creation.sql` - NEW database schema
- `/apps/web/src/app/auth/callback/route.ts` - MODIFIED callback handler
- `/apps/web/src/components/auth/RegisterForm.tsx` - Unchanged (email flow)
- `/apps/web/src/components/auth/LoginForm.tsx` - Unchanged (OAuth buttons)

---

## 🎯 Summary

**Problem:** OAuth users had no profiles  
**Solution:** 3-layer auto-creation (trigger + RPC + callback fallback)  
**Result:** All signup methods create profiles automatically  
**Status:** Ready to deploy  

**Next Steps:**
1. Run SQL schema in Supabase
2. Deploy code changes to Vercel
3. Test with Google and LinkedIn
4. Verify profiles are created

---

**Questions or issues?** Check Supabase logs, Vercel logs, and browser console for errors.

