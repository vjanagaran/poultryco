# 🌐 PoultryCo Marketing Website Structure

**Last Updated:** November 4, 2025  
**Status:** Implementation Phase  
**Version:** 1.0

---

## 📋 **Executive Summary**

This document defines the complete structure, strategy, and implementation plan for the PoultryCo marketing website at www.poultryco.net. The site serves dual purposes:

1. **Guest Experience:** Vision-driven marketing to acquire users across all stakeholder segments
2. **User Experience:** Redirect authenticated users to `/home` dashboard while keeping marketing pages accessible

---

## 🎯 **Strategic Foundation**

### **Positioning**
PoultryCo is the **"HubSpot of Poultry"** - a community-first platform with:
- **Mission:** Connect · Collaborate · Co-create
- **Tagline:** "Growing Together"
- **Free Forever:** Everything in MVP is free (no monetization messaging publicly)
- **Governed by:** PTIC (Section 8 Non-Profit)

### **Inspiration**
- **HubSpot:** Community-first, education-led growth, free CRM for small businesses
- **Pivot Decision:** Pure community platform instead of free ERP, due to smaller TAM in poultry vs general business software

### **Target Audience (11 Stakeholder Segments)**
1. Farmers (Independent broiler/layer)
2. Veterinarians
3. FPOs (Farmer Producer Organizations)
4. Associations
5. Nutritionists
6. Students
7. Feed Mills
8. Hatcheries
9. Consultants
10. Researchers (Academics)
11. Equipment Suppliers

---

## 🗂️ **Complete Site Structure**

```
www.poultryco.net/
│
├── / (Homepage)
│   └── Vision-driven landing page
│       ├── Connect · Collaborate · Co-create
│       ├── Mission showcase (not stakeholder gateway)
│       ├── CTA: "Join the Mission - Growing Together"
│       └── Auth: Guest → Landing | User → Redirect /home
│
├── /stakeholders/ (11 Stakeholder Pages - SEO Optimized)
│   ├── /stakeholders/farmers
│   │   └── Title: "For Poultry Farmers" (SEO: casual tone)
│   ├── /stakeholders/veterinarians
│   │   └── Title: "For Veterinarians"
│   ├── /stakeholders/fpos
│   │   └── Title: "For FPOs and Cooperatives"
│   ├── /stakeholders/associations
│   │   └── Title: "For Farmer Associations"
│   ├── /stakeholders/nutritionists
│   │   └── Title: "For Poultry Nutritionists"
│   ├── /stakeholders/students
│   │   └── Title: "For Students and Interns"
│   ├── /stakeholders/feed-mills
│   │   └── Title: "For Feed Mill Operators"
│   ├── /stakeholders/hatcheries
│   │   └── Title: "For Hatchery Operators"
│   ├── /stakeholders/consultants
│   │   └── Title: "For Poultry Consultants"
│   ├── /stakeholders/researchers
│   │   └── Title: "For Researchers and Academics"
│   └── /stakeholders/equipment-suppliers
│       └── Title: "For Equipment Suppliers"
│
├── /about
│   └── PTIC story, mission, team, governance
│
├── /contact
│   └── Contact form, support channels
│
├── /blog
│   └── CMS-managed content (existing)
│
├── /blog/[slug]
│   └── Individual blog posts
│
├── /privacy
│   └── Privacy Policy (existing)
│
├── /terms
│   └── Terms of Service (existing)
│
├── /register
│   └── Signup flow (direct signup CTA)
│
└── /login
    └── Login flow

Note: /features page deferred to later phase
```

---

## 🎨 **Design System**

### **Brand Colors**
```css
--primary-green: #2B7A4B;
--primary-orange: #E67E22;
--neutral-cream: #F8F6F0;
--text-dark: #1A1A1A;
--text-muted: #6B7280;
--background-white: #FFFFFF;
--background-light: #F9FAFB;
```

### **Typography**
- **Headings:** Poppins (already configured)
- **Body:** Inter (already configured)

### **Spacing Philosophy**
- **Premium Feel:** Lots of white space
- **Section Padding Mobile:** 4rem 1.5rem
- **Section Padding Desktop:** 6rem 2rem
- **Max Content Width:** 1280px

### **Breakpoints**
- **Mobile:** 375px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

---

## 🧭 **Navigation Structure**

### **Guest Header Navigation**
```
Logo (PoultryCo) | Platform (Dropdown) | Resources (Dropdown) | About | [Login] [Sign Up]

Platform Dropdown:
- For Farmers
- For Veterinarians
- For FPOs
- For Associations
- For Nutritionists
- For Students
- For Feed Mills
- For Hatcheries
- For Consultants
- For Researchers
- For Equipment Suppliers

Resources Dropdown:
- Blog
- Contact
- Help Center (future)
```

### **Authenticated User Header**
```
Logo | Home | Discover | Stream | Messages | Tools | [Profile Icon]
```

**Note:** Marketing pages remain accessible to authenticated users via direct links/bookmarks

---

## 📄 **Homepage Structure**

### **Purpose**
Vision-driven mission showcase, NOT stakeholder gateway

### **Sections**
1. **Hero Section**
   - Tagline Badge: "An Initiative of PTIC (Section 8 Non-Profit)"
   - Headline: "Connect · Collaborate · Co-create"
   - Subheadline: Vision statement
   - Mission Box: "Every farmer deserves fair prices..."
   - Primary CTA: "Join the Mission - It's Free Forever" → /register
   - Secondary CTA: "Learn About Our Vision" → #vision
   - Trust Indicators: 5,000+ Members, Verified by PTIC, 100% Free Forever

2. **Vision Section** (#vision)
   - "Why PoultryCo Exists"
   - Industry problems (3 pain points)
   - Solution: Connect · Collaborate · Co-create (3 pillars)
   - Mission statement box (green gradient)

3. **Stakeholder Showcase**
   - "One Platform. Every Stakeholder."
   - 11 stakeholder cards (grid layout)
   - Each card: Icon, Title, Brief benefit, CTA arrow
   - Bottom: "Don't see your role? Join anyway"

4. **Stats Section**
   - Live platform statistics
   - User counts, connections, impact metrics

5. **How It Works** (Simple 3-step)
   - Sign up → Connect → Grow

6. **Final CTA**
   - "Join the Mission - Growing Together"
   - Emphasis on community, not features

---

## 📄 **Stakeholder Page Template**

### **Common Structure** (Unique content per page)
Each page follows this template with customized content:

1. **SEO Foundation**
   - Title: "For [Stakeholder] | PoultryCo"
   - H1: "For [Stakeholder]" (casual tone, not corporate)
   - Meta description: Benefit-focused
   - Schema.org markup
   - OpenGraph tags

2. **Hero Section**
   - Emotional headline (problem/aspiration)
   - Subheadline (current pain point)
   - Primary CTA: "Sign Up Free" → /register

3. **Problem Section** (3 pain points)
   - Stakeholder-specific challenges
   - Emotional impact statements

4. **Solution Section** (How PoultryCo helps)
   - 3-4 core benefits
   - Feature → Benefit → Feeling format
   - Realistic stats/outcomes

5. **Social Proof**
   - Simulated testimonials (realistic, not hyperbolic)
   - Trust badges (PTIC, associations)
   - Usage stats

6. **How It Works** (Simple steps)
   - Sign up → Use platform → Benefit

7. **FAQ** (Address objections)
   - 4-6 common questions
   - Honest, transparent answers

8. **Final CTA**
   - Direct signup: "Join Free" → /register

---

## 🎯 **SEO Strategy**

### **Keyword Research Approach**
For each stakeholder page, target:
- **Primary Keywords:** "[stakeholder] platform India", "poultry [stakeholder] network"
- **Secondary Keywords:** "[stakeholder-specific pain point solutions]"
- **Long-tail:** Informational + solution keywords

### **On-Page SEO Checklist**
- ✅ Optimized title tags (60 characters)
- ✅ Meta descriptions (155 characters)
- ✅ H1, H2, H3 hierarchy
- ✅ Schema.org markup (Organization, WebPage)
- ✅ OpenGraph tags (social sharing)
- ✅ Image alt tags
- ✅ Internal linking structure
- ✅ Mobile-first responsive design
- ✅ Performance optimization (Lighthouse 90+)

### **Content Pillars for Blog**
1. **Farmer Education** (How-to guides, calculators)
2. **Expert Insights** (Vet advice, nutrition tips)
3. **Success Stories** (Case studies, testimonials)
4. **Industry Trends** (Reports, analysis)

---

## 🔧 **Technical Implementation**

### **Framework**
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS

### **Page Types**
- **Static Pages:** All stakeholder pages, about, contact (no CMS)
- **Dynamic Pages:** Blog posts (CMS-managed)

### **Performance Targets**
```
Lighthouse Scores:
├── Performance: 95+
├── Accessibility: 100
├── Best Practices: 95+
└── SEO: 100

Core Web Vitals:
├── LCP (Largest Contentful Paint): <2.5s
├── FID (First Input Delay): <100ms
└── CLS (Cumulative Layout Shift): <0.1
```

### **Image Strategy**
- WebP format (fallback PNG/JPG)
- Lazy loading (below fold)
- Minimal images (premium feel)
- Max initial load: 200KB images total

---

## 📊 **Success Metrics**

### **By Stakeholder Page**
| Page | Primary Goal | Success Metric |
|------|--------------|----------------|
| /stakeholders/farmers | Signups | 100 signups/week by Month 3 |
| /stakeholders/fpos | Pilot applications | 10 FPO pilots by Jan 2026 |
| /stakeholders/veterinarians | Founding vets | 20 founding vets by Jan 2026 |
| /stakeholders/associations | Partnerships | 5 associations by Feb 2026 |
| /stakeholders/nutritionists | Professional signups | 50 nutritionists by Feb 2026 |
| /stakeholders/students | Internships | 10 student projects by Mar 2026 |
| Others | Signups | 20-50 signups each by Feb 2026 |

### **Overall Website Metrics**
- **Traffic:** 10,000+ monthly visitors by Month 3
- **Conversion Rate:** 5-8% (guest → signup)
- **Bounce Rate:** <40%
- **Avg Session Duration:** 3+ minutes
- **Blog Engagement:** 2 posts/week, 1,000+ views/post

---

## 📅 **Implementation Roadmap**

### **Phase 1: Foundation (Week 1)**
- ✅ Create documentation (this file)
- ⏳ Update Header component (stakeholder dropdown)
- ⏳ Update Footer component (newsletter form)
- ⏳ Create new homepage (vision-driven)
- ⏳ Update site config

### **Phase 2: Core Stakeholder Pages (Weeks 2-3)**
Priority order:
1. /stakeholders/farmers (highest traffic potential)
2. /stakeholders/veterinarians
3. /stakeholders/fpos
4. /stakeholders/associations
5. /stakeholders/nutritionists
6. /stakeholders/students

### **Phase 3: Additional Stakeholder Pages (Week 4)**
7. /stakeholders/feed-mills
8. /stakeholders/hatcheries
9. /stakeholders/consultants
10. /stakeholders/researchers
11. /stakeholders/equipment-suppliers

### **Phase 4: Optimization (Week 5+)**
- SEO optimization
- Performance tuning
- A/B testing headlines/CTAs
- Analytics setup
- Blog content creation

---

## 🎯 **Content Guidelines**

### **Tone & Voice**
- **Farmers:** Simple, respectful, empowering (not condescending)
- **FPOs:** Professional but warm, data-driven
- **Vets:** Recognition, respect for expertise
- **Associations:** Legacy, impact, leadership
- **Students:** Opportunity, career, real-world impact
- **Others:** Professional, benefit-focused

### **Copy Principles**
1. **Emotion → Benefit → Feature** (always in this order)
2. **Concise:** To-the-point, but SEO-optimized
3. **Realistic:** No hyperbole, honest projections
4. **Actionable:** Clear next steps, single CTA per section

### **Placeholder Content Strategy**
- **Testimonials:** Simulated but realistic (no real names/photos yet)
- **Stats:** Mix of aspirational targets and survey data
- **Images:** Minimal use, placeholders for future authentic photos

---

## 🔐 **Authentication Behavior**

### **Homepage (`/`)**
```javascript
Guest users: See landing page
Logged-in users: Auto-redirect to /home dashboard
```

### **Marketing Pages (all other pages)**
```javascript
All pages: Accessible to both guest and logged-in users
Header: Dynamic based on auth state
  - Guest: Show "Login" and "Sign Up" buttons
  - Logged-in: Show platform navigation
```

### **Logic**
- Check auth status in root page (`/`)
- If authenticated → `redirect('/home')`
- All other marketing pages → Render normally, change header only

---

## 📝 **Footer Structure**

### **New Footer Sections**

```
┌─────────────────────────────────────────────────────────────┐
│                         Footer                               │
├─────────────────────────────────────────────────────────────┤
│  [LOGO & TAGLINE]    [STAKEHOLDERS]   [COMPANY]  [NEWSLETTER]│
│                                                               │
│  PoultryCo           For Farmers       About      Stay Updated│
│  Connect·            For Vets          Blog       [Email Input]│
│  Collaborate·        For FPOs          Contact    [Subscribe]  │
│  Co-create           For Associations  PTIC                   │
│                      + 7 more          Privacy                │
│  [Social Icons]                        Terms                  │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  © 2025 PoultryCo | Initiative of PTIC (Section 8 Non-Profit)│
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Launch Checklist**

### **Pre-Launch (Before Feb 2026)**
- [ ] All 11 stakeholder pages live
- [ ] Homepage finalized
- [ ] Header/Footer updated
- [ ] SEO audit (Lighthouse 90+)
- [ ] Mobile responsiveness verified
- [ ] Load time <3s
- [ ] Analytics tracking setup
- [ ] Blog content (20+ posts)

### **Launch Day (PTSE Feb 2026)**
- [ ] Press release
- [ ] Association partnerships live
- [ ] Demo at PTSE event
- [ ] Social media push
- [ ] Email to 500+ survey respondents

### **Post-Launch (Month 1+)**
- [ ] Monitor conversion rates
- [ ] A/B test headlines
- [ ] Collect user feedback
- [ ] Iterate based on data
- [ ] Create case studies

---

## 📞 **Key Contacts**

**Development Team:** [Internal]  
**Marketing Team:** [Internal]  
**PTIC Leadership:** Janagaran V (President)  
**Design Assets:** /docs/brand/

---

## 📚 **Related Documentation**

- [Brand Guidelines](../brand/poultryco_brand_guidelines.md)
- [MVP Complete Scope](../MVP_COMPLETE_SCOPE.md)
- [Project Status](../PROJECT_STATUS.md)
- [Stakeholder Decks](../decks/)

---

**Document Owner:** Development Team  
**Review Cycle:** Weekly during implementation  
**Status:** ✅ Approved for Implementation

---

**Ready to build a legendary marketing website! 🚀**

