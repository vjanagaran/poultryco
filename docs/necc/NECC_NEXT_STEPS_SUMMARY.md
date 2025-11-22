# 🎯 NECC Module - Next Steps Summary

**Date:** January 2025  
**Status:** Phase 1 Complete ✅ | Phase 2 Ready to Start 🚀  
**Last Review:** 2025-01-17

---

## 📊 CURRENT STATUS

### ✅ Phase 1: Foundation (COMPLETE)

**Database Schema:**
- ✅ `necc_zones` table (37 zones imported)
- ✅ `necc_prices` table (historical data imported)
- ✅ `necc_scraper_logs` table
- ✅ `necc_annotations` table (schema ready, no data yet)
- ✅ `necc_annotation_metadata` table (schema ready)
- ✅ `necc_ai_predictions` table (schema ready for Phase 3)
- ✅ Shared engagement system (`entity_types`, `entity_likes`, `entity_comments`, `entity_shares`)

**API Functions:**
- ✅ `necc-prices.ts` - All price fetching functions (15+ functions)
- ✅ `necc-zones.ts` - All zone fetching functions
- ✅ `necc-date.ts` - Date utilities

**Pages Implemented:**
- ✅ `/necc` - Home page with stats
- ✅ `/necc/today` - Today's prices with yesterday comparison
- ✅ `/necc/[year]` - Year overview with monthly breakdown
- ✅ `/necc/[year]/[month]` - Month view with daily chart
- ✅ `/necc/[year]/[month]/[day]` - Day detail with missing data handling
- ✅ `/necc/zones` - Zones overview (production & consumption)
- ✅ `/necc/zones/[zone]` - Individual zone pages with trends
- ✅ `/necc/analysis` - Comprehensive analysis with charts
- ✅ `/necc/trends` - Placeholder for Phase 2 features
- ✅ `/necc/about` - About page with disclaimers

**Features:**
- ✅ Missing data handling (shows previous day rate with note)
- ✅ Navigation (breadcrumbs, previous/next buttons)
- ✅ Charts (CSS-based bar charts)
- ✅ Responsive design
- ✅ SEO optimization (metadata, OpenGraph, JSON-LD schema)
- ✅ Date redirect handling (YYYY-MM-DD → YYYY/MM/DD)

---

## 🚀 PHASE 2: NEXT STEPS (Weeks 5-8)

### **WEEK 5: Expert System & Annotations**

#### **Day 1-2: Expert Access Control** ⏳

**Tasks:**
1. **Add `necc_expert` qualification to profile system**
   - Review existing profile qualifications schema
   - Add `necc_expert` as a qualification type
   - Create migration script if needed
   - Location: Check `supabase/schema/02_profile_roles.sql` or similar

2. **Create expert access check functions**
   - File: `apps/web/src/lib/api/expert-access.ts`
   - Function: `isNECCExpert(userId: string): Promise<boolean>`
   - Function: `getExpertProfile(userId: string): Promise<ExpertProfile | null>`
   - Use profile qualifications to check access

3. **Create expert badge component**
   - File: `apps/web/src/components/necc/ExpertBadge.tsx`
   - Display expert badge with tooltip
   - Show verification status
   - Style: Green badge with checkmark icon

4. **Create expert verification UI** (if needed)
   - Admin interface to verify experts
   - Expert application flow (if needed)

**Dependencies:**
- Profile qualifications system (needs review to understand structure)
- User authentication system (already exists)

---

#### **Day 3-4: Annotation System** ⏳

**Tasks:**
1. **Create annotation API functions**
   - File: `apps/web/src/lib/api/necc-annotations.ts`
   - Functions needed:
     - `createAnnotation(data: CreateAnnotationInput)`
     - `getAnnotationsByDate(date: string, zoneId?: string)`
     - `getAnnotationsByZone(zoneId: string)`
     - `getAnnotationById(id: string)`
     - `updateAnnotation(id: string, data: UpdateAnnotationInput)`
     - `deleteAnnotation(id: string)`

2. **Create annotation form component**
   - File: `apps/web/src/components/necc/AnnotationForm.tsx`
   - Fields:
     - Date picker (required)
     - Zone selector (required)
     - Annotation type (spike, trend, anomaly, prediction) - dropdown
     - Title (required)
     - Content (rich text, required)
     - Tags (optional)
   - Validation
   - Expert access check
   - Submit handler

3. **Create annotation card component**
   - File: `apps/web/src/components/necc/AnnotationCard.tsx`
   - Display:
     - Expert badge + name
     - Annotation type badge
     - Title
     - Content (truncated with "read more")
     - Date and zone
     - Metadata (views, helpful count)
     - Engagement buttons (like, comment, share)
   - Link to full annotation view

4. **Create annotation list page**
   - File: `apps/web/src/app/necc/annotations/page.tsx`
   - Display all annotations
   - Filters: Date, zone, type
   - Sort: Date (newest first), helpful count
   - Pagination

5. **Create annotation detail page**
   - File: `apps/web/src/app/necc/annotations/[id]/page.tsx`
   - Full annotation display
   - Related annotations
   - Engagement section

**Dependencies:**
- Database schema already exists (`necc_annotations` table)
- Expert access system (from Day 1-2)

---

#### **Day 5: Annotation Metadata** ⏳

**Tasks:**
1. **Create annotation metadata API**
   - File: `apps/web/src/lib/api/annotation-metadata.ts`
   - Functions:
     - `markAnnotationHelpful(annotationId: string, userId: string)`
     - `unmarkAnnotationHelpful(annotationId: string, userId: string)`
     - `incrementAnnotationViews(annotationId: string)`
     - `getAnnotationMetadata(annotationId: string)`

2. **Create annotation metadata component**
   - File: `apps/web/src/components/necc/AnnotationMetadata.tsx`
   - Helpful button (thumbs up icon)
   - Views count
   - Expert verification badge
   - Update metadata on interaction

3. **Integrate metadata into annotation cards**
   - Update `AnnotationCard.tsx` to use metadata component
   - Track views on annotation load
   - Handle helpful button clicks

**Dependencies:**
- Database schema already exists (`necc_annotation_metadata` table)

---

### **WEEK 6: User Reporting & Admin Tools**

#### **Day 6-7: User Reporting** ⏳

**Tasks:**
1. **Review existing platform report system**
   - Check if report system exists
   - Understand report entity types
   - Check report submission flow
   - Location: Search for "report" in codebase

2. **Create NECC report issue component**
   - File: `apps/web/src/components/necc/ReportIssue.tsx`
   - Report types:
     - Incorrect price data
     - Missing data
     - Annotation issue
     - Other
   - Fields: Type, description, date/zone (if applicable)
   - Submit handler
   - Success/error feedback

3. **Add report button to pages**
   - Day detail page
   - Zone page
   - Annotation cards
   - Price tables

4. **Integrate with platform report system**
   - Use entity type: `necc_price` or `necc_annotation`
   - Link reports to specific data points

**Dependencies:**
- Platform report system (needs review)

---

#### **Day 8-9: Admin CRUD (apps/admin)** ⏳

**Tasks:**
1. **Create admin NECC prices page**
   - File: `apps/admin/src/app/(dashboard)/necc/prices/page.tsx`
   - Display price list (table)
   - Filters: Date range, zone
   - Search functionality
   - Pagination
   - Sort by date, zone, price

2. **Create price CRUD component**
   - File: `apps/admin/src/components/necc/PriceCRUD.tsx`
   - Create form:
     - Date picker
     - Zone selector (dropdown)
     - Suggested price (number input)
     - Prevailing price (number input, optional)
     - Validation
   - Update form (pre-filled)
   - Delete confirmation
   - Bulk operations (if needed)

3. **Create admin API functions**
   - File: `apps/admin/src/lib/api/admin-necc-prices.ts`
   - Functions:
     - `createPrice(data: CreatePriceInput)`
     - `updatePrice(id: string, data: UpdatePriceInput)`
     - `deletePrice(id: string)`
     - `getPricesForAdmin(filters: AdminPriceFilters)`
   - Admin authentication check

4. **Add admin navigation**
   - Add "NECC" section to admin sidebar
   - Link to prices page
   - Link to monitoring page

**Dependencies:**
- Admin app structure (needs review)
- Admin authentication system

---

#### **Day 10: Admin Monitoring (apps/admin)** ⏳

**Tasks:**
1. **Create admin monitoring page**
   - File: `apps/admin/src/app/(dashboard)/necc/monitoring/page.tsx`
   - Dashboard layout
   - Key metrics cards:
     - Last scrape time
     - Scrape success rate (24h, 7d)
     - Failed scrapes count
     - Data completeness

2. **Create scraper logs viewer**
   - File: `apps/admin/src/components/necc/ScraperLogs.tsx`
   - Display logs table:
     - Timestamp
     - Status (success/failure)
     - Zones scraped
     - Zones successful
     - Zones failed
     - Error details (expandable)
   - Filters: Date range, status
   - Pagination
   - Export logs (CSV)

3. **Create data quality dashboard**
   - File: `apps/admin/src/components/necc/DataQualityDashboard.tsx`
   - Charts:
     - Data completeness over time
     - Missing zones by date
     - Price distribution
   - Alerts for anomalies
   - Outlier detection (if implemented)

4. **Add manual scraper trigger**
   - Button to trigger scraper manually
   - Loading state
   - Success/error feedback
   - API endpoint: `apps/admin/src/app/api/admin/scrape-necc/route.ts`

5. **Create admin monitoring API**
   - File: `apps/admin/src/lib/api/admin-necc-monitoring.ts`
   - Functions:
     - `getScraperLogs(filters: ScraperLogFilters)`
     - `getDataQualityMetrics()`
     - `triggerScraper()`

**Dependencies:**
- Scraper edge function (already exists)
- `necc_scraper_logs` table (already exists)

---

### **WEEK 7-8: Engagement Integration & Polish**

#### **Day 11-12: Engagement Integration** ⏳

**Tasks:**
1. **Review shared engagement system**
   - ✅ Tables already exist: `entity_likes`, `entity_comments`, `entity_shares`
   - Check existing engagement API (if any)
   - Understand entity type system
   - Location: `supabase/schema/51_shared_engagement_system.sql`

2. **Create engagement API functions**
   - File: `apps/web/src/lib/api/engagement.ts` (or update existing)
   - Functions:
     - `likeEntity(entityType: string, entityId: string, userId: string)`
     - `unlikeEntity(entityType: string, entityId: string, userId: string)`
     - `getEntityLikes(entityType: string, entityId: string)`
     - `commentOnEntity(entityType: string, entityId: string, content: string, userId: string)`
     - `getEntityComments(entityType: string, entityId: string)`
     - `shareEntity(entityType: string, entityId: string, platform: string, userId: string)`
     - `getEntityShares(entityType: string, entityId: string)`

3. **Create engagement component**
   - File: `apps/web/src/components/necc/EntityEngagement.tsx`
   - Like button (heart icon)
   - Comment button (speech bubble icon)
   - Share button (share icon)
   - Display counts
   - Handle user interactions
   - Show user's current state (liked, commented, shared)

4. **Integrate engagement into annotations**
   - Add engagement component to `AnnotationCard.tsx`
   - Add engagement to annotation detail page
   - Use entity type: `necc_annotation`

5. **Add engagement to price pages** (if needed)
   - Consider if price data should have engagement
   - Or only annotations have engagement

**Dependencies:**
- ✅ Shared engagement tables (already exist)
- Entity type `necc_annotation` needs to be added to `entity_types` table

---

#### **Day 13-14: Annotation Display on Pages** ⏳

**Tasks:**
1. **Display annotations on day detail page**
   - Update: `apps/web/src/app/necc/[year]/[month]/[day]/page.tsx`
   - Fetch annotations for the date
   - Display annotation cards section
   - Filter by zone (if viewing specific zone)
   - Link to full annotation

2. **Display annotations on zone pages**
   - Update: `apps/web/src/app/necc/zones/[zone]/page.tsx`
   - Fetch annotations for the zone
   - Display recent annotations
   - Link to all annotations for zone

3. **Add annotation highlights on charts**
   - Update: `apps/web/src/app/necc/analysis/page.tsx`
   - Fetch annotations for date range
   - Display annotation markers on charts
   - Tooltip shows annotation on hover
   - Click to view annotation

4. **Create annotation filter/sort**
   - Filter by: Date, zone, type, expert
   - Sort by: Date, helpful count, views
   - Add to annotation list page

**Dependencies:**
- Annotation system (from Day 3-5)
- Annotation API functions

---

#### **Day 15-16: Testing & Refinement** ⏳

**Tasks:**
1. **Test annotation creation flow**
   - Expert can create annotation
   - Non-expert cannot create annotation
   - Form validation works
   - Annotation displays correctly

2. **Test expert access control**
   - Expert badge displays
   - Expert access check works
   - Non-experts see appropriate UI

3. **Test user reporting**
   - User can submit report
   - Report stored correctly
   - Admin can view reports

4. **Test admin CRUD**
   - Admin can create price
   - Admin can update price
   - Admin can delete price
   - Validation works

5. **Test monitoring dashboard**
   - Logs display correctly
   - Metrics calculate correctly
   - Manual scraper trigger works

6. **Test engagement system**
   - Like/unlike works
   - Comments work
   - Shares work
   - Counts update correctly

7. **Bug fixes**
   - Fix any issues found
   - Improve error handling
   - Add loading states

8. **Performance optimization**
   - Optimize queries
   - Add caching where needed
   - Reduce bundle size

9. **Mobile responsiveness**
   - Test on mobile devices
   - Fix layout issues
   - Improve touch interactions

---

## 📋 KEY DEPENDENCIES TO REVIEW

### 1. Profile Qualifications System
- **Location:** Need to find where profile qualifications are stored
- **Action:** Search for "qualification" or "profile_qualification" in schema
- **Purpose:** To add `necc_expert` qualification type

### 2. Platform Report System
- **Location:** Need to find existing report system
- **Action:** Search for "report" in codebase
- **Purpose:** To integrate NECC reporting with platform-wide system

### 3. Admin App Structure
- **Location:** `apps/admin/` directory
- **Action:** Review admin app structure and navigation
- **Purpose:** To add NECC admin pages

### 4. Entity Types Table
- **Location:** `supabase/schema/51_shared_engagement_system.sql`
- **Action:** Verify `necc_annotation` entity type exists in `entity_types` table
- **Purpose:** For engagement system integration

---

## 🎯 PHASE 2 SUCCESS CRITERIA

### **Must Have:**
- ✅ Experts can create annotations
- ✅ Annotations display on pages
- ✅ Users can report issues
- ✅ Admin can correct data
- ✅ Monitoring dashboard functional
- ✅ Engagement system working

### **Nice to Have:**
- [ ] Annotation search
- [ ] Annotation notifications
- [ ] Expert leaderboard
- [ ] Bulk annotation operations
- [ ] Advanced filtering

---

## 📝 NOTES

### **What's Already Done:**
- ✅ All Phase 1 features complete
- ✅ Database schema ready for Phase 2
- ✅ Shared engagement tables exist
- ✅ All core pages working
- ✅ API functions for prices and zones complete

### **What Needs to Be Built:**
- ⏳ Expert access control system
- ⏳ Annotation creation and display
- ⏳ User reporting integration
- ⏳ Admin CRUD tools
- ⏳ Admin monitoring dashboard
- ⏳ Engagement system integration
- ⏳ Annotation display on existing pages

### **Key Considerations:**
- Annotation moderation (if needed)
- Expert verification process
- Report response workflow
- Engagement spam prevention
- Performance optimization for annotation queries

---

## 🚀 IMMEDIATE NEXT STEPS

1. **Start with Expert Access Control** (Day 1-2)
   - Review profile qualifications system
   - Add `necc_expert` qualification
   - Create expert access check functions
   - Create ExpertBadge component

2. **Build Annotation System** (Day 3-5)
   - Create annotation API functions
   - Create annotation form and card components
   - Create annotation list and detail pages
   - Create annotation metadata system

3. **Add User Reporting** (Day 6-7)
   - Review platform report system
   - Create ReportIssue component
   - Integrate with platform system

4. **Build Admin Tools** (Day 8-10)
   - Create admin NECC pages
   - Create price CRUD components
   - Create monitoring dashboard

5. **Integrate Engagement** (Day 11-12)
   - Review shared engagement system
   - Create engagement API functions
   - Create EntityEngagement component
   - Integrate into annotations

6. **Polish & Test** (Day 13-16)
   - Display annotations on pages
   - Test all features
   - Fix bugs and optimize

---

**Status:** ✅ **Phase 1 Complete** | 🚀 **Phase 2 Ready to Start**  
**Last Updated:** January 2025

