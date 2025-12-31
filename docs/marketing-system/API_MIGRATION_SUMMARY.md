# Marketing API Migration Summary

**Date:** December 2025  
**Status:** Frontend API Client Updated

---

## ✅ Completed Updates

### 1. ContentSchedule Interface Updated

**Changes:**
- ✅ Added `scheduled_date` (DATE) and `scheduled_time` (TIME) fields
- ✅ Kept `scheduled_for` for backward compatibility (deprecated)
- ✅ Added performance tracking fields (views, likes, comments, shares, clicks)
- ✅ Added relationship fields (campaign, content, channel)

**Location:** `apps/admin/src/lib/api/marketing.ts`

---

### 2. MarketingCampaign Interface Added

**New Interface:**
- ✅ `MarketingCampaign` interface matches new `mkt_campaigns` schema
- ✅ Includes campaign relationships (segments, NDP topics, pillars, content)
- ✅ Supports new campaign types and statuses

**Location:** `apps/admin/src/lib/api/marketing.ts`

---

### 3. Campaign Relationship Functions Added

**New Functions:**
- ✅ `getCampaignSegments(campaignId)`
- ✅ `setCampaignSegments(campaignId, segmentIds)`
- ✅ `getCampaignNdpTopics(campaignId)`
- ✅ `setCampaignNdpTopics(campaignId, topicIds)`
- ✅ `getCampaignPillars(campaignId)`
- ✅ `setCampaignPillars(campaignId, pillarIds)`
- ✅ `getCampaignContent(campaignId)`
- ✅ `setCampaignContent(campaignId, contentIds)`

**Location:** `apps/admin/src/lib/api/marketing.ts`

---

### 4. Schedule Functions Updated

**Updates:**
- ✅ `getContentSchedule()` now supports `campaignId` filter
- ✅ `createContentSchedule()` now requires `scheduled_date` and optional `scheduled_time`
- ✅ Backward compatibility maintained with `scheduled_for` support

**Location:** `apps/admin/src/lib/api/marketing.ts`

---

## 📋 Remaining Work

### Backend API Updates Required

1. **Update API Endpoints:**
   - `/marketing/campaigns` - Use `mkt_campaigns` table
   - `/marketing/schedule` - Use `mkt_con_schedule` table with `scheduled_date`/`scheduled_time`
   - Add campaign relationship endpoints

2. **Update Database Queries:**
   - Filter schedule by `scheduled_date BETWEEN startDate AND endDate`
   - Join campaigns via `mkt_campaign_content_assignments`
   - Return campaign data in schedule responses

3. **Update Response Types:**
   - Ensure all responses match new schema structure
   - Include relationship data (segments, topics, pillars) in campaign responses

---

### Frontend Component Updates Required

1. **Calendar Page:**
   - Update to use `scheduled_date` and `scheduled_time` separately
   - Handle date filtering correctly
   - Display time from `scheduled_time` field

2. **Campaign Pages:**
   - Add segment and NDP topic selection in campaign creation
   - Display linked segments and topics in campaign details
   - Update campaign filtering

3. **Schedule Creation:**
   - Use separate date and time inputs
   - Update form submission to use new fields

---

## 🔄 Migration Path

### Phase 1: Backend API (Priority)
1. Update database queries to use new table names
2. Update schedule endpoints to handle `scheduled_date`/`scheduled_time`
3. Add campaign relationship endpoints
4. Test all endpoints

### Phase 2: Frontend Components
1. Update calendar page date/time handling
2. Update campaign pages to show relationships
3. Update schedule creation forms
4. Test all pages

### Phase 3: Data Migration
1. Migrate existing data to new schema
2. Convert `scheduled_for` → `scheduled_date` + `scheduled_time`
3. Migrate campaign relationships
4. Verify data integrity

---

## 📚 Related Documentation

- [Migration Guide](./MIGRATION_TO_NEW_SCHEMA.md)
- [Marketing Module Naming](../../docs/database/MARKETING_MODULE_NAMING.md)
- [Marketing Module Schema](../../aws/database/schema/MARKETING_MODULE_SCHEMA.md)

---

**Last Updated:** December 2025  
**Status:** Frontend API Client Ready

