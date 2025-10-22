# 🚀 PoultryCo Deployment Guide

**Complete guide for deploying Web & Admin apps from MVP to PMF**

---

## 📊 Current Status

✅ **Ready for Deployment:**
- Web app (marketing + blog)
- Admin app (CMS + forms management)
- All forms functional
- Next.js 15 warnings fixed
- SEO optimized
- Favicons configured

---

## 🎯 Recommended Hosting Solutions

### **Option 1: Vercel (RECOMMENDED) 🌟**

**Best for:** Next.js apps, auto-deployment, zero configuration

#### **Pros:**
- ✅ **FREE** (Hobby tier sufficient until PMF)
- ✅ Native Next.js support (made by same team)
- ✅ Auto-deployment from GitHub
- ✅ Zero configuration needed
- ✅ Automatic SSL/HTTPS
- ✅ Global CDN (Edge Network)
- ✅ Preview deployments for PRs
- ✅ Environment variables management
- ✅ Built-in analytics
- ✅ Excellent DX (Developer Experience)

#### **Limits (Free Tier):**
- 100 GB bandwidth/month (enough for 10K+ users)
- Unlimited static requests
- 100 GB-Hours serverless execution
- Commercial use allowed

#### **Perfect For:**
- Both web and admin apps
- Until you reach ~100K monthly visitors
- Your MVP to PMF journey

---

### **Option 2: Netlify**

**Best for:** Static sites, JAMstack

#### **Pros:**
- ✅ FREE tier available
- ✅ Auto-deployment from Git
- ✅ Form submissions handling
- ✅ Automatic SSL
- ✅ CDN included

#### **Cons:**
- ⚠️ Not optimized for Next.js SSR
- ⚠️ Requires additional configuration
- ⚠️ Edge functions limited on free tier

#### **Limits (Free Tier):**
- 100 GB bandwidth/month
- 300 build minutes/month

---

### **Option 3: AWS Amplify**

**Best for:** AWS ecosystem integration

#### **Pros:**
- ✅ Generous free tier
- ✅ Auto-deployment
- ✅ Good Next.js support
- ✅ AWS integration

#### **Cons:**
- ⚠️ More complex setup
- ⚠️ Steeper learning curve
- ⚠️ Can get expensive quickly

#### **Limits (Free Tier - 12 months):**
- 15 GB stored/month
- 5 GB served/month
- 1,000 build minutes/month

---

### **Option 4: AWS EC2 (NOT RECOMMENDED for MVP)**

**Best for:** Full control, custom infrastructure

#### **Pros:**
- ✅ Full server control
- ✅ Can run anything
- ✅ SSH access

#### **Cons:**
- ❌ Manual deployment setup
- ❌ Need to manage server/updates
- ❌ SSL certificate setup
- ❌ Load balancer configuration
- ❌ Security hardening required
- ❌ Cost: ~$10-50/month minimum
- ❌ DevOps overhead
- ❌ NOT auto-deployment by default

**Only use EC2 if:**
- You need custom server processes
- You have DevOps expertise
- You need 100% control

---

## 🏆 Final Recommendation

### **Deploy to Vercel (Both Apps)**

**Why Vercel is perfect for you:**

1. **Zero Cost:** Free until PMF
2. **Zero DevOps:** No server management
3. **Auto-Deploy:** Push to GitHub = live in 30 seconds
4. **Perfect for Next.js:** Built by the Next.js team
5. **Production Ready:** Used by Netflix, TikTok, Nike
6. **Scalable:** Handles millions of users (when you get there)

### **Architecture:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  www.poultryco.net (Web - Vercel)              │
│  - Marketing site                               │
│  - Blog                                         │
│  - Forms (Early Access, Contact)               │
│                                                 │
└────────────┬────────────────────────────────────┘
             │
             │ Supabase API
             │
             ▼
┌────────────────────────────────────────────────┐
│         Supabase (Database + Auth)             │
│  - PostgreSQL database                          │
│  - Authentication                               │
│  - Storage (CDN)                                │
└────────────▲───────────────────────────────────┘
             │
             │ Supabase API
             │
┌────────────┴────────────────────────────────────┐
│                                                 │
│  admin.poultryco.net (Admin - Vercel)          │
│  - Blog CMS                                     │
│  - Forms management                             │
│  - Category/Tag management                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📋 Deployment Checklist

### **Pre-Deployment (5 minutes)**

- [ ] Ensure all environment variables are documented
- [ ] Test build locally: `npm run build`
- [ ] Verify Supabase connection in production
- [ ] Prepare custom domains (if any)
- [ ] Review `.gitignore` (ensure .env.local excluded)

### **Web App Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GA_ID=your_ga_id
SITE_URL=https://www.poultryco.net
```

### **Admin App Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SITE_URL=https://admin.poultryco.net
```

---

## 🚀 Step-by-Step: Deploy to Vercel

### **Method 1: Vercel CLI (Fastest)**

#### **1. Install Vercel CLI**
```bash
npm install -g vercel
```

#### **2. Deploy Web App**
```bash
cd apps/web
vercel login
vercel --prod
```

#### **3. Deploy Admin App**
```bash
cd apps/admin
vercel --prod
```

Done! Your apps are live.

---

### **Method 2: Vercel Dashboard (Recommended for Production)**

#### **Step 1: Push to GitHub**

```bash
# From monorepo root
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

#### **Step 2: Import Projects to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Vercel will detect your monorepo

#### **Step 3: Configure Web App**

**Project Settings:**
- **Framework Preset:** Next.js
- **Root Directory:** `apps/web`
- **Build Command:** `cd ../.. && npm run build --workspace=@poultryco/web`
- **Output Directory:** `apps/web/.next`
- **Install Command:** `npm install`

**Environment Variables:** (Add all from `.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_GA_ID=xxx
SITE_URL=https://www.poultryco.net
```

#### **Step 4: Configure Admin App**

**Project Settings:**
- **Framework Preset:** Next.js
- **Root Directory:** `apps/admin`
- **Build Command:** `cd ../.. && npm run build --workspace=@poultryco/admin`
- **Output Directory:** `apps/admin/.next`
- **Install Command:** `npm install`

**Environment Variables:** (Add all from `.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
SITE_URL=https://admin.poultryco.net
```

#### **Step 5: Deploy**

Click "Deploy" for both projects. Vercel will:
- Install dependencies
- Build your apps
- Deploy to global CDN
- Provide preview URLs

---

## 🌐 Custom Domain Setup

### **Web App: www.poultryco.net**

1. In Vercel project settings → Domains
2. Add domain: `www.poultryco.net`
3. Add DNS records at your domain provider:

```
Type  | Name | Value
------|------|------------------
CNAME | www  | cname.vercel-dns.com
A     | @    | 76.76.21.21
```

### **Admin App: admin.poultryco.net**

1. In Vercel project settings → Domains
2. Add domain: `admin.poultryco.net`
3. Add DNS record:

```
Type  | Name  | Value
------|-------|------------------
CNAME | admin | cname.vercel-dns.com
```

**SSL:** Automatic (provisioned by Vercel)

---

## 🔄 Auto-Deployment Setup

### **Automatic Deployments (Already included with Vercel + GitHub)**

**Every git push to main:**
- ✅ Automatic build
- ✅ Automatic deploy
- ✅ Automatic invalidate CDN
- ✅ Zero downtime

**Every Pull Request:**
- ✅ Preview deployment
- ✅ Unique URL
- ✅ Test before merge

**Deployment time:** ~30-60 seconds

---

## 🔐 Security Checklist

### **Before Going Live:**

- [ ] Environment variables set in Vercel (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] Admin app protected with middleware
- [ ] Supabase RLS policies active
- [ ] Service role key only in admin app
- [ ] CORS configured in Supabase
- [ ] Rate limiting enabled (Supabase has built-in)

### **Supabase CORS Setup:**

In Supabase Dashboard → Settings → API:

**Allowed Origins:**
```
https://www.poultryco.net
https://admin.poultryco.net
```

---

## 📊 Monitoring & Analytics

### **Vercel Analytics (Built-in)**
- Real-time visitor stats
- Web vitals (Core Web Vitals)
- Top pages
- Traffic sources

**Enable:**
1. Vercel Dashboard → Analytics
2. Click "Enable Analytics"

### **Google Analytics 4**
Already integrated via `NEXT_PUBLIC_GA_ID`

### **Supabase Logs**
- Database queries
- Auth events
- Storage access
- API requests

---

## 💰 Cost Estimation

### **Until PMF (0-10K users/month):**

| Service | Plan | Cost |
|---------|------|------|
| Vercel (Web) | Hobby | **FREE** |
| Vercel (Admin) | Hobby | **FREE** |
| Supabase | Free | **FREE** |
| Domain | Yearly | ~$12/year |
| **Total** | | **$1/month** |

### **After PMF (10K-100K users/month):**

| Service | Plan | Cost |
|---------|------|------|
| Vercel (Web) | Pro | $20/month |
| Vercel (Admin) | Hobby | FREE |
| Supabase | Pro | $25/month |
| Domain | Yearly | ~$12/year |
| **Total** | | **$46/month** |

### **Scale (100K+ users/month):**

| Service | Plan | Cost |
|---------|------|------|
| Vercel (Web) | Pro | $20/month |
| Vercel (Admin) | Pro | $20/month |
| Supabase | Pro | $25-100/month |
| **Total** | | **$65-140/month** |

---

## 🎯 Post-Deployment Tasks

### **Immediate (Day 1):**
- [ ] Test all forms on live site
- [ ] Verify admin login works
- [ ] Test blog post creation/publishing
- [ ] Check image uploads to Supabase CDN
- [ ] Submit sitemap to Google Search Console
- [ ] Verify GA4 tracking

### **Week 1:**
- [ ] Monitor Vercel analytics
- [ ] Check Supabase usage
- [ ] Test on mobile devices
- [ ] Monitor form submissions
- [ ] Setup error monitoring (optional: Sentry)

### **SEO Setup:**
- [ ] Google Search Console verification
- [ ] Submit sitemap: `www.poultryco.net/sitemap.xml`
- [ ] Bing Webmaster Tools
- [ ] Schema markup validation

---

## 🆘 Troubleshooting

### **Build Fails:**
```bash
# Test locally first
cd apps/web
npm run build

# Check logs in Vercel dashboard
```

### **Environment Variables Not Working:**
- Ensure `NEXT_PUBLIC_` prefix for client-side vars
- Redeploy after adding new vars
- Check spelling (case-sensitive)

### **Supabase Connection Issues:**
- Verify environment variables
- Check Supabase service status
- Review RLS policies
- Check API key permissions

### **Admin Access Issues:**
- Verify admin_users table has your user
- Check middleware.ts logic
- Ensure SUPABASE_SERVICE_ROLE_KEY is set

---

## 🔄 Rollback Strategy

### **If something goes wrong:**

**Vercel:**
1. Go to project → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback (30 seconds)

**Database:**
- Supabase has Point-in-Time Recovery (paid plans)
- Always test schema changes on staging first

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Vercel Monorepo Guide](https://vercel.com/docs/concepts/monorepos)

---

## 🎉 Ready to Deploy?

**Your apps are production-ready!**

1. Choose deployment method (Vercel recommended)
2. Follow step-by-step guide above
3. Deploy both apps
4. Test everything
5. Start collecting leads!

---

**Questions?**
- Vercel support: support@vercel.com
- Supabase support: support@supabase.io

**Good luck with your launch! 🚀**

