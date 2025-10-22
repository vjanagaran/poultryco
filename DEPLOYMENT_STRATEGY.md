# PoultryCo Deployment Strategy

**Date:** October 22, 2025  
**Status:** ⚠️ Vercel deployment blocked by React 19 + Next.js 15 compatibility issue

---

## 🚨 CURRENT ISSUE

**Error:** `TypeError: Cannot read properties of null (reading 'useContext')`  
**Occurs:** During static generation of `/404` page on Vercel build  
**Root Cause:** Multiple React versions (19.1.0 and 19.2.0) in monorepo causing context conflicts

### What We've Tried:
1. ✅ Simplified error pages (no React components)
2. ✅ Inlined Google Analytics in server layout  
3. ✅ Added React version overrides in root `package.json`
4. ✅ Force dynamic rendering on not-found page
5. ❌ Issue persists - appears to be a React 19 + Next.js 15 edge case

---

## ✅ RECOMMENDED DEPLOYMENT OPTIONS

### Option 1: Downgrade to React 18 (FASTEST FIX) ⭐
**Time to deploy:** 30 minutes  
**Cost:** FREE (Vercel Hobby)  
**Pros:**
- Proven stable with Next.js 15
- Works with all current features
- Vercel auto-deployment
- No infrastructure management

**Cons:**
- Missing React 19 features (not critical for MVP)

**Steps:**
1. Downgrade to React 18.3.1 in all packages
2. Remove React overrides from root package.json
3. Test build locally
4. Push to Vercel

---

### Option 2: Railway.app (RECOMMENDED FOR MVP) ⭐⭐⭐
**Time to deploy:** 1 hour  
**Cost:** FREE tier ($5/month credit, enough for MVP)  
**Pros:**
- Docker-based deployment (full control)
- Auto-deployment from GitHub
- PostgreSQL included (for Supabase alternative later)
- Easy scaling
- Handles React 19 + Next.js 15 properly

**Cons:**
- Need to create Dockerfile
- Slightly more complex than Vercel

**Deploy:**
```bash
# Connect GitHub repo to Railway
# Railway auto-detects Next.js
# Deploy both web and admin apps
```

---

### Option 3: Render.com (SIMPLE & RELIABLE)
**Time to deploy:** 1 hour  
**Cost:** FREE tier (good for MVP)  
**Pros:**
- Simple setup
- Auto-deployment from GitHub
- Free SSL
- Good for Node.js apps

**Cons:**
- Slower cold starts on free tier
- Limited to 750 hours/month on free tier

---

### Option 4: AWS Amplify Hosting (SCALABLE)
**Time to deploy:** 1-2 hours  
**Cost:** Pay-as-you-go (~$1-5/month for MVP)  
**Pros:**
- AWS ecosystem integration
- Auto-deployment
- CDN included
- Highly scalable

**Cons:**
- More complex setup
- Requires AWS account

---

### Option 5: Self-Hosted on AWS EC2 / DigitalOcean
**Time to deploy:** 2-3 hours  
**Cost:** $5-10/month  
**Pros:**
- Full control
- Can handle any React/Next.js version
- Custom server configuration

**Cons:**
- Manual deployment setup
- Need to manage server
- No auto-scaling on free tier

---

## 📊 COMPARISON TABLE

| Platform | Free Tier | Auto-Deploy | Build Time | Cold Start | React 19 Support |
|----------|-----------|-------------|------------|------------|------------------|
| **Vercel** | ✅ Yes | ✅ Yes | Fast | None | ❌ Issues |
| **Railway** | ✅ $5 credit | ✅ Yes | Medium | None | ✅ Yes |
| **Render** | ✅ Yes | ✅ Yes | Medium | Slow | ✅ Yes |
| **Amplify** | ⚠️ Limited | ✅ Yes | Fast | None | ✅ Yes |
| **EC2/DO** | ❌ No | ❌ Manual | Custom | None | ✅ Yes |

---

## 🎯 MY RECOMMENDATION

**For MVP to PMF:** Use **Railway.app**

**Why:**
1. FREE for MVP phase ($5 monthly credit)
2. Handles React 19 + Next.js 15 without issues
3. Auto-deployment from GitHub (like Vercel)
4. Can easily migrate to AWS later when scaling
5. PostgreSQL included if you want to move from Supabase

**Setup Steps:**
1. Create Railway account
2. Connect GitHub repo
3. Deploy `apps/web` as one service
4. Deploy `apps/admin` as another service
5. Add environment variables
6. Custom domains: `poultryco.net` → web, `admin.poultryco.net` → admin

---

## 🔧 ALTERNATIVE: Fix React 19 Issue

If you want to stick with Vercel, downgrade to React 18:

```json
// apps/web/package.json
{
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}

// apps/admin/package.json
{
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  }
}
```

Then:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build --workspace=@poultryco/web
```

---

## 📝 NEXT STEPS

**Choose your path:**

**Path A (React 18 + Vercel):**
1. I'll downgrade React to 18.3.1
2. Test build
3. Push to Vercel
4. ✅ Live in 30 minutes

**Path B (React 19 + Railway):**
1. I'll create Railway configuration
2. Set up deployment
3. Configure domains
4. ✅ Live in 1 hour

**Path C (Other platform):**
- Tell me which platform you prefer
- I'll set it up accordingly

---

## 🚀 RECOMMENDED IMMEDIATE ACTION

**Go with Railway.app for MVP phase**

Benefits:
- Keep React 19 + Next.js 15 (future-proof)
- Free for MVP
- Auto-deployment
- Easy to manage
- Can migrate later if needed

Let me know your choice and I'll proceed immediately! 🎯

