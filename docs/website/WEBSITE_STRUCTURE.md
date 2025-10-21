# PoultryCo Marketing Website - Complete Structure

**Version:** 1.0  
**Date:** October 20, 2025  
**Domain:** www.poultryco.net  
**Tech Stack:** Next.js 14+ (App Router)

---

## 🏗️ Site Architecture

### Domain Strategy

```
Phase 1 (NOW - Pre-MVP Marketing Site):
www.poultryco.net/
├── / (Landing Page)
├── /features
├── /about
├── /blog
│   ├── /blog/[slug]
│   └── /blog/category/[category]
├── /contact
├── /early-access (Main CTA)
├── /ptse (Event-specific landing)
├── /tools-preview
├── /associations (B2B landing)
└── /press

Phase 2 (Post Mobile MVP - Hybrid Site):
www.poultryco.net/
├── / (Dual-purpose: Guest landing OR auto-redirect to /home)
├── /login
├── /signup
├── /home (Feed - logged in users)
├── /me/{slug} (Personal profiles - public, SEO friendly)
├── /com/{slug} (Business profiles - public, SEO friendly)
├── /org/{slug} (Organization profiles - public, SEO friendly)
├── /events
├── /jobs
├── /tools
└── [All marketing pages remain accessible]
```

---

## 📄 Page-by-Page Structure

### 1. Home Page (/)

#### Hero Section
- **Headline:** "The Professional Network Built BY Poultry People, FOR Poultry People"
- **Subheadline:** Value proposition (2-3 lines)
- **Primary CTA:** "Get Early Access 🚀"
- **Secondary CTA:** "Watch 2-Min Demo Video ▶"
- **Background:** Hero image/video

#### Social Proof Bar
- StartupTN logo
- PTIC logo
- Association logos
- "Featured at PTSE 2025"

#### The Problem Section (Story-driven)
**3-Act Timeline:**
1. Act 1: The Plea (PTSE 1st Edition)
2. Act 2: The Promise (PTSE 2nd Edition)
3. Act 3: The Proof (PTSE 3rd Edition)

#### Pain Points Grid (4x2)
- 8 common problems with icons
- Visual representation
- Transition to solution

#### Solution Preview (Tabs/Cards)
**4 Stakeholder Views:**
1. For Farmers
2. For Veterinarians
3. For Suppliers/Vendors
4. For Associations

Each with:
- 4 key benefits
- Supporting image
- CTA to learn more

#### Platform Preview
- App screenshot showcase
- 5-slide carousel
- Interactive demo

#### Early Adopter Benefits
**3 Reasons to Join Now:**
1. 🎁 Founding Member Status
2. 🔓 Lifetime Free Access
3. 🗳️ Shape the Platform

#### Testimonials
- 3-card carousel
- Industry leaders
- Photos + credentials
- Verified badges

#### Stats Counter (when available)
- Professionals waiting
- Associations partnering
- Businesses ready
- Countries covered

#### PTSE Banner
- Event date countdown
- Location
- Register CTA

#### Final CTA
- Large registration form
- Role selection
- Key fields
- Submit button
- Trust badges below

---

### 2. /features - Features Hub

#### Main Features Page

**Hero:**
- "Everything You Need to Succeed"
- Subtitle about comprehensive platform

**Feature Categories Grid (6 categories):**

1. **🤝 Networking**
   - Verified Professional Profiles
   - Connection Management
   - Role-Based Discovery
   - Multi-Role Support
   - Link to: `/features/networking`

2. **💬 Collaboration**
   - Expert Q&A System
   - Discussion Groups
   - 1:1 Messaging
   - Video Consultations
   - Link to: `/features/collaboration`

3. **📊 Industry Tools**
   - FCR Calculator
   - Feed Formula Optimizer
   - Farm Bookkeeping
   - Market Intelligence
   - Link to: `/features/tools`

4. **🎓 Learning**
   - Expert Articles
   - Best Practices Library
   - Training Resources
   - Webinars & Events
   - Link to: `/features/learning`

5. **🏢 Business Growth**
   - Product Showcase
   - Job Board
   - Supplier Directory
   - Partnership Opportunities
   - Link to: `/features/business`

6. **🔐 Trust & Security**
   - Multi-level Verification
   - Privacy Controls
   - Secure Messaging
   - Data Protection
   - Link to: `/features/security`

#### Individual Feature Pages

**Template Structure for each:**
```
/features/[feature-name]

Sections:
1. Hero with specific benefit
2. "How It Works" (3-step visual)
3. "Who It's For" (stakeholder tabs)
4. Real-world scenario
5. Coming soon features
6. Related features
7. CTA to early access
```

**Pages to Create:**
- `/features/networking`
- `/features/collaboration`
- `/features/tools`
- `/features/learning`
- `/features/business`
- `/features/security`

---

### 3. /about - About Us

#### Our Story
- Founder's journey timeline
- From technology leader to industry builder
- The PTSE connection
- Why poultry-only

#### Why PoultryCo?
**"Specific is Terrific" argument:**
- Generic platforms fail
- Industry-specific wins
- Built by insiders

#### Our Values (5 Core Values)
1. 🌱 Grow Together
2. 🎓 Expertise Matters
3. 🤝 Trusted Connections
4. 🌍 Global Community
5. 🆓 Accessible to All

#### Team Section
- Founder profile
- Advisory board (when available)
- Key team members

#### Backed By
- StartupTN
- PTIC
- Partner associations
- Industry supporters

#### Media Section
- Press mentions
- Awards
- Recognition

---

### 4. /blog - Content Hub

#### Blog Home
**Layout:**
- Hero: Featured post (large card)
- Recent posts (3-column grid)
- Sidebar:
  - Email subscription
  - Categories
  - Popular posts
  - Search
  - Tags

**Post Categories:**
1. Industry Insights
2. Farmer Stories
3. Expert Advice
4. Platform Updates
5. Events & News

#### Individual Post
```
/blog/[slug]

Structure:
- Hero image
- Title + metadata (date, author, category, read time)
- Article content
- Author bio card
- Related posts
- Comments (future)
- Share buttons
- Newsletter CTA
```

#### Category Page
```
/blog/category/[category]

- Category description
- Filtered posts grid
- Pagination
- Sidebar
```

#### Tag Page
```
/blog/tag/[tag]

- Tag description
- Tagged posts
- Related tags
```

---

### 5. /contact - Contact Us

**3-Column Layout:**

#### Column 1: General Inquiries
- Contact form
  - Name
  - Email
  - Phone
  - Category dropdown
  - Message
  - Submit button

#### Column 2: Partnership Inquiries

**For Associations:**
- "Bring your members to PoultryCo"
- Benefits list
- Schedule call CTA

**For Businesses:**
- "Showcase your products/services"
- Partner benefits
- Partner with us CTA

#### Column 3: Press & Media
- Media kit download
- Press releases
- Interview requests
- Download button

**Footer Section:**
- Direct contact info
  - Email: hello@poultryco.net
  - Phone
  - Address (if any)
- Social media links
- Office locations (future)

---

### 6. /early-access - Primary Conversion Page

**Hero:**
- "Be Among the First 5,000 Founding Members"
- Urgency messaging

**Benefits Comparison Table:**
```
Regular Members vs Founding Members

Feature comparison showing:
- Basic features (both)
- Premium features (founding only)
- Exclusive benefits (founding only)
```

**Scarcity Elements:**
- Countdown/spots remaining
- Progress bar
- "Only X spots left"

**Enhanced Registration Form:**

**Multi-step:**
1. Your Role (selection)
2. Basic Info (name, email, phone)
3. What You Need Most (survey)
4. Confirmation

**Post-submission:**
- Success message
- What happens next (5 steps)
- Social sharing options

---

### 7. /ptse - Event Landing Page

**Event-Specific Design:**
- PTSE branding colors
- Event date prominent
- Countdown timer

**Sections:**

#### Hero
- "Witness the Platform That Was Promised"
- "Live at PTSE 3rd Edition"
- Event details
- Register CTA

#### Event Agenda
- Timeline of activities
- Speaker sessions
- Demo times
- Networking opportunities

#### Why Attend
- See live demo
- Meet the founder
- Exclusive launch offers
- Network with industry

#### Special Offers
- On-site signup benefits
- Association bulk registration
- Exhibitor packages

#### Registration Form
- Name, email, phone
- Organization
- Ticket type
- Submit

---

### 8. /tools-preview - Coming Soon Features

**Hero:**
- "Industry Tools Built For You"

**Tool Showcase (Interactive):**

1. **🧮 FCR Calculator**
   - Description
   - Screenshot/mockup
   - [Try Beta] button
   - Request feature link

2. **📊 Feed Formula Optimizer**
   - Description
   - Screenshot/mockup
   - [Coming Soon] badge
   - Join waitlist

3. **💰 Farm Bookkeeping**
   - Description
   - Screenshot/mockup
   - Express interest button

4. **📈 Business Plan Creator**
   - Description
   - Screenshot/mockup
   - Vote for priority

**Feature Request Survey:**
- "What tool do you need most?"
- Open-ended input
- Submit feedback

---

### 9. /associations - B2B Landing

**Targeted at Association Leaders**

**Hero:**
- "Empower Your Members Digitally"
- Subtitle for associations

**Benefits for Associations:**
- Digital member directory
- Bulk member onboarding
- Event management
- Member engagement tracking
- Association branding
- Announcement system
- Always free

**Case Study:**
- "How PTIC Manages 650+ Members"
- Screenshot
- Results
- Testimonial

**Feature Showcase:**
- Bulk invite demo
- Event management
- Member analytics
- Communication tools

**Pricing:**
- "Always Free for Associations"
- No hidden costs
- Clear messaging

**CTA:**
- Schedule demo call
- Download association guide

**Current Partners:**
- Association logos
- Testimonials

---

### 10. /press - Media & Press Kit

**Hero:**
- "PoultryCo in the News"

**Press Releases Section:**
- Latest announcements
- Downloadable PDFs
- Dates
- Categories

**Media Coverage:**
- News outlet logos
- Links to articles
- Quotes

**Press Kit Downloads:**
- Logo assets (ZIP)
- Brand guidelines (PDF)
- Product screenshots (ZIP)
- Founder bio & photo
- Company fact sheet
- Press releases archive

**Media Contact:**
- Press officer name
- Email: press@poultryco.net
- Phone
- Response time expectations

---

## 🔗 Additional Pages

### /privacy - Privacy Policy
- Standard privacy policy
- GDPR compliant
- Data handling
- User rights

### /terms - Terms of Service
- Usage terms
- User responsibilities
- Platform rules
- Legal disclaimers

### /cookies - Cookie Policy
- Cookie usage
- Types of cookies
- User control
- Third-party cookies

### 404 - Not Found
- Friendly message
- Search box
- Popular pages links
- Home link

### 500 - Server Error
- Error message
- Retry option
- Contact support
- Home link

---

## 🗺️ Navigation Structure

### Main Navigation (Desktop)
```
[Logo]  Features  About  Blog  Contact  [Get Early Access - CTA Button]
```

### Mobile Navigation (Hamburger)
```
[☰] [Logo] [CTA Icon]

Opens full-screen menu:
- Features
- About
- Blog
- Contact
- PTSE Event
- Get Early Access (prominent)
- Social links
```

### Footer Navigation
```
Column 1: Platform
- Features
- About
- Associations
- Tools Preview
- PTSE Event

Column 2: Resources
- Blog
- Press
- Contact
- Privacy Policy
- Terms of Service

Column 3: Community
- Early Access
- WhatsApp Group
- LinkedIn
- Twitter
- Instagram

Column 4: Contact
- Email
- Phone
- Address
- Support

Bottom Bar:
- © 2025 PoultryCo. All rights reserved.
- Built with ❤️ for the global poultry community
- Language selector (future)
```

---

## 📊 Page Priorities for Development

### Phase 1: MVP (Launch ASAP)
**Priority 1 (Week 1):**
1. Home page (/)
2. Early access (/early-access)
3. About (/about)
4. Contact (/contact)
5. Privacy & Terms

**Priority 2 (Week 2):**
6. Features hub (/features)
7. Blog home + 5 initial posts
8. PTSE landing (/ptse)

### Phase 2: Content Expansion
9. Individual feature pages
10. Blog expansion (20+ posts)
11. Tools preview
12. Associations landing
13. Press page

### Phase 3: Advanced
14. Interactive demos
15. Video content
16. User-generated content
17. Multi-language support

---

## 🎯 URL Structure & SEO

### URL Patterns

**Marketing Pages:**
```
/ (home)
/features
/features/[feature-name]
/about
/blog
/blog/[slug]
/blog/category/[category]
/contact
/early-access
/ptse
```

**Future Platform Pages:**
```
/login
/signup
/home (app)
/me/[slug] (profiles)
/com/[slug] (businesses)
/org/[slug] (organizations)
/events
/jobs
/tools
```

### SEO Best Practices
- Clean, descriptive URLs
- Hyphens for word separation
- Lowercase only
- No special characters
- Canonical URLs
- XML sitemap
- Robots.txt

---

## 📱 Responsive Breakpoints

```
Mobile:    320px - 768px
Tablet:    768px - 1024px
Desktop:   1024px - 1440px
Wide:      1440px+
```

### Content Strategy by Device
- **Mobile:** Single column, larger text, simplified navigation
- **Tablet:** 2 columns where appropriate, full navigation
- **Desktop:** Multi-column layouts, hover states, full features
- **Wide:** Max-width container (1440px), optimal line lengths

---

## 🔧 Technical Requirements

### Next.js Configuration
- App Router (Next.js 14+)
- TypeScript
- Server Components (default)
- Client Components (where needed)
- API Routes for forms
- Static Generation where possible
- ISR for blog

### Performance Targets
- Lighthouse Score: 95+
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Core Web Vitals: Green

### Integrations Needed
- Analytics (Google Analytics 4)
- Tag Manager (GTM)
- Email service (for subscriptions)
- Form handling (API routes)
- CMS (headless - future)
- CDN (Vercel/Cloudflare)

---

## 📚 Related Documents

- `MARKETING_STRATEGY.md` - Overall marketing approach
- `CONTENT_STRATEGY.md` - Blog and content planning
- `SEO_STRATEGY.md` - Search optimization
- `DESIGN_GUIDELINES.md` - UI/UX patterns
- `LEAD_GENERATION.md` - Forms and conversions

---

**Status:** Ready for Development  
**Next Step:** Create wireframes and begin Next.js setup  
**Team:** PoultryCo Web Team

