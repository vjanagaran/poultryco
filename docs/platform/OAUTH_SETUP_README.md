# OAuth & Legal Pages Documentation

**Complete Reference for PoultryCo OAuth Authentication and Legal Pages**

---

## 📚 Documentation Files

### Primary Reference (Read This First)
**[OAUTH_AND_LEGAL_PAGES_COMPLETE.md](OAUTH_AND_LEGAL_PAGES_COMPLETE.md)**

Complete reference covering:
- Legal pages implementation (Privacy & Terms)
- OAuth setup (Google & LinkedIn)
- Profile auto-creation system
- Photo capture from OAuth
- Testing procedures
- Troubleshooting guide
- Maintenance guidelines

**When to use:** Complete information, debugging, understanding the system

---

### Quick Start Guide
**[OAUTH_QUICK_START.md](OAUTH_QUICK_START.md)**

Fast setup guide:
- 3-step deployment process
- Quick testing procedures
- Common issue fixes
- Success checklist

**When to use:** New setup, quick reference, deploying changes

---

## 🗂️ Related Documentation

### Legacy Documents (Consolidated)
The following were merged into the complete reference above:
- ~~OAUTH_PHOTO_FIX.md~~ → Deleted
- ~~OAUTH_DEBUG_GUIDE.md~~ → Deleted
- ~~OAUTH_SETUP_INSTRUCTIONS.md~~ → Deleted
- ~~QUICK_OAUTH_FIX.md~~ → Deleted
- ~~OAUTH_PROFILE_FIX.md~~ → Deleted
- ~~FINAL_OAUTH_FIX.md~~ → Deleted

### Still Separate (Specific Topics)
- **[LINKEDIN_OAUTH_FIX.md](../../LINKEDIN_OAUTH_FIX.md)** - LinkedIn provider name fix
- **[GOOGLE_OAUTH_SETUP_CHECKLIST.md](../../GOOGLE_OAUTH_SETUP_CHECKLIST.md)** - Google consent screen
- **[LEGAL_PAGES_SUMMARY.md](../../LEGAL_PAGES_SUMMARY.md)** - Legal pages details

**Note:** These can also be consolidated or moved to `/docs/archive/` if preferred.

---

## 📂 File Structure

### Application Files
```
apps/web/src/
├── app/
│   ├── (marketing)/
│   │   ├── privacy/page.tsx           ✅ Privacy Policy
│   │   └── terms/page.tsx             ✅ Terms of Service
│   └── auth/
│       └── callback/route.ts          ✅ OAuth callback handler
└── components/auth/
    ├── LoginForm.tsx                  ✅ Google/LinkedIn login
    └── RegisterForm.tsx               ✅ Google/LinkedIn signup
```

### Database Files
```
supabase/schema/
├── 45_oauth_profile_creation.sql      ✅ RPC function
└── 46_update_existing_oauth_profiles.sql  ✅ Backfill script
```

---

## 🎯 Quick Reference

### OAuth Provider Names
```typescript
'google'         // ✅ Google OAuth
'linkedin_oidc'  // ✅ LinkedIn OAuth (NOT 'linkedin')
```

### URLs
```
Privacy:  https://www.poultryco.net/privacy
Terms:    https://www.poultryco.net/terms
Callback: https://www.poultryco.net/auth/callback
```

### Email Addresses
```
privacy@poultryco.net   - Privacy inquiries
legal@poultryco.net     - Legal matters
dmca@poultryco.net      - Copyright notices
dpo@poultryco.net       - Data Protection Officer
```

### SQL Functions
```sql
create_profile_for_user(
  user_id,
  full_name,
  email,
  slug,
  profile_photo_url,  -- Optional
  phone,              -- Optional
  phone_verified      -- Optional
)
```

---

## 🚀 Getting Started

### New Developer Setup
1. Read: [OAUTH_QUICK_START.md](OAUTH_QUICK_START.md)
2. Run: Database SQL scripts
3. Deploy: Code to Vercel
4. Test: OAuth flows

### Debugging Issues
1. Read: [OAUTH_AND_LEGAL_PAGES_COMPLETE.md](OAUTH_AND_LEGAL_PAGES_COMPLETE.md) → Troubleshooting section
2. Check: Vercel and Supabase logs
3. Verify: OAuth provider settings
4. Test: Manual RPC function calls

### Updating Legal Pages
1. Edit: `apps/web/src/app/(marketing)/privacy/page.tsx` or `terms/page.tsx`
2. Update: "Last Updated" date
3. Add: Version history entry
4. Deploy: `vercel --prod`
5. Notify: Users of material changes

---

## 📊 System Status

| Component | Status | Version |
|-----------|--------|---------|
| Privacy Policy | ✅ Live | 1.0 |
| Terms of Service | ✅ Live | 1.0 |
| Google OAuth | ✅ Working | Latest |
| LinkedIn OAuth | ✅ Working | OIDC |
| Profile Creation | ✅ Working | v2 (with photos) |
| Photo Capture | ✅ Enhanced | Latest |

---

## 🔗 External Resources

**Supabase:**
- Dashboard: https://supabase.com/dashboard
- Auth Docs: https://supabase.com/docs/guides/auth

**Google:**
- Cloud Console: https://console.cloud.google.com/
- OAuth Docs: https://developers.google.com/identity/protocols/oauth2

**LinkedIn:**
- Developer Portal: https://www.linkedin.com/developers/
- OIDC Docs: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2

**Legal:**
- GDPR: https://gdpr.eu/
- COPPA: https://www.ftc.gov/enforcement/rules/rulemaking-regulatory-reform-proceedings/childrens-online-privacy-protection-rule

---

## 📞 Support

**For questions or issues:**
- Technical: Check the complete reference doc
- OAuth: Review provider-specific sections
- Legal: Consult with legal counsel
- Database: Check Supabase logs and schema files

---

**Last Updated:** October 31, 2025  
**Maintained By:** PoultryCo Development Team  
**Next Review:** After public launch


