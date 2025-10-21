# PoultryCo Admin Portal - Technical Architecture

**Document Version:** 1.0  
**Date:** October 21, 2025  
**Tech Stack:** Next.js 15 + React 19 + TypeScript + Supabase

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Admin Portal (admin.poultryco.net)          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Next.js 15 App (React 19 + TypeScript)       │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │  Pages/      │  │ Components/  │  │  API       │ │  │
│  │  │  Routes      │  │  UI Library  │  │  Routes    │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │  State       │  │  Auth        │  │  Utils     │ │  │
│  │  │  Management  │  │  System      │  │  Helpers   │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│                           ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Supabase Backend                         │  │
│  │                                                        │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐ │  │
│  │  │PostgreSQL│  │  Auth    │  │ Storage  │  │ Edge │ │  │
│  │  │(58 tables│  │  (JWT)   │  │ (Media)  │  │ Func │ │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Technology Stack

### Frontend

#### Core Framework
- **Next.js 15.5+** - React framework with App Router
- **React 19** - UI library (aligned with mobile/web)
- **TypeScript 5.3+** - Type safety

#### UI & Styling
- **Tailwind CSS 3.4+** - Utility-first CSS
- **Shadcn/ui** - Accessible component library
- **Radix UI** - Headless UI primitives
- **Lucide React** - Icon library
- **Recharts** - Charts and graphs
- **React Hook Form** - Form management
- **Zod** - Schema validation

#### State Management
- **TanStack Query (React Query)** - Server state
- **Zustand** - Client state
- **Context API** - Auth & theme

#### Rich Text Editor
- **Tiptap** or **Lexical** - Modern WYSIWYG editor
- **@tiptap/extension-***  - Extensions for media, tables, etc.

#### Data Tables
- **TanStack Table** - Powerful table library
- **@tanstack/react-table** - React bindings

### Backend & Database

#### Database
- **Supabase (PostgreSQL)** - Existing infrastructure
- **Prisma** (optional) - Type-safe ORM
- **Drizzle** (alternative) - Lightweight ORM

#### Authentication
- **Supabase Auth** - JWT-based auth
- **NextAuth.js** (optional) - Additional providers
- **@supabase/ssr** - Server-side auth

#### API
- **Next.js API Routes** - Serverless functions
- **Supabase Edge Functions** - Complex operations
- **tRPC** (optional) - Type-safe APIs

### DevOps & Tooling

#### Deployment
- **Vercel** - Hosting platform
- **GitHub Actions** - CI/CD
- **Docker** (optional) - Containerization

#### Monitoring & Analytics
- **Vercel Analytics** - Performance monitoring
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **PostHog** - Product analytics

#### Testing
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Testing Library** - Component testing

---

## 📁 Project Structure

```
apps/admin/
├── public/
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/              # Dashboard group
│   │   │   ├── dashboard/            # Main dashboard
│   │   │   ├── content/              # Content management
│   │   │   │   ├── blog/
│   │   │   │   ├── pages/
│   │   │   │   └── media/
│   │   │   ├── users/                # User management
│   │   │   ├── analytics/            # Analytics
│   │   │   ├── marketing/            # Marketing tools
│   │   │   │   ├── emails/
│   │   │   │   ├── campaigns/
│   │   │   │   └── newsletters/
│   │   │   ├── events/               # Event management
│   │   │   ├── jobs/                 # Job board admin
│   │   │   ├── moderation/           # Content moderation
│   │   │   ├── settings/             # System settings
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/                      # API routes
│   │   │   ├── blog/
│   │   │   ├── users/
│   │   │   ├── analytics/
│   │   │   └── upload/
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   │
│   ├── components/
│   │   ├── layout/                   # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   └── PageHeader.tsx
│   │   │
│   │   ├── ui/                       # Shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   │
│   │   ├── dashboard/                # Dashboard widgets
│   │   │   ├── StatsCard.tsx
│   │   │   ├── Chart.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── blog/                     # Blog components
│   │   │   ├── BlogEditor.tsx
│   │   │   ├── BlogList.tsx
│   │   │   ├── BlogPreview.tsx
│   │   │   └── SEOFields.tsx
│   │   │
│   │   ├── users/                    # User components
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserDetails.tsx
│   │   │   ├── UserFilters.tsx
│   │   │   └── UserActions.tsx
│   │   │
│   │   ├── analytics/                # Analytics components
│   │   │   ├── MetricCard.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── PieChart.tsx
│   │   │   └── DataTable.tsx
│   │   │
│   │   ├── forms/                    # Form components
│   │   │   ├── BlogForm.tsx
│   │   │   ├── UserForm.tsx
│   │   │   ├── EmailForm.tsx
│   │   │   └── SettingsForm.tsx
│   │   │
│   │   └── shared/                   # Shared components
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── ConfirmDialog.tsx
│   │
│   ├── lib/
│   │   ├── supabase/                 # Supabase client
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   │
│   │   ├── api/                      # API utilities
│   │   │   ├── blog.ts
│   │   │   ├── users.ts
│   │   │   ├── analytics.ts
│   │   │   └── email.ts
│   │   │
│   │   ├── hooks/                    # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useBlog.ts
│   │   │   ├── useUsers.ts
│   │   │   └── useAnalytics.ts
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── cn.ts
│   │   │   ├── date.ts
│   │   │   ├── format.ts
│   │   │   └── validation.ts
│   │   │
│   │   └── constants/                # Constants
│   │       ├── routes.ts
│   │       ├── permissions.ts
│   │       └── config.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── database.ts               # Supabase types
│   │   ├── api.ts
│   │   ├── blog.ts
│   │   ├── user.ts
│   │   └── index.ts
│   │
│   ├── store/                        # Zustand stores
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── filterStore.ts
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── .env.local                        # Environment variables
├── .env.example                      # Example env file
├── next.config.mjs                   # Next.js config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
├── package.json                      # Dependencies
└── README.md                         # Documentation
```

---

## 🔐 Authentication Flow

### Login Process

```
User → Login Page → Supabase Auth → JWT Token → Protected Routes
                         │
                         ├─ MFA Challenge (if enabled)
                         │
                         └─ Session Storage → Middleware Check
```

### Authorization

```typescript
// Middleware checks on every request
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.redirect('/login');
  }
  
  // Check admin role
  const { data: profile } = await supabase
    .from('admin_users')
    .select('role, permissions')
    .eq('user_id', session.user.id)
    .single();
    
  if (!profile) {
    return NextResponse.redirect('/unauthorized');
  }
  
  // Store in request headers for route access
  request.headers.set('x-user-role', profile.role);
  request.headers.set('x-user-permissions', JSON.stringify(profile.permissions));
  
  return NextResponse.next();
}
```

---

## 📊 Database Schema Extensions

### Admin-Specific Tables

```sql
-- Admin Users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL, -- 'super_admin', 'content_manager', etc.
  permissions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES admin_users(id),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'scheduled'
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_id UUID,
  segment JSONB, -- user filters
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sent'
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media Library
CREATE TABLE media_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  folder TEXT DEFAULT '/',
  uploaded_by UUID REFERENCES admin_users(id),
  alt_text TEXT,
  caption TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 API Architecture

### REST API Structure

```
/api/
├── auth/
│   ├── login          POST
│   ├── logout         POST
│   ├── refresh        POST
│   └── me             GET
│
├── blog/
│   ├── posts          GET, POST
│   ├── posts/[id]     GET, PUT, DELETE
│   ├── posts/publish  POST
│   ├── categories     GET, POST
│   └── tags           GET
│
├── users/
│   ├── list           GET
│   ├── [id]           GET, PUT, DELETE
│   ├── [id]/suspend   POST
│   ├── [id]/verify    POST
│   └── export         GET
│
├── analytics/
│   ├── dashboard      GET
│   ├── users          GET
│   ├── content        GET
│   └── traffic        GET
│
├── marketing/
│   ├── campaigns      GET, POST
│   ├── campaigns/[id] GET, PUT, DELETE
│   ├── campaigns/send POST
│   └── newsletters    GET, POST
│
└── media/
    ├── upload         POST
    ├── list           GET
    └── [id]           GET, DELETE
```

---

## 🎨 Component Library

### Shadcn/ui Components

```bash
# Install Shadcn/ui
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add alert
```

---

## 📦 Key Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.45.0",
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/react-table": "^8.0.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@radix-ui/react-*": "^1.0.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.300.0",
    "recharts": "^2.10.0",
    "@tiptap/react": "^2.1.0",
    "@tiptap/starter-kit": "^2.1.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^19.0.0",
    "typescript": "^5.3.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.1.0",
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

---

## 🚀 Performance Optimization

### Server Components
- Use React Server Components by default
- Client components only when needed (interactivity)
- Streaming for large data sets

### Data Fetching
- Server-side data fetching
- React Query for client-side caching
- Optimistic updates for better UX

### Code Splitting
- Route-based code splitting (automatic)
- Dynamic imports for heavy components
- Lazy loading for charts and editors

### Caching Strategy
```typescript
// Next.js 15 caching
export const revalidate = 60; // Revalidate every 60 seconds

// React Query caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

---

## 🔒 Security Measures

### Input Validation
```typescript
// Zod schema for blog post
const blogPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  category: z.enum(['news', 'guide', 'update']),
  tags: z.array(z.string()).max(10),
  status: z.enum(['draft', 'published']),
});
```

### SQL Injection Prevention
- Use Supabase client (parameterized queries)
- Never concatenate user input into queries
- Use RLS policies

### XSS Prevention
- Sanitize HTML content
- Use DOMPurify for rich text
- CSP headers

### CSRF Protection
- CSRF tokens on forms
- SameSite cookies
- Origin validation

---

## 📈 Monitoring & Logging

### Error Tracking
```typescript
// Sentry integration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Activity Logging
```typescript
// Log admin actions
async function logActivity(
  adminId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  details?: any
) {
  await supabase.from('admin_activity_logs').insert({
    admin_id: adminId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    ip_address: request.ip,
    user_agent: request.headers['user-agent'],
  });
}
```

---

## ✅ Technical Checklist

### Setup
- [ ] Initialize Next.js 15 project
- [ ] Configure TypeScript
- [ ] Set up Tailwind CSS
- [ ] Install Shadcn/ui
- [ ] Configure Supabase client
- [ ] Set up environment variables

### Authentication
- [ ] Implement login/logout
- [ ] Add MFA support
- [ ] Create middleware for auth
- [ ] Implement RBAC
- [ ] Add session management

### Core Features
- [ ] Build dashboard
- [ ] Create blog CMS
- [ ] Implement user management
- [ ] Add analytics dashboard
- [ ] Build email campaign tool

### Testing & QA
- [ ] Unit tests (Vitest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Security audit
- [ ] Performance testing

### Deployment
- [ ] Set up Vercel project
- [ ] Configure custom domain
- [ ] Set up CI/CD
- [ ] Configure monitoring
- [ ] Production deployment

---

**Status:** 📋 Technical Architecture Complete  
**Next:** Feature Specifications & UI Design  
**Owner:** Engineering Team

