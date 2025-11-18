# Authentication System - Complete Reference

**Last Updated:** November 1, 2025  
**Status:** ✅ Production Ready

---

## 📋 Overview

PoultryCo's authentication system provides secure user onboarding through multiple methods with automatic profile creation.

### Supported Methods
- ✅ Email & Password
- ✅ Google OAuth
- ✅ LinkedIn OAuth (OIDC)
- 📋 More providers (future)

### Key Features
- Automatic profile creation for all methods
- Profile photo capture from OAuth
- Email verification
- Password reset
- Session management
- Protected routes

---

## 🔐 Authentication Methods

### 1. Email & Password

**Signup Flow:**
1. User fills registration form (`/register`)
2. Provides: Full name, email, password
3. System creates auth user
4. System creates profile via RPC function
5. Email verification sent
6. Redirect to `/welcome` onboarding

**Login Flow:**
1. User enters email and password (`/login`)
2. System validates credentials
3. Creates session
4. Redirect to `/home` or `/dashboard`

**Password Reset:**
1. User requests reset (`/forgot-password`)
2. Email sent with reset link
3. User sets new password (`/reset-password`)
4. Redirect to login

**Implementation:**
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name },
    emailRedirectTo: `${origin}/auth/callback?next=/welcome`
  }
});

// Create profile
await supabase.rpc('create_profile_for_user', {
  p_user_id: data.user.id,
  p_full_name: fullName,
  p_email: email,
  p_slug: generatedSlug
});
```

---

### 2. Google OAuth

**Setup:**
- Provider: `'google'`
- Scopes: `email profile openid`
- Callback: `/auth/callback`

**Signup/Login Flow:**
1. User clicks "Continue with Google"
2. Redirects to Google consent screen
3. User authorizes
4. Returns to `/auth/callback` with code
5. System exchanges code for session
6. System checks if profile exists
7. If new user → Creates profile with Google data
8. If existing user → Updates photo if missing
9. Redirect to `/welcome` (new) or `/home` (existing)

**Data Captured:**
```javascript
{
  name: "Full Name",           → profiles.full_name
  email: "user@gmail.com",     → profiles.email
  picture: "https://...",      → profiles.profile_photo_url
  email_verified: true         → profiles.email_verified = true
}
```

**Google Cloud Console Setup:**
1. Enable Google+ API
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs (Supabase callback)
4. Update consent screen:
   - App name: PoultryCo
   - Privacy policy: https://www.poultryco.net/privacy
   - Terms of service: https://www.poultryco.net/terms
   - Scopes: email, profile, openid

**Implementation:**
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${origin}/auth/callback?next=/welcome`
  }
});
```

---

### 3. LinkedIn OAuth (OIDC)

**Setup:**
- Provider: `'linkedin_oidc'` ⚠️ NOT `'linkedin'`
- Scopes: Automatic (email, profile, openid)
- Callback: `/auth/callback`

**Why OIDC?**
- LinkedIn deprecated traditional OAuth 2.0
- OIDC is the new standard (August 2023+)
- Supabase uses `linkedin_oidc` provider name

**Signup/Login Flow:**
Same as Google, but uses LinkedIn metadata

**Data Captured:**
```javascript
{
  full_name: "Full Name",      → profiles.full_name
  email: "user@email.com",     → profiles.email
  picture: "https://...",      → profiles.profile_photo_url
  avatar_url: "https://..."    → profiles.profile_photo_url (fallback)
}
```

**LinkedIn Developer Setup:**
1. Create app at LinkedIn Developer Portal
2. Add "Sign In with LinkedIn using OpenID Connect" product
3. Configure redirect URIs (Supabase callback)
4. Get Client ID and Secret
5. Add to Supabase → Authentication → Providers → LinkedIn (OIDC)

**Implementation:**
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'linkedin_oidc',  // NOT 'linkedin'
  options: {
    redirectTo: `${origin}/auth/callback?next=/welcome`
  }
});
```

---

## 🔄 OAuth Callback Flow

**File:** `/apps/web/src/app/auth/callback/route.ts`

**Process:**
```javascript
1. Receive authorization code from OAuth provider
2. Exchange code for session (creates user in auth.users)
3. Extract metadata (name, email, photo)
4. Check if profile exists
5. If NO profile:
   - Generate unique slug
   - Call create_profile_for_user() RPC
   - Pass name, email, photo, phone
   - Profile created with 60+ strength
6. If profile EXISTS but no photo:
   - Update profile with OAuth photo
   - Increase profile strength
7. Redirect to destination (/welcome or /home)
```

**Key Features:**
- ✅ Automatic profile creation
- ✅ Photo capture from OAuth
- ✅ Unique slug generation
- ✅ Debug logging
- ✅ Error handling
- ✅ Existing user photo update

---

## 💾 Database Schema

### Auth Tables (Supabase Managed)

**auth.users:**
- id (UUID, primary key)
- email
- encrypted_password (for email auth)
- phone
- email_confirmed_at
- phone_confirmed_at
- raw_user_meta_data (OAuth data stored here)
- created_at

### Application Tables

**profiles:**
- id (UUID, references auth.users)
- full_name
- profile_slug (unique)
- email
- email_verified
- phone
- phone_verified
- profile_photo_url ← **Captured from OAuth**
- location_state
- country
- profile_strength ← **Calculated dynamically**
- is_public
- created_at, updated_at

**profile_stats:**
- Auto-created via trigger
- Initialized with zeros
- Updated by engagement

---

## 🛠️ RPC Function

### create_profile_for_user()

**Location:** `/supabase/schema/45_oauth_profile_creation.sql`

**Signature:**
```sql
CREATE FUNCTION create_profile_for_user(
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_slug TEXT,
  p_profile_photo_url TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT '',
  p_phone_verified BOOLEAN DEFAULT false
)
RETURNS JSON
```

**What It Does:**
1. Calculates profile strength
   - Base: 25 points
   - +Name: 15 points
   - +Photo: 20 points
   - +Phone: 10 points
2. Inserts into profiles table
3. Creates profile_stats row
4. Returns success/error JSON

**Profile Strength:**
- Email signup: 40 points (base + name)
- OAuth signup: 60 points (base + name + photo)
- After onboarding: 80-100 points

---

## 🧪 Testing

### Test Email Signup
```bash
1. Go to /register
2. Fill form (name, email, password)
3. Submit
4. Check email for verification
5. Verify in database:

SELECT id, full_name, profile_slug, profile_strength
FROM profiles
ORDER BY created_at DESC LIMIT 1;

-- Should show: 40 profile_strength
```

### Test Google OAuth
```bash
1. Go to /register
2. Click "Continue with Google"
3. Authorize
4. Should redirect to /welcome
5. Verify in database:

SELECT full_name, profile_photo_url, profile_strength
FROM profiles
ORDER BY created_at DESC LIMIT 1;

-- Should have: photo URL, 60+ profile_strength
```

### Test LinkedIn OAuth
```bash
1. Go to /register
2. Click "Continue with LinkedIn"
3. Authorize
4. Should redirect to /welcome (no errors)
5. Verify profile created with photo
```

---

## 🐛 Troubleshooting

### Issue: LinkedIn Validation Error
**Error:** "Unsupported provider: provider is not enabled"

**Cause:** Using `'linkedin'` instead of `'linkedin_oidc'`

**Fix:** Already fixed in code ✅
- Check: LoginForm.tsx and RegisterForm.tsx use `linkedin_oidc`

### Issue: Profile Not Created for OAuth
**Debug:**
1. Check Vercel logs (`/auth/callback`)
2. Look for: "Profile created successfully" or errors
3. Verify RPC function exists in Supabase
4. Test RPC manually

### Issue: No Profile Photo
**Debug:**
1. Check Google scopes include `profile`
2. Check Vercel logs for metadata
3. Check `raw_user_meta_data` in auth.users
4. Run backfill script if existing user

**Fix Existing Users:**
```sql
-- Run: /supabase/schema/46_update_existing_oauth_profiles.sql
```

---

## 📊 Verification Queries

### Check Auth Users
```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'provider' as provider,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

### Check Profiles Created
```sql
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.profile_photo_url,
  p.profile_strength,
  au.raw_user_meta_data->>'provider' as signup_method
FROM profiles p
LEFT JOIN auth.users au ON au.id = p.id
ORDER BY p.created_at DESC
LIMIT 10;
```

### Check OAuth Photo Coverage
```sql
SELECT 
  COUNT(*) as total_oauth_users,
  COUNT(p.profile_photo_url) as has_photo,
  COUNT(*) - COUNT(p.profile_photo_url) as missing_photo
FROM auth.users au
JOIN profiles p ON p.id = au.id
WHERE au.raw_user_meta_data->>'provider' IS NOT NULL;
```

---

## 🔒 Security

### Password Requirements
- Minimum 8 characters
- Hashed with bcrypt (Supabase default)
- Never stored in plain text
- Reset via email only

### OAuth Security
- State parameter for CSRF protection
- PKCE flow for authorization
- Secure token exchange
- Session timeout
- Secure cookie storage

### Session Management
- JWT tokens via Supabase
- Automatic refresh
- Secure HTTP-only cookies
- Session expiry
- Multi-device support

### RLS Policies
- Users can only create their own profile
- Users can only update their own profile
- Public profiles viewable by all
- Private profiles viewable by connections

---

## 📁 File Locations

### Frontend
```
apps/web/src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   └── auth/
│       └── callback/route.ts         ← OAuth callback
├── components/auth/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── ForgotPasswordForm.tsx
│   └── ResetPasswordForm.tsx
└── contexts/
    └── AuthContext.tsx               ← Auth state management
```

### Backend
```
supabase/schema/
├── 45_oauth_profile_creation.sql     ← RPC function
└── 46_update_existing_oauth_profiles.sql  ← Backfill script
```

### Legal
```
apps/web/src/app/(marketing)/
├── privacy/page.tsx                  ← Privacy Policy
└── terms/page.tsx                    ← Terms of Service
```

---

## 🎯 Next Steps

### Immediate
- [ ] Deploy updated OAuth code
- [ ] Update Google consent screen
- [ ] Test all auth methods
- [ ] Verify profile photos captured

### Short-term
- [ ] Set up legal email addresses
- [ ] Legal review of Privacy/Terms
- [ ] Add more OAuth providers (optional)
- [ ] Implement 2FA (future)

### Long-term
- [ ] Phone number verification
- [ ] Magic link authentication
- [ ] Passwordless options
- [ ] Social sign-in (Facebook, Twitter)

---

**For complete OAuth setup:** See [OAUTH_AND_LEGAL_PAGES_COMPLETE.md](../platform/OAUTH_AND_LEGAL_PAGES_COMPLETE.md)  
**For quick setup:** See [OAUTH_QUICK_START.md](../platform/OAUTH_QUICK_START.md)  
**For legal pages:** See LEGAL_PAGES_SUMMARY.md in root


