# PoultryCo Marketing Website

**www.poultryco.net - Next.js 14 Marketing Website**

---

## 📊 Project Overview

This is the marketing website for PoultryCo, built with Next.js 14 (App Router), TypeScript, and Tailwind CSS. The site serves as the primary lead generation and brand awareness platform before the mobile MVP launch.

### Purpose
- Generate 10,000+ early access signups
- Establish brand authority in poultry industry
- Drive traffic to PTSE 3rd edition
- Build SEO foundation
- Capture qualified leads

### Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Fonts:** Inter (primary), Poppins (secondary)
- **Hosting:** EC2 + PM2
- **Analytics:** Google Analytics 4 (to be added)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Installation

```bash
# From monorepo root
cd apps/web

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

---

## 📁 Project Structure

```
apps/web/
├── src/
│   ├── app/                          # App Router pages
│   │   ├── (marketing)/              # Marketing group
│   │   │   ├── layout.tsx            # Marketing layout
│   │   │   ├── page.tsx              # Home page (/)
│   │   │   ├── about/                # About page
│   │   │   ├── features/             # Features pages
│   │   │   ├── blog/                 # Blog pages
│   │   │   ├── contact/              # Contact page
│   │   │   ├── early-access/         # Early access page
│   │   │   ├── ptse/                 # PTSE landing
│   │   │   ├── tools-preview/        # Tools preview
│   │   │   ├── associations/         # B2B landing
│   │   │   └── press/                # Press page
│   │   ├── api/                      # API routes
│   │   │   ├── subscribe/            # Email subscription
│   │   │   ├── early-access/         # Early access form
│   │   │   └── contact/              # Contact form
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   └── not-found.tsx             # 404 page
│   │
│   ├── components/                   # React components
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx            # Site header
│   │   │   ├── Footer.tsx            # Site footer
│   │   │   ├── MobileNav.tsx         # Mobile navigation
│   │   │   └── Container.tsx         # Content container
│   │   ├── sections/                 # Page sections
│   │   │   ├── Hero.tsx              # Hero sections
│   │   │   ├── Features.tsx          # Features grid
│   │   │   ├── Testimonials.tsx      # Testimonials
│   │   │   ├── Stats.tsx             # Statistics
│   │   │   ├── CTA.tsx               # Call-to-action
│   │   │   └── Newsletter.tsx        # Newsletter signup
│   │   ├── ui/                       # UI components
│   │   │   ├── Button.tsx            # Button component
│   │   │   ├── Card.tsx              # Card component
│   │   │   ├── Input.tsx             # Form input
│   │   │   ├── Badge.tsx             # Badge component
│   │   │   └── Icon.tsx              # Icon wrapper
│   │   └── forms/                    # Form components
│   │       ├── EarlyAccessForm.tsx   # Early access form
│   │       ├── ContactForm.tsx       # Contact form
│   │       └── NewsletterForm.tsx    # Newsletter form
│   │
│   ├── lib/                          # Utility functions
│   │   ├── utils.ts                  # General utilities
│   │   ├── api.ts                    # API helpers
│   │   └── analytics.ts              # Analytics setup
│   │
│   ├── config/                       # Configuration
│   │   ├── site.ts                   # Site config
│   │   ├── navigation.ts             # Navigation config
│   │   └── metadata.ts               # SEO metadata
│   │
│   ├── styles/                       # Additional styles
│   │   └── fonts.ts                  # Font imports
│   │
│   └── types/                        # TypeScript types
│       ├── index.ts                  # Shared types
│       └── forms.ts                  # Form types
│
├── public/                           # Static assets
│   ├── images/                       # Images
│   │   ├── logo.svg                  # Logo
│   │   ├── hero/                     # Hero images
│   │   ├── features/                 # Feature images
│   │   └── team/                     # Team photos
│   ├── fonts/                        # Custom fonts (if needed)
│   └── favicon.ico                   # Favicon
│
├── .env.local.example                # Environment variables template
├── .eslintrc.json                    # ESLint config
├── .gitignore                        # Git ignore
├── next.config.mjs                   # Next.js config
├── package.json                      # Dependencies
├── postcss.config.mjs                # PostCSS config
├── tailwind.config.ts                # Tailwind config
├── tsconfig.json                     # TypeScript config
└── README.md                         # This file
```

---

## 🎨 Design System

### Colors
```css
Primary:   #2B7A4B (PoultryCo Green)
Orange:    #E67E22 (CTAs, Urgency)
Cream:     #F8F6F0 (Backgrounds)
Navy:      #1E3A5F (Text)
Brown:     #8D6E3B (Supporting)
```

### Typography
- **Primary:** Inter (body, UI)
- **Secondary:** Poppins (headlines, brand)

### Component Library
All components follow the design guidelines documented in `/docs/website/DESIGN_GUIDELINES.md`

---

## 📄 Key Pages

### Phase 1 (Priority 1 - Week 1)
1. **Home (/)** - Landing page with hero, features, testimonials, CTA
2. **Early Access (/early-access)** - Main conversion page
3. **About (/about)** - Our story, team, values
4. **Contact (/contact)** - Contact form and information
5. **Privacy & Terms** - Legal pages

### Phase 2 (Week 2)
6. **Features (/features)** - Features hub and individual pages
7. **Blog (/blog)** - Blog home and posts
8. **PTSE (/ptse)** - Event landing page

### Phase 3 (Ongoing)
9. **Tools Preview (/tools-preview)** - Coming soon features
10. **Associations (/associations)** - B2B landing
11. **Press (/press)** - Media kit and press releases

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` file:
```bash
# Site Configuration
SITE_URL=https://www.poultryco.net
SITE_NAME=PoultryCo

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Email Service (when integrated)
EMAIL_SERVICE_API_KEY=your_api_key

# Database (when needed)
DATABASE_URL=your_database_url
```

### Site Config

Edit `src/config/site.ts` for site-wide settings:
```typescript
export const siteConfig = {
  name: 'PoultryCo',
  description: 'Professional networking platform for the global poultry industry',
  url: 'https://www.poultryco.net',
  ogImage: '/og-image.jpg',
  links: {
    linkedin: 'https://linkedin.com/company/poultryco',
    twitter: 'https://twitter.com/poultryco',
    // ...
  },
}
```

---

## 🎯 SEO Strategy

### Per Page SEO

Each page must include:
- Unique title (55-60 characters)
- Meta description (150-160 characters)
- Open Graph tags
- Twitter Card tags
- Schema.org structured data

### Implementation

```typescript
// In page.tsx or layout.tsx
export const metadata: Metadata = {
  title: 'PoultryCo - Professional Network for Poultry Industry',
  description: 'Join 10,000+ poultry professionals...',
  openGraph: {
    title: '...',
    description: '...',
    url: '...',
    images: ['...'],
  },
}
```

### Dynamic Metadata (Blog Posts)

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug)
  return {
    title: post.title,
    description: post.excerpt,
    // ...
  }
}
```

---

## 📊 Analytics & Tracking

### Google Analytics 4

```typescript
// src/lib/analytics.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const pageview = (url: string) => {
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  })
}

export const event = ({ action, category, label, value }: EventParams) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
```

### Track Events

```typescript
import { event } from '@/lib/analytics'

// Track CTA clicks
event({
  action: 'click',
  category: 'CTA',
  label: 'Early Access Button - Hero',
})

// Track form submissions
event({
  action: 'submit',
  category: 'Form',
  label: 'Early Access Form',
})
```

---

## 📝 Content Management

### Blog Posts (Future)

Options for blog content management:
1. **MDX files** (simple, git-based)
2. **Headless CMS** (Contentful, Sanity, Strapi)
3. **Database** (AWS RDS)

**Recommended for MVP:** MDX files in `/content/blog/`

```
content/
└── blog/
    ├── post-1.mdx
    ├── post-2.mdx
    └── post-3.mdx
```

---

## 🚀 Deployment

### EC2 Production Deployment

The web app is deployed on EC2 using PM2. See [EC2 Deployment Guide](../../docs/deployment/EC2_DEPLOYMENT_GUIDE.md) for details.

**Quick commands:**
```bash
# On EC2 server
cd ~/poultryco
pm2 restart poultryco-web
pm2 logs poultryco-web
```

### Environment Variables
Set environment variables in `.env` file on EC2:
- Create `.env` file in `apps/web/` directory
- Add required environment variables
- Restart PM2: `pm2 restart poultryco-web`

### Custom Domain
1. Configure domain in Route 53 or your DNS provider
2. Update DNS records:
   - Type: A, Name: @, Value: 76.76.21.21
   - Type: A/ALIAS, Name: www, Value: [ALB DNS name]

---

## ⚡ Performance Optimization

### Core Web Vitals Targets
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1

### Optimization Checklist
- [ ] Image optimization (WebP, lazy loading)
- [ ] Font optimization (subset, preload)
- [ ] Code splitting
- [ ] Minimize JavaScript
- [ ] Enable compression
- [ ] Use CDN (AWS CloudFront)
- [ ] Implement caching headers
- [ ] Optimize third-party scripts

### Image Optimization

```typescript
import Image from 'next/image'

<Image
  src="/images/hero.jpg"
  alt="Description"
  width={1200}
  height={600}
  priority // For above-the-fold images
  placeholder="blur" // With blurDataURL
/>
```

---

## ♿ Accessibility

### Requirements
- WCAG 2.1 AA compliance
- Minimum 4.5:1 color contrast
- Keyboard navigation
- Screen reader support
- Focus indicators
- Alt text for all images
- Semantic HTML

### Testing Tools
- Lighthouse (in Chrome DevTools)
- axe DevTools
- WAVE browser extension

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Mobile responsive (all breakpoints)
- [ ] Cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] Performance (Lighthouse score 95+)
- [ ] Accessibility (WCAG AA)
- [ ] SEO (meta tags, structured data)
- [ ] Analytics tracking
- [ ] Links work correctly
- [ ] Images load and display properly

---

## 📚 Documentation

### Related Docs
- **Marketing Strategy:** `/docs/website/MARKETING_STRATEGY.md`
- **Website Structure:** `/docs/website/WEBSITE_STRUCTURE.md`
- **Design Guidelines:** `/docs/website/DESIGN_GUIDELINES.md`
- **SEO Strategy:** `/docs/website/SEO_STRATEGY.md`
- **Content Strategy:** `/docs/website/CONTENT_STRATEGY.md`

### Brand Assets
- Logo files: `/docs/brand/logo/`
- Brand guidelines: `/docs/brand/poultryco_brand_guidelines.md`
- Wireframes: `/docs/wireframes/`

---

## 👥 Development Team

### Workflow
1. Review design guidelines
2. Build component in isolation
3. Test responsive behavior
4. Check accessibility
5. Optimize performance
6. Deploy to preview
7. Get team feedback
8. Deploy to production

### Code Standards
- TypeScript strict mode
- ESLint rules followed
- Component naming: PascalCase
- File naming: kebab-case or PascalCase
- Comments for complex logic
- Commit message format: `type: description`

---

## 🎯 Success Metrics

### Website Goals (90 days)
- 50,000 unique visitors
- 10,000 early access signups
- 5,000 email subscribers
- 95+ Lighthouse score
- < 40% bounce rate
- 3+ pages per session

### Monthly Tracking
- Traffic sources
- Conversion rates
- Top performing pages
- User behavior flow
- Form completion rates
- SEO rankings

---

## 🔗 Quick Links

- **Live Site:** https://www.poultryco.net (when deployed)
- **Deployment:** EC2 + PM2
- **Analytics:** Google Analytics dashboard
- **AWS Console:** https://console.aws.amazon.com
- **Design Figma:** [Link when available]

---

## 🆘 Support

### Questions?
- Technical: Ask Dev Lead
- Design: Check `/docs/website/DESIGN_GUIDELINES.md`
- Content: Ask Content Manager
- SEO: Check `/docs/website/SEO_STRATEGY.md`

### Issues
- Report bugs via GitHub Issues
- Tag with `web-app` label
- Include screenshots/steps to reproduce

---

**Status:** Setup Complete ✅  
**Next Step:** Create layout components (Header, Footer)  
**Team:** PoultryCo Web Development Team

---

**Let's build a high-converting marketing website! 🚀🐔**

