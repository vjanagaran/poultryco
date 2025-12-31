# Marketing Module - Visual Navigation Structure

**Date:** December 2025  
**Visual Design Reference**

---

## 📐 Complete Navigation Tree

```
┌─────────────────────────────────────────────────────────────┐
│  MARKETING                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Marketing Dashboard                                     │
│     /marketing                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🎯 CORE MARKETING                                         │
│  ├─ 🚀 Campaigns                                           │
│  │    /marketing/campaigns                                 │
│  │    ├─ /new                                              │
│  │    ├─ /[id]                                             │
│  │    └─ /[id]/edit                                        │
│  │                                                         │
│  ├─ 👥 Segments                                            │
│  │    /marketing/segments                                  │
│  │    ├─ /new                                              │
│  │    ├─ /[id]                                             │
│  │    └─ /[id]/edit                                        │
│  │                                                         │
│  ├─ 💡 NDP Research                                        │
│  │    /marketing/ndp-research                              │
│  │    ├─ 📂 Categories                                     │
│  │    │    /marketing/ndp-research/categories             │
│  │    └─ 💡 Topics                                         │
│  │         /marketing/ndp-research/topics                  │
│  │         ├─ /new                                         │
│  │         └─ /[id]                                         │
│  │                                                         │
│  └─ 🎭 Personas                                            │
│       /marketing/personas                                  │
│       ├─ /contacts                                         │
│       ├─ /scores                                           │
│       └─ /mapping                                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📝 CONTENT SYSTEM                                         │
│  ├─ 🏛️ Content Pillars                                      │
│  │    /marketing/content/pillars                           │
│  │    ├─ /new                                              │
│  │    ├─ /[id]                                             │
│  │    └─ /[id]/edit                                        │
│  │                                                         │
│  ├─ 📄 Content                                             │
│  │    /marketing/content                                   │
│  │    ├─ /new                                              │
│  │    ├─ /[id]                                             │
│  │    └─ /[id]/edit                                        │
│  │                                                         │
│  ├─ 💭 Content Ideas                                       │
│  │    /marketing/content/ideas                             │
│  │    ├─ /new                                              │
│  │    ├─ /[id]                                             │
│  │    └─ /[id]/edit                                        │
│  │                                                         │
│  ├─ 📅 Content Calendar                                    │
│  │    /marketing/content/calendar                          │
│  │    ├─ /new                                              │
│  │    └─ /[id]                                             │
│  │                                                         │
│  └─ 🏷️ Content Tags                                        │
│       /marketing/content/tags                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  💬 WHATSAPP                                               │
│  ├─ 📱 Accounts                                             │
│  │    /marketing/whatsapp/accounts                          │
│  │    ├─ /new                                              │
│  │    └─ /[id]                                             │
│  │                                                         │
│  ├─ 👥 Groups                                              │
│  │    /marketing/whatsapp/groups                           │
│  │    ├─ /[id]                                             │
│  │    └─ /[id]/edit                                        │
│  │                                                         │
│  ├─ 📇 Contacts                                            │
│  │    /marketing/whatsapp/contacts                         │
│  │    └─ /[id]                                             │
│  │                                                         │
│  ├─ 💬 Messages                                            │
│  │    /marketing/whatsapp/messages                          │
│  │    ├─ /new                                              │
│  │    └─ /[id]                                             │
│  │                                                         │
│  └─ 📊 Analytics                                            │
│       /marketing/whatsapp/analytics                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📱 SOCIAL MEDIA                                           │
│  ├─ 📺 Channels                                            │
│  │    /marketing/social/channels                           │
│  │    ├─ /new                                              │
│  │    ├─ /[id]                                             │
│  │    └─ /[id]/edit                                        │
│  │                                                         │
│  ├─ 📝 Posts                                               │
│  │    /marketing/social/posts                              │
│  │    ├─ /new                                              │
│  │    ├─ /[id]                                             │
│  │    └─ /[id]/edit                                        │
│  │                                                         │
│  ├─ 📅 Schedule                                            │
│  │    /marketing/social/schedule                            │
│  │    ├─ /new                                              │
│  │    └─ /[id]                                             │
│  │                                                         │
│  └─ 📊 Analytics                                            │
│       /marketing/social/analytics                          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  📧 EMAIL                                                  │
│  ├─ 📬 Campaigns                                           │
│  │    /marketing/email/campaigns                            │
│  │    ├─ /new                                              │
│  │    ├─ /[id]                                             │
│  │    └─ /[id]/edit                                        │
│  │                                                         │
│  ├─ 📝 Templates                                           │
│  │    /marketing/email/templates                            │
│  │    ├─ /new                                              │
│  │    ├─ /[id]                                             │
│  │    └─ /[id]/edit                                        │
│  │                                                         │
│  ├─ 📋 Lists                                               │
│  │    /marketing/email/lists                                │
│  │    ├─ /new                                              │
│  │    ├─ /[id]                                             │
│  │    └─ /[id]/subscribers                                 │
│  │                                                         │
│  ├─ 📅 Schedule                                            │
│  │    /marketing/email/schedule                             │
│  │    ├─ /new                                              │
│  │    └─ /[id]                                             │
│  │                                                         │
│  └─ 📊 Analytics                                            │
│       /marketing/email/analytics                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  📊 ANALYTICS & KPIS                                       │
│  ├─ 📈 Marketing KPIs                                      │
│  │    /marketing/analytics/kpis                             │
│  │    ├─ /social                                           │
│  │    ├─ /platform                                         │
│  │    ├─ /whatsapp                                         │
│  │    └─ /email                                            │
│  │                                                         │
│  ├─ 📉 Performance                                         │
│  │    /marketing/analytics/performance                      │
│  │    ├─ /campaigns                                        │
│  │    ├─ /content                                          │
│  │    └─ /channels                                         │
│  │                                                         │
│  ├─ 📊 Reports                                             │
│  │    /marketing/analytics/reports                          │
│  │    ├─ /weekly                                           │
│  │    ├─ /monthly                                          │
│  │    └─ /custom                                           │
│  │                                                         │
│  └─ 🎯 Goals                                               │
│       /marketing/analytics/goals                            │
│       ├─ /new                                              │
│       ├─ /[id]                                             │
│       └─ /[id]/edit                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Sidebar Visual Layout

```
┌──────────────────────────────┐
│  PoultryCo Admin Portal      │
│  [Logo]                      │
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
│                              │
│  ▶ 📧 Email                 │
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

## 📊 Navigation Statistics

- **Total Top-Level Sections:** 7
- **Total Pages:** ~60+
- **Sub-modules:** 5 (Core, Content, WhatsApp, Social, Email)
- **Analytics:** 1 (shared across all)

---

## 🔄 URL Structure Pattern

```
/marketing                          → Dashboard
/marketing/[module]                 → Module overview (optional)
/marketing/[module]/[section]       → Section list
/marketing/[module]/[section]/new   → Create
/marketing/[module]/[section]/[id]  → Details
/marketing/[module]/[section]/[id]/edit → Edit
```

**Examples:**
- `/marketing/campaigns` - Campaign list
- `/marketing/campaigns/new` - Create campaign
- `/marketing/content/pillars` - Pillar list
- `/marketing/whatsapp/accounts` - Account list
- `/marketing/social/channels` - Channel list

---

## ✅ Implementation Status

### Existing Pages (Ready)
- ✅ `/marketing` - Dashboard
- ✅ `/marketing/campaigns` - Campaigns
- ✅ `/marketing/segments` - Segments
- ✅ `/marketing/content/pillars` - Pillars
- ✅ `/marketing/content` - Content
- ✅ `/marketing/content/ideas` - Ideas
- ✅ `/marketing/content/calendar` - Calendar
- ✅ `/marketing/content/tags` - Tags
- ✅ `/marketing/whatsapp` - WhatsApp Dashboard
- ✅ `/marketing/whatsapp/accounts` - Accounts
- ✅ `/marketing/whatsapp/groups` - Groups
- ✅ `/marketing/whatsapp/messages` - Messages

### Pages to Create
- ⏳ `/marketing/ndp-research` - NDP Research section
- ⏳ `/marketing/ndp-research/categories` - Categories
- ⏳ `/marketing/ndp-research/topics` - Topics (move from `/marketing/topics`)
- ⏳ `/marketing/personas` - Personas section
- ⏳ `/marketing/social` - Social Media section
- ⏳ `/marketing/social/channels` - Channels (move from `/marketing/channels`)
- ⏳ `/marketing/social/posts` - Posts
- ⏳ `/marketing/social/schedule` - Schedule
- ⏳ `/marketing/social/analytics` - Analytics
- ⏳ `/marketing/email` - Email section
- ⏳ `/marketing/email/campaigns` - Email campaigns
- ⏳ `/marketing/email/templates` - Templates
- ⏳ `/marketing/email/lists` - Lists
- ⏳ `/marketing/email/schedule` - Schedule
- ⏳ `/marketing/email/analytics` - Analytics
- ⏳ `/marketing/analytics` - Analytics section
- ⏳ `/marketing/analytics/kpis` - KPIs (move from `/marketing/kpis`)
- ⏳ `/marketing/analytics/performance` - Performance
- ⏳ `/marketing/analytics/reports` - Reports
- ⏳ `/marketing/analytics/goals` - Goals

---

**Last Updated:** December 2025  
**Status:** Design Complete

