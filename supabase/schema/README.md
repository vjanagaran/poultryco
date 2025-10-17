# PoultryCo Database Schema

**Version:** 1.0  
**Date:** October 17, 2025  
**Status:** Production Ready

---

## 📋 Overview

This directory contains the complete SQL schema for PoultryCo's profile system, including:

- **Personal Profiles** with multi-role support
- **Business Profiles** with products and jobs
- **Organization Profiles** with membership and events
- **Privacy & Verification** system
- **Gamification** with badges and completeness tracking
- **Network Connections** (LinkedIn-style)
- **Complete RLS Policies** for security

**Total Tables:** 45+  
**Total SQL Files:** 12

---

## 📁 File Structure

Execute files in this exact order:

```
01_core_profiles.sql                    # Core profile tables
02_profile_roles.sql                    # Multi-role system
03_professional_info.sql                # Experience, education, skills
04_business_details.sql                 # Business locations, team, contacts
05_business_products_jobs.sql           # Products and job postings
06_organizations.sql                    # Organization details
07_memberships_events.sql               # Membership & event management
08_event_speakers_exhibitors.sql        # Event features (PTSE)
09_privacy_verification_gamification.sql # Privacy, verification, badges
10_network_connections.sql              # Connections and follows
11_stats_metrics.sql                    # Statistics tables
12_rls_policies.sql                     # Row Level Security policies
```

---

## 🚀 Execution Instructions

### **Method 1: Supabase Dashboard (Recommended)**

1. Open Supabase Dashboard → Your Project
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste **entire content** of `01_core_profiles.sql`
5. Click **"Run"**
6. Wait for success confirmation
7. Repeat for files `02` through `12` **in order**

**Important:**
- Execute files **one at a time**
- Execute in **numerical order**
- Wait for each file to complete before running the next
- Check for errors after each execution

### **Method 2: Supabase CLI**

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Execute schema files
supabase db execute --file 01_core_profiles.sql
supabase db execute --file 02_profile_roles.sql
supabase db execute --file 03_professional_info.sql
supabase db execute --file 04_business_details.sql
supabase db execute --file 05_business_products_jobs.sql
supabase db execute --file 06_organizations.sql
supabase db execute --file 07_memberships_events.sql
supabase db execute --file 08_event_speakers_exhibitors.sql
supabase db execute --file 09_privacy_verification_gamification.sql
supabase db execute --file 10_network_connections.sql
supabase db execute --file 11_stats_metrics.sql
supabase db execute --file 12_rls_policies.sql
```

### **Method 3: psql (Direct Connection)**

```bash
# Connect to Supabase PostgreSQL
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Execute files
\i 01_core_profiles.sql
\i 02_profile_roles.sql
\i 03_professional_info.sql
\i 04_business_details.sql
\i 05_business_products_jobs.sql
\i 06_organizations.sql
\i 07_memberships_events.sql
\i 08_event_speakers_exhibitors.sql
\i 09_privacy_verification_gamification.sql
\i 10_network_connections.sql
\i 11_stats_metrics.sql
\i 12_rls_policies.sql
```

---

## ✅ Verification Steps

After executing all files, verify the setup:

### **1. Check Tables Created**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected:** 45+ tables

### **2. Check RLS Enabled**

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected:** All tables should have `rowsecurity = true`

### **3. Check Functions Created**

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

**Expected:** 20+ functions

### **4. Check Triggers**

```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

**Expected:** 30+ triggers

### **5. Test Basic Operations**

```sql
-- Test profile creation (replace with your user ID from auth.users)
INSERT INTO profiles (id, full_name, profile_slug, location_state, country, phone, email)
VALUES (
  auth.uid(),
  'Test User',
  'test-user-namakkal',
  'Tamil Nadu',
  'India',
  '+919876543210',
  'test@example.com'
);

-- Check profile created
SELECT * FROM profiles WHERE id = auth.uid();

-- Check privacy settings auto-created
SELECT * FROM profile_privacy_settings WHERE profile_id = auth.uid();

-- Check stats initialized
SELECT * FROM profile_stats WHERE profile_id = auth.uid();
```

---

## 🔧 Troubleshooting

### **Error: "relation already exists"**

**Solution:** Tables already created. Either:
- Skip that file
- Drop tables and recreate: `DROP TABLE table_name CASCADE;`
- Start fresh (danger): See "Reset Database" below

### **Error: "function already exists"**

**Solution:** Add `OR REPLACE` to function definitions (already included in files)

### **Error: "permission denied"**

**Solution:** Ensure you're connected as `postgres` user or have proper permissions

### **Error: "syntax error"**

**Solution:**
- Ensure entire file content is copied
- Check for missing characters during copy/paste
- Re-copy from source file

---

## 🗑️ Reset Database (Danger Zone)

**⚠️ WARNING: This will delete ALL data!**

Only use for development/testing:

```sql
-- Drop all tables (cascades to all dependent objects)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Grant permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run all schema files
```

---

## 📊 Database Statistics

After setup, check database size:

```sql
SELECT 
  schemaname,
  COUNT(*) as table_count,
  pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||tablename))::bigint) as total_size
FROM pg_tables 
WHERE schemaname = 'public'
GROUP BY schemaname;
```

---

## 🔐 Security Notes

### **RLS (Row Level Security)**

All tables have RLS enabled with policies that:
- Allow users to manage their own data
- Respect privacy settings
- Enforce connection-based visibility
- Grant admin permissions appropriately

### **Functions Security**

Functions are marked `SECURITY DEFINER` where needed to:
- Check authentication state
- Validate relationships
- Maintain data integrity

### **Important:**

1. **Never disable RLS** unless you know what you're doing
2. **Review policies** before production deployment
3. **Test permissions** with different user roles
4. **Monitor query performance** with RLS enabled

---

## 🎯 Next Steps

After successful schema deployment:

1. ✅ **Test Authentication Flow**
   - Create test user via Supabase Auth
   - Verify profile auto-creation
   - Test profile updates

2. ✅ **Test Privacy Settings**
   - Create multiple test users
   - Test connection requests
   - Verify visibility rules

3. ✅ **Create Sample Data**
   - Add sample profiles
   - Create business profiles
   - Set up test organization (PTIC)

4. ✅ **Test Business Features**
   - Add products
   - Post jobs
   - Add team members

5. ✅ **Test Organization Features**
   - Create membership tiers
   - Bulk invite members
   - Create test event (PTSE)

6. ✅ **Performance Testing**
   - Test with 1000+ profiles
   - Check query performance
   - Optimize indexes if needed

---

## 📚 Related Documentation

- **Full Specification:** `../../docs/PROFILE_SYSTEM_SPECIFICATION.md`
- **Summary:** `../../docs/PROFILE_SYSTEM_SUMMARY.md`
- **Approval Doc:** `../../docs/PROFILE_SYSTEM_APPROVED.md`

---

## 🐛 Known Issues

None at this time.

---

## 🔄 Version History

### **Version 1.0** (October 17, 2025)
- Initial production-ready schema
- 45+ tables
- Complete RLS policies
- Multi-role profile system
- Polymorphic memberships
- Full event management (PTSE-ready)
- Privacy & verification system
- Gamification with badges

---

## 💡 Tips

1. **Backup Before Execution:** Always backup your database before running schema changes
2. **Test in Staging First:** Use a staging project for testing
3. **Monitor Performance:** Check slow query log after deployment
4. **Review Policies:** Customize RLS policies based on your needs
5. **Index Optimization:** Add custom indexes based on your query patterns

---

## 📧 Support

For issues or questions:
1. Check `PROFILE_SYSTEM_SPECIFICATION.md` for detailed information
2. Review Supabase logs for errors
3. Check PostgreSQL logs for database errors

---

**Last Updated:** October 17, 2025  
**Schema Version:** 1.0  
**Ready for Production:** ✅ YES

