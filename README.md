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

### Web App (`apps/web`) - ✅ Marketing Site Ready

Next.js marketing website + future web app platform.

**Status:** Marketing Pages ✅ | User Auth ⏳ | SEO Profiles ⏳

**Tech Stack:**
- Next.js 15, React 19
- TypeScript, Tailwind CSS
- Supabase integration ready
- Google Analytics, SEO optimized

**Features:**
- Home, Features, About, Blog
- Early Access Registration
- Contact Form
- Responsive design

**URL:** www.poultryco.net (dev: localhost:3000)

### Admin Portal (`apps/admin`) - ✅ Base Ready

Next.js admin dashboard for platform management.

**Status:** Auth ✅ | Dashboard ✅ | CMS 📋 | Analytics 📋

**Tech Stack:**
- Next.js 15, React 19
- TypeScript, Tailwind CSS
- Supabase with admin_users table
- Role-Based Access Control (5 roles)

**Features:**
- Admin Authentication
- Dashboard with metrics
- Navigation with sidebar
- User profile display

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
- 59 tables (58 core + 1 admin)
- Row Level Security (RLS) enabled
- Full-text search ready
- SEO-friendly slugs
- Multi-role system (8 roles)

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

### App-Specific
- [Mobile App README](./apps/mobile/README.md)
- [Web App README](./apps/web/README.md)
- [Admin Portal README](./apps/admin/README.md)
- [Admin Portal Docs](./docs/admin/) - Complete admin documentation
- [Website Docs](./docs/website/) - Marketing website strategy

### Reference
- [Brand Guidelines](./docs/brand/poultryco_brand_guidelines.md) - 40-page brand bible
- [Database Schema](./supabase/schema/) - 59 tables documentation
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

