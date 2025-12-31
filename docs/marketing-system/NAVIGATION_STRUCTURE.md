# Marketing Module - Navigation Structure Design

**Date:** December 2025  
**Status:** Design Complete

---

## 📋 Overview

Comprehensive left navigation structure for the Marketing module covering:
- Core Marketing System
- Content System
- WhatsApp Integration
- Social Media Channels
- Email Channels
- Analytics & KPIs

---

## 🎯 Navigation Structure

```
MARKETING
├── 📊 Marketing Dashboard          /marketing
│
├── 🎯 Core Marketing
│   ├── 🚀 Campaigns                /marketing/campaigns
│   ├── 👥 Segments                 /marketing/segments
│   ├── 💡 NDP Research             /marketing/ndp-research
│   │   ├── Categories              /marketing/ndp-research/categories
│   │   └── Topics                  /marketing/ndp-research/topics
│   └── 🎭 Personas                 /marketing/personas
│
├── 📝 Content System
│   ├── 🏛️ Content Pillars          /marketing/content/pillars
│   ├── 📄 Content                  /marketing/content
│   ├── 💭 Content Ideas            /marketing/content/ideas
│   ├── 📅 Content Calendar         /marketing/content/calendar
│   └── 🏷️ Content Tags             /marketing/content/tags
│
├── 💬 WhatsApp
│   ├── 📱 Accounts                 /marketing/whatsapp/accounts
│   ├── 👥 Groups                   /marketing/whatsapp/groups
│   ├── 📇 Contacts                 /marketing/whatsapp/contacts
│   ├── 💬 Messages                 /marketing/whatsapp/messages
│   └── 📊 Analytics                 /marketing/whatsapp/analytics
│
├── 📱 Social Media
│   ├── 📺 Channels                 /marketing/social/channels
│   ├── 📝 Posts                    /marketing/social/posts
│   ├── 📅 Schedule                 /marketing/social/schedule
│   └── 📊 Analytics                 /marketing/social/analytics
│
├── 📧 Email
│   ├── 📬 Campaigns                /marketing/email/campaigns
│   ├── 📝 Templates                /marketing/email/templates
│   ├── 📋 Lists                    /marketing/email/lists
│   ├── 📅 Schedule                 /marketing/email/schedule
│   └── 📊 Analytics                 /marketing/email/analytics
│
└── 📊 Analytics & KPIs
    ├── 📈 Marketing KPIs           /marketing/analytics/kpis
    ├── 📉 Performance              /marketing/analytics/performance
    ├── 📊 Reports                  /marketing/analytics/reports
    └── 🎯 Goals                    /marketing/analytics/goals
```

---

## 📐 Detailed Navigation Structure

### 1. Marketing Dashboard
**Path:** `/marketing`  
**Icon:** 📊  
**Description:** Overview of all marketing activities, stats, and quick actions

**Sub-pages:** None (main dashboard)

---

### 2. Core Marketing

#### 2.1 Campaigns
**Path:** `/marketing/campaigns`  
**Icon:** 🚀  
**Description:** Top-level marketing campaigns that orchestrate all activities

**Sub-pages:**
- `/marketing/campaigns/new` - Create campaign
- `/marketing/campaigns/[id]` - Campaign details
- `/marketing/campaigns/[id]/edit` - Edit campaign
- `/marketing/campaigns/[id]/performance` - Campaign performance

#### 2.2 Segments
**Path:** `/marketing/segments`  
**Icon:** 👥  
**Description:** Target audience segments (11 stakeholder types)

**Sub-pages:**
- `/marketing/segments/new` - Create segment
- `/marketing/segments/[id]` - Segment details
- `/marketing/segments/[id]/edit` - Edit segment

#### 2.3 NDP Research
**Path:** `/marketing/ndp-research`  
**Icon:** 💡  
**Description:** Need-Desire-Pain framework research (ICP language)

**Sub-pages:**
- `/marketing/ndp-research/categories` - NDP categories (Need, Desire, Pain, etc.)
- `/marketing/ndp-research/topics` - NDP research topics
- `/marketing/ndp-research/topics/new` - Create NDP topic
- `/marketing/ndp-research/topics/[id]` - Topic details

#### 2.4 Personas
**Path:** `/marketing/personas`  
**Icon:** 🎭  
**Description:** Persona mapping (segments + regions + attributes = ICP)

**Sub-pages:**
- `/marketing/personas/contacts` - Persona contacts
- `/marketing/personas/scores` - Confidence scores
- `/marketing/personas/mapping` - Persona mapping tool

---

### 3. Content System

#### 3.1 Content Pillars
**Path:** `/marketing/content/pillars`  
**Icon:** 🏛️  
**Description:** Core research topics that serve as foundation for content

**Sub-pages:**
- `/marketing/content/pillars/new` - Create pillar
- `/marketing/content/pillars/[id]` - Pillar details
- `/marketing/content/pillars/[id]/edit` - Edit pillar

#### 3.2 Content
**Path:** `/marketing/content`  
**Icon:** 📄  
**Description:** Master and repurposed content pieces

**Sub-pages:**
- `/marketing/content/new` - Create content
- `/marketing/content/[id]` - Content details
- `/marketing/content/[id]/edit` - Edit content

#### 3.3 Content Ideas
**Path:** `/marketing/content/ideas`  
**Icon:** 💭  
**Description:** Quick capture of content ideas before full pillar development

**Sub-pages:**
- `/marketing/content/ideas/new` - Create idea
- `/marketing/content/ideas/[id]` - Idea details
- `/marketing/content/ideas/[id]/edit` - Edit idea

#### 3.4 Content Calendar
**Path:** `/marketing/content/calendar`  
**Icon:** 📅  
**Description:** Schedule and track content publishing across all channels

**Sub-pages:**
- `/marketing/content/calendar/new` - Schedule content
- `/marketing/content/calendar/[id]` - Schedule item details
- `/marketing/content/calendar/[id]/edit` - Edit schedule

#### 3.5 Content Tags
**Path:** `/marketing/content/tags`  
**Icon:** 🏷️  
**Description:** Flexible taxonomy for content categorization

**Sub-pages:** None (list + create/edit in modal)

---

### 4. WhatsApp

#### 4.1 Accounts
**Path:** `/marketing/whatsapp/accounts`  
**Icon:** 📱  
**Description:** WhatsApp account management and connections

**Sub-pages:**
- `/marketing/whatsapp/accounts/new` - Add account
- `/marketing/whatsapp/accounts/[id]` - Account details
- `/marketing/whatsapp/accounts/[id]/qr` - QR code display

#### 4.2 Groups
**Path:** `/marketing/whatsapp/groups`  
**Icon:** 👥  
**Description:** WhatsApp groups discovery and management

**Sub-pages:**
- `/marketing/whatsapp/groups/[id]` - Group details
- `/marketing/whatsapp/groups/[id]/edit` - Edit group
- `/marketing/whatsapp/groups/[id]/contacts` - View group contacts

#### 4.3 Contacts
**Path:** `/marketing/whatsapp/contacts`  
**Icon:** 📇  
**Description:** WhatsApp contacts and persona mapping

**Sub-pages:**
- `/marketing/whatsapp/contacts/[id]` - Contact details
- `/marketing/whatsapp/contacts/[id]/persona` - Persona mapping

#### 4.4 Messages
**Path:** `/marketing/whatsapp/messages`  
**Icon:** 💬  
**Description:** WhatsApp message tracking and management

**Sub-pages:**
- `/marketing/whatsapp/messages/new` - Send message
- `/marketing/whatsapp/messages/[id]` - Message details

#### 4.5 Analytics
**Path:** `/marketing/whatsapp/analytics`  
**Icon:** 📊  
**Description:** WhatsApp campaign performance and metrics

**Sub-pages:** None (dashboard view)

---

### 5. Social Media

#### 5.1 Channels
**Path:** `/marketing/social/channels`  
**Icon:** 📺  
**Description:** Social media channel management (LinkedIn, Facebook, Instagram, etc.)

**Sub-pages:**
- `/marketing/social/channels/new` - Add channel
- `/marketing/social/channels/[id]` - Channel details
- `/marketing/social/channels/[id]/edit` - Edit channel

#### 5.2 Posts
**Path:** `/marketing/social/posts`  
**Icon:** 📝  
**Description:** Social media posts management

**Sub-pages:**
- `/marketing/social/posts/new` - Create post
- `/marketing/social/posts/[id]` - Post details
- `/marketing/social/posts/[id]/edit` - Edit post

#### 5.3 Schedule
**Path:** `/marketing/social/schedule`  
**Icon:** 📅  
**Description:** Social media content scheduling

**Sub-pages:**
- `/marketing/social/schedule/new` - Schedule post
- `/marketing/social/schedule/[id]` - Schedule details

#### 5.4 Analytics
**Path:** `/marketing/social/analytics`  
**Icon:** 📊  
**Description:** Social media performance analytics

**Sub-pages:** None (dashboard view)

---

### 6. Email

#### 6.1 Campaigns
**Path:** `/marketing/email/campaigns`  
**Icon:** 📬  
**Description:** Email marketing campaigns

**Sub-pages:**
- `/marketing/email/campaigns/new` - Create campaign
- `/marketing/email/campaigns/[id]` - Campaign details
- `/marketing/email/campaigns/[id]/edit` - Edit campaign

#### 6.2 Templates
**Path:** `/marketing/email/templates`  
**Icon:** 📝  
**Description:** Email template management

**Sub-pages:**
- `/marketing/email/templates/new` - Create template
- `/marketing/email/templates/[id]` - Template details
- `/marketing/email/templates/[id]/edit` - Edit template

#### 6.3 Lists
**Path:** `/marketing/email/lists`  
**Icon:** 📋  
**Description:** Email subscriber lists

**Sub-pages:**
- `/marketing/email/lists/new` - Create list
- `/marketing/email/lists/[id]` - List details
- `/marketing/email/lists/[id]/subscribers` - Manage subscribers

#### 6.4 Schedule
**Path:** `/marketing/email/schedule`  
**Icon:** 📅  
**Description:** Email scheduling

**Sub-pages:**
- `/marketing/email/schedule/new` - Schedule email
- `/marketing/email/schedule/[id]` - Schedule details

#### 6.5 Analytics
**Path:** `/marketing/email/analytics`  
**Icon:** 📊  
**Description:** Email performance analytics

**Sub-pages:** None (dashboard view)

---

### 7. Analytics & KPIs

#### 7.1 Marketing KPIs
**Path:** `/marketing/analytics/kpis`  
**Icon:** 📈  
**Description:** Overall marketing KPIs and metrics

**Sub-pages:**
- `/marketing/analytics/kpis/social` - Social media KPIs
- `/marketing/analytics/kpis/platform` - Platform KPIs
- `/marketing/analytics/kpis/whatsapp` - WhatsApp KPIs
- `/marketing/analytics/kpis/email` - Email KPIs

#### 7.2 Performance
**Path:** `/marketing/analytics/performance`  
**Icon:** 📉  
**Description:** Campaign and content performance analysis

**Sub-pages:**
- `/marketing/analytics/performance/campaigns` - Campaign performance
- `/marketing/analytics/performance/content` - Content performance
- `/marketing/analytics/performance/channels` - Channel performance

#### 7.3 Reports
**Path:** `/marketing/analytics/reports`  
**Icon:** 📊  
**Description:** Marketing reports and insights

**Sub-pages:**
- `/marketing/analytics/reports/weekly` - Weekly reports
- `/marketing/analytics/reports/monthly` - Monthly reports
- `/marketing/analytics/reports/custom` - Custom reports

#### 7.4 Goals
**Path:** `/marketing/analytics/goals`  
**Icon:** 🎯  
**Description:** Marketing goals and targets

**Sub-pages:**
- `/marketing/analytics/goals/new` - Create goal
- `/marketing/analytics/goals/[id]` - Goal details
- `/marketing/analytics/goals/[id]/edit` - Edit goal

---

## 🎨 Visual Navigation Structure

```
┌─────────────────────────────────────┐
│  MARKETING                          │
├─────────────────────────────────────┤
│  📊 Marketing Dashboard              │
│                                     │
│  🎯 CORE MARKETING                  │
│    🚀 Campaigns                     │
│    👥 Segments                      │
│    💡 NDP Research                  │
│      • Categories                   │
│      • Topics                       │
│    🎭 Personas                      │
│                                     │
│  📝 CONTENT SYSTEM                  │
│    🏛️ Content Pillars               │
│    📄 Content                       │
│    💭 Content Ideas                 │
│    📅 Content Calendar              │
│    🏷️ Content Tags                  │
│                                     │
│  💬 WHATSAPP                        │
│    📱 Accounts                      │
│    👥 Groups                        │
│    📇 Contacts                      │
│    💬 Messages                      │
│    📊 Analytics                     │
│                                     │
│  📱 SOCIAL MEDIA                    │
│    📺 Channels                      │
│    📝 Posts                         │
│    📅 Schedule                      │
│    📊 Analytics                     │
│                                     │
│  📧 EMAIL                           │
│    📬 Campaigns                     │
│    📝 Templates                     │
│    📋 Lists                         │
│    📅 Schedule                      │
│    📊 Analytics                     │
│                                     │
│  📊 ANALYTICS & KPIS                │
│    📈 Marketing KPIs                │
│    📉 Performance                   │
│    📊 Reports                       │
│    🎯 Goals                         │
└─────────────────────────────────────┘
```

---

## 📋 Navigation Implementation Notes

### Collapsible Sections
- Each main section (Core Marketing, Content System, etc.) can be collapsible
- Shows sub-items when expanded
- Highlights active section

### Active State
- Current page highlighted
- Parent section expanded if sub-page is active
- Breadcrumb shows full path

### Icons
- Use consistent icon set (emoji or icon library)
- Icons help quick visual identification
- Color coding by section (optional)

### Badge Counts
- Show counts for items (e.g., "Calendar (17)")
- Show status indicators (e.g., active campaigns count)
- Update in real-time

---

## 🔄 Migration from Current Structure

### Current → New Mapping

| Current Path | New Path | Notes |
|--------------|----------|-------|
| `/marketing` | `/marketing` | ✅ Same |
| `/marketing/topics` | `/marketing/ndp-research/topics` | Moved to NDP Research |
| `/marketing/segments` | `/marketing/segments` | ✅ Same |
| `/marketing/pillars` | `/marketing/content/pillars` | Moved to Content System |
| `/marketing/campaigns` | `/marketing/campaigns` | ✅ Same |
| `/marketing/channels` | `/marketing/social/channels` | Moved to Social Media |
| `/marketing/calendar` | `/marketing/content/calendar` | Moved to Content System |
| `/marketing/kpis` | `/marketing/analytics/kpis` | Moved to Analytics |
| `/marketing/content` | `/marketing/content` | ✅ Same |
| `/marketing/ideas` | `/marketing/content/ideas` | Moved to Content System |
| `/marketing/settings/tags` | `/marketing/content/tags` | Moved to Content System |
| `/marketing/whatsapp` | `/marketing/whatsapp` | ✅ Same (new) |

---

## 📝 Implementation Checklist

### Phase 1: Core Structure
- [ ] Update navigation component to support collapsible sections
- [ ] Create navigation data structure
- [ ] Add icons for all menu items
- [ ] Implement active state highlighting

### Phase 2: Page Organization
- [ ] Move existing pages to new structure
- [ ] Create redirects for old paths
- [ ] Update all internal links
- [ ] Update breadcrumbs

### Phase 3: New Pages
- [ ] Create NDP Research section pages
- [ ] Create Personas section pages
- [ ] Create Social Media section pages
- [ ] Create Email section pages
- [ ] Create Analytics section pages

### Phase 4: Polish
- [ ] Add badge counts
- [ ] Add status indicators
- [ ] Implement search/filter
- [ ] Add keyboard shortcuts

---

## 🎯 Benefits of This Structure

1. **Clear Organization** - Logical grouping by function
2. **Scalability** - Easy to add new channels/modules
3. **Discoverability** - Users can find features easily
4. **Consistency** - Same pattern across all channels
5. **Efficiency** - Quick navigation to any feature

---

**Last Updated:** December 2025  
**Status:** Design Complete, Ready for Implementation

