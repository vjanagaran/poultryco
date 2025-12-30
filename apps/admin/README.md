# PoultryCo Admin Portal

**Version:** 1.0.0  
**URL:** admin.poultryco.net (production) | http://localhost:3001 (development)  
**Tech Stack:** Next.js 15 + React 19 + TypeScript + AWS ECS

---

## 🎯 Overview

The PoultryCo Admin Portal is a comprehensive back-office system for managing the entire PoultryCo platform including content, users, analytics, marketing campaigns, and system operations.

---

## 📚 Documentation

**Complete Documentation:** `/docs/admin/`

- [Admin Portal Strategy](../../docs/admin/ADMIN_PORTAL_STRATEGY.md)
- [Technical Architecture](../../docs/admin/TECHNICAL_ARCHITECTURE.md)
- [Feature Specifications](../../docs/admin/FEATURE_SPECIFICATIONS.md)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20.17+
- npm 10+
- API server running (see `apps/api/README.md`)

### Installation

```bash
# From monorepo root
cd apps/admin

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your API URL
# NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1

# Run development server
npm run dev
```

Visit: http://localhost:3001

---

## 📁 Project Structure

```
apps/admin/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   │   └── login/
│   │   ├── (dashboard)/       # Protected dashboard
│   │   │   ├── dashboard/
│   │   │   ├── content/
│   │   │   ├── users/
│   │   │   ├── analytics/
│   │   │   ├── marketing/
│   │   │   └── settings/
│   │   └── api/               # API routes
│   │
│   ├── components/
│   │   ├── layout/            # Sidebar, Header
│   │   ├── ui/                # Shadcn/ui components
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── blog/              # Blog CMS components
│   │   ├── users/             # User management
│   │   └── analytics/         # Charts & graphs
│   │
│   ├── lib/
│   │   ├── api/               # REST API clients
│   │   ├── hooks/             # Custom hooks
│   │   └── utils/             # Utility functions
│   │
│   ├── types/                 # TypeScript types
│   └── store/                 # Zustand stores
│
├── public/                    # Static assets
├── .env.example               # Environment template
├── next.config.mjs            # Next.js config
├── tailwind.config.ts         # Tailwind config
└── tsconfig.json              # TypeScript config
```

---

## 🔐 Authentication

The admin portal uses Supabase Auth with JWT tokens.

### Login
- Email/password authentication
- Session management
- Auto-logout after inactivity
- Protected routes via middleware

### Authorization
- Role-based access control (RBAC)
- Granular permissions
- Activity logging

---

## 🎨 Features

### ✅ Phase 1 (Current)
- [x] Authentication system
- [x] Basic dashboard
- [x] Navigation sidebar
- [x] Protected routes
- [ ] Blog CMS
- [ ] User management
- [ ] Analytics dashboard

### 🔄 Phase 2 (In Progress)
- [ ] Email marketing
- [ ] Media library
- [ ] Content moderation
- [ ] Event management
- [ ] Job board admin

### ⏳ Phase 3 (Planned)
- [ ] Advanced analytics
- [ ] System settings
- [ ] Activity logs
- [ ] Notifications

---

## 🛠️ Development

### Available Scripts

```bash
# Development server (port 3001)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type check
npm run type-check
```

### Adding Shadcn/ui Components

```bash
# Install Shadcn/ui CLI
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
# ... etc
```

---

## 🔒 Security

### Environment Variables
Never commit `.env.local` to git. Use `.env.example` as a template.

### Required Variables
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1

# Environment
NODE_ENV=development
```

**Note:** Supabase variables are no longer needed. All operations use the REST API.

### Best Practices
- API authentication via JWT tokens
- Validate all inputs
- Sanitize user-generated content
- Log all admin actions
- Use HTTPS in production
- Keep API URL secure (use environment variables)

---

## 📊 Database Access

All database operations go through the REST API:
- Admin authentication via `/admin/auth/login`
- Blog management via `/content/blog/*`
- Marketing management via `/marketing/*`
- NECC management via `/necc/*`

See [API Documentation](../../docs/api/) for complete API reference.

---

## 🚀 Deployment

### AWS ECS Fargate (Production)

```bash
# Build and deploy using deploy script
cd apps/admin
./deploy.sh
```

### Custom Domain
- Point `admin.poultryco.net` to AWS ALB
- Configure SSL via ACM (automatic)
- Set up redirects via ALB listener rules

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📈 Monitoring

### Error Tracking
- Sentry for error monitoring
- LogRocket for session replay
- AWS CloudWatch for performance monitoring

### Logging
- All admin actions logged to database
- Error logs sent to Sentry
- Performance metrics in CloudWatch

---

## 👥 Team

### Roles
- **Super Admin** - Full access
- **Content Manager** - Blog, pages, media
- **User Manager** - User operations
- **Marketing Manager** - Campaigns, analytics
- **Community Manager** - Moderation, support

---

## 📞 Support

### Issues
Create an issue in GitHub with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### Questions
- Check documentation first
- Ask in team chat
- Email: dev@poultryco.net

---

## ✅ Checklist for New Developers

- [ ] Clone repository
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Read documentation in `/docs/admin/`
- [ ] Run development server
- [ ] Review codebase structure
- [ ] Understand authentication flow
- [ ] Familiarize with database schema

---

## 📝 Contributing

1. Create feature branch from `dev`
2. Make changes
3. Test thoroughly
4. Submit pull request
5. Wait for code review
6. Merge after approval

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for details.

---

## 📄 License

Private - PoultryCo Internal Use Only

---

**Status:** 🚀 In Development  
**Version:** 1.0.0  
**Last Updated:** October 21, 2025

---

**Built with ❤️ by the PoultryCo Team**

