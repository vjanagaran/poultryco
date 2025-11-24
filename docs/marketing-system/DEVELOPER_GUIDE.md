# Marketing System - Developer Guide

**Version:** 1.0  
**Last Updated:** November 24, 2025  
**Status:** Production Ready ✅

---

## Overview

Complete in-house marketing system for PoultryCo, built to reduce content management time by 80% (from 15 hours/week to 3 hours/week) and support scaling to 1,000 users within 3 months of platform launch.

### Tech Stack
- **Frontend:** Next.js 15, React, TypeScript
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **UI:** shadcn/ui components, Tailwind CSS
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod validation

---

## Quick Start

### 1. Database Setup

```bash
# Navigate to project root
cd /Users/janagaran/Programs/poultryco

# Apply all marketing schemas (54, 55, 56)
supabase db push

# Verify schemas applied
supabase db diff
```

### 2. Install Dependencies

```bash
cd apps/admin
npm install
```

### 3. Run Development Server

```bash
npm run dev
# Visit: http://localhost:3001/marketing
```

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Database Schema

### Core Tables (Schema 54)

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `stakeholder_segments` | 11 target audience types | → `content_topic_segments` |
| `ndp_categories` | Need/Desire/Pain categories | → `content_topics` |
| `content_topics` | NDP-based content topics | ← `content_topic_segments` |
| `content_topic_segments` | Many-to-many mapping | Topics ↔ Segments |
| `pillar_types` | Pillar categorization | → `content_pillar_types` |
| `content_pillars` | Core research topics | → `content` |
| `content_pillar_types` | Many-to-many mapping | Pillars ↔ Types |
| `content_types` | Content format types | → `content` |
| `content` | Unified content (master + repurposed) | ← `content_pillars` |
| `content_ideas` | Idea capture & tracking | → `content_pillars` |
| `marketing_channels` | Social media & distribution | → `content_schedule` |
| `content_schedule` | Publishing calendar | ← `content`, `marketing_channels` |
| `social_media_kpis` | Platform performance metrics | JSONB data |
| `platform_kpis` | Aggregated KPI tracking | Time-series data |

### Tags System (Schema 55)

| Table | Purpose |
|-------|---------|
| `content_tags` | Flexible taxonomy for content |
| `content_tag_assignments` | Content → Tags mapping |
| `pillar_tag_assignments` | Pillars → Tags mapping |

### Campaigns System (Schema 56)

| Table | Purpose |
|-------|---------|
| `content_campaigns` | Campaign management |
| `content_campaign_assignments` | Content → Campaigns |
| `pillar_campaign_assignments` | Pillars → Campaigns |

---

## Module Structure

```
apps/admin/src/app/(dashboard)/marketing/
├── page.tsx                    # Dashboard
├── topics/                     # NDP Topics
│   ├── page.tsx               # List
│   ├── new/page.tsx           # Create
│   └── [id]/page.tsx          # Detail/Edit
├── segments/                   # Stakeholder Segments
│   └── page.tsx               # List
├── ideas/                      # Content Ideas
│   ├── page.tsx               # List
│   ├── new/page.tsx           # Create
│   └── [id]/page.tsx          # Detail/Edit
├── pillars/                    # Content Pillars
│   ├── page.tsx               # List
│   ├── new/page.tsx           # Create
│   └── [id]/page.tsx          # Detail/Edit
├── content/                    # Content Management
│   ├── page.tsx               # List
│   ├── new/page.tsx           # Create
│   └── [id]/page.tsx          # Detail/Edit
├── channels/                   # Marketing Channels
│   ├── page.tsx               # List
│   ├── new/page.tsx           # Create
│   └── [id]/page.tsx          # Detail/Edit
├── calendar/                   # Content Calendar
│   ├── page.tsx               # Calendar View
│   ├── new/page.tsx           # Schedule Content
│   └── [id]/page.tsx          # Edit Schedule
├── campaigns/                  # Campaign Management
│   └── page.tsx               # List/CRUD
├── settings/
│   └── tags/page.tsx          # Tag Management
└── kpis/                       # KPI Dashboard
    └── page.tsx               # Metrics View
```

---

## Key Features

### 1. Content Workflow (2-Level)

```
Topic → Pillar → Content → Schedule
```

**Example Flow:**
1. Create NDP Topic: "High Mortality in Broiler Farms"
2. Create Pillar: Deep research on mortality causes
3. Create Content: Blog post (master)
4. Create Content: Social posts (repurposed from master)
5. Schedule: Assign to channels with dates

### 2. Content Modes

- **Master Content:** Original long-form (blog, ebook, video)
- **Repurposed Content:** Derived from master (social posts, infographics)

### 3. Many-to-Many Relationships

- **Topics ↔ Segments:** `content_topic_segments`
- **Pillars ↔ Types:** `content_pillar_types`
- **Content ↔ Tags:** `content_tag_assignments`
- **Pillars ↔ Tags:** `pillar_tag_assignments`
- **Content ↔ Campaigns:** `content_campaign_assignments`
- **Pillars ↔ Campaigns:** `pillar_campaign_assignments`

---

## React Hooks

### Content Tags

```typescript
import { useContentTags } from '@/lib/hooks/useContentTags';

// Fetch all tags
const { data: tags } = useContentTags();

// Create tag
const { mutate: createTag } = useCreateContentTag();
createTag({ name: 'SEO', color: '#3B82F6', description: '...' });

// Assign tags to content
const { mutate: assignTags } = useAssignContentTags();
assignTags({ contentId: '...', tagIds: ['...', '...'] });
```

### Content Campaigns

```typescript
import { useContentCampaigns } from '@/lib/hooks/useContentCampaigns';

// Fetch campaigns
const { data: campaigns } = useContentCampaigns();

// Create campaign
const { mutate: createCampaign } = useCreateContentCampaign();
createCampaign({
  name: 'Product Launch Q1',
  start_date: '2025-01-01',
  end_date: '2025-03-31',
  // ...
});

// Get campaign performance
const { data: performance } = useCampaignPerformance(campaignId);
```

---

## API Patterns

### Fetching with Joins

```typescript
// Fetch content with related data
const { data } = await supabase
  .from('content')
  .select(`
    *,
    content_types(name),
    content_pillars(title),
    content_topics(title),
    content_tag_assignments(
      content_tags(id, name, color)
    ),
    content_campaign_assignments(
      content_campaigns(id, name, color)
    )
  `)
  .eq('id', contentId)
  .single();
```

### Many-to-Many Updates

```typescript
// Update topic segments
async function updateTopicSegments(topicId: string, segmentIds: string[]) {
  // Delete existing
  await supabase
    .from('content_topic_segments')
    .delete()
    .eq('topic_id', topicId);
  
  // Insert new
  if (segmentIds.length > 0) {
    const mappings = segmentIds.map(segmentId => ({
      topic_id: topicId,
      segment_id: segmentId,
    }));
    
    await supabase
      .from('content_topic_segments')
      .insert(mappings);
  }
}
```

---

## Testing Checklist

### Database
- [ ] All schemas (54, 55, 56) applied successfully
- [ ] 11 stakeholder segments seeded
- [ ] NDP categories populated
- [ ] Content types populated
- [ ] Pillar types populated

### CRUD Operations
- [ ] Topics: Create, Read, Update, Delete, Segment Assignment
- [ ] Segments: List, View
- [ ] Ideas: Create, Read, Update, Delete
- [ ] Pillars: Create, Read, Update, Delete, Tag/Campaign Assignment
- [ ] Content: Create, Read, Update, Delete, Tag/Campaign Assignment
- [ ] Channels: Create, Read, Update, Delete
- [ ] Schedule: Create, Read, Update, Delete
- [ ] Tags: Create, Read, Update, Delete, Assignment
- [ ] Campaigns: Create, Read, Update, Delete, Assignment

### Workflows
- [ ] Topic → Pillar → Content → Schedule flow
- [ ] Master content → Repurposed content
- [ ] Tag filtering on content/pillars
- [ ] Campaign color-coding on calendar
- [ ] Multi-segment assignment to topics

### UI/UX
- [ ] Dashboard displays correct counts
- [ ] Calendar shows scheduled content
- [ ] Filters work on all list pages
- [ ] Forms validate correctly
- [ ] Delete confirmations work
- [ ] Navigation between related entities

---

## Common Issues & Solutions

### Issue: Dashboard shows 0 for segments
**Solution:** Table name was `customer_segments`, corrected to `stakeholder_segments`

### Issue: Build fails with Radix UI errors
**Solution:** Install missing dependencies:
```bash
npm install @radix-ui/react-popover @radix-ui/react-scroll-area \
  @radix-ui/react-use-callback-ref @radix-ui/react-use-escape-keydown \
  @floating-ui/dom @floating-ui/react-dom
```

### Issue: Topics can't assign segments
**Solution:** Implemented `content_topic_segments` mapping table with CRUD operations

---

## Performance Considerations

### Database Indexes
All foreign keys are automatically indexed. Additional indexes on:
- `content.status`
- `content.published_at`
- `content_schedule.scheduled_date`
- `content_schedule.status`

### Query Optimization
- Use `.select()` to fetch only needed columns
- Limit results with `.limit()` on list pages
- Use `.single()` for detail pages
- Implement pagination for large datasets

### Caching Strategy
- React Query caches API responses
- Stale time: 5 minutes (default)
- Refetch on window focus: enabled
- Invalidate on mutations

---

## Deployment

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Build Command

```bash
npm run build
```

### Production Checks
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] CORS configured for domain
- [ ] Error tracking configured (Sentry, etc.)

---

## Support & Documentation

- **Schema Files:** `/supabase/schema/54_*.sql`, `55_*.sql`, `56_*.sql`
- **Strategy Document:** `/docs/marketing-system/MARKETING_STRATEGY.md`
- **Architecture:** `/docs/marketing-system/CONTENT_ARCHITECTURE.md`
- **Quick Reference:** `/docs/marketing-system/QUICK_REFERENCE.md`

---

## Changelog

### v1.0 (November 24, 2025)
- ✅ Complete CRUD operations for all entities
- ✅ Content tags system
- ✅ Content campaigns system
- ✅ Many-to-many relationships implemented
- ✅ Calendar with campaign color-coding
- ✅ Production build successful
- ✅ All schema mismatches fixed

---

**For questions or issues, contact the development team.**

