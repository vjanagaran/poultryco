# 🎯 NECC Phase 2: Engagement System - To-Do List

**Date:** January 2025  
**Status:** Ready to Start  
**Prerequisites:** ✅ All Phase 1 features complete

---

## 📋 PHASE 2 OVERVIEW

**Goal:** Enable expert annotations, user engagement, and admin tools

**Timeline:** 4 weeks (Weeks 5-8)  
**Focus:** Expert system, annotations, reporting, admin CRUD

---

## ✅ WEEK 5: EXPERT SYSTEM & ANNOTATIONS

### **Day 1-2: Expert Access Control**

#### Tasks:
- [ ] **Add `necc_expert` qualification to profile system**
  - [ ] Update profile qualifications schema/table
  - [ ] Add `necc_expert` as a qualification type
  - [ ] Create migration script if needed

- [ ] **Create expert access check functions**
  - [ ] File: `apps/web/src/lib/api/expert-access.ts`
  - [ ] Function: `isNECCExpert(userId: string): Promise<boolean>`
  - [ ] Function: `getExpertProfile(userId: string): Promise<ExpertProfile | null>`
  - [ ] Use profile qualifications to check access

- [ ] **Create expert badge component**
  - [ ] File: `apps/web/src/components/necc/ExpertBadge.tsx`
  - [ ] Display expert badge with tooltip
  - [ ] Show verification status
  - [ ] Style: Green badge with checkmark icon

- [ ] **Create expert verification UI** (if needed)
  - [ ] Admin interface to verify experts
  - [ ] Expert application flow (if needed)

**Deliverables:**
- Expert access check working
- Expert badge displaying on user profiles
- Expert qualification system integrated

---

### **Day 3-4: Annotation System**

#### Tasks:
- [ ] **Create annotation API functions**
  - [ ] File: `apps/web/src/lib/api/necc-annotations.ts`
  - [ ] Function: `createAnnotation(data: CreateAnnotationInput)`
  - [ ] Function: `getAnnotationsByDate(date: string, zoneId?: string)`
  - [ ] Function: `getAnnotationsByZone(zoneId: string)`
  - [ ] Function: `getAnnotationById(id: string)`
  - [ ] Function: `updateAnnotation(id: string, data: UpdateAnnotationInput)`
  - [ ] Function: `deleteAnnotation(id: string)`

- [ ] **Create annotation form component**
  - [ ] File: `apps/web/src/components/necc/AnnotationForm.tsx`
  - [ ] Fields:
    - Date picker (required)
    - Zone selector (required)
    - Annotation type (spike, trend, anomaly, prediction) - dropdown
    - Title (required)
    - Content (rich text, required)
    - Tags (optional)
  - [ ] Validation
  - [ ] Expert access check
  - [ ] Submit handler

- [ ] **Create annotation card component**
  - [ ] File: `apps/web/src/components/necc/AnnotationCard.tsx`
  - [ ] Display:
    - Expert badge + name
    - Annotation type badge
    - Title
    - Content (truncated with "read more")
    - Date and zone
    - Metadata (views, helpful count)
    - Engagement buttons (like, comment, share)
  - [ ] Link to full annotation view

- [ ] **Create annotation list page**
  - [ ] File: `apps/web/src/app/necc/annotations/page.tsx`
  - [ ] Display all annotations
  - [ ] Filters: Date, zone, type
  - [ ] Sort: Date (newest first), helpful count
  - [ ] Pagination

- [ ] **Create annotation detail page**
  - [ ] File: `apps/web/src/app/necc/annotations/[id]/page.tsx`
  - [ ] Full annotation display
  - [ ] Related annotations
  - [ ] Engagement section

**Deliverables:**
- Experts can create annotations
- Annotations display on pages
- Annotation CRUD working

---

### **Day 5: Annotation Metadata**

#### Tasks:
- [ ] **Create annotation metadata API**
  - [ ] File: `apps/web/src/lib/api/annotation-metadata.ts`
  - [ ] Function: `markAnnotationHelpful(annotationId: string, userId: string)`
  - [ ] Function: `unmarkAnnotationHelpful(annotationId: string, userId: string)`
  - [ ] Function: `incrementAnnotationViews(annotationId: string)`
  - [ ] Function: `getAnnotationMetadata(annotationId: string)`

- [ ] **Create annotation metadata component**
  - [ ] File: `apps/web/src/components/necc/AnnotationMetadata.tsx`
  - [ ] Helpful button (thumbs up icon)
  - [ ] Views count
  - [ ] Expert verification badge
  - [ ] Update metadata on interaction

- [ ] **Integrate metadata into annotation cards**
  - [ ] Update `AnnotationCard.tsx` to use metadata component
  - [ ] Track views on annotation load
  - [ ] Handle helpful button clicks

**Deliverables:**
- Helpful button working
- Views tracking working
- Metadata displaying correctly

---

## ✅ WEEK 6: USER REPORTING & ADMIN TOOLS

### **Day 6-7: User Reporting**

#### Tasks:
- [ ] **Review existing platform report system**
  - [ ] Check if report system exists
  - [ ] Understand report entity types
  - [ ] Check report submission flow

- [ ] **Create NECC report issue component**
  - [ ] File: `apps/web/src/components/necc/ReportIssue.tsx`
  - [ ] Report types:
    - Incorrect price data
    - Missing data
    - Annotation issue
    - Other
  - [ ] Fields: Type, description, date/zone (if applicable)
  - [ ] Submit handler
  - [ ] Success/error feedback

- [ ] **Add report button to pages**
  - [ ] Day detail page
  - [ ] Zone page
  - [ ] Annotation cards
  - [ ] Price tables

- [ ] **Integrate with platform report system**
  - [ ] Use entity type: `necc_price` or `necc_annotation`
  - [ ] Link reports to specific data points

**Deliverables:**
- Users can report issues
- Reports stored in platform system
- Admin can view reports

---

### **Day 8-9: Admin CRUD (apps/admin)**

#### Tasks:
- [ ] **Create admin NECC prices page**
  - [ ] File: `apps/admin/src/app/(dashboard)/necc/prices/page.tsx`
  - [ ] Display price list (table)
  - [ ] Filters: Date range, zone
  - [ ] Search functionality
  - [ ] Pagination
  - [ ] Sort by date, zone, price

- [ ] **Create price CRUD component**
  - [ ] File: `apps/admin/src/components/necc/PriceCRUD.tsx`
  - [ ] Create form:
    - Date picker
    - Zone selector (dropdown)
    - Suggested price (number input)
    - Prevailing price (number input, optional)
    - Validation
  - [ ] Update form (pre-filled)
  - [ ] Delete confirmation
  - [ ] Bulk operations (if needed)

- [ ] **Create admin API functions**
  - [ ] File: `apps/admin/src/lib/api/admin-necc-prices.ts`
  - [ ] Function: `createPrice(data: CreatePriceInput)`
  - [ ] Function: `updatePrice(id: string, data: UpdatePriceInput)`
  - [ ] Function: `deletePrice(id: string)`
  - [ ] Function: `getPricesForAdmin(filters: AdminPriceFilters)`
  - [ ] Admin authentication check

- [ ] **Add admin navigation**
  - [ ] Add "NECC" section to admin sidebar
  - [ ] Link to prices page
  - [ ] Link to monitoring page

**Deliverables:**
- Admin can create prices
- Admin can update prices
- Admin can delete prices
- Individual row access working

---

### **Day 10: Admin Monitoring (apps/admin)**

#### Tasks:
- [ ] **Create admin monitoring page**
  - [ ] File: `apps/admin/src/app/(dashboard)/necc/monitoring/page.tsx`
  - [ ] Dashboard layout
  - [ ] Key metrics cards:
    - Last scrape time
    - Scrape success rate (24h, 7d)
    - Failed scrapes count
    - Data completeness

- [ ] **Create scraper logs viewer**
  - [ ] File: `apps/admin/src/components/necc/ScraperLogs.tsx`
  - [ ] Display logs table:
    - Timestamp
    - Status (success/failure)
    - Zones scraped
    - Zones successful
    - Zones failed
    - Error details (expandable)
  - [ ] Filters: Date range, status
  - [ ] Pagination
  - [ ] Export logs (CSV)

- [ ] **Create data quality dashboard**
  - [ ] File: `apps/admin/src/components/necc/DataQualityDashboard.tsx`
  - [ ] Charts:
    - Data completeness over time
    - Missing zones by date
    - Price distribution
  - [ ] Alerts for anomalies
  - [ ] Outlier detection (if implemented)

- [ ] **Add manual scraper trigger**
  - [ ] Button to trigger scraper manually
  - [ ] Loading state
  - [ ] Success/error feedback
  - [ ] API endpoint: `apps/admin/src/app/api/admin/scrape-necc/route.ts`

- [ ] **Create admin monitoring API**
  - [ ] File: `apps/admin/src/lib/api/admin-necc-monitoring.ts`
  - [ ] Function: `getScraperLogs(filters: ScraperLogFilters)`
  - [ ] Function: `getDataQualityMetrics()`
  - [ ] Function: `triggerScraper()`

**Deliverables:**
- Admin can view scraper logs
- Admin can see data quality metrics
- Admin can trigger scraper manually
- Monitoring dashboard functional

---

## ✅ WEEK 7-8: ENGAGEMENT INTEGRATION & POLISH

### **Day 11-12: Engagement Integration**

#### Tasks:
- [ ] **Review shared engagement system**
  - [ ] Check `entity_likes`, `entity_comments`, `entity_shares` tables
  - [ ] Check existing engagement API (if any)
  - [ ] Understand entity type system

- [ ] **Create engagement API functions**
  - [ ] File: `apps/web/src/lib/api/engagement.ts` (or update existing)
  - [ ] Function: `likeEntity(entityType: string, entityId: string, userId: string)`
  - [ ] Function: `unlikeEntity(entityType: string, entityId: string, userId: string)`
  - [ ] Function: `getEntityLikes(entityType: string, entityId: string)`
  - [ ] Function: `commentOnEntity(entityType: string, entityId: string, content: string, userId: string)`
  - [ ] Function: `getEntityComments(entityType: string, entityId: string)`
  - [ ] Function: `shareEntity(entityType: string, entityId: string, platform: string, userId: string)`
  - [ ] Function: `getEntityShares(entityType: string, entityId: string)`

- [ ] **Create engagement component**
  - [ ] File: `apps/web/src/components/necc/EntityEngagement.tsx`
  - [ ] Like button (heart icon)
  - [ ] Comment button (speech bubble icon)
  - [ ] Share button (share icon)
  - [ ] Display counts
  - [ ] Handle user interactions
  - [ ] Show user's current state (liked, commented, shared)

- [ ] **Integrate engagement into annotations**
  - [ ] Add engagement component to `AnnotationCard.tsx`
  - [ ] Add engagement to annotation detail page
  - [ ] Use entity type: `necc_annotation`

- [ ] **Add engagement to price pages** (if needed)
  - [ ] Consider if price data should have engagement
  - [ ] Or only annotations have engagement

**Deliverables:**
- Users can like annotations
- Users can comment on annotations
- Users can share annotations
- Engagement counts displaying

---

### **Day 13-14: Annotation Display on Pages**

#### Tasks:
- [ ] **Display annotations on day detail page**
  - [ ] Update: `apps/web/src/app/necc/[year]/[month]/[day]/page.tsx`
  - [ ] Fetch annotations for the date
  - [ ] Display annotation cards section
  - [ ] Filter by zone (if viewing specific zone)
  - [ ] Link to full annotation

- [ ] **Display annotations on zone pages**
  - [ ] Update: `apps/web/src/app/necc/zones/[zone]/page.tsx`
  - [ ] Fetch annotations for the zone
  - [ ] Display recent annotations
  - [ ] Link to all annotations for zone

- [ ] **Add annotation highlights on charts**
  - [ ] Update: `apps/web/src/app/necc/analysis/page.tsx`
  - [ ] Fetch annotations for date range
  - [ ] Display annotation markers on charts
  - [ ] Tooltip shows annotation on hover
  - [ ] Click to view annotation

- [ ] **Create annotation filter/sort**
  - [ ] Filter by: Date, zone, type, expert
  - [ ] Sort by: Date, helpful count, views
  - [ ] Add to annotation list page

**Deliverables:**
- Annotations visible on relevant pages
- Chart annotations working
- Filtering and sorting working

---

### **Day 15-16: Testing & Refinement**

#### Tasks:
- [ ] **Test annotation creation flow**
  - [ ] Expert can create annotation
  - [ ] Non-expert cannot create annotation
  - [ ] Form validation works
  - [ ] Annotation displays correctly

- [ ] **Test expert access control**
  - [ ] Expert badge displays
  - [ ] Expert access check works
  - [ ] Non-experts see appropriate UI

- [ ] **Test user reporting**
  - [ ] User can submit report
  - [ ] Report stored correctly
  - [ ] Admin can view reports

- [ ] **Test admin CRUD**
  - [ ] Admin can create price
  - [ ] Admin can update price
  - [ ] Admin can delete price
  - [ ] Validation works

- [ ] **Test monitoring dashboard**
  - [ ] Logs display correctly
  - [ ] Metrics calculate correctly
  - [ ] Manual scraper trigger works

- [ ] **Test engagement system**
  - [ ] Like/unlike works
  - [ ] Comments work
  - [ ] Shares work
  - [ ] Counts update correctly

- [ ] **Bug fixes**
  - [ ] Fix any issues found
  - [ ] Improve error handling
  - [ ] Add loading states

- [ ] **Performance optimization**
  - [ ] Optimize queries
  - [ ] Add caching where needed
  - [ ] Reduce bundle size

- [ ] **Mobile responsiveness**
  - [ ] Test on mobile devices
  - [ ] Fix layout issues
  - [ ] Improve touch interactions

**Deliverables:**
- All features tested
- Bugs fixed
- Performance optimized
- Mobile responsive

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

### **Dependencies:**
- Profile qualification system (for expert access)
- Platform report system (for user reporting)
- Shared engagement tables (already exist)

### **Considerations:**
- Annotation moderation (if needed)
- Expert verification process
- Report response workflow
- Engagement spam prevention

---

## 🚀 NEXT STEPS

1. **Start with Expert Access Control** (Day 1-2)
2. **Build Annotation System** (Day 3-5)
3. **Add User Reporting** (Day 6-7)
4. **Build Admin Tools** (Day 8-10)
5. **Integrate Engagement** (Day 11-12)
6. **Polish & Test** (Day 13-16)

---

**Status:** ✅ **Ready to Start Phase 2**  
**Last Updated:** January 2025

