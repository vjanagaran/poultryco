# LinkedIn OAuth Fix - Provider Name Issue

**Date:** October 31, 2025  
**Status:** ✅ Fixed  
**Note:** This doc is kept for historical reference. See consolidated docs at `/docs/platform/OAUTH_SETUP_README.md`

---

## 🐛 Issue

LinkedIn OAuth was returning error:
```json
{
  "code": 400,
  "error_code": "validation_failed",
  "msg": "Unsupported provider: provider is not enabled"
}
```

**URL causing error:**
```
https://ceknyafzwqlchzxipsqx.supabase.co/auth/v1/authorize?provider=linkedin&redirect_to=https%3A%2F%2Fwww.poultryco.net%2Fauth%2Fcallback%3Fnext%3D%2Fdashboard...
```

---

## 🔍 Root Cause

**Problem:** The code was using `'linkedin'` as the provider name, but Supabase uses **`'linkedin_oidc'`** for LinkedIn authentication.

**Why?** 
- LinkedIn deprecated their traditional OAuth 2.0 method
- LinkedIn now requires OpenID Connect (OIDC)
- Supabase adapted by introducing the `linkedin_oidc` provider
- Your Supabase dashboard shows "LinkedIn (OIDC)" - indicating the correct provider name

---

## ✅ Solution Applied

### Files Modified

1. **`/apps/web/src/components/auth/LoginForm.tsx`**
2. **`/apps/web/src/components/auth/RegisterForm.tsx`**

### Changes Made

**Before:**
```typescript
const handleSocialAuth = async (provider: 'google' | 'linkedin') => {
  // ...
  const { error } = await supabase.auth.signInWithOAuth({
    provider, // This was passing 'linkedin'
    options: { redirectTo },
  });
};

// Button click
onClick={() => handleSocialAuth('linkedin')}
```

**After:**
```typescript
const handleSocialAuth = async (provider: 'google' | 'linkedin_oidc') => {
  // ...
  const { error } = await supabase.auth.signInWithOAuth({
    provider, // Now passes 'linkedin_oidc'
    options: { redirectTo },
  });
};

// Button click
onClick={() => handleSocialAuth('linkedin_oidc')}
```

---

## 📋 Changes Summary

### LoginForm.tsx
- ✅ Changed type definition: `'linkedin'` → `'linkedin_oidc'`
- ✅ Changed button onClick: `handleSocialAuth('linkedin')` → `handleSocialAuth('linkedin_oidc')`

### RegisterForm.tsx
- ✅ Changed type definition: `'linkedin'` → `'linkedin_oidc'`
- ✅ Changed button onClick: `handleSocialAuth('linkedin')` → `handleSocialAuth('linkedin_oidc')`

---

## 🧪 Testing

After deploying these changes:

1. **Go to:** `https://www.poultryco.net/login` or `/register`
2. **Click:** "Continue with LinkedIn" button
3. **Expected:** LinkedIn OAuth consent screen appears
4. **Verify:** User can successfully authenticate and is redirected back

---

## 📚 Additional Information

### LinkedIn OIDC Requirements

For LinkedIn OIDC to work, you need:

1. **LinkedIn App Settings:**
   - Application created after August 1, 2023, OR
   - "Sign In with LinkedIn using OpenID Connect" product added to existing app
   - Redirect URIs must match Supabase settings

2. **Supabase Settings:**
   - LinkedIn (OIDC) provider enabled ✅ (confirmed in your screenshot)
   - Client ID configured ✅
   - Client Secret configured ✅
   - Callback URL: `https://ceknyafzwqlchzxipsqx.supabase.co/auth/v1/callback`

3. **Your App Settings:**
   - Redirect after auth: `https://www.poultryco.net/auth/callback?next=/dashboard` (login)
   - Redirect after auth: `https://www.poultryco.net/auth/callback?next=/welcome` (register)

---

## 🔐 OAuth Flow

### Login Flow
1. User clicks "Continue with LinkedIn"
2. Calls `handleSocialAuth('linkedin_oidc')`
3. Redirects to LinkedIn OIDC consent screen
4. User authorizes
5. LinkedIn redirects to Supabase callback: `https://ceknyafzwqlchzxipsqx.supabase.co/auth/v1/callback`
6. Supabase processes and redirects to: `https://www.poultryco.net/auth/callback?next=/dashboard`
7. Your app's callback route exchanges code for session
8. User redirected to `/dashboard`

### Register Flow
Same as login, but final redirect goes to `/welcome` for onboarding.

---

## ⚠️ Important Notes

### Provider Names in Supabase

| Display Name | Provider String |
|--------------|----------------|
| Google | `'google'` |
| LinkedIn (OIDC) | `'linkedin_oidc'` |
| GitHub | `'github'` |
| Facebook | `'facebook'` |
| Twitter | `'twitter'` |
| Azure | `'azure'` |

**Always use the provider string, not the display name!**

### If You Still Get Errors

1. **Check Supabase Dashboard:**
   - Ensure LinkedIn (OIDC) is enabled (you confirmed this ✅)
   - Verify Client ID and Secret are correct
   - Check redirect URLs are whitelisted

2. **Check LinkedIn Developer Portal:**
   - Verify app has "Sign In with LinkedIn using OpenID Connect" product
   - Ensure redirect URIs include Supabase callback URL
   - Check app is in production mode (or your test account is added)

3. **Check Browser Console:**
   - Look for any CORS errors
   - Check network tab for failed requests
   - Verify cookies are being set

4. **Supabase Auth Logs:**
   - Go to Supabase Dashboard → Authentication → Logs
   - Check for detailed error messages

---

## 📊 Testing Checklist

After deploying:

- [ ] Build succeeds without TypeScript errors
- [ ] Login page loads without errors
- [ ] Register page loads without errors
- [ ] Google OAuth still works (didn't break anything)
- [ ] LinkedIn button appears and is clickable
- [ ] Clicking LinkedIn redirects to LinkedIn consent screen
- [ ] After LinkedIn authorization, user is redirected back
- [ ] User is logged in and session is created
- [ ] User data (name, email) is populated from LinkedIn
- [ ] User is redirected to correct destination (/dashboard or /welcome)

---

## 🚀 Deployment

To deploy the fix:

```bash
# From workspace root
cd apps/web

# Build to check for errors
npm run build

# Deploy to production (Vercel)
vercel --prod

# Or if using git deployment
git add .
git commit -m "Fix: Update LinkedIn OAuth provider to linkedin_oidc"
git push origin main
```

---

## 📖 Reference

**Supabase Documentation:**
- [LinkedIn OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-linkedin)
- [OAuth Providers](https://supabase.com/docs/reference/javascript/auth-signinwithoauth)

**LinkedIn Documentation:**
- [Sign In with LinkedIn using OpenID Connect](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
- [Migration Guide](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/migration-faq)

---

## ✅ Status

**Issue:** Provider name mismatch (`linkedin` vs `linkedin_oidc`)  
**Fix Applied:** ✅ Changed to `linkedin_oidc` in both auth forms  
**Files Modified:** 2 (LoginForm.tsx, RegisterForm.tsx)  
**Testing Required:** Manual testing after deployment  
**Breaking Changes:** None (Google OAuth unaffected)  

---

**Next Step:** Deploy to production and test LinkedIn login flow end-to-end.


