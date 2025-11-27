# Marketing System - Quick Reference

**Version:** 1.0  
**Last Updated:** November 24, 2025

---

## Access URLs

- **Dev Server:** http://localhost:3001/marketing
- **Production:** [Your production URL]
- **Database:** Supabase Dashboard

---

## Database Tables

### Core Tables (Schema 54)
```sql
stakeholder_segments        -- 11 target audience types
ndp_categories             -- Need/Desire/Pain categories
content_topics             -- NDP-based topics
content_topic_segments     -- Topics ↔ Segments (many-to-many)
pillar_types               -- Pillar categorization
content_pillars            -- Core research topics
content_pillar_types       -- Pillars ↔ Types (many-to-many)
content_types              -- Content format types
content                    -- Unified content (master + repurposed)
content_ideas              -- Idea capture
marketing_channels         -- Distribution channels
content_schedule           -- Publishing calendar
social_media_kpis          -- Platform metrics
platform_kpis              -- Aggregated KPIs
```

### Tags System (Schema 55)
```sql
content_tags               -- Tag definitions
content_tag_assignments    -- Content → Tags
pillar_tag_assignments     -- Pillars → Tags
```

### Campaigns System (Schema 56)
```sql
content_campaigns                -- Campaign definitions
content_campaign_assignments     -- Content → Campaigns
pillar_campaign_assignments      -- Pillars → Campaigns
```

---

## Common Commands

### Development
```bash
# Start dev server
cd apps/admin && npm run dev

# Build for production
npm run build

# Apply database migrations
cd ../.. && supabase db push

# Reset database (caution!)
supabase db reset
```

### Database Queries
```sql
-- Count all content
SELECT COUNT(*) FROM content;

-- Get content with relationships
SELECT c.*, ct.name as type, cp.title as pillar
FROM content c
LEFT JOIN content_types ct ON c.content_type_id = ct.id
LEFT JOIN content_pillars cp ON c.pillar_id = cp.id;

-- Get scheduled content for today
SELECT * FROM content_schedule
WHERE DATE(scheduled_date) = CURRENT_DATE
AND status = 'scheduled';

-- Campaign performance
SELECT * FROM campaign_performance
WHERE campaign_id = 'your-campaign-id';
```

---

## React Hooks

### Content Tags
```typescript
import { useContentTags, useCreateContentTag, useAssignContentTags } from '@/lib/hooks/useContentTags';

// Fetch tags
const { data: tags } = useContentTags();

// Create tag
const { mutate: createTag } = useCreateContentTag();
createTag({ name: 'SEO', color: '#3B82F6' });

// Assign tags
const { mutate: assignTags } = useAssignContentTags();
assignTags({ contentId: 'id', tagIds: ['id1', 'id2'] });
```

### Content Campaigns
```typescript
import { useContentCampaigns, useCreateContentCampaign } from '@/lib/hooks/useContentCampaigns';

// Fetch campaigns
const { data: campaigns } = useContentCampaigns();

// Create campaign
const { mutate: createCampaign } = useCreateContentCampaign();
createCampaign({
  name: 'Q1 Launch',
  start_date: '2025-01-01',
  end_date: '2025-03-31',
  goal: 'Get 1000 users',
  color: '#FF6B6B'
});
```

---

## Content Workflow

### Quick Flow
```
1. Capture Idea → /marketing/ideas/new
2. Create Topic → /marketing/topics/new
3. Research Pillar → /marketing/pillars/new
4. Create Content → /marketing/content/new
5. Schedule → /marketing/calendar/new
```

### Content Multiplication
```
1 Pillar (2 hours)
  ↓
4 Master Pieces (4 hours)
  ↓
40 Repurposed Pieces (2 hours)
= 44 Total Pieces in 8 hours
```

---

## API Patterns

### Fetch with Relationships
```typescript
const { data } = await supabase
  .from('content')
  .select(`
    *,
    content_types(name),
    content_pillars(title),
    content_tag_assignments(
      content_tags(id, name, color)
    )
  `)
  .eq('id', contentId)
  .single();
```

### Many-to-Many Insert
```typescript
// Insert topic-segment mappings
const mappings = segmentIds.map(segmentId => ({
  topic_id: topicId,
  segment_id: segmentId,
}));

await supabase
  .from('content_topic_segments')
  .insert(mappings);
```

### Many-to-Many Update
```typescript
// Delete existing
await supabase
  .from('content_tag_assignments')
  .delete()
  .eq('content_id', contentId);

// Insert new
await supabase
  .from('content_tag_assignments')
  .insert(newMappings);
```

---

## Navigation

### Main Sections
- `/marketing` - Dashboard
- `/marketing/topics` - NDP Topics
- `/marketing/segments` - Target Segments
- `/marketing/ideas` - Content Ideas
- `/marketing/pillars` - Content Pillars
- `/marketing/content` - Content Library
- `/marketing/channels` - Distribution Channels
- `/marketing/calendar` - Publishing Calendar
- `/marketing/campaigns` - Campaign Management
- `/marketing/settings/tags` - Tag Management
- `/marketing/kpis` - Performance Dashboard

---

## Key Metrics

### Time Efficiency
- **Before:** 15 hours/week
- **Target:** 3 hours/week
- **Savings:** 80%

### Content Velocity
- **Before:** 4 blogs/month
- **Target:** 8+ blogs/month
- **Increase:** 2x

### Content Multiplication
- **Ratio:** 1:4:40
- **Output:** 44 pieces per pillar

---

## Status Codes

### Content Status
- `draft` - Work in progress
- `in_review` - Awaiting approval
- `approved` - Ready to schedule
- `published` - Live
- `archived` - No longer active

### Schedule Status
- `scheduled` - Queued for publishing
- `published` - Successfully published
- `failed` - Publishing error
- `cancelled` - Manually cancelled

### Idea Status
- `captured` - Initial entry
- `in_review` - Being evaluated
- `approved` - Greenlit for production
- `in_production` - Being created
- `completed` - Finished
- `rejected` - Not moving forward

---

## Color Codes

### Campaign Colors (Hex)
- Primary: `#FF6B6B` (Red)
- Secondary: `#4ECDC4` (Teal)
- Success: `#95E1D3` (Mint)
- Warning: `#F38181` (Pink)
- Info: `#3B82F6` (Blue)

### Status Colors
- Draft: Gray
- In Review: Yellow
- Approved: Blue
- Published: Green
- Archived: Gray (muted)

---

## Troubleshooting

### Dashboard shows 0 counts
**Check:** Table names in queries match schema
**Fix:** Verify `stakeholder_segments` not `customer_segments`

### Build fails
**Check:** Missing dependencies
**Fix:** `npm install @radix-ui/react-popover @floating-ui/dom`

### Content not scheduling
**Check:** Content status is `approved`
**Fix:** Update content status before scheduling

### Tags not showing
**Check:** Tag assignments table
**Fix:** Verify `content_tag_assignments` has records

---

## Support

### Documentation
- **Developer Guide:** `/docs/marketing-system/DEVELOPER_GUIDE.md`
- **Marketing Strategy:** `/docs/marketing-system/MARKETING_STRATEGY.md`
- **Content Architecture:** `/docs/marketing-system/CONTENT_ARCHITECTURE.md`

### Schema Files
- **Core:** `/supabase/schema/54_marketing_system.sql`
- **Tags:** `/supabase/schema/55_content_tags_system.sql`
- **Campaigns:** `/supabase/schema/56_content_campaigns_system.sql`

### Contact
- **Dev Team:** For technical issues
- **Marketing Team:** For strategy/content questions

---

## Keyboard Shortcuts (Future)

```
Ctrl/Cmd + K     - Quick search
Ctrl/Cmd + N     - New content
Ctrl/Cmd + S     - Save draft
Ctrl/Cmd + P     - Publish
Ctrl/Cmd + /     - Help
```

---

**Last Updated:** November 24, 2025  
**Version:** 1.0
