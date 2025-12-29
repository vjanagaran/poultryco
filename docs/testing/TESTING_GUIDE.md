# Testing Guide - Web & Admin Apps

## Quick Start

### 1. Start All Services

```bash
# Terminal 1: Start API
cd apps/api
npm run dev
# API runs on http://localhost:3002

# Terminal 2: Start Web App
cd apps/web
npm run dev
# Web app runs on http://localhost:3000

# Terminal 3: Start Admin App
cd apps/admin
npm run dev
# Admin app runs on http://localhost:3001
```

### 2. Run Automated Tests

```bash
# Run the comprehensive test script
./scripts/test-all-features.sh
```

### 3. Manual Testing

Follow the comprehensive test plan: `docs/testing/COMPREHENSIVE_TEST_PLAN.md`

---

## Testing Checklist

### ✅ Pre-Testing Setup

- [ ] All services are running
- [ ] Database is connected and migrated
- [ ] Environment variables are configured
- [ ] Test user accounts are created
- [ ] Test data is available

### ✅ Critical Paths (Must Test)

#### Web App
- [ ] User registration and login
- [ ] Profile creation and editing
- [ ] Business profile creation
- [ ] Messaging (send/receive)
- [ ] Connection requests
- [ ] Blog post viewing
- [ ] NECC price viewing

#### Admin App
- [ ] Admin login
- [ ] Blog post creation
- [ ] NECC zone management
- [ ] NECC price scraping
- [ ] Content management

### ✅ API Endpoints

Test all migrated endpoints:
- Users API
- Businesses API
- Organizations API
- Events API
- Jobs API
- Marketplace API
- Messages API
- Notifications API
- Social API
- NECC API

---

## Common Issues & Solutions

### Issue: API returns 401 Unauthorized
**Solution:** Ensure you're sending the JWT token in the Authorization header:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3002/api/v1/users/search
```

### Issue: Blog pages return 404
**Solution:** Public blog endpoints need to be created. See `docs/api/WEB_PAGES_MIGRATION_COMPLETE.md`

### Issue: Supabase errors in console
**Solution:** Some utility files still reference Supabase. These will be removed in the cleanup phase.

### Issue: Images not loading
**Solution:** Check S3 configuration and ensure `NEXT_PUBLIC_CDN_URL` is set correctly.

---

## Test Data

### Test Users
- Admin: `admin@poultryco.net`
- Regular User: `user@poultryco.net`

### Test Businesses
- Create test businesses via admin panel or API

### Test Blog Posts
- Create test posts via admin panel

---

## Reporting Issues

When you find an issue:

1. Document it in the test plan under "Issue Tracking"
2. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Browser/OS information

---

## Next Steps

After testing:

1. Fix all critical issues
2. Document test results
3. Update test plan with results
4. Create issues for bugs found
5. Plan follow-up testing

