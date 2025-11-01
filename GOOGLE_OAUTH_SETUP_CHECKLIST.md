# Google OAuth Consent Screen Setup Checklist

**Date:** October 31, 2025  
**Status:** ⚠️ Action Required  
**Note:** This doc is kept for Google-specific setup. Full docs at `/docs/platform/OAUTH_AND_LEGAL_PAGES_COMPLETE.md`

---

## 📋 Steps to Update Google Cloud Console

Based on the screenshot you provided, you need to update the **Branding** section of your OAuth consent screen.

### 1. Navigate to OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your PoultryCo project
3. Navigate to: **APIs & Services** → **OAuth consent screen**
4. Click **EDIT APP** (if already exists) or create new

---

## 2. Update Branding Section

### App Logo
- **Upload icon.png** (120x120 pixels minimum)
- **Recommended:** Use PoultryCo logo
- **Location:** `/docs/brand/logo/` (if available)

### App Domain Section

Update these fields with your production URLs:

```
Application home page:
https://www.poultryco.net

Application privacy policy link:
https://www.poultryco.net/privacy

Application terms of service link:
https://www.poultryco.net/terms
```

### Authorized Domains

Add your domain (if not already added):
```
poultryco.net
```

**Note:** Do NOT include `https://` or `www.` in authorized domains - just the domain name.

---

## 3. Developer Contact Information

Ensure you have a valid email:
```
Email: team@poultryco.net
```

---

## 4. Scopes Configuration

Verify you have the necessary scopes:
- ✅ `email` - See your primary Google Account email address
- ✅ `profile` - See your personal info, including any personal info you've made publicly available
- ✅ `openid` - Associate you with your personal info on Google

**These should already be configured if Google Auth is working.**

---

## 5. Test Users (If in Testing Mode)

If your app is still in **Testing** mode (not Published), add test users:
1. Go to **OAuth consent screen** → **Test users**
2. Add email addresses of people who should be able to test Google login
3. Click **SAVE**

---

## 6. Publishing Status

### Current Status Options:

**Testing Mode:**
- ✅ Free, no verification needed
- ⚠️ Limited to 100 users
- ⚠️ Need to manually add test users
- ✅ Good for development and beta testing

**Production Mode:**
- ⚠️ Requires Google verification (can take 1-6 weeks)
- ✅ No user limits
- ✅ All users can sign in
- ⚠️ Needs to submit app for review if requesting sensitive scopes

**Recommendation for Now:** Stay in **Testing** mode until ready for public launch.

---

## 7. Verification Checklist

After updating, verify:

- [ ] Application home page URL is correct: `https://www.poultryco.net`
- [ ] Privacy policy URL is accessible: `https://www.poultryco.net/privacy`
- [ ] Terms of service URL is accessible: `https://www.poultryco.net/terms`
- [ ] Authorized domain includes `poultryco.net`
- [ ] App logo is uploaded (optional but recommended)
- [ ] Developer contact email is valid
- [ ] Test users are added (if in Testing mode)

---

## 8. Test the Flow

After saving changes, test Google OAuth:

1. Go to `https://www.poultryco.net/register`
2. Click "Continue with Google"
3. Verify the consent screen shows:
   - ✅ PoultryCo logo (if uploaded)
   - ✅ Application name: "PoultryCo"
   - ✅ Privacy policy link
   - ✅ Terms of service link
   - ✅ Scopes requested (email, profile, openid)

---

## 9. Common Issues & Fixes

### Issue: "Access blocked: This app's request is invalid"
**Fix:** Make sure authorized domains include `poultryco.net`

### Issue: "403: access_denied"
**Fix:** If in Testing mode, add user to test users list

### Issue: Privacy/Terms links show 404
**Fix:** Deploy the new pages to production first:
```bash
# From workspace root
cd apps/web
npm run build
# Deploy to Vercel (or your hosting)
vercel --prod
```

### Issue: Redirect URI mismatch
**Fix:** Add authorized redirect URIs:
```
https://www.poultryco.net/auth/callback
http://localhost:3000/auth/callback  (for development)
```

---

## 10. Security Best Practices

✅ **Do:**
- Use HTTPS for all URLs (production)
- Keep client secret secure (never commit to git)
- Regularly review authorized users
- Monitor OAuth usage in Google Console

❌ **Don't:**
- Share client ID/secret publicly
- Use HTTP in production
- Request unnecessary scopes
- Skip email verification

---

## 📸 Screenshot Reference

The screenshot you provided shows the **Branding** section. Here's what to fill:

| Field | Value |
|-------|-------|
| **App name** | PoultryCo |
| **User support email** | team@poultryco.net |
| **App logo** | Upload 120x120 icon.png |
| **Application home page** | https://www.poultryco.net |
| **Application privacy policy link** | https://www.poultryco.net/privacy ⚠️ |
| **Application terms of service link** | https://www.poultryco.net/terms ⚠️ |
| **Authorized domains** | poultryco.net |

⚠️ = **Requires update based on new pages created**

---

## 🚀 Deployment Order

To avoid 404 errors on privacy/terms links:

1. **First:** Deploy the web app with new privacy/terms pages
   ```bash
   cd apps/web
   npm run build
   vercel --prod  # or your deployment method
   ```

2. **Verify:** Check pages are live
   - https://www.poultryco.net/privacy
   - https://www.poultryco.net/terms

3. **Then:** Update Google OAuth consent screen with URLs

4. **Test:** Try Google login flow

---

## 📞 Support

If you encounter issues:

**Google OAuth Issues:**
- Google Cloud Console: https://console.cloud.google.com/
- Support: https://cloud.google.com/support

**PoultryCo Implementation:**
- Check logs in Vercel dashboard
- Check Supabase auth logs
- Review browser console for errors

---

## ✅ Quick Reference

**Pages Created:**
- ✅ `/privacy` - Privacy Policy
- ✅ `/terms` - Terms of Service

**Google OAuth URLs to Update:**
- ⚠️ Application home page: `https://www.poultryco.net`
- ⚠️ Privacy policy: `https://www.poultryco.net/privacy`
- ⚠️ Terms of service: `https://www.poultryco.net/terms`

**Status:**
- ✅ Pages created and built successfully
- ✅ SEO metadata added
- ✅ Footer links configured
- ✅ Registration form references terms
- ⚠️ Google OAuth consent screen needs update
- ⚠️ Email addresses need setup (privacy@, legal@, etc.)

---

**Next Action:** Update Google Cloud Console OAuth consent screen with the new URLs after deploying to production.


