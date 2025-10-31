# OAuth Profile Creation - Quick Fix

**Error Fixed:** `function name "create_profile_for_user" is not unique`

---

## ✅ Solution: Run This SQL

**File:** `/supabase/schema/45_oauth_profile_creation.sql`

The file now includes:
```sql
-- Drop old function signatures first to avoid conflicts
DROP FUNCTION IF EXISTS create_profile_for_user(UUID, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_profile_for_user(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN);

-- Then creates the new function with 7 parameters
CREATE OR REPLACE FUNCTION create_profile_for_user(...)
```

---

## 🚀 One-Command Setup

### Step 1: Run SQL
1. Open: **Supabase Dashboard** → **SQL Editor**
2. Copy **entire file**: `/supabase/schema/45_oauth_profile_creation.sql`
3. Paste and click **"Run"**
4. Should show: ✅ Success (no errors)

### Step 2: Deploy Code
```bash
cd apps/web
vercel --prod
```

---

## 🧪 Quick Test

### Test OAuth Signup
1. Incognito window
2. `/register` → Click "Continue with Google"
3. Authorize
4. Should redirect to `/welcome` ✅

### Verify Profile Created
```sql
-- In Supabase SQL Editor
SELECT 
  id,
  full_name,
  profile_photo_url,  -- Should have photo URL
  profile_strength    -- Should be 60+
FROM profiles
ORDER BY created_at DESC
LIMIT 1;
```

---

## 🔍 What This Does

**Drops old function:**
- Old: 4 parameters (user_id, name, email, slug)
- Conflicts prevented ✅

**Creates new function:**
- New: 7 parameters (+ photo_url, phone, phone_verified)
- Captures all OAuth data ✅
- Dynamic profile strength ✅

---

## ✅ Expected Result

After running SQL:
```
DROP FUNCTION
DROP FUNCTION
CREATE FUNCTION
```

After OAuth signup:
- ✅ Profile exists in database
- ✅ Has Google/LinkedIn profile photo
- ✅ Profile strength is 60+ (not 25)
- ✅ Can access /dashboard without errors

---

## 📊 What Gets Captured

| Data | Source | Profile Field |
|------|--------|---------------|
| Name | Google/LinkedIn | `full_name` |
| Email | Google/LinkedIn | `email` |
| **Photo** | Google/LinkedIn | `profile_photo_url` ✅ |
| Phone | Rarely available | `phone` |

**Profile Strength:**
- Base: 25
- +Name: 15
- +Photo: 20 ← **NEW!**
- **Total: 60** (was 25 before)

---

## 🐛 If Still Not Working

**Check 1: Function exists?**
```sql
SELECT routine_name, COUNT(*) 
FROM information_schema.routines 
WHERE routine_name = 'create_profile_for_user'
GROUP BY routine_name;

-- Should show: create_profile_for_user | 1
-- (Not 2 or more)
```

**Check 2: Parameters?**
```sql
SELECT parameter_name, data_type
FROM information_schema.parameters
WHERE specific_name = (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'create_profile_for_user'
  LIMIT 1
)
ORDER BY ordinal_position;

-- Should show 7 rows
```

**Check 3: Vercel logs**
- Dashboard → Functions → `/auth/callback`
- Look for: "Profile created successfully"

---

## 📝 Summary

**Problem:** Function name conflict (old 4-param vs new 7-param)  
**Solution:** Drop old function first, then create new one  
**Result:** OAuth users get complete profiles with photos  

**Status:** ✅ Ready to run  
**File:** `45_oauth_profile_creation.sql` (updated)  
**Next:** Run SQL → Deploy → Test


