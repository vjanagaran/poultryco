# 🤝 Contributing to PoultryCo

Welcome to the PoultryCo development team!

---

## 🚀 Quick Start

### First Time Setup
```bash
# 1. Clone the repository
git clone https://github.com/vjanagaran/poultryco.git
cd poultryco

# 2. Install dependencies
npm install

# 3. Set up environment variables
cd apps/mobile
cp .env.sample .env.local
# Add your Supabase credentials to .env.local

# 4. Start development
npm run mobile
```

See [Team Onboarding Guide](./docs/poultryco-team-onboarding.md) for detailed setup instructions.

---

## 💻 Development Workflow

### Daily Workflow
```bash
# 1. Pull latest changes
git checkout dev
git pull origin dev

# 2. Start development
npm run mobile

# 3. Make your changes
# Edit files in apps/mobile/src/

# 4. Commit and push
git add .
git commit -m "feat: your feature description"
git pull origin dev  # Always pull before push
git push origin dev
```

### Branch Strategy
- **`main`** - Production (don't push directly)
- **`dev`** - Development (everyone works here)

⚠️ **Important:** Always work on the `dev` branch and communicate in WhatsApp before pushing large changes.

---

## 📝 Commit Message Format

Use conventional commits:

```bash
feat: add user profile screen
fix: resolve login button issue
docs: update README
style: format code
refactor: restructure auth flow
test: add profile tests
chore: update dependencies
```

---

## 🏗️ Project Structure

```
poultryco/
├── apps/
│   └── mobile/          # React Native mobile app
├── packages/
│   ├── ui/              # Shared UI components
│   ├── api/             # Supabase API calls
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities
│   └── config/          # Configuration (colors, constants)
└── docs/                # Documentation
```

---

## 📦 Using Shared Packages

Import from shared packages in your code:

```typescript
// UI Components
import { Button, Card } from '@poultryco/ui';

// API Functions
import { supabase } from '@poultryco/api';

// Types
import { User, Profile } from '@poultryco/types';

// Utilities
import { formatDate } from '@poultryco/utils';

// Configuration
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

## 🧪 Before Committing

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

---

## 🆘 Getting Help

- **WhatsApp Group**: [Join Team](https://chat.whatsapp.com/Gjay6t2n6Nf000DwFbLFP8)
- **GitHub Issues**: [Report Issues](https://github.com/vjanagaran/poultryco/issues)
- **Documentation**: Check `docs/` folder

---

## ✅ Code Review Checklist

Before pushing:
- [ ] Code works on your device
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Follows brand guidelines
- [ ] Tested on both iOS and Android (if possible)
- [ ] Communicated in WhatsApp group (for large changes)

---

**Happy coding! 🚀🐔**

