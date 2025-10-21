# PoultryCo Admin Portal - Quick Start Guide

**Last Updated:** October 21, 2025  
**Version:** 1.0.0

---

## 🚀 Get Started in 5 Minutes

### 1. **Navigate to Admin Directory**
```bash
cd apps/admin
```

### 2. **Set Up Environment Variables**
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# Get these from: https://supabase.com/dashboard/project/_/settings/api
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. **Start Development Server**
```bash
# From apps/admin
npm run dev

# OR from monorepo root
npm run admin
```

### 4. **Access Admin Portal**
Open your browser: **http://localhost:3001**

---

## 🔐 First Login

### Create Admin User in Supabase

1. Go to Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter email and password
5. Confirm email (or disable email confirmation in Supabase settings)

### Login

1. Visit http://localhost:3001/login
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the dashboard

---

## 📁 Project Structure

```
apps/admin/
├── src/
│   ├── app/
│   │   ├── (auth)/login/          # Login page
│   │   ├── (dashboard)/           # Protected routes
│   │   │   ├── dashboard/         # Main dashboard
│   │   │   ├── content/blog/      # Blog CMS (ready)
│   │   │   ├── users/             # User management (ready)
│   │   │   ├── analytics/         # Analytics (ready)
│   │   │   ├── marketing/         # Email campaigns (ready)
│   │   │   └── settings/          # Settings (ready)
│   │   └── api/                   # API routes
│   │
│   ├── components/                # UI components
│   ├── lib/                       # Utilities
│   └── middleware.ts              # Auth protection
│
└── public/                        # Static assets
```

---

## 🛠️ Common Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
npm run type-check   # Check TypeScript
```

### From Monorepo Root
```bash
npm run admin        # Start admin dev server
npm run web          # Start web dev server
npm run mobile       # Start mobile dev server
```

---

## 🎨 Adding UI Components

### Install Shadcn/ui
```bash
# Initialize Shadcn/ui
npx shadcn-ui@latest init

# Add components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
```

---

## 📊 Current Features

### ✅ Working Now
- **Authentication**
  - Login page
  - Session management
  - Protected routes
  - Auto-redirect

- **Dashboard**
  - Stats cards (4 metrics)
  - Recent activity widgets
  - Sidebar navigation
  - User profile display

### 📁 Ready to Build
- **Blog CMS** - Structure ready at `/dashboard/content/blog`
- **User Management** - Structure ready at `/dashboard/users`
- **Analytics** - Structure ready at `/dashboard/analytics`
- **Email Marketing** - Structure ready at `/dashboard/marketing`
- **Settings** - Structure ready at `/dashboard/settings`

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use a different port
npm run dev -- --port 3002
```

### Supabase Connection Error
1. Check `.env.local` has correct credentials
2. Verify Supabase project is active
3. Check network connection
4. Restart dev server

### TypeScript Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Restart dev server
npm run dev
```

---

## 📚 Documentation

### Complete Docs
- [Admin Strategy](/docs/admin/ADMIN_PORTAL_STRATEGY.md) - Overview & requirements
- [Technical Architecture](/docs/admin/TECHNICAL_ARCHITECTURE.md) - Tech details
- [Feature Specifications](/docs/admin/FEATURE_SPECIFICATIONS.md) - Detailed specs
- [README](/apps/admin/README.md) - Full documentation

### Summary Docs
- [Planning Complete](/ADMIN_PORTAL_PLANNING_COMPLETE.md)
- [Setup Complete](/ADMIN_PORTAL_SETUP_COMPLETE.md)
- [Complete Summary](/ADMIN_PORTAL_COMPLETE_SUMMARY.md)

---

## 🎯 Next Steps

### Immediate
1. ✅ Set up environment variables
2. ✅ Create admin user in Supabase
3. ✅ Test login flow
4. ✅ Explore dashboard

### This Week
1. Install Shadcn/ui components
2. Start blog CMS development
3. Create blog post list page
4. Build rich text editor

### Next 2 Weeks
1. Complete blog CMS
2. Build user management
3. Add analytics dashboard
4. Implement email campaigns

---

## 💡 Tips

### Development
- Use TypeScript strict mode (already enabled)
- Follow existing code patterns
- Test on multiple screen sizes
- Use Shadcn/ui for consistency

### Security
- Never commit `.env.local`
- Use environment variables for secrets
- Validate all inputs
- Log admin actions

### Performance
- Use Server Components by default
- Client Components only when needed
- Optimize images
- Use React Query for caching

---

## 📞 Support

### Issues
- Check documentation first
- Search existing issues
- Create new issue with details

### Questions
- Review feature specifications
- Check technical architecture
- Ask in team chat

---

## ✅ Checklist

- [ ] Environment variables set up
- [ ] Admin user created in Supabase
- [ ] Successfully logged in
- [ ] Dashboard loads correctly
- [ ] Navigation works
- [ ] Read documentation
- [ ] Ready to build features

---

**Status:** ✅ Ready for Development  
**URL:** http://localhost:3001  
**Port:** 3001

---

**Happy coding! 🚀**

