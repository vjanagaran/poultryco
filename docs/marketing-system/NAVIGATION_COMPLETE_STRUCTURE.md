# Marketing Module - Complete Navigation Structure

**Date:** December 2025  
**Status:** Design Complete - Ready for Implementation

---

## 📋 Complete Navigation Tree

### Level 1: Main Sections

```
MARKETING
├── 📊 Marketing Dashboard
├── 🎯 Core Marketing
├── 📝 Content System
├── 💬 WhatsApp
├── 📱 Social Media
├── 📧 Email
└── 📊 Analytics & KPIs
```

---

## 🎯 Detailed Structure

### 1. 📊 Marketing Dashboard
**Path:** `/marketing`  
**Icon:** 📊  
**Type:** Main Dashboard  
**Description:** Overview of all marketing activities, stats, and quick actions

---

### 2. 🎯 Core Marketing

**Parent Path:** `/marketing/core` (optional overview page)

#### 2.1 🚀 Campaigns
- **Path:** `/marketing/campaigns`
- **Sub-pages:**
  - `/marketing/campaigns/new` - Create campaign
  - `/marketing/campaigns/[id]` - Campaign details & performance
  - `/marketing/campaigns/[id]/edit` - Edit campaign
- **Description:** Top-level marketing campaigns that orchestrate all activities

#### 2.2 👥 Segments
- **Path:** `/marketing/segments`
- **Sub-pages:**
  - `/marketing/segments/new` - Create segment
  - `/marketing/segments/[id]` - Segment details
  - `/marketing/segments/[id]/edit` - Edit segment
- **Description:** Target audience segments (11 stakeholder types)

#### 2.3 💡 NDP Research
- **Path:** `/marketing/ndp-research`
- **Sub-sections:**
  - **📂 Categories** - `/marketing/ndp-research/categories`
    - NDP framework categories (Need, Desire, Pain, Problem, Fear, Fantasy)
  - **💡 Topics** - `/marketing/ndp-research/topics`
    - `/marketing/ndp-research/topics/new` - Create topic
    - `/marketing/ndp-research/topics/[id]` - Topic details
    - `/marketing/ndp-research/topics/[id]/edit` - Edit topic
- **Description:** Need-Desire-Pain framework research (ICP language)

#### 2.4 🎭 Personas
- **Path:** `/marketing/personas`
- **Sub-pages:**
  - `/marketing/personas/contacts` - Persona contacts
  - `/marketing/personas/scores` - Confidence scores
  - `/marketing/personas/mapping` - Persona mapping tool
- **Description:** Persona mapping (segments + regions + attributes = ICP)

---

### 3. 📝 Content System

**Parent Path:** `/marketing/content` (content list page)

#### 3.1 🏛️ Content Pillars
- **Path:** `/marketing/content/pillars`
- **Sub-pages:**
  - `/marketing/content/pillars/new` - Create pillar
  - `/marketing/content/pillars/[id]` - Pillar details
  - `/marketing/content/pillars/[id]/edit` - Edit pillar
- **Description:** Core research topics that serve as foundation for content

#### 3.2 📄 Content
- **Path:** `/marketing/content`
- **Sub-pages:**
  - `/marketing/content/new` - Create content
  - `/marketing/content/[id]` - Content details
  - `/marketing/content/[id]/edit` - Edit content
- **Description:** Master and repurposed content pieces

#### 3.3 💭 Content Ideas
- **Path:** `/marketing/content/ideas`
- **Sub-pages:**
  - `/marketing/content/ideas/new` - Create idea
  - `/marketing/content/ideas/[id]` - Idea details
  - `/marketing/content/ideas/[id]/edit` - Edit idea
- **Description:** Quick capture of content ideas before full pillar development

#### 3.4 📅 Content Calendar
- **Path:** `/marketing/content/calendar`
- **Sub-pages:**
  - `/marketing/content/calendar/new` - Schedule content
  - `/marketing/content/calendar/[id]` - Schedule item details
  - `/marketing/content/calendar/[id]/edit` - Edit schedule
- **Description:** Schedule and track content publishing across all channels
- **Badge:** Show count of scheduled items

#### 3.5 🏷️ Content Tags
- **Path:** `/marketing/content/tags`
- **Description:** Flexible taxonomy for content categorization
- **Note:** Can use modal for create/edit instead of separate pages

---

### 4. 💬 WhatsApp

**Parent Path:** `/marketing/whatsapp` (WhatsApp dashboard)

#### 4.1 📱 Accounts
- **Path:** `/marketing/whatsapp/accounts`
- **Sub-pages:**
  - `/marketing/whatsapp/accounts/new` - Add account
  - `/marketing/whatsapp/accounts/[id]` - Account details
  - `/marketing/whatsapp/accounts/[id]/qr` - QR code display
- **Description:** WhatsApp account management and connections

#### 4.2 👥 Groups
- **Path:** `/marketing/whatsapp/groups`
- **Sub-pages:**
  - `/marketing/whatsapp/groups/[id]` - Group details
  - `/marketing/whatsapp/groups/[id]/edit` - Edit group
  - `/marketing/whatsapp/groups/[id]/contacts` - View group contacts
- **Description:** WhatsApp groups discovery and management

#### 4.3 📇 Contacts
- **Path:** `/marketing/whatsapp/contacts`
- **Sub-pages:**
  - `/marketing/whatsapp/contacts/[id]` - Contact details
  - `/marketing/whatsapp/contacts/[id]/persona` - Persona mapping
- **Description:** WhatsApp contacts and persona mapping

#### 4.4 💬 Messages
- **Path:** `/marketing/whatsapp/messages`
- **Sub-pages:**
  - `/marketing/whatsapp/messages/new` - Send message
  - `/marketing/whatsapp/messages/[id]` - Message details
- **Description:** WhatsApp message tracking and management

#### 4.5 📊 Analytics
- **Path:** `/marketing/whatsapp/analytics`
- **Description:** WhatsApp campaign performance and metrics

---

### 5. 📱 Social Media

**Parent Path:** `/marketing/social` (Social media dashboard)

#### 5.1 📺 Channels
- **Path:** `/marketing/social/channels`
- **Sub-pages:**
  - `/marketing/social/channels/new` - Add channel
  - `/marketing/social/channels/[id]` - Channel details
  - `/marketing/social/channels/[id]/edit` - Edit channel
- **Description:** Social media channel management (LinkedIn, Facebook, Instagram, etc.)

#### 5.2 📝 Posts
- **Path:** `/marketing/social/posts`
- **Sub-pages:**
  - `/marketing/social/posts/new` - Create post
  - `/marketing/social/posts/[id]` - Post details
  - `/marketing/social/posts/[id]/edit` - Edit post
- **Description:** Social media posts management

#### 5.3 📅 Schedule
- **Path:** `/marketing/social/schedule`
- **Sub-pages:**
  - `/marketing/social/schedule/new` - Schedule post
  - `/marketing/social/schedule/[id]` - Schedule details
- **Description:** Social media content scheduling

#### 5.4 📊 Analytics
- **Path:** `/marketing/social/analytics`
- **Description:** Social media performance analytics

---

### 6. 📧 Email

**Parent Path:** `/marketing/email` (Email dashboard)

#### 6.1 📬 Campaigns
- **Path:** `/marketing/email/campaigns`
- **Sub-pages:**
  - `/marketing/email/campaigns/new` - Create campaign
  - `/marketing/email/campaigns/[id]` - Campaign details
  - `/marketing/email/campaigns/[id]/edit` - Edit campaign
- **Description:** Email marketing campaigns

#### 6.2 📝 Templates
- **Path:** `/marketing/email/templates`
- **Sub-pages:**
  - `/marketing/email/templates/new` - Create template
  - `/marketing/email/templates/[id]` - Template details
  - `/marketing/email/templates/[id]/edit` - Edit template
- **Description:** Email template management

#### 6.3 📋 Lists
- **Path:** `/marketing/email/lists`
- **Sub-pages:**
  - `/marketing/email/lists/new` - Create list
  - `/marketing/email/lists/[id]` - List details
  - `/marketing/email/lists/[id]/subscribers` - Manage subscribers
- **Description:** Email subscriber lists

#### 6.4 📅 Schedule
- **Path:** `/marketing/email/schedule`
- **Sub-pages:**
  - `/marketing/email/schedule/new` - Schedule email
  - `/marketing/email/schedule/[id]` - Schedule details
- **Description:** Email scheduling

#### 6.5 📊 Analytics
- **Path:** `/marketing/email/analytics`
- **Description:** Email performance analytics

---

### 7. 📊 Analytics & KPIs

**Parent Path:** `/marketing/analytics` (Analytics dashboard)

#### 7.1 📈 Marketing KPIs
- **Path:** `/marketing/analytics/kpis`
- **Sub-pages:**
  - `/marketing/analytics/kpis/social` - Social media KPIs
  - `/marketing/analytics/kpis/platform` - Platform KPIs
  - `/marketing/analytics/kpis/whatsapp` - WhatsApp KPIs
  - `/marketing/analytics/kpis/email` - Email KPIs
- **Description:** Overall marketing KPIs and metrics

#### 7.2 📉 Performance
- **Path:** `/marketing/analytics/performance`
- **Sub-pages:**
  - `/marketing/analytics/performance/campaigns` - Campaign performance
  - `/marketing/analytics/performance/content` - Content performance
  - `/marketing/analytics/performance/channels` - Channel performance
- **Description:** Campaign and content performance analysis

#### 7.3 📊 Reports
- **Path:** `/marketing/analytics/reports`
- **Sub-pages:**
  - `/marketing/analytics/reports/weekly` - Weekly reports
  - `/marketing/analytics/reports/monthly` - Monthly reports
  - `/marketing/analytics/reports/custom` - Custom reports
- **Description:** Marketing reports and insights

#### 7.4 🎯 Goals
- **Path:** `/marketing/analytics/goals`
- **Sub-pages:**
  - `/marketing/analytics/goals/new` - Create goal
  - `/marketing/analytics/goals/[id]` - Goal details
  - `/marketing/analytics/goals/[id]/edit` - Edit goal
- **Description:** Marketing goals and targets

---

## 📊 Navigation Summary

### Statistics
- **Total Top-Level Sections:** 7
- **Total Sub-modules:** 5 (Core, Content, WhatsApp, Social, Email)
- **Total Pages:** ~70+
- **Collapsible Sections:** 6 (all except Dashboard)

### Organization Pattern
```
/marketing                          → Dashboard
/marketing/[module]                 → Module section
/marketing/[module]/[section]       → Section list
/marketing/[module]/[section]/new   → Create
/marketing/[module]/[section]/[id]  → Details
/marketing/[module]/[section]/[id]/edit → Edit
```

---

## 🎨 Visual Sidebar Layout

```
┌──────────────────────────────┐
│  PoultryCo Admin Portal      │
├──────────────────────────────┤
│                              │
│  📊 Marketing Dashboard      │
│                              │
│  ──────────────────────────  │
│  MARKETING MODULES           │
│  ──────────────────────────  │
│                              │
│  ▼ 🎯 Core Marketing        │
│    🚀 Campaigns             │
│    👥 Segments              │
│    ▼ 💡 NDP Research        │
│      📂 Categories          │
│      💡 Topics              │
│    🎭 Personas              │
│                              │
│  ▼ 📝 Content System        │
│    🏛️ Content Pillars       │
│    📄 Content               │
│    💭 Content Ideas          │
│    📅 Content Calendar (17)  │
│    🏷️ Content Tags          │
│                              │
│  ▼ 💬 WhatsApp              │
│    📱 Accounts               │
│    👥 Groups                │
│    📇 Contacts              │
│    💬 Messages              │
│    📊 Analytics             │
│                              │
│  ▶ 📱 Social Media          │
│    (collapsed)              │
│                              │
│  ▶ 📧 Email                 │
│    (collapsed)              │
│                              │
│  ▼ 📊 Analytics & KPIs      │
│    📈 Marketing KPIs        │
│    📉 Performance           │
│    📊 Reports               │
│    🎯 Goals                 │
│                              │
└──────────────────────────────┘
```

---

## 🔄 Migration Path

### Current → New URL Mapping

| Current | New | Action |
|---------|-----|--------|
| `/marketing/topics` | `/marketing/ndp-research/topics` | Move + Redirect |
| `/marketing/channels` | `/marketing/social/channels` | Move + Redirect |
| `/marketing/calendar` | `/marketing/content/calendar` | Move + Redirect |
| `/marketing/kpis` | `/marketing/analytics/kpis` | Move + Redirect |
| `/marketing/settings/tags` | `/marketing/content/tags` | Move + Redirect |

---

## ✅ Implementation Checklist

### Phase 1: Navigation Component
- [ ] Create collapsible navigation component
- [ ] Add expand/collapse functionality
- [ ] Implement active state highlighting
- [ ] Add badge counts
- [ ] Add icons

### Phase 2: Page Migration
- [ ] Move existing pages to new structure
- [ ] Create redirects for old URLs
- [ ] Update all internal links
- [ ] Update breadcrumbs

### Phase 3: New Pages
- [ ] Create NDP Research section
- [ ] Create Personas section
- [ ] Create Social Media section
- [ ] Create Email section
- [ ] Create Analytics section

### Phase 4: Integration
- [ ] Update marketing dashboard
- [ ] Add quick links
- [ ] Update navigation API (if using API-based nav)
- [ ] Test all navigation paths

---

## 📚 Files Created

1. **Navigation Structure Document:** `docs/marketing-system/NAVIGATION_STRUCTURE.md`
2. **Visual Navigation:** `docs/marketing-system/NAVIGATION_VISUAL.md`
3. **Navigation Data:** `apps/admin/src/lib/navigation/marketing-nav.ts`
4. **Navigation Component:** `apps/admin/src/components/marketing/MarketingNav.tsx`
5. **This Document:** Complete structure reference

---

**Last Updated:** December 2025  
**Status:** Design Complete - Ready for Implementation

