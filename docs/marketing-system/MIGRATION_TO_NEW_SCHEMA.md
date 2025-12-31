# Marketing Module Migration to New Schema

**Date:** December 2025  
**Status:** Migration Guide

---

## 📋 Overview

This document outlines the migration from the current Supabase-based marketing schema to the new AWS schema with the finalized naming structure.

---

## 🔄 Table Name Mapping

### Old Schema (Supabase) → New Schema (AWS)

| Old Table | New Table | Notes |
|-----------|-----------|-------|
| `stakeholder_segments` | `mkt_segments` | Same structure, new prefix |
| `ndp_categories` | `mkt_ndp_categories` | Same structure, new prefix |
| `content_topics` | `mkt_ndp_topics` | **Important:** Topics are now NDP research, not content |
| `content_topic_segments` | `mkt_ndp_topic_segments` | Same structure, new prefix |
| `content_types` | `mkt_con_types` | Same structure, new prefix |
| `pillar_types` | `mkt_con_pillar_types` | Same structure, new prefix |
| `content_pillars` | `mkt_con_pillars` | Same structure, new prefix |
| `content_pillar_types` | `mkt_con_pillar_types` | Same structure, new prefix |
| `content_ideas` | `mkt_con_ideas` | Same structure, new prefix |
| `content` | `mkt_con_content` | Same structure, new prefix |
| `marketing_channels` | `mkt_channels` | Same structure, new prefix |
| `content_schedule` | `mkt_con_schedule` | **Column changes:** `scheduled_for` → `scheduled_date` + `scheduled_time` |
| `content_campaigns` | `mkt_campaigns` | **Major change:** Now top-level, not content-specific |
| `content_campaign_assignments` | `mkt_campaign_content_assignments` | Junction table |
| `pillar_campaign_assignments` | `mkt_campaign_pillar_assignments` | Junction table |
| `social_media_kpis` | `mkt_social_kpis` | Same structure, new prefix |
| `platform_kpis` | `mkt_kpis` | Same structure, new prefix |

---

## 🔑 Key Schema Changes

### 1. Campaigns Structure Change

**Old:** Campaigns were content-specific (`content_campaigns`)  
**New:** Campaigns are top-level (`mkt_campaigns`) that orchestrate all marketing activities

**Impact:**
- Campaigns now link to:
  - Segments (via `mkt_campaign_segment_assignments`)
  - NDP Topics (via `mkt_campaign_ndp_assignments`)
  - Pillars (via `mkt_campaign_pillar_assignments`)
  - Content (via `mkt_campaign_content_assignments`)

**Migration Steps:**
1. Update campaign creation to include segment and NDP topic assignments
2. Update campaign display to show linked segments and topics
3. Update campaign filtering to use new relationships

---

### 2. Content Schedule Column Changes

**Old Schema:**
```sql
scheduled_for TIMESTAMPTZ  -- Combined date and time
```

**New Schema:**
```sql
scheduled_date DATE         -- Date only
scheduled_time TIME         -- Time only (nullable)
```

**Impact:**
- Calendar queries need to filter by `scheduled_date` instead of `scheduled_for`
- Time display needs to use `scheduled_time` field
- Date range queries use `scheduled_date BETWEEN start_date AND end_date`

**Migration Steps:**
1. Update `getContentSchedule` API to use `scheduled_date` and `scheduled_time`
2. Update calendar page to handle separate date and time fields
3. Update schedule creation form to use date and time inputs separately

---

### 3. NDP Topics Renamed

**Old:** `content_topics` (suggested it was content-related)  
**New:** `mkt_ndp_topics` (clearly research-related)

**Impact:**
- API endpoints change from `/marketing/topics` to `/marketing/ndp-topics` (or keep same for backward compatibility)
- Interface names should reflect research nature

**Migration Steps:**
1. Update API client interfaces (keep `ContentTopic` for now, or rename to `NdpTopic`)
2. Update UI labels to emphasize research nature
3. Update documentation

---

### 4. Content Calendar Coverage

**Current Implementation:**
- Calendar page exists at `/marketing/calendar`
- Uses `content_schedule` table
- Shows week view with scheduled content

**New Schema Coverage:**
- ✅ `mkt_con_schedule` table exists
- ✅ Links to `mkt_con_content` and `mkt_channels`
- ✅ Has `scheduled_date` and `scheduled_time` fields
- ✅ Has `status` field (scheduled, published, failed, cancelled)
- ✅ Has performance tracking fields

**Migration Steps:**
1. Update calendar API to use `mkt_con_schedule`
2. Update date/time handling to use separate fields
3. Ensure campaign linking works (via content → campaign relationship)

---

## 📝 API Client Migration

### Interface Updates Needed

#### 1. ContentSchedule Interface

**Old:**
```typescript
interface ContentSchedule {
  id: string;
  content_id: string;
  channel_id: string;
  scheduled_for: string;  // TIMESTAMPTZ
  status: string;
  published_url: string | null;
  published_at?: string | null;
  created_at: string;
}
```

**New:**
```typescript
interface ContentSchedule {
  id: string;
  content_id: string;
  channel_id: string;
  scheduled_date: string;      // DATE
  scheduled_time: string | null; // TIME (nullable)
  status: string;
  published_url: string | null;
  published_at?: string | null;
  published_date?: string | null; // Actual publication date
  content_created_date?: string;    // When content was created
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  clicks?: number;
  created_at: string;
}
```

#### 2. Campaign Interface

**Old:**
```typescript
interface ContentCampaign {
  id: string;
  name: string;
  slug: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  target_pieces: number;
  target_reach?: number;
  target_engagement?: number;
  color: string;
  icon?: string;
  status: CampaignStatus;
}
```

**New:**
```typescript
interface MarketingCampaign {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  campaign_type?: 'product_launch' | 'awareness' | 'engagement' | 'conversion' | 'retention' | 'other';
  start_date?: string;
  end_date?: string;
  primary_goal?: string;
  target_metrics?: Record<string, any>; // JSONB
  budget?: number;
  status: CampaignStatus;
  total_reach?: number;
  total_engagement?: number;
  total_conversions?: number;
  // Relationships (from junction tables)
  segment_ids?: string[];
  ndp_topic_ids?: string[];
  pillar_ids?: string[];
  content_ids?: string[];
  created_at: string;
  updated_at: string;
}
```

---

## 🔧 Code Updates Required

### 1. API Client (`apps/admin/src/lib/api/marketing.ts`)

**Updates:**
- ✅ Keep existing function names for backward compatibility
- ✅ Update return types to match new schema
- ✅ Add campaign relationship endpoints:
  - `getCampaignSegments(campaignId)`
  - `getCampaignNdpTopics(campaignId)`
  - `setCampaignSegments(campaignId, segmentIds)`
  - `setCampaignNdpTopics(campaignId, topicIds)`

**Example:**
```typescript
// Add new campaign relationship functions
export async function getCampaignSegments(campaignId: string): Promise<StakeholderSegment[]> {
  return apiClient.get<StakeholderSegment[]>(`/marketing/campaigns/${campaignId}/segments`);
}

export async function setCampaignSegments(campaignId: string, segmentIds: string[]): Promise<void> {
  await apiClient.post(`/marketing/campaigns/${campaignId}/segments`, { segmentIds });
}
```

---

### 2. Calendar Page (`apps/admin/src/app/(dashboard)/marketing/calendar/page.tsx`)

**Updates:**
- Update `getContentSchedule` call to handle new date/time structure
- Update date filtering to use `scheduled_date`
- Update time display to use `scheduled_time`
- Ensure campaign linking works

**Example:**
```typescript
// Old
const data = await getContentSchedule({ startDate, endDate });

// New - API should handle date range filtering on scheduled_date
const data = await getContentSchedule({ 
  startDate, 
  endDate,
  // API filters: WHERE scheduled_date BETWEEN startDate AND endDate
});
```

---

### 3. Campaigns Page (`apps/admin/src/app/(dashboard)/marketing/campaigns/page.tsx`)

**Updates:**
- Update campaign creation to include segment and NDP topic selection
- Update campaign display to show linked segments and topics
- Update campaign filtering

**Example:**
```typescript
// Campaign creation form should include:
- Segment selection (multi-select)
- NDP Topic selection (multi-select)
- Pillar selection (optional, can be added later)
```

---

### 4. Dashboard Stats (`apps/admin/src/app/(dashboard)/marketing/page.tsx`)

**Updates:**
- Update stats API to use new table names
- Add campaign count to dashboard
- Ensure all counts use new table names

---

## 📊 Migration Checklist

### Phase 1: Database Migration
- [ ] Run schema migration scripts (70-74_mkt_*.sql)
- [ ] Migrate data from old tables to new tables
- [ ] Update `scheduled_for` → `scheduled_date` + `scheduled_time`
- [ ] Migrate campaign relationships

### Phase 2: API Updates
- [ ] Update API endpoints to use new table names
- [ ] Update API response types to match new schema
- [ ] Add campaign relationship endpoints
- [ ] Update schedule endpoints to handle date/time separately

### Phase 3: Frontend Updates
- [ ] Update API client interfaces
- [ ] Update calendar page date/time handling
- [ ] Update campaign pages to show relationships
- [ ] Update dashboard stats
- [ ] Test all marketing pages

### Phase 4: Testing
- [ ] Test calendar functionality
- [ ] Test campaign creation with segments/topics
- [ ] Test content scheduling
- [ ] Test KPI tracking
- [ ] Test all CRUD operations

---

## 🎯 Content Calendar Coverage

### Current Features
✅ Week view calendar  
✅ Schedule content to channels  
✅ Track publication status  
✅ Show campaign associations  

### New Schema Support
✅ `mkt_con_schedule` table with all required fields  
✅ Separate date and time fields for better scheduling  
✅ Performance tracking (views, likes, comments, shares, clicks)  
✅ Content creation date tracking  
✅ Published date tracking  

### Migration Steps for Calendar
1. **Update API Query:**
   ```typescript
   // Filter by scheduled_date range
   GET /marketing/schedule?startDate=2025-12-01&endDate=2025-12-07
   ```

2. **Update Date Display:**
   ```typescript
   // Use scheduled_date for day filtering
   const dayContent = scheduledContent.filter(item => 
     isSameDay(new Date(item.scheduled_date), day)
   );
   
   // Use scheduled_time for time display
   {item.scheduled_time && (
     <div>{format(new Date(`2000-01-01T${item.scheduled_time}`), 'h:mm a')}</div>
   )}
   ```

3. **Update Schedule Creation:**
   ```typescript
   // Use separate date and time inputs
   <input type="date" name="scheduled_date" />
   <input type="time" name="scheduled_time" />
   ```

---

## 📚 Related Documentation

- [Marketing Module Naming Structure](../../docs/database/MARKETING_MODULE_NAMING.md)
- [Marketing Module Schema](../../aws/database/schema/MARKETING_MODULE_SCHEMA.md)
- [Database Standards](../../docs/database/DATABASE_STANDARDS.md)

---

**Last Updated:** December 2025  
**Status:** Ready for Implementation

