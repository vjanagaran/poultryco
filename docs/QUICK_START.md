# ⚡ PoultryCo Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies (First Time Only)
```bash
npm install
```

### 2. Run Mobile App
```bash
npm run mobile
```

### 3. Scan QR Code
- Open Expo Go app on your phone
- Scan the QR code in terminal
- App loads on your device!

---

## 📦 Common Commands

### Development
```bash
npm run mobile          # Start mobile app
npm run dev             # Start all apps (when web is added)
```

### Building
```bash
npm run build           # Build all apps
npm run type-check      # Check TypeScript
npm run lint            # Lint all code
npm run format          # Format all code
```

### Cleaning
```bash
npm run clean           # Clean all build artifacts
```

---

## 📁 Where to Find Things

### Mobile App Code
```
apps/mobile/src/
├── screens/        # App screens
├── components/     # Mobile components
├── navigation/     # Navigation setup
└── config/         # Configuration
```

### Shared Code
```
packages/
├── ui/             # Shared UI components
├── api/            # Supabase API calls
├── types/          # TypeScript types
├── utils/          # Utilities
└── config/         # Configuration (colors, etc.)
```

### Documentation
```
docs/
├── brand/          # Brand guidelines & logos
├── wireframes/     # UI designs
└── *.md            # Documentation files
```

---

## 🎨 Using Shared Packages

### Import Components
```typescript
import { Button } from '@poultryco/ui';
```

### Import API Functions
```typescript
import { supabase } from '@poultryco/api';
```

### Import Types
```typescript
import { User, Profile } from '@poultryco/types';
```

### Import Utilities
```typescript
import { formatDate } from '@poultryco/utils';
```

### Import Config
```typescript
import { colors } from '@poultryco/config';
```

---

## 🎨 Brand Colors

```typescript
import { colors } from '@poultryco/config';

colors.primary      // #2B7A4B - PoultryCo Green
colors.cream        // #F8F6F0 - Warm Cream
colors.navy         // #1E3A5F - Deep Navy
colors.orange       // #E67E22 - Sunrise Orange
colors.brown        // #8D6E3B - Earth Brown
```

---

## 🆘 Troubleshooting

### App Won't Start?
```bash
cd apps/mobile
npm start -- --clear
```

### Type Errors?
```bash
npm run type-check
```

### Need Clean Install?
```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Full Documentation

- [README.md](./README.md) - Project overview
- [STRUCTURE.md](./STRUCTURE.md) - Complete structure
- [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md) - Migration details
- [Team Onboarding](./docs/poultryco-team-onboarding.md) - Full guide

---

## 🔗 Quick Links

- **WhatsApp**: [Join Team](https://chat.whatsapp.com/Gjay6t2n6Nf000DwFbLFP8)
- **GitHub**: [Issues](https://github.com/vjanagaran/poultryco/issues)
- **Supabase**: [Dashboard](https://supabase.com/dashboard)

---

**Need Help?** Ask in WhatsApp group! 💬


