# Setup New PoultryCo Environment

**Purpose:** Complete guide for setting up a fresh Supabase environment for development/testing  
**Time Required:** ~30 minutes  
**Last Updated:** October 27, 2024

---

## 📋 Prerequisites

- [ ] Supabase account
- [ ] Project created in Supabase
- [ ] Node.js 18+ installed
- [ ] Git repository cloned

---

## 🚀 Quick Start (5 Steps)

### Step 1: Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in details:
   - **Name:** `poultryco-dev` (or your choice)
   - **Database Password:** Strong password (save this!)
   - **Region:** Choose closest to your location
   - **Plan:** Free tier is fine for dev
4. Wait 2-3 minutes for project setup

### Step 2: Get Project Credentials
1. Go to Project Settings → API
2. Copy these values:
   ```
   Project URL:    https://[PROJECT-ID].supabase.co
   anon (public):  eyJ... (long string)
   service_role:   eyJ... (long string - keep secret!)
   ```
3. Save to `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

### Step 3: Execute Schema Files
1. Go to Supabase Dashboard → SQL Editor
2. Execute files **in order** (copy/paste content):

```bash
# Execute these 28 files in sequence:
01_core_profiles.sql
02_profile_roles.sql
03_professional_info.sql
04_business_details.sql
05_business_products_jobs.sql
06_organizations.sql
07_memberships_events.sql
08_event_speakers_exhibitors.sql
09_privacy_verification_gamification.sql
10_network_connections.sql
11_stats_metrics.sql
12_rls_policies.sql
13_admin_roles.sql
14_marketing_cms.sql
15_social_posts_system.sql
16_social_posts_rls.sql
17_messaging_system.sql
18_notifications_system.sql
19_market_data_and_dashboard.sql
20_storage_buckets_and_policies.sql
21_add_cover_photo.sql
22_messaging_performance_optimization.sql
23_notification_triggers.sql
24_discovery_system_tables.sql
25_discovery_system_indexes.sql
26_make_profiles_global.sql
27_fix_profile_insert_policy.sql
28_final_rls_fixes.sql
```

**Important:** 
- Execute files **one at a time**
- Wait for each to complete successfully
- If error occurs, note which file and error message

### Step 4: Setup Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Click "Create Bucket"
3. Name: `cdn-poultryco`
4. **Public bucket:** YES (check the box)
5. Click "Create bucket"
6. Go to SQL Editor
7. Execute: `supabase/storage/UPDATE_BUCKET_MIME_TYPES.sql`

### Step 5: Verify Setup
Run verification queries in SQL Editor:

```sql
-- Check tables created
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public';
-- Should return: 70+

-- Check RLS enabled
SELECT COUNT(*) as rls_enabled_tables
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
-- Should return: 50+

-- Check storage bucket
SELECT * FROM storage.buckets WHERE name = 'cdn-poultryco';
-- Should return: 1 row with public = true

-- Check indexes
SELECT COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public';
-- Should return: 150+
```

---

## 📦 Install Dependencies

```bash
# Navigate to project root
cd poultryco

# Install all dependencies
npm install

# Verify installation
npm run build
```

---

## 🧪 Test Data (Optional)

### Create Test User
```sql
-- This will be done through the app's registration
-- But for quick testing, you can use Supabase Auth UI
```

### Seed Sample Data (Optional)
Create a few test entities for development:

```sql
-- Insert sample business types
INSERT INTO business_types (name, description) VALUES
('feed_mill', 'Feed Manufacturing'),
('hatchery', 'Hatchery Operations'),
('farm', 'Poultry Farm'),
('veterinary_clinic', 'Veterinary Services'),
('equipment_supplier', 'Equipment & Supplies');

-- Insert sample organization types
INSERT INTO organization_types (name, description) VALUES
('association', 'Professional Association'),
('cooperative', 'Farmers Cooperative'),
('research_institution', 'Research & Development'),
('government_body', 'Government Agency');

-- Insert sample event types
INSERT INTO event_types (name, description) VALUES
('conference', 'Industry Conference'),
('workshop', 'Training Workshop'),
('webinar', 'Online Webinar'),
('trade_show', 'Trade Show & Exhibition');

-- Insert sample job types
INSERT INTO job_types (name, description) VALUES
('full_time', 'Full-time Position'),
('part_time', 'Part-time Position'),
('contract', 'Contract/Freelance'),
('internship', 'Internship');
```

---

## 🔐 Security Configuration

### 1. Email Auth Settings
1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates (optional)

### 2. URL Configuration
1. Go to Authentication → URL Configuration
2. Add your local dev URL: `http://localhost:3000`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`

### 3. Rate Limiting (Production)
1. Go to Project Settings → API
2. Review rate limits
3. Adjust as needed for your plan

---

## 🌐 Frontend Configuration

### Environment Variables
Create `.env.local` in `apps/web/`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Optional: Service role (for admin functions)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Start Development Server
```bash
# Web app
cd apps/web
npm run dev
# Opens at http://localhost:3000

# Mobile app (optional)
cd apps/mobile
npm run start
# Opens Expo dev tools
```

---

## ✅ Verification Checklist

After setup, verify these work:

### Basic Functions
- [ ] Register new user account
- [ ] Login with email/password
- [ ] View own profile at `/me`
- [ ] Upload profile photo
- [ ] Edit profile information

### Discovery
- [ ] Browse members at `/discover/members`
- [ ] Browse businesses at `/discover/businesses`
- [ ] Search functionality works
- [ ] Filters work correctly

### Social Features
- [ ] Create a post at `/stream`
- [ ] Like a post
- [ ] Comment on a post
- [ ] @mention works

### Messaging
- [ ] Open messages at `/messages`
- [ ] Start new conversation
- [ ] Send message
- [ ] Receive message (use 2 browsers/users)

### Business Features
- [ ] Create business profile
- [ ] Edit business details
- [ ] Add products
- [ ] Invite team members

---

## 🐛 Common Issues & Solutions

### Issue: "relation does not exist"
**Solution:** Schema file not executed or executed out of order
```bash
# Re-run the missing schema file in SQL Editor
```

### Issue: "row-level security policy"
**Solution:** RLS policies not created
```bash
# Execute: 12_rls_policies.sql
# And: 28_final_rls_fixes.sql
```

### Issue: Storage uploads fail
**Solution:** Bucket not public or wrong configuration
```bash
# In SQL Editor:
UPDATE storage.buckets 
SET public = true 
WHERE name = 'cdn-poultryco';
```

### Issue: Images not loading
**Solution:** Storage policies not set
```bash
# Execute: 20_storage_buckets_and_policies.sql
```

### Issue: Notifications not working
**Solution:** Triggers not created
```bash
# Execute: 23_notification_triggers.sql
```

### Issue: Build fails with type errors
**Solution:** Clear cache and reinstall
```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📚 Additional Resources

- [DATABASE.md](./DATABASE.md) - Complete schema reference
- [Schema Migration Guide](../supabase/schema/SQL_MIGRATION_GUIDE.md)
- [Storage Setup](../supabase/storage/CDN_SETUP.md)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🆘 Need Help?

### Check Logs
```bash
# Supabase logs (in dashboard)
Logs → Database

# Frontend logs
# Open browser DevTools → Console

# Check schema execution errors
# SQL Editor → History tab
```

### Verify Environment
```bash
# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version

# Check Supabase connection
# In browser console:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

---

## 🎯 Next Steps After Setup

1. ✅ Create your test user account
2. ✅ Complete profile information
3. ✅ Create a test business profile
4. ✅ Create a few test posts
5. ✅ Test messaging between 2 users
6. ✅ Explore all features

---

## 📝 Notes for Dev Team

### Development Workflow
1. Always pull latest from `main` branch
2. Create feature branch: `feature/your-feature-name`
3. Test locally before pushing
4. Run `npm run build` before committing
5. Create PR for review

### Database Changes
1. Never modify production database directly
2. Always create migration files
3. Test migrations on dev environment first
4. Document all schema changes

### Code Standards
1. TypeScript strict mode enabled
2. ESLint configured
3. Prettier for formatting
4. Follow existing patterns

---

**Setup Complete! 🎉**

You now have a fully functional PoultryCo development environment ready for development and testing.

