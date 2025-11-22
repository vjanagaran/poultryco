# 🚀 NECC Module - Development Plan

**Date:** January 2025  
**Status:** Ready to Start  
**Development Strategy:** Web First → Admin → Mobile (Next Phase)  
**AI Copilot:** Cursor

---

## 🎯 DEVELOPMENT STRATEGY

### Order of Development
1. **apps/web** - Complete entire module first
2. **apps/admin** - Admin tools and monitoring
3. **apps/mobile** - Mobile app (next dev phase)

### Data Strategy
- **Historical Data:** Import from PoultryCare via Supabase dashboard (manual)
- **Future Data:** Focus on crawling system for ongoing data collection

---

## 📋 PHASE 1: MVP DEVELOPMENT (Weeks 1-4)

### Week 1: Database & Data Layer

#### Day 1-2: Database Schema
- [ ] Create `necc_zones` table
- [ ] Create `necc_prices` table
- [ ] Create `necc_scraper_logs` table
- [ ] Create `feature_flags` table
- [ ] Set up indexes for performance
- [ ] Create database functions (if needed)
- [ ] Set up RLS policies

**Files:**
- `supabase/schema/50_necc_system.sql`

**Dependencies:**
- Core profiles schema (for user references)

---

#### Day 3-4: Scraper Implementation
- [ ] Create Supabase Edge Function for scraper
- [ ] Implement HTML parsing (similar to PoultryCare)
- [ ] Handle zone name normalization
- [ ] Implement 15-minute interval logic
- [ ] Add error handling and logging
- [ ] Test scraper with current date
- [ ] Set up Vercel Cron job (every 15 minutes)

**Files:**
- `supabase/functions/scrape-necc-prices/index.ts`
- `vercel.json` (cron configuration)

**Key Features:**
- Scrape every 15 minutes
- Log all failures to `necc_scraper_logs`
- Handle missing data gracefully
- Respect rate limits

---

#### Day 5: Data Import (Historical)
- [ ] Export data from PoultryCare
- [ ] Format for Supabase import
- [ ] Import via Supabase dashboard
- [ ] Verify data integrity
- [ ] Document import process

**Note:** Manual process, not code development

---

### Week 2: URL Structure & Core Pages

#### Day 6-7: Route Structure Setup
- [ ] Set up Next.js route structure
- [ ] Implement date parsing (hierarchical + short format)
- [ ] Create redirect logic for short format
- [ ] Set up breadcrumb navigation
- [ ] Create layout component for NECC pages

**Files:**
- `apps/web/src/app/necc/page.tsx` (home)
- `apps/web/src/app/necc/today/page.tsx`
- `apps/web/src/app/necc/[year]/page.tsx`
- `apps/web/src/app/necc/[year]/[month]/page.tsx`
- `apps/web/src/app/necc/[year]/[month]/[day]/page.tsx`
- `apps/web/src/app/necc/[date]/page.tsx` (redirect)

---

#### Day 8-9: Home Page (`/necc`)
- [ ] Hero section with today's average price
- [ ] Change vs yesterday indicator
- [ ] Quick stat cards (zones, experts, annotations)
- [ ] Today's highlights section
- [ ] Quick links navigation
- [ ] Featured content section
- [ ] SEO metadata component

**Files:**
- `apps/web/src/app/necc/page.tsx`
- `apps/web/src/components/necc/NECCHomePage.tsx`
- `apps/web/src/components/necc/PriceStatCard.tsx`

---

#### Day 10: Today's Page (`/necc/today`)
- [ ] Today's date display
- [ ] Price table (all zones)
- [ ] Yesterday comparison
- [ ] Visual comparison chart
- [ ] Zone ranking
- [ ] Expert insight section (if available)
- [ ] Quick actions (compare, share, alert)
- [ ] SEO metadata

**Files:**
- `apps/web/src/app/necc/today/page.tsx`
- `apps/web/src/components/necc/TodayPriceTable.tsx`
- `apps/web/src/components/necc/PriceComparisonChart.tsx`

---

### Week 3: Date-Based Pages

#### Day 11-12: Year Page (`/necc/[year]`)
- [ ] Year overview section
- [ ] Average price for year
- [ ] High/Low prices
- [ ] Monthly breakdown chart
- [ ] Month cards with navigation
- [ ] Key insights section
- [ ] Previous/Next year navigation
- [ ] SEO metadata

**Files:**
- `apps/web/src/app/necc/[year]/page.tsx`
- `apps/web/src/components/necc/YearOverview.tsx`
- `apps/web/src/components/necc/MonthCards.tsx`

---

#### Day 13-14: Month Page (`/necc/[year]/[month]`)
- [ ] Month overview section
- [ ] Average price for month
- [ ] High/Low prices
- [ ] Daily chart (all days)
- [ ] Day grid (calendar view)
- [ ] Month insights
- [ ] Previous/Next month navigation
- [ ] SEO metadata

**Files:**
- `apps/web/src/app/necc/[year]/[month]/page.tsx`
- `apps/web/src/components/necc/MonthOverview.tsx`
- `apps/web/src/components/necc/DailyChart.tsx`
- `apps/web/src/components/necc/DayGrid.tsx`

---

#### Day 15: Day Page (`/necc/[year]/[month]/[day]`)
- [ ] Date header with navigation
- [ ] All zones price table
- [ ] Suggested vs Prevailing comparison
- [ ] Zone comparison chart
- [ ] Missing data handling (show previous day with note)
- [ ] Context sections (7-day trend, month context)
- [ ] Related content
- [ ] SEO metadata

**Files:**
- `apps/web/src/app/necc/[year]/[month]/[day]/page.tsx`
- `apps/web/src/components/necc/DayDetail.tsx`
- `apps/web/src/components/necc/MissingDataNote.tsx`

---

### Week 4: Analytics & Engagement

#### Day 16-17: Analysis Page (`/necc/analysis`)
- [ ] Interactive charts (Recharts)
- [ ] Time period selector (7d, 30d, 1y, 5y, 10y)
- [ ] Zone selector (multi-select)
- [ ] Chart interactions (zoom, pan, filter)
- [ ] Annotation highlights (Phase 2)
- [ ] Export functionality
- [ ] SEO metadata

**Files:**
- `apps/web/src/app/necc/analysis/page.tsx`
- `apps/web/src/components/necc/AnalysisDashboard.tsx`
- `apps/web/src/components/necc/PriceTrendChart.tsx`
- `apps/web/src/components/necc/ZoneComparisonChart.tsx`

---

#### Day 18-19: Zone Pages (`/necc/zones`)
- [ ] All zones overview page
- [ ] Individual zone pages (`/necc/zones/[zone]`)
- [ ] Zone-specific price charts
- [ ] Zone historical data
- [ ] Zone comparisons
- [ ] Related zones
- [ ] SEO metadata

**Files:**
- `apps/web/src/app/necc/zones/page.tsx`
- `apps/web/src/app/necc/zones/[zone]/page.tsx`
- `apps/web/src/components/necc/ZoneDetail.tsx`
- `apps/web/src/components/necc/ZoneChart.tsx`

---

#### Day 20: Engagement Integration
- [ ] Integrate shared engagement system
- [ ] Like button component (entity_likes)
- [ ] Comment component (entity_comments)
- [ ] Share component (entity_shares)
- [ ] Engagement counts display
- [ ] User activity tracking

**Files:**
- `apps/web/src/components/necc/EntityEngagement.tsx`
- `apps/web/src/lib/api/engagement.ts`

**Dependencies:**
- Shared engagement tables (entity_likes, entity_comments, entity_shares)

---

### Week 4: Polish & Testing

#### Day 21-22: SEO & Metadata
- [ ] SEO metadata component
- [ ] Dynamic title tags
- [ ] Meta descriptions
- [ ] Open Graph tags
- [ ] Schema markup (Dataset)
- [ ] Canonical URLs
- [ ] Sitemap generation

**Files:**
- `apps/web/src/components/necc/SEOMetadata.tsx`
- `apps/web/src/lib/seo/necc-seo.ts`

---

#### Day 23-24: Missing Data Handling
- [ ] Previous day rate lookup
- [ ] Missing data note component
- [ ] Month view empty state ("-" or empty)
- [ ] Data completeness indicators

**Files:**
- `apps/web/src/components/necc/MissingDataNote.tsx`
- `apps/web/src/lib/api/necc-prices.ts` (with previous day logic)

---

#### Day 25: Testing & Refinement
- [ ] Test all routes
- [ ] Test date navigation
- [ ] Test missing data scenarios
- [ ] Test scraper integration
- [ ] Performance testing
- [ ] Mobile responsiveness
- [ ] Bug fixes

---

## 📋 PHASE 2: ENGAGEMENT (Weeks 5-8)

### Week 5: Expert System

#### Day 26-27: Expert Access Control
- [ ] Add `necc_expert` to profile qualifications
- [ ] Expert badge display
- [ ] Expert verification UI
- [ ] Expert access check functions

**Files:**
- `apps/web/src/lib/api/expert-access.ts`
- `apps/web/src/components/necc/ExpertBadge.tsx`

---

#### Day 28-29: Annotation System
- [ ] Create `necc_annotations` table
- [ ] Create `necc_annotation_metadata` table
- [ ] Annotation creation form
- [ ] Annotation display component
- [ ] Annotation types (spike, trend, anomaly, prediction)
- [ ] Rich text editor integration

**Files:**
- `supabase/schema/51_necc_annotations.sql`
- `apps/web/src/app/necc/annotations/page.tsx`
- `apps/web/src/components/necc/AnnotationForm.tsx`
- `apps/web/src/components/necc/AnnotationCard.tsx`

---

#### Day 30: Annotation Metadata
- [ ] Helpful button (NECC-specific)
- [ ] Views tracking
- [ ] Expert verification badge
- [ ] Metadata updates

**Files:**
- `apps/web/src/components/necc/AnnotationMetadata.tsx`
- `apps/web/src/lib/api/annotation-metadata.ts`

---

### Week 6: User Reporting & Admin Tools

#### Day 31-32: User Reporting
- [ ] Integrate platform-wide report system
- [ ] Report issue component
- [ ] Report submission
- [ ] Report tracking

**Files:**
- `apps/web/src/components/necc/ReportIssue.tsx`
- Uses existing platform report system

---

#### Day 33-34: Admin CRUD (apps/admin)
- [ ] Admin price list view
- [ ] Create price form
- [ ] Update price form
- [ ] Individual row access
- [ ] Date picker for price entry
- [ ] Validation

**Files:**
- `apps/admin/src/app/(dashboard)/necc/prices/page.tsx`
- `apps/admin/src/components/necc/PriceCRUD.tsx`

---

#### Day 35: Admin Monitoring (apps/admin)
- [ ] Scraper logs viewer
- [ ] Failure alerts display
- [ ] Data quality dashboard
- [ ] Outlier logs (Phase 2 if needed)

**Files:**
- `apps/admin/src/app/(dashboard)/necc/monitoring/page.tsx`
- `apps/admin/src/components/necc/ScraperLogs.tsx`

---

### Week 7-8: Polish & Testing

#### Day 36-40: Phase 2 Testing
- [ ] Test annotation system
- [ ] Test expert access
- [ ] Test user reporting
- [ ] Test admin CRUD
- [ ] Test monitoring dashboard
- [ ] Bug fixes
- [ ] Performance optimization

---

## 📋 PHASE 3: INTELLIGENCE (Weeks 9-12)

### Week 9: AI Integration

#### Day 41-42: AI Predictions
- [ ] Create `necc_ai_predictions` table
- [ ] OpenAI API integration
- [ ] Prediction generation function
- [ ] 7-day forecast
- [ ] 30-day forecast
- [ ] Confidence intervals
- [ ] Disclaimers

**Files:**
- `supabase/schema/52_necc_ai_predictions.sql`
- `apps/web/src/lib/api/ai-predictions.ts`
- `apps/web/src/components/necc/AIPrediction.tsx`

---

#### Day 43-44: Expert Predictions
- [ ] Expert prediction form
- [ ] Prediction display
- [ ] AI vs Expert comparison
- [ ] Prediction accuracy tracking

**Files:**
- `apps/web/src/components/necc/ExpertPrediction.tsx`
- `apps/web/src/components/necc/PredictionComparison.tsx`

---

### Week 10: Advanced Analytics

#### Day 45-46: Trend Analysis
- [ ] Pattern recognition
- [ ] Seasonal analysis
- [ ] Correlation analysis
- [ ] Volatility metrics

**Files:**
- `apps/web/src/app/necc/trends/page.tsx`
- `apps/web/src/components/necc/TrendAnalysis.tsx`

---

#### Day 47-48: Compare Tool
- [ ] Zone comparison interface
- [ ] Multi-zone selection
- [ ] Comparison charts
- [ ] Price gap analysis

**Files:**
- `apps/web/src/app/necc/compare/page.tsx`
- `apps/web/src/components/necc/ZoneComparisonTool.tsx`

---

### Week 11-12: Final Features

#### Day 49-50: Infographic Generation
- [ ] Infographic templates
- [ ] Server-side generation (Puppeteer)
- [ ] Customization options
- [ ] Usage logging
- [ ] Share functionality

**Files:**
- `supabase/functions/generate-infographic/index.ts`
- `apps/web/src/components/necc/InfographicGenerator.tsx`

---

#### Day 51-52: Price Alerts
- [ ] Alert creation form
- [ ] Alert management
- [ ] Notification system
- [ ] Alert history

**Files:**
- `apps/web/src/app/necc/alerts/page.tsx`
- `apps/web/src/components/necc/PriceAlert.tsx`

---

#### Day 53-55: Phase 3 Testing
- [ ] Test AI predictions
- [ ] Test expert predictions
- [ ] Test advanced analytics
- [ ] Test infographic generation
- [ ] Test price alerts
- [ ] Bug fixes
- [ ] Performance optimization

---

## 🛠️ SHARED COMPONENTS & UTILITIES

### Core Components
- [ ] `EntityEngagement.tsx` - Shared engagement (likes, comments, shares)
- [ ] `SEOMetadata.tsx` - SEO metadata component
- [ ] `DateNavigation.tsx` - Date picker and navigation
- [ ] `ZoneSelector.tsx` - Zone selection component
- [ ] `PriceChart.tsx` - Base price chart component

### API Functions
- [ ] `apps/web/src/lib/api/necc-prices.ts` - Price data fetching
- [ ] `apps/web/src/lib/api/necc-zones.ts` - Zone data
- [ ] `apps/web/src/lib/api/engagement.ts` - Engagement operations
- [ ] `apps/web/src/lib/api/ai-predictions.ts` - AI predictions

### Utilities
- [ ] `apps/web/src/lib/utils/necc-date.ts` - Date parsing and formatting
- [ ] `apps/web/src/lib/utils/necc-price.ts` - Price formatting
- [ ] `apps/web/src/lib/utils/necc-zone.ts` - Zone name normalization

---

## ✅ COMPLETION CHECKLIST

### Phase 1: MVP
- [ ] Database schema complete
- [ ] Scraper working (15-min intervals)
- [ ] All URL routes working
- [ ] Home page complete
- [ ] Today page complete
- [ ] Year/Month/Day pages complete
- [ ] Analysis page complete
- [ ] Zone pages complete
- [ ] Engagement integrated
- [ ] SEO implemented
- [ ] Missing data handling
- [ ] Testing complete

### Phase 2: Engagement
- [ ] Expert system complete
- [ ] Annotation system complete
- [ ] User reporting integrated
- [ ] Admin CRUD complete
- [ ] Admin monitoring complete
- [ ] Testing complete

### Phase 3: Intelligence
- [ ] AI predictions complete
- [ ] Expert predictions complete
- [ ] Advanced analytics complete
- [ ] Compare tool complete
- [ ] Infographic generation complete
- [ ] Price alerts complete
- [ ] Testing complete

---

## 🎯 SUCCESS CRITERIA

### Phase 1
- ✅ Scraper runs every 15 minutes
- ✅ All routes accessible
- ✅ Data displays correctly
- ✅ Missing data handled gracefully
- ✅ Engagement works (likes, comments, shares)

### Phase 2
- ✅ Experts can create annotations
- ✅ Users can report issues
- ✅ Admin can correct data
- ✅ Monitoring dashboard functional

### Phase 3
- ✅ AI predictions working
- ✅ Expert predictions working
- ✅ Infographics shareable
- ✅ Price alerts functional

---

**Status:** ✅ Ready to Start  
**Next:** Begin Day 1 - Database Schema

