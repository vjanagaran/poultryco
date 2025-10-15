# PoultryCo - Professional Networking Platform for the Global Poultry Industry

**"Connect . Collaborate . Co-create"**

PoultryCo is a professional networking and collaboration platform specifically designed for the global poultry industry, connecting farmers, veterinarians, vendors, researchers, and associations in a trusted community ecosystem.

## 🏗️ Monorepo Structure

This project uses a monorepo architecture powered by Turborepo and npm workspaces.

```
poultryco/
├── apps/
│   ├── mobile/          # Expo React Native mobile app (iOS/Android)
│   └── web/             # Next.js web app (coming soon)
├── packages/
│   ├── ui/              # Shared UI components
│   ├── api/             # Supabase client & API calls
│   ├── types/           # Shared TypeScript types
│   ├── utils/           # Shared utilities
│   └── config/          # Shared configuration
├── supabase/            # Supabase backend (Edge Functions, migrations)
└── docs/                # Documentation & brand assets
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
# Run mobile app
npm run mobile

# Run web app (when available)
npm run web

# Build all apps
npm run build

# Lint all packages
npm run lint

# Type check all packages
npm run type-check

# Format code
npm run format

# Clean all build artifacts
npm run clean
```

## 📱 Apps

### Mobile App (`apps/mobile`)

React Native mobile application built with Expo.

**Tech Stack:**
- Expo SDK 54
- React Native 0.81
- TypeScript
- React Navigation
- Supabase
- NativeWind (Tailwind CSS)
- Zustand (State Management)
- React Query

**Run:**
```bash
cd apps/mobile
npm run dev
```

### Web App (`apps/web`) - Coming Soon

Next.js web application with unified marketing site and app.

**Tech Stack:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- React Query

## 📦 Shared Packages

### `@poultryco/ui`
Shared UI components for mobile and web.

### `@poultryco/api`
Supabase client and API calls.

### `@poultryco/types`
Shared TypeScript types and interfaces.

### `@poultryco/utils`
Shared utility functions and helpers.

### `@poultryco/config`
Shared configuration (colors, constants, etc.).

## 🎨 Brand Colors

```typescript
primary: '#2B7A4B'      // PoultryCo Green
cream: '#F8F6F0'        // Warm Cream
navy: '#1E3A5F'         // Deep Navy
orange: '#E67E22'       // Sunrise Orange
brown: '#8D6E3B'        // Earth Brown
```

## 🗄️ Backend

PoultryCo uses Supabase as the backend:
- PostgreSQL database
- Authentication (email/password, social)
- Real-time subscriptions
- Edge Functions
- Storage

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md) - Get started in 5 minutes
- [Team Onboarding Guide](./docs/poultryco-team-onboarding.md) - Complete setup guide
- [Brand Guidelines](./docs/brand/poultryco_brand_guidelines.md) - Brand assets & colors
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

