# OAuth & Legal Pages - Documentation Index

**Master index for all OAuth and legal documentation**  
**Last Updated:** October 31, 2025

---

## 📖 Primary Documentation (Start Here)

### 1. Complete Reference Guide ⭐
**[OAUTH_AND_LEGAL_PAGES_COMPLETE.md](OAUTH_AND_LEGAL_PAGES_COMPLETE.md)**

**400+ lines of comprehensive documentation covering:**
- Legal pages (Privacy Policy & Terms of Service)
- OAuth setup (Google & LinkedIn)
- Profile auto-creation system
- Photo capture from OAuth metadata
- Complete testing procedures
- Detailed troubleshooting guide
- Maintenance and update procedures

**Use this for:**
- Understanding the complete system
- Debugging issues
- Reference during development
- Training new team members

---

### 2. Quick Start Guide 🚀
**[OAUTH_QUICK_START.md](OAUTH_QUICK_START.md)**

**15-minute setup guide with:**
- 3-step deployment process
- Quick testing checklist
- Common issue solutions
- Success verification

**Use this for:**
- Initial setup
- Quick deployment
- Verifying everything works

---

### 3. This Index 📋
**[OAUTH_SETUP_README.md](OAUTH_SETUP_README.md)**

**Navigation hub with:**
- Documentation overview
- File locations
- Quick reference cards
- External resources

**Use this for:**
- Finding the right documentation
- Quick lookups
- Status overview

---

## 📁 Implementation Files

### Application Code

**Legal Pages:**
```
/apps/web/src/app/(marketing)/
├── privacy/page.tsx              - Privacy Policy page
└── terms/page.tsx                - Terms of Service page
```

**OAuth Authentication:**
```
/apps/web/src/
├── app/auth/callback/route.ts    - OAuth callback handler
└── components/auth/
    ├── LoginForm.tsx             - Login with Google/LinkedIn
    └── RegisterForm.tsx          - Signup with Google/LinkedIn
```

**Configuration:**
```
/apps/web/src/config/site.ts      - Footer links configuration
```

### Database Schema

```
/supabase/schema/
├── 45_oauth_profile_creation.sql         - RPC function for profile creation
└── 46_update_existing_oauth_profiles.sql - Backfill script (one-time use)
```

---

## 🔍 Quick Reference Cards

### OAuth Provider Names
```typescript
✅ Correct:
- 'google'         // Google OAuth
- 'linkedin_oidc'  // LinkedIn OAuth

❌ Wrong:
- 'linkedin'       // Old, deprecated, causes errors
```

### Important URLs
```
Production:
- https://www.poultryco.net
- https://www.poultryco.net/privacy
- https://www.poultryco.net/terms
- https://www.poultryco.net/auth/callback

Development:
- http://localhost:3000
- http://localhost:3000/privacy
- http://localhost:3000/terms
```

### Email Addresses
```
privacy@poultryco.net    - Privacy & data requests
legal@poultryco.net      - Legal matters
dmca@poultryco.net       - Copyright notices
dpo@poultryco.net        - Data Protection Officer
team@poultryco.net       - General contact
```

### Database Functions
```sql
-- Create profile (7 parameters)
create_profile_for_user(
  p_user_id UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_slug TEXT,
  p_profile_photo_url TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT '',
  p_phone_verified BOOLEAN DEFAULT false
)

-- Returns: {"success": true/false, "profile_strength": number, ...}
```

---

## 🎯 Common Tasks

### Deploy Legal Page Updates
```bash
cd apps/web
# Edit privacy/page.tsx or terms/page.tsx
npm run build
vercel --prod
```

### Test OAuth Locally
```bash
cd apps/web
npm run dev
# Visit http://localhost:3000/register
# Test OAuth flows
```

### Check OAuth Logs
```
Vercel: Dashboard → Functions → /auth/callback
Supabase: Dashboard → Logs → Postgres Logs
```

### Update Existing Profiles with Photos
```sql
-- In Supabase SQL Editor
-- Run: 46_update_existing_oauth_profiles.sql
```

### Verify Profile Creation
```sql
SELECT 
  p.full_name,
  p.profile_photo_url,
  p.profile_strength,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC
LIMIT 10;
```

---

## 🐛 Troubleshooting Quick Links

| Issue | Section in Complete Guide |
|-------|--------------------------|
| LinkedIn validation error | Common Issues → Issue 1 |
| Profile not created | Common Issues → Issue 2 |
| No profile photo | Common Issues → Issue 3 |
| Profile strength wrong | Common Issues → Issue 4 |
| Function name conflict | Common Issues → Issue 5 |
| Column name errors | Common Issues → Issue 6 |

**All issues documented in:** [OAUTH_AND_LEGAL_PAGES_COMPLETE.md](OAUTH_AND_LEGAL_PAGES_COMPLETE.md) → Troubleshooting section

---

## 📊 System Architecture

### Data Flow Diagram
```
User Action
    ↓
┌─────────────────────────────────────────┐
│ Email Signup        OAuth Signup        │
│     ↓                    ↓               │
│ RegisterForm        Google/LinkedIn     │
│     ↓                    ↓               │
│ Explicit RPC        auth/callback       │
│     ↓                    ↓               │
│     └────────────────────┘               │
│              ↓                           │
│    create_profile_for_user()            │
│              ↓                           │
│    ┌────────────────────┐               │
│    │ profiles table     │               │
│    │ profile_stats      │               │
│    └────────────────────┘               │
└─────────────────────────────────────────┘
```

### Profile Data Sources

**Email Registration:**
- Name: User input (form)
- Email: User input (form)
- Photo: None initially
- Phone: None initially

**Google OAuth:**
- Name: Google metadata (`name`)
- Email: Google metadata (`email`)
- Photo: Google metadata (`picture`)
- Phone: Rarely available

**LinkedIn OAuth:**
- Name: LinkedIn metadata (`full_name`)
- Email: LinkedIn metadata (`email`)
- Photo: LinkedIn metadata (`picture` or `avatar_url`)
- Phone: Not available

---

## 🎓 Learning Path

### For New Developers

**Week 1: Understanding**
1. Read: OAUTH_QUICK_START.md (15 min)
2. Read: Complete guide introduction and overview (30 min)
3. Review: Legal pages in browser
4. Review: Auth flow code

**Week 2: Implementation**
1. Set up: Local development environment
2. Test: OAuth flows locally
3. Debug: Using Vercel logs
4. Deploy: To staging/production

**Week 3: Mastery**
1. Read: Full troubleshooting guide
2. Practice: Manual testing procedures
3. Understand: Database schema and RPC functions
4. Document: Any new issues or solutions

---

## 📅 Maintenance Schedule

### Daily
- Monitor OAuth success rates
- Check for profile creation failures
- Review error logs

### Weekly
- Verify photo capture rates
- Check profile strength distribution
- Review user feedback

### Monthly
- Update metrics dashboard
- Review OAuth provider status
- Check for deprecated OAuth methods
- Audit legal pages for accuracy

### Quarterly
- Review and update legal pages if needed
- Check OAuth provider compliance
- Verify GDPR compliance
- Update documentation

### Annually
- Legal counsel review of Privacy & Terms
- Major documentation review
- OAuth provider relationship review
- Compliance audit

---

## 🔄 Version History

### Version 1.0 - October 31, 2025
**Initial complete implementation:**
- ✅ Privacy Policy created
- ✅ Terms of Service created
- ✅ Google OAuth working
- ✅ LinkedIn OAuth fixed (provider name)
- ✅ Profile auto-creation implemented
- ✅ Photo capture from OAuth
- ✅ Backfill script for existing users
- ✅ Complete documentation consolidated

**Changes from development:**
- Consolidated 8 separate docs into 2 primary docs
- Fixed LinkedIn provider name
- Enhanced photo capture
- Added debug logging
- Created backfill script

---

## 📞 Getting Help

### Documentation Issues
- Check complete reference guide first
- Search for keywords in consolidated doc
- Review troubleshooting section

### Technical Issues
- Check Vercel logs (callback execution)
- Check Supabase logs (RPC calls)
- Test RPC function manually
- Review provider settings

### Legal Questions
- Consult with legal counsel
- Review GDPR/COPPA resources
- Check industry-specific regulations

---

## ✅ Documentation Quality Checklist

This consolidated documentation provides:

- [x] Complete overview of all components
- [x] Step-by-step setup instructions
- [x] Testing procedures for all scenarios
- [x] Troubleshooting for all known issues
- [x] Code examples and SQL queries
- [x] Quick reference cards
- [x] Maintenance guidelines
- [x] Version history
- [x] External resource links
- [x] Clear organization and structure

---

**For complete information:** See [OAUTH_AND_LEGAL_PAGES_COMPLETE.md](OAUTH_AND_LEGAL_PAGES_COMPLETE.md)  
**For quick setup:** See [OAUTH_QUICK_START.md](OAUTH_QUICK_START.md)  
**For this index:** You're reading it! 📖


