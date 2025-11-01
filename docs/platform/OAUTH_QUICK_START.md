# OAuth & Legal Pages - Quick Start Guide

**For:** Developers setting up OAuth or updating legal pages  
**Time:** 15 minutes  
**Last Updated:** October 31, 2025

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Deploy Legal Pages ✅ DONE

Privacy and Terms pages are already created and deployed:
- ✅ `/privacy` - Privacy Policy
- ✅ `/terms` - Terms of Service

**Nothing to do - already live!**

### Step 2: Set Up OAuth Profile Creation

**In Supabase SQL Editor:**
```sql
-- Copy and run: /supabase/schema/45_oauth_profile_creation.sql
-- This creates the profile auto-creation function
```

**Verify it worked:**
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'create_profile_for_user';

-- Should return 1 row
```

### Step 3: Deploy Code

**From terminal:**
```bash
cd apps/web
npm run build
vercel --prod
```

**Done!** 🎉

---

## 🧪 Test It Works

### Test Google OAuth
1. Incognito window
2. Go to `/register`
3. Click "Continue with Google"
4. Authorize
5. Should redirect to `/welcome` ✅

**Check database:**
```sql
SELECT full_name, profile_photo_url, profile_strength
FROM profiles
ORDER BY created_at DESC LIMIT 1;

-- Should have: name, photo URL, strength 60+
```

### Test LinkedIn OAuth
Same as Google, should work without errors.

---

## 🔧 Fix Existing Users (Optional)

If you have users who signed up before this fix:

**Run once in Supabase SQL Editor:**
```sql
-- Copy and run: /supabase/schema/46_update_existing_oauth_profiles.sql
-- This updates existing profiles with photos from OAuth
```

**Output:**
```
NOTICE: Updated profile user@gmail.com with photo: https://...
NOTICE: Total profiles updated: X
```

---

## 📋 Update Google OAuth Consent Screen

**Google Cloud Console:**
1. Go to: APIs & Services → OAuth consent screen
2. Edit App → Branding section
3. Update:
   - Privacy policy: `https://www.poultryco.net/privacy`
   - Terms of service: `https://www.poultryco.net/terms`
4. Save

---

## ⚠️ Common Issues

### "Profile not created"
→ Check if SQL was run in Supabase  
→ Check Vercel logs for errors

### "No profile photo"
→ Check Google scopes include `profile`  
→ Check Vercel logs for metadata

### "LinkedIn validation error"
→ Provider should be `linkedin_oidc` (already fixed ✅)

---

## 📖 Full Documentation

For detailed troubleshooting and reference:

**See:** `/docs/platform/OAUTH_AND_LEGAL_PAGES_COMPLETE.md`

Contains:
- Complete legal pages documentation
- OAuth configuration details
- Profile auto-creation system
- Full troubleshooting guide
- Maintenance procedures

---

## ✅ Success Checklist

After deployment:

- [ ] `/privacy` page loads
- [ ] `/terms` page loads
- [ ] Google OAuth creates profile with photo
- [ ] LinkedIn OAuth creates profile with photo
- [ ] Email registration still works
- [ ] Vercel logs show success messages
- [ ] No errors in production

**All working?** You're done! 🎉

---

**Quick Start Complete** | **For details:** See OAUTH_AND_LEGAL_PAGES_COMPLETE.md

