# Marketing System Module

**Location:** `apps/admin/src/app/(dashboard)/marketing/`  
**Status:** Phase 1 - Foundation Complete ✅

## Quick Start

1. **Apply Database Migration:**
   ```bash
   cd /Users/janagaran/Programs/poultryco
   supabase db push
   ```

2. **Start Admin App:**
   ```bash
   cd apps/admin
   npm run dev
   # Visit: http://localhost:3001/marketing
   ```

## Module Structure

```
marketing/
├── page.tsx              # Dashboard (main hub)
├── topics/               # NDP Framework Topics
│   ├── page.tsx         # List all topics
│   └── new/
│       └── page.tsx     # Create new topic
├── segments/            # Customer Segments
│   └── page.tsx         # List all segments
├── pillars/             # Content Pillars (research hub)
│   └── page.tsx         # List all pillars
├── channels/            # Marketing Channels
│   └── page.tsx         # List all channels
├── calendar/            # Content Calendar
│   └── page.tsx         # Week view calendar
└── kpis/                # KPI Dashboard
    └── page.tsx         # Metrics dashboard
```

## Features

### ✅ Completed
- Marketing Dashboard with overview
- NDP Topics management (list + create)
- Customer Segments (list view)
- Content Pillars (list view)
- Marketing Channels (list view)
- Content Calendar (week view)
- KPI Dashboard (metrics view)

### 🚧 To Build Next (as needed)
- Detail/Edit pages for all entities
- KPI entry form
- Stakeholders management
- Content Ideas management
- Calendar item creation/editing

## Key Concepts

### Content Pillar Workflow
```
1 Content Pillar (e.g., "Origin Story")
  ↓ (deep research + source documents)
4 Blog Articles
  ↓ (repurpose)
40 Social Posts (10 formats × 4 blogs)
= 44 Content Pieces from 1 Pillar!
```

### NDP Framework
- **Farm Types:** CBF, Layer, Broiler, Breeder, Hatchery, Feed_Mill, Processing
- **Categories:** Fear, PainPoint, Problem, Need, Desire, Fantasy
- **Audiences:** Farmers, Veterinarians, Vendors, Researchers, Associations

### Channels Pre-loaded
- LinkedIn (1,211 followers)
- Facebook (820 followers)
- Instagram (405 followers)
- Twitter (225 followers)
- YouTube (363 subscribers)
- Website Blog
- (+ WhatsApp channels can be added)

## Database Tables

All tables in `supabase/schema/54_marketing_system.sql`:

- `stakeholder_segments` (11 target audience types)
- `ndp_categories`
- `content_topics`
- `content_topic_segments` (many-to-many mapping)
- `content_types`
- `pillar_types`
- `content_pillars`
- `content_pillar_types` (many-to-many mapping)
- `content_ideas`
- `content` (unified master + repurposed)
- `marketing_channels`
- `content_schedule`
- `social_media_kpis` (JSONB metrics)
- `platform_kpis`

## Usage Examples

### Create Content Pillar (Origin Story)
1. Go to `/marketing/pillars`
2. Click "+ Create Pillar"
3. Add:
   - Title: "PoultryCo Origin Story"
   - Type: company_story
   - Research documents (upload PDFs, add links)
   - Key insights
4. Generate content from this pillar

### Schedule Social Posts
1. Go to `/marketing/calendar`
2. Navigate to desired week
3. Click "+ Schedule Content"
4. Select channel, date, time
5. Add content and publish manually
6. Mark as published with URL

### Track Weekly KPIs
1. Go to `/marketing/kpis`
2. Click "+ Log KPIs"
3. Select channel
4. Enter metrics (followers, engagement, reach)
5. View trends in dashboard

## Dependencies

- `date-fns` - Date manipulation (already installed)
- `@tanstack/react-query` - Data fetching (already installed)
- Supabase client (already configured)
- shadcn/ui components (already available)

## Goals

**Time Reduction:** 15 hours/week → 3 hours/week (80%)  
**Content Velocity:** 4 blogs/month → 8+ blogs/month  
**User Growth:** Support 1,000 users in 3 months post-launch

## Documentation

- **Full Strategy:** `/docs/marketing-system/Marketing_System_Strategy.md`
- **Implementation Summary:** `/docs/marketing-system/IMPLEMENTATION_SUMMARY.md`
- **Excel Data:** `/docs/markerting-system/*.xlsx`

## Support

For issues or questions:
1. Check strategy document
2. Review database schema
3. Check existing spreadsheets for data formats

