# Admin Authentication Strategy

**Date:** October 21, 2025  
**Status:** Recommended Approach

---

## 🎯 **Solution: Same Supabase, Role-Based Access**

### **Recommended Approach**
Use the **same Supabase Auth** for both end-users and admins, but differentiate them with a **role-based system** in the database.

---

## 🏗️ **Architecture**

```
┌─────────────────────────────────────────────────────┐
│              Supabase Auth (Single Instance)         │
│                                                      │
│  All users authenticate here (email/password)       │
└──────────────────┬───────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  User authenticated   │
        │  (JWT token issued)   │
        └──────────┬────────────┘
                   │
        ┌──────────▼──────────┐
        │  Check user role    │
        │  in database        │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────────────────┐
        │                                  │
   ┌────▼─────┐              ┌────────▼────────┐
   │ Regular  │              │  Admin User     │
   │ User     │              │  (has admin     │
   │          │              │   role in DB)   │
   └────┬─────┘              └────────┬────────┘
        │                             │
        ▼                             ▼
   Mobile/Web App              Admin Portal
   (www.poultryco.net)        (admin.poultryco.net)
```

---

## 📊 **Database Schema for Admin Roles**

### **Create Admin Roles Table**

```sql
-- Admin Users Table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_manager', 'user_manager', 'marketing_manager', 'community_manager')),
  permissions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id),
  last_login_at TIMESTAMPTZ,
  
  -- Ensure one user can only have one admin role
  UNIQUE(user_id)
);

-- Index for fast lookups
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_is_active ON admin_users(is_active);

-- Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all admin users
CREATE POLICY "Admins can view admin users"
  ON admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- Policy: Super admins can manage admin users
CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = user_uuid
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM admin_users
  WHERE user_id = user_uuid
  AND is_active = true;
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔐 **Implementation**

### **1. Environment Variables (Shared)**

**Location:** `/apps/.env.local` (shared by all apps)

```env
# Supabase (Same for all apps)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Benefits:**
- ✅ Single source of truth
- ✅ Easy to update
- ✅ No duplication
- ✅ Consistent across apps

### **2. Updated Middleware (Admin Portal)**

```typescript
// apps/admin/src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if user is authenticated
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated, check if user is admin
  if (session && !request.nextUrl.pathname.startsWith('/login')) {
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('role, permissions, is_active')
      .eq('user_id', session.user.id)
      .single()

    // If user is not an admin, deny access
    if (error || !adminUser || !adminUser.is_active) {
      // Clear session and redirect to login with error
      await supabase.auth.signOut()
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url)
      )
    }

    // Store admin role in headers for use in pages
    response.headers.set('x-user-role', adminUser.role)
    response.headers.set('x-user-permissions', JSON.stringify(adminUser.permissions))
  }

  // Redirect to dashboard if already logged in
  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### **3. Updated Login Page**

```typescript
// apps/admin/src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for error from middleware
  const urlError = searchParams.get('error');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      
      // Authenticate user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user is admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role, is_active')
        .eq('user_id', authData.user.id)
        .single();

      if (adminError || !adminUser || !adminUser.is_active) {
        // User is not an admin, sign them out
        await supabase.auth.signOut();
        throw new Error('You do not have admin access. Please use the main app.');
      }

      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', authData.user.id);

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="w-16 h-16 bg-poultryco-green rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-2xl">P</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PoultryCo Admin
        </h1>
        <p className="text-gray-600">
          Sign in to manage the platform
        </p>
      </div>

      {/* Error Messages */}
      {(error || urlError === 'unauthorized') && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
          {urlError === 'unauthorized' 
            ? 'You do not have admin access. Please contact your administrator.'
            : error
          }
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Admin Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            placeholder="admin@poultryco.net"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poultryco-green focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-poultryco-green text-white py-3 rounded-lg font-semibold hover:bg-poultryco-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Admin access only. Contact your administrator for access.</p>
      </div>
    </div>
  );
}
```

---

## 📝 **SQL Migration File**

Create this file to set up admin roles:

```sql
-- File: supabase/schema/13_admin_roles.sql

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'content_manager', 'user_manager', 'marketing_manager', 'community_manager')),
  permissions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id),
  last_login_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Helper Functions
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM admin_users
  WHERE user_id = user_uuid AND is_active = true;
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

-- Comments
COMMENT ON TABLE admin_users IS 'Admin users with role-based access control';
COMMENT ON COLUMN admin_users.role IS 'Admin role: super_admin, content_manager, user_manager, marketing_manager, community_manager';
COMMENT ON COLUMN admin_users.permissions IS 'Additional granular permissions as JSON';
```

---

## 🚀 **How to Set Up**

### **Step 1: Create Shared Environment File**

```bash
# Create shared .env.local in apps/ folder
touch /Users/janagaran/Programs/poultryco/apps/.env.local

# Add your Supabase credentials
```

### **Step 2: Update Next.js Config (All Apps)**

```javascript
// apps/admin/next.config.mjs
// apps/web/next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Load env from parent directory
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  // ... rest of config
}
```

### **Step 3: Run SQL Migration**

```bash
# In Supabase SQL Editor, run:
# supabase/schema/13_admin_roles.sql
```

### **Step 4: Create First Admin User**

```sql
-- In Supabase SQL Editor

-- 1. First, create a user in Supabase Auth (or use existing user)
-- Go to: Authentication > Users > Add User
-- Email: admin@poultryco.net
-- Password: (set a strong password)

-- 2. Get the user_id from auth.users table
SELECT id, email FROM auth.users WHERE email = 'admin@poultryco.net';

-- 3. Make that user a super admin
INSERT INTO admin_users (user_id, role, is_active)
VALUES (
  'USER_ID_FROM_STEP_2',  -- Replace with actual UUID
  'super_admin',
  true
);
```

---

## ✅ **Benefits of This Approach**

### **1. Single Auth System**
- ✅ One Supabase instance
- ✅ One user table
- ✅ Simplified management
- ✅ Cost-effective

### **2. Role-Based Access**
- ✅ Same email can be user + admin
- ✅ Granular permissions
- ✅ Easy to manage roles
- ✅ Audit trail

### **3. Security**
- ✅ Row Level Security (RLS)
- ✅ Middleware protection
- ✅ Server-side validation
- ✅ Activity logging

### **4. Flexibility**
- ✅ Multiple admin roles
- ✅ Custom permissions
- ✅ Easy to add new roles
- ✅ Scalable

---

## 🎯 **Admin Roles**

| Role | Permissions | Use Case |
|------|-------------|----------|
| **super_admin** | Full access | Platform owner, CTO |
| **content_manager** | Blog, pages, media | Content team |
| **user_manager** | User CRUD, verification | Support team |
| **marketing_manager** | Campaigns, analytics | Marketing team |
| **community_manager** | Moderation, support | Community team |

---

## 📊 **Permission System**

```typescript
// Example permissions JSON
{
  "blog": ["create", "read", "update", "delete"],
  "users": ["read", "update"],
  "analytics": ["read"],
  "settings": []
}
```

---

## 🔒 **Security Best Practices**

1. **Never expose service role key** in client code
2. **Always validate on server-side** (middleware, API routes)
3. **Log all admin actions** for audit trail
4. **Use MFA for super admins** (optional but recommended)
5. **Regularly review admin access** and remove inactive admins

---

**Status:** ✅ Recommended Approach  
**Complexity:** Medium  
**Security:** High  
**Maintainability:** Excellent

