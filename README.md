# PoultryCo - Professional Networking Platform for the Global Poultry Industry

**"Connect . Collaborate . Co-create"**

PoultryCo is a professional networking and collaboration platform specifically designed for the global poultry industry, connecting farmers, veterinarians, vendors, researchers, and associations in a trusted community ecosystem.

## 🏗️ Monorepo Structure

This project uses a monorepo architecture powered by Turborepo and npm workspaces.

```
poultryco/
├── apps/
│   ├── mobile/          # Expo React Native app (iOS/Android) ✅
│   ├── web/             # Next.js marketing website ✅
│   └── admin/           # Next.js admin portal ✅
├── packages/
│   ├── design-system/   # Brand colors, typography, spacing ✅
│   ├── types/           # Shared TypeScript types
│   ├── ui/              # Shared UI components
│   ├── api/             # Supabase client & API calls
│   ├── utils/           # Shared utilities
│   └── config/          # Shared configuration
├── supabase/schema/     # Database schema (59 tables) ✅
└── docs/                # Documentation & brand assets ✅
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Expo CLI: `npm install -g expo-cli`
- Supabase account and project

### Installation

```bash
# Install dependencies for all packages
npm install

# Start mobile app in development mode
npm run mobile

# Or use turbo to run all dev servers
npm run dev
```

### Development Commands

```bash
# Run individual apps
npm run mobile   # Mobile app (Expo dev server)
npm run web      # Marketing website (port 3000)
npm run admin    # Admin portal (port 3001)

# Run all apps simultaneously
npm run dev

# Build & maintenance
npm run build        # Build all packages
npm run lint         # Lint all packages
npm run type-check   # Type check all packages
npm run format       # Format code
npm run clean        # Clean build artifacts
```

## 📱 Applications

### Mobile App (`apps/mobile`) - ✅ MVP Ready

React Native mobile app for iOS & Android.

**Status:** Authentication ✅ | Profile System ✅ | Networking 🔄

**Tech Stack:**
- Expo SDK 54, React Native 0.81
- TypeScript, React Navigation 7
- Supabase Auth & Database
- NativeWind (Tailwind CSS for RN)
- Zustand + React Query

**Features:**
- Login, Signup, Forgot Password
- 4-step Profile Creation Wizard
- Enhanced Profile Screen
- Multi-role support (8 roles)

### Web App (`apps/web`) - ✅ Production Ready

Next.js marketing website + blog platform.

**Status:** Marketing Pages ✅ | Blog ✅ | Forms ✅ | SEO ✅

**Tech Stack:**
- Next.js 15, React 19
- TypeScript, Tailwind CSS
- Supabase integration
- Google Analytics, SEO optimized

**Features:**
- Home, Features, About, Blog
- Blog with pagination, categories, tags
- Early Access Registration
- Contact Form + Newsletter
- Responsive design
- Favicons & PWA manifest

**URL:** www.poultryco.net (dev: localhost:3000)

### Admin Portal (`apps/admin`) - ✅ Production Ready

Next.js admin dashboard for content & marketing management.

**Status:** Auth ✅ | Dashboard ✅ | Blog CMS ✅ | Forms Management ✅

**Tech Stack:**
- Next.js 15, React 19
- TypeScript, Tailwind CSS
- Supabase with admin_users table
- Role-Based Access Control (5 roles)
- Rich Text Editor (Tiptap)

**Features:**
- Admin Authentication
- Blog CMS (create, edit, schedule, publish)
- Category & tag management
- Image upload to Supabase CDN
- Forms management (Early Access, Newsletter, Contact)
- CSV export for all submissions

**URL:** admin.poultryco.net (dev: localhost:3001)

**Admin Roles:** Super Admin, Content Manager, User Manager, Marketing Manager, Community Manager

## 📦 Shared Packages

### `@poultryco/design-system` ✅
Brand colors, typography, spacing constants.

### `@poultryco/types`
Shared TypeScript types and interfaces (planned).

### `@poultryco/ui`
Shared UI components for mobile and web (planned).

### `@poultryco/api`
Supabase client wrappers and API calls (planned).

### `@poultryco/utils`
Shared utility functions and helpers (planned).

## 🎨 Brand Colors

```typescript
primary: '#2B7A4B'      // PoultryCo Green
cream: '#F8F6F0'        // Warm Cream
navy: '#1E3A5F'         // Deep Navy
orange: '#E67E22'       // Sunrise Orange
brown: '#8D6E3B'        // Earth Brown
```

## 🗄️ Backend

**Provider:** Supabase (PostgreSQL)

**Database:**
- 64 tables (58 core + 1 admin + 5 marketing/CMS)
- Row Level Security (RLS) enabled
- Full-text search ready
- SEO-friendly slugs
- Multi-role system (8 roles)
- Blog, categories, tags, forms

**Features:**
- Authentication (JWT-based)
- Real-time subscriptions
- Edge Functions
- Storage (media uploads)
- Admin role management

**Project:** https://ceknyafzwqlchzxipsqx.supabase.co

## 📚 Documentation

### Getting Started
- [Platform Overview](./PLATFORM_OVERVIEW.md) - **START HERE** - Complete platform guide
- [Quick Start Guide](./QUICK_START.md) - Get started in 5 minutes
- [Team Onboarding Guide](./docs/poultryco-team-onboarding.md) - New developer guide
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute

### Deployment 🚀
- [Deployment Summary](./DEPLOYMENT_SUMMARY.md) - **Quick reference** - Visual guide
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - **Complete guide** - Step-by-step instructions
- [Hosting Comparison](./HOSTING_COMPARISON.md) - Compare 7 hosting platforms
- [Deploy Script](./deploy-vercel.sh) - Automated deployment to Vercel

### App-Specific
- [Mobile App README](./apps/mobile/README.md)
- [Web App README](./apps/web/README.md)
- [Admin Portal README](./apps/admin/README.md)
- [Blog CMS Documentation](./BLOG_CMS_ENHANCED.md) - Complete CMS guide
- [Setup Blog CMS](./SETUP_BLOG_CMS.md) - Quick setup guide

### Reference
- [Brand Guidelines](./docs/brand/poultryco_brand_guidelines.md) - 40-page brand bible
- [Database Schema](./supabase/schema/) - 64 tables documentation
- [Current Status](./docs/CURRENT_STATUS.md) - Project progress
- [Wireframes](./docs/wireframes/) - UI designs (English & Tamil)

## 🤝 Contributing

This is a private project. For team members:

1. Always work on the `dev` branch
2. Communicate in WhatsApp before pushing large changes
3. Follow the commit message format: `type: description`
4. Test your changes before pushing

## 📄 License

Private - All rights reserved

## 🔗 Links

- **WhatsApp Group**: [Join Team](https://chat.whatsapp.com/Gjay6t2n6Nf000DwFbLFP8)
- **GitHub Issues**: [Track Tasks](https://github.com/vjanagaran/poultryco/issues)
- **Supabase Dashboard**: [Manage Backend](https://supabase.com/dashboard)

---

**Built with ❤️ for the global poultry community**

