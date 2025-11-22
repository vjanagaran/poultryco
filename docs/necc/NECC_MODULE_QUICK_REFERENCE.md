# 🚀 NECC Module - Quick Reference Guide

**For:** Developers, Product Team, GTM Team  
**Last Updated:** January 2025

---

## 📍 URL STRUCTURE (Quick Reference)

### Core Pages
```
/necc                    → Home/Gateway
/necc/today              → Today's rates
/necc/2025               → Year overview
/necc/2025/01            → Month overview
/necc/2025/01/17         → Day detail (CANONICAL)
/necc/2025-01-17         → Day detail (REDIRECTS to above)
```

### Feature Pages
```
/necc/analysis           → Interactive charts
/necc/trends             → Trend analysis
/necc/zones              → All zones
/necc/zones/namakkal     → Zone detail
/necc/experts             → All experts
/necc/experts/bv-rao     → Expert profile
/necc/predictions         → Forecasts
/necc/compare            → Zone comparison
/necc/alerts             → Price alerts
/necc/blog               → Blog posts
/necc/about              → About NECC
```

---

## 🎯 KEY DECISIONS

### Date Format
- **Canonical:** `/necc/2025/01/17` (hierarchical)
- **Short:** `/necc/2025-01-17` (redirects to canonical)
- **Why:** SEO + UX + Sharing

### Charting Library
- **Web:** Recharts (already in use)
- **Mobile:** Victory Native (React Native)
- **Why:** Team familiar, perfect fit for stack

### Data Source
- **Method:** Web scraping (NECC doesn't have API)
- **Frequency:** Daily cron job
- **Historical:** One-time scrape (10+ years)

### Expert System
- **Method:** Profile scoring + manual NECC access
- **Integration:** Use existing profile system
- **Access:** Manual selection for annotation access

### AI Model
- **Primary:** OpenAI GPT-4
- **Fallback:** Anthropic Claude
- **Future:** Can build custom models

### Infographic Generation
- **Method:** Server-side (Puppeteer)
- **Analytics:** Log all usage for improvement
- **Caching:** Generate once, cache results

### Mobile Strategy
- **Approach:** All 3 (Responsive + PWA + Native)
- **Why:** Maximum reach and UX

---

## 📊 PAGE SPECIFICATIONS (Summary)

| Page | Purpose | Key Content | SEO Focus |
|------|---------|-------------|-----------|
| `/necc` | Gateway | Overview, highlights | "NECC Egg Prices" |
| `/necc/today` | Daily rates | Today vs yesterday | "Today's NECC Prices" |
| `/necc/2025` | Year view | Year analytics | "NECC Prices 2025" |
| `/necc/2025/01` | Month view | Month analytics | "NECC Prices January 2025" |
| `/necc/2025/01/17` | Day view | Daily detail | "NECC Prices Jan 17, 2025" |
| `/necc/analysis` | Charts | Interactive analysis | "NECC Price Analysis" |
| `/necc/trends` | Trends | Pattern analysis | "NECC Price Trends" |
| `/necc/zones/namakkal` | Zone detail | Zone-specific data | "NECC Prices Namakkal" |
| `/necc/experts/bv-rao` | Expert profile | Expert content | "BV Rao NECC Expert" |
| `/necc/predictions` | Forecasts | AI + Expert predictions | "NECC Price Predictions" |
| `/necc/blog` | Content | Blog posts | "NECC Blog" |
| `/necc/about` | Info | About NECC | "About NECC" |

---

## 🔍 SEO CHECKLIST

### Per Page
- [ ] Unique title tag (50-60 chars)
- [ ] Meta description (150-160 chars)
- [ ] H1 with primary keyword
- [ ] Schema markup (Dataset)
- [ ] Open Graph tags
- [ ] Canonical URL
- [ ] Internal links
- [ ] External links (NECC official)

### Site-Wide
- [ ] Sitemap (`/sitemap-necc.xml`)
- [ ] Robots.txt rules
- [ ] Breadcrumb navigation
- [ ] Mobile-friendly
- [ ] Fast page load (<2s)

---

## 🎨 UX PATTERNS

### Navigation
- **Primary:** Top nav (Home, Today, Analysis, Trends, Zones, Experts, Blog)
- **Secondary:** Breadcrumbs (Home > Year > Month > Day)
- **Quick Links:** Today, This Week, This Month
- **Mobile:** Hamburger menu + bottom tabs

### Date Navigation
- **Calendar Picker:** Click to select date
- **Previous/Next:** Arrow buttons
- **Keyboard:** Arrow keys for navigation
- **Quick Links:** Today, Yesterday, This Week

### Zone Selection
- **Dropdown:** Searchable zone list
- **Multi-select:** For comparison
- **Favorites:** Save preferred zones
- **Recent:** Show recently viewed zones

### Charts
- **Hover:** Show tooltip
- **Click:** Navigate to detail
- **Zoom:** Click and drag
- **Annotations:** Click to see expert insight

---

## 🚀 GTM STRATEGY

### Content Types
1. **Daily:** Today's prices (automated)
2. **Weekly:** Week summary, trend analysis
3. **Monthly:** Month review, expert insights
4. **Quarterly:** Quarter analysis, predictions

### Sharing Mechanics
- **Infographics:** Shareable cards
- **Social Media:** Daily updates
- **WhatsApp:** Price alerts
- **Email:** Weekly digest

### Growth Loops
1. **Daily Habit:** Check prices → Return daily → Share
2. **Expert Authority:** Create content → Gain followers → More content
3. **Viral Sharing:** Share → Others see → Sign up → Share more
4. **SEO Content:** Blog posts → Rank → Traffic → Engagement

---

## 📈 KEY METRICS

### Engagement
- Daily active users (DAU)
- Page views per session
- Time on page
- Return rate

### Content
- Annotation views
- Expert engagement
- Blog post views
- Share count

### Growth
- Organic traffic (SEO)
- Referral traffic (sharing)
- Sign-ups from NECC module
- Conversion rate

### Technical
- Page load time (<2s)
- API response time (<200ms)
- Crawler success rate (>95%)
- Error rate (<1%)

---

## 🛠️ TECHNICAL STACK

### Frontend
- **Framework:** Next.js 15
- **Charts:** Recharts (web), Victory Native (mobile)
- **Styling:** Tailwind CSS
- **State:** Zustand, React Query

### Backend
- **Database:** Supabase (PostgreSQL)
- **Functions:** Supabase Edge Functions
- **Scraping:** Deno + Cheerio
- **AI:** OpenAI API

### Infrastructure
- **Hosting:** Vercel
- **Storage:** Supabase Storage
- **Cron:** Vercel Cron
- **Analytics:** Vercel Analytics

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [ ] Route structure setup
- [ ] Base pages (home, today, about)
- [ ] Date handling (both formats)
- [ ] SEO components
- [ ] Navigation structure

### Phase 2: Core Pages
- [ ] Year/Month/Day pages
- [ ] Zone pages
- [ ] Analysis page
- [ ] Trends page

### Phase 3: Advanced Features
- [ ] Expert pages
- [ ] Predictions page
- [ ] Compare tool
- [ ] Alerts system

### Phase 4: Content & SEO
- [ ] Blog integration
- [ ] SEO optimization
- [ ] Schema markup
- [ ] Sitemap generation

### Phase 5: Growth Features
- [ ] Sharing mechanics
- [ ] Social media integration
- [ ] Analytics tracking
- [ ] Growth loops

---

## 📚 DOCUMENTATION

### For Developers
- Technical Spec: `NECC_ANALYTICS_TECHNICAL_SPEC.md`
- URL Structure: `NECC_URL_STRUCTURE_DECISION.md`
- Comprehensive Plan: `NECC_MODULE_COMPREHENSIVE_PLAN.md`

### For Product Team
- Brainstorm: `NECC_ANALYTICS_BRAINSTORM.md`
- User Flows: `NECC_ANALYTICS_USER_FLOWS.md`
- Expert Insights: `NECC_ANALYTICS_EXPERT_INSIGHTS.md`

### For GTM Team
- Comprehensive Plan: `NECC_MODULE_COMPREHENSIVE_PLAN.md`
- Decision Matrix: `NECC_ANALYTICS_DECISION_MATRIX.md`

---

## 🎯 QUICK START

1. **Review:** Comprehensive Plan
2. **Validate:** URL structure decision
3. **Plan:** Implementation phases
4. **Start:** Phase 1 development

---

**Status:** ✅ Ready for Implementation  
**Next:** Start Phase 1 (Foundation)

