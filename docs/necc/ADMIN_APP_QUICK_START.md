# 🚀 NECC Admin App - Quick Start Guide

**For:** Development Team  
**Purpose:** Quick reference for building the NECC admin app  
**Last Updated:** January 2025

---

## 📁 PROJECT STRUCTURE

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── necc/                          # 👈 NEW: NECC admin section
│   │   │   │   ├── page.tsx                   # NECC Dashboard
│   │   │   │   ├── zones/
│   │   │   │   │   ├── page.tsx               # Zone List
│   │   │   │   │   ├── new/page.tsx           # Add Zone
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx           # Zone Detail
│   │   │   │   │       └── edit/page.tsx      # Edit Zone
│   │   │   │   ├── prices/
│   │   │   │   │   ├── page.tsx               # Price List
│   │   │   │   │   ├── daily/page.tsx         # Daily Price Grid
│   │   │   │   │   ├── new/page.tsx           # Add Manual Price
│   │   │   │   │   └── import/page.tsx        # Import Prices
│   │   │   │   ├── scraper/
│   │   │   │   │   ├── page.tsx               # Scraper Dashboard
│   │   │   │   │   ├── logs/page.tsx          # Scraper Logs
│   │   │   │   │   └── config/page.tsx        # Scraper Config
│   │   │   │   ├── experts/
│   │   │   │   │   ├── page.tsx               # Expert List
│   │   │   │   │   ├── new/page.tsx           # Add Expert
│   │   │   │   │   └── [id]/page.tsx          # Expert Detail
│   │   │   │   ├── annotations/
│   │   │   │   │   ├── page.tsx               # Annotation List
│   │   │   │   │   └── [id]/page.tsx          # Annotation Detail
│   │   │   │   ├── predictions/
│   │   │   │   │   ├── page.tsx               # Prediction List
│   │   │   │   │   └── [id]/page.tsx          # Prediction Detail
│   │   │   │   ├── blog/
│   │   │   │   │   ├── page.tsx               # Blog List
│   │   │   │   │   ├── new/page.tsx           # New Post
│   │   │   │   │   └── [id]/edit/page.tsx     # Edit Post
│   │   │   │   ├── analytics/page.tsx         # Analytics Dashboard
│   │   │   │   └── settings/page.tsx          # NECC Settings
│   │   │   └── ... (existing admin pages)
│   │   └── api/
│   │       └── admin/
│   │           └── necc/                       # 👈 NEW: NECC API routes
│   │               ├── zones/route.ts
│   │               ├── prices/route.ts
│   │               ├── scraper/
│   │               │   ├── run/route.ts
│   │               │   ├── stop/route.ts
│   │               │   ├── status/route.ts
│   │               │   └── logs/route.ts
│   │               ├── experts/route.ts
│   │               ├── annotations/route.ts
│   │               ├── predictions/route.ts
│   │               └── analytics/route.ts
│   ├── components/
│   │   ├── necc/                               # 👈 NEW: NECC components
│   │   │   ├── zones/
│   │   │   │   ├── ZoneForm.tsx
│   │   │   │   ├── ZoneTable.tsx
│   │   │   │   └── ZoneCard.tsx
│   │   │   ├── prices/
│   │   │   │   ├── PriceForm.tsx
│   │   │   │   ├── PriceTable.tsx
│   │   │   │   ├── DailyPriceGrid.tsx
│   │   │   │   └── PriceImportModal.tsx
│   │   │   ├── scraper/
│   │   │   │   ├── ScraperStatusCard.tsx
│   │   │   │   ├── ScraperControls.tsx
│   │   │   │   └── LogViewer.tsx
│   │   │   ├── experts/
│   │   │   │   ├── ExpertForm.tsx
│   │   │   │   └── ExpertTable.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── TrafficChart.tsx
│   │   │   │   ├── EngagementChart.tsx
│   │   │   │   └── MetricCard.tsx
│   │   │   └── dashboard/
│   │   │       ├── NECCDashboardCards.tsx
│   │   │       └── QuickActions.tsx
│   │   └── ... (existing components)
│   └── lib/
│       ├── api/
│       │   └── necc-admin.ts                   # 👈 NEW: NECC API client
│       ├── validations/
│       │   └── necc.ts                         # 👈 NEW: Zod schemas
│       └── ... (existing lib)
```

---

## 🗄️ DATABASE TABLES (Already Exist)

### Existing NECC Tables
```sql
-- Core tables (in supabase/schema/50_necc_system.sql)
necc_zones                  -- Zone data (Namakkal, Mumbai, etc.)
necc_prices                 -- Daily price data
necc_annotations            -- Expert annotations
necc_experts                -- Expert profiles
necc_predictions            -- AI & expert predictions
necc_monthly_averages       -- Materialized view (monthly data)
necc_yoy_daily_averages     -- Materialized view (YoY data)
```

### New Admin Tables (To Create)
```sql
-- Admin-specific tables
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'zone_created', 'price_updated', etc.
  resource_type TEXT NOT NULL, -- 'zone', 'price', 'annotation', etc.
  resource_id UUID,
  details JSONB, -- Full details of the action
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scraper_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL, -- 'started', 'success', 'failed'
  mode TEXT NOT NULL, -- 'CRON', 'MANUAL'
  triggered_by UUID REFERENCES profiles(id), -- NULL if CRON
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  zones_scraped INTEGER DEFAULT 0,
  zones_failed INTEGER DEFAULT 0,
  error_message TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scraper_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT, -- 'general', 'scraper', 'email', etc.
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Middleware Protection
```typescript
// apps/admin/src/middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if route is admin-only
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const supabase = createServerClient(/* ... */)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check if user has admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  return NextResponse.next()
}
```

### RLS Policies (To Add)
```sql
-- Admin-only access to admin tables
CREATE POLICY "Admin users can read audit log"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Similar for scraper_logs, scraper_config, system_settings
```

---

## 🎨 UI COMPONENTS (Use Existing)

### From shadcn/ui (Already Installed)
```tsx
// Import from existing components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
```

### New Components to Create
```tsx
// apps/admin/src/components/necc/zones/ZoneForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { zoneSchema, type ZoneFormData } from '@/lib/validations/necc'

export function ZoneForm({ zone }: { zone?: Zone }) {
  const router = useRouter()
  const form = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: zone || {},
  })

  const onSubmit = async (data: ZoneFormData) => {
    const response = await fetch('/api/admin/necc/zones', {
      method: zone ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      router.push('/admin/necc/zones')
      router.refresh()
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

---

## 🔧 API ROUTES

### Zone Management
```typescript
// apps/admin/src/app/api/admin/necc/zones/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { zoneSchema } from '@/lib/validations/necc'
import { logAdminAction } from '@/lib/audit'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Get zones
  const { data, error } = await supabase
    .from('necc_zones')
    .select('*')
    .order('sorting', { ascending: true })
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Validate input
  const body = await request.json()
  const validatedData = zoneSchema.parse(body)
  
  // Insert zone
  const { data, error } = await supabase
    .from('necc_zones')
    .insert(validatedData)
    .select()
    .single()
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  // Log action
  await logAdminAction(user.id, 'zone_created', 'zone', data.id, validatedData)
  
  return NextResponse.json(data, { status: 201 })
}
```

### Scraper Control
```typescript
// apps/admin/src/app/api/admin/necc/scraper/run/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/audit'

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Log scraper start
  const { data: log } = await supabase
    .from('scraper_logs')
    .insert({
      status: 'started',
      mode: 'MANUAL',
      triggered_by: user.id,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()
  
  // Trigger scraper (call the existing cron endpoint internally)
  try {
    const scrapeResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cron/scrape-necc-prices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`, // Add this to env
      },
    })
    
    if (scrapeResponse.ok) {
      await supabase
        .from('scraper_logs')
        .update({ status: 'success', completed_at: new Date().toISOString() })
        .eq('id', log.id)
      
      await logAdminAction(user.id, 'scraper_run', 'scraper', log.id, {})
      
      return NextResponse.json({ message: 'Scraper started successfully' })
    } else {
      throw new Error('Scraper failed')
    }
  } catch (error) {
    await supabase
      .from('scraper_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: error.message,
      })
      .eq('id', log.id)
    
    return NextResponse.json({ error: 'Scraper failed' }, { status: 500 })
  }
}
```

---

## 📝 VALIDATION SCHEMAS

```typescript
// apps/admin/src/lib/validations/necc.ts

import { z } from 'zod'

export const zoneSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  description: z.string().optional(),
  zone_type: z.enum(['production_center', 'consumption_center']),
  zone_code: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  sorting: z.number().int().default(0),
  status: z.boolean().default(true),
})

export const priceSchema = z.object({
  zone_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  suggested_price: z.number().int().positive().optional(),
  prevailing_price: z.number().int().positive().optional(),
  source: z.enum(['scraped', 'manual', 'imported']).default('manual'),
})

export const expertSchema = z.object({
  profile_id: z.string().uuid(),
  credentials: z.string().optional(),
  organization: z.string().optional(),
  experience_years: z.number().int().min(0).optional(),
  specialization: z.array(z.string()).optional(),
  bio: z.string().optional(),
  verified: z.boolean().default(false),
  necc_access: z.boolean().default(false),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
})

export const annotationSchema = z.object({
  expert_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  zone_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  annotation_type: z.enum([
    'price_spike',
    'price_drop',
    'trend_change',
    'market_insight',
    'forecast',
    'general'
  ]),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
})

export type ZoneFormData = z.infer<typeof zoneSchema>
export type PriceFormData = z.infer<typeof priceSchema>
export type ExpertFormData = z.infer<typeof expertSchema>
export type AnnotationFormData = z.infer<typeof annotationSchema>
```

---

## 🔨 UTILITY FUNCTIONS

```typescript
// apps/admin/src/lib/audit.ts

import { createServerClient } from '@/lib/supabase/server'

export async function logAdminAction(
  adminUserId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: any
) {
  const supabase = createServerClient()
  
  await supabase.from('admin_audit_log').insert({
    admin_user_id: adminUserId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
  })
}
```

```typescript
// apps/admin/src/lib/export.ts

export function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h]).join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
```

---

## 🎯 DEVELOPMENT WORKFLOW

### 1. Start Development Server
```bash
cd apps/admin
npm run dev
```

### 2. Database Migrations
```bash
# Create new migration
cd supabase
npx supabase migration new admin_tables

# Apply migrations
npx supabase db push
```

### 3. Generate Types (After DB Changes)
```bash
npx supabase gen types typescript --local > src/types/database.types.ts
```

### 4. Testing
```bash
# Run tests
npm run test

# Run E2E tests
npm run test:e2e
```

---

## 📋 FIRST TASKS (Day 1)

1. ✅ Create admin tables (migrations)
2. ✅ Set up admin routing (`apps/admin/src/app/(dashboard)/necc/`)
3. ✅ Create NECC Dashboard page
4. ✅ Add NECC to admin navigation
5. ✅ Create Zone List page
6. ✅ Create API route for zones (`/api/admin/necc/zones`)
7. ✅ Test zone CRUD operations

---

## 🔍 USEFUL QUERIES

### Get All Zones with Latest Price
```sql
SELECT 
  z.*,
  p.date AS last_price_date,
  p.suggested_price,
  p.prevailing_price
FROM necc_zones z
LEFT JOIN LATERAL (
  SELECT * FROM necc_prices
  WHERE zone_id = z.id
  ORDER BY date DESC
  LIMIT 1
) p ON true
ORDER BY z.sorting;
```

### Get Scraper Success Rate (Last 30 Days)
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_runs,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_runs,
  ROUND(
    100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*),
    2
  ) as success_rate
FROM scraper_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Get Missing Prices by Zone (Last 7 Days)
```sql
WITH date_range AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE,
    '1 day'::interval
  )::date AS date
),
zone_dates AS (
  SELECT z.id, z.name, dr.date
  FROM necc_zones z
  CROSS JOIN date_range dr
  WHERE z.status = true
)
SELECT 
  zd.name,
  zd.date,
  CASE WHEN p.id IS NULL THEN 'MISSING' ELSE 'OK' END as status
FROM zone_dates zd
LEFT JOIN necc_prices p ON p.zone_id = zd.id AND p.date = zd.date
WHERE p.id IS NULL
ORDER BY zd.date DESC, zd.name;
```

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue: "Unauthorized" when calling API
**Solution:** Check middleware, ensure user has admin role

### Issue: Type errors with Supabase client
**Solution:** Regenerate types with `npx supabase gen types`

### Issue: RLS blocking admin actions
**Solution:** Ensure RLS policies allow admin users

### Issue: Scraper not starting
**Solution:** Check `CRON_SECRET` env variable, verify scraper endpoint

---

## 📚 HELPFUL LINKS

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Recharts Docs](https://recharts.org/)
- [Zod Validation](https://zod.dev/)

---

**Status:** ✅ **Ready to Start Development**  
**Next Step:** Create admin tables migration and start with Zone Management module

