# Discovery System - Frontend Implementation Plan

**Status:** 🚀 Database Ready - Frontend Implementation Required  
**Date:** October 26, 2025  
**Priority:** High - MVP Feature

---

## Overview

Build a comprehensive Discovery system with intuitive navigation, powerful filtering, and trust-building elements displayed in card-based layouts. Focus on self-learning UI/UX that guides users to find exactly what they need.

---

## Implementation Phases

### Phase 1: Core Discovery Components (Est. 8-10 hours)
**Priority:** P0 - Must Have

#### 1.1 Discovery Navigation Header
**File:** `apps/web/src/components/discovery/DiscoveryNav.tsx`

**Features:**
- Mega menu with 6 main categories:
  - 👥 Network (Members)
  - 🏢 Business (Companies)
  - 🛒 Marketplace (Products)
  - 🌐 Community (Organizations)
  - 📅 Events & Webinars
  - 💼 Jobs
- Hover state shows subcategories with counts
- Active state highlighting
- Mobile-responsive hamburger menu

**Trust Elements:** None (Navigation only)

#### 1.2 Unified Search Bar
**File:** `apps/web/src/components/discovery/UnifiedSearchBar.tsx`

**Features:**
- Global search with autocomplete
- Search type selector (All, Members, Businesses, etc.)
- Recent searches
- Popular searches
- Location-based search toggle
- Voice search (future)

**Trust Elements:**
- Result counts per category
- Trending searches badge

#### 1.3 Filter Sidebar Component
**File:** `apps/web/src/components/discovery/FilterSidebar.tsx`

**Features:**
- Dynamic filters based on discovery type
- Collapsible filter groups
- Selected filters display at top
- Clear all filters button
- Save filter preset (future)
- Filter count badges

**Trust Elements:**
- Result count per filter option
- Most popular filters highlighted

---

### Phase 2: Member Discovery (Est. 10-12 hours)
**Priority:** P0 - Must Have

#### 2.1 Member Directory Page
**File:** `apps/web/src/app/(platform)/discover/members/page.tsx`

**Features:**
- Card grid layout (responsive: 1/2/3 columns)
- Infinite scroll with loading states
- Sort options (Relevant, Nearby, Connections, New)
- View toggle (Grid/List)
- Empty state with suggestions

**Filters:**
- Location (City, State, Radius)
- Role/Expertise
- Skills
- Industry Experience
- Verified profiles only
- Has profile photo
- Connection degree (1st, 2nd, 3rd)

#### 2.2 Member Card Component
**File:** `apps/web/src/components/discovery/cards/MemberCard.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│  [Avatar]  Name ⭐ [Verified]       │
│            Headline                  │
│            📍 Location               │
├─────────────────────────────────────┤
│  🔗 120 connections                 │
│  👥 450 followers                   │
│  ⭐ 4.8 rating (24 reviews)         │
├─────────────────────────────────────┤
│  [Connect] [Message] [···]          │
└─────────────────────────────────────┘
```

**Trust Elements:**
- ✅ Verification badge (government ID verified)
- ⭐ Rating score (from endorsements/reviews)
- 🔗 Connection count (shows network size)
- 👥 Follower count (shows influence)
- 💚 Mutual connections (hover shows names)
- 📊 Profile completeness bar (90%+)
- 🏆 Badges (Top Contributor, Expert, etc.)
- 📅 Member since date

**Interactions:**
- Hover: Show quick info tooltip
- Click: Navigate to profile
- Connect button: Send connection request
- Message button: Start conversation
- Save to list (bookmark)

---

### Phase 3: Business Discovery (Est. 12-14 hours)
**Priority:** P0 - Must Have

#### 3.1 Business Directory Page
**File:** `apps/web/src/app/(platform)/discover/businesses/page.tsx`

**Features:**
- Card grid with featured businesses at top
- Map view toggle (show on map)
- Sort: Relevant, Nearby, Ratings, Established
- Business type quick filters (chips)

**Filters:**
- Business Type (hierarchical: Category → Type)
- Location (City, State, Radius)
- Specializations
- Production Capacity
- Service Areas
- Certifications
- Verified business only
- Has products
- Has jobs

#### 3.2 Business Card Component
**File:** `apps/web/src/components/discovery/cards/BusinessCard.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│  [Logo]  Business Name ✓            │
│          Type • 📍 Location          │
├─────────────────────────────────────┤
│  ⭐ 4.5 (89 reviews)                │
│  📦 245 products                    │
│  👥 12 team members                 │
│  📜 ISO 9001 certified              │
├─────────────────────────────────────┤
│  Est. 2015 • 🏆 Verified Seller     │
├─────────────────────────────────────┤
│  [View Profile] [Contact] [···]     │
└─────────────────────────────────────┘
```

**Trust Elements:**
- ✓ Verification badge (business documents verified)
- ⭐ Rating & review count (from buyers)
- 📦 Product count (shows inventory depth)
- 👥 Team member count (shows company size)
- 📜 Certification badges (ISO, FSSAI, etc.)
- 📅 Established year (shows longevity)
- 🏆 Business badges (Top Seller, Premium, etc.)
- 💬 Response rate & time
- 📈 Transaction history (orders completed)

**Interactions:**
- View profile
- Contact/Inquire button
- Follow business
- Browse products
- See on map

---

### Phase 4: Product Marketplace (Est. 14-16 hours)
**Priority:** P0 - Must Have

#### 4.1 Product Marketplace Page
**File:** `apps/web/src/app/(platform)/discover/products/page.tsx`

**Features:**
- Card grid with product images
- Category breadcrumb navigation
- 3-level category filtering (cascading)
- Price range slider
- Map view for local products
- Sort: Relevant, Price, Rating, Newest

**Filters:**
- Category (3-level hierarchy)
- Bird Type (Broiler, Layer, Breeder, etc.)
- Age Group (Starter, Grower, Finisher, etc.)
- Price Range
- Availability (In Stock, Pre-order)
- Certifications
- Seller Location
- Seller Rating
- Free Shipping
- Minimum Order Quantity

#### 4.2 Product Card Component
**File:** `apps/web/src/components/discovery/cards/ProductCard.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│  [Product Image]                    │
│  [Quick View] [Save]                │
├─────────────────────────────────────┤
│  Product Name                       │
│  Category • Bird Type               │
├─────────────────────────────────────┤
│  ⭐ 4.6 (156 reviews)               │
│  ✓ Certified • 📦 In Stock          │
├─────────────────────────────────────┤
│  💰 ₹2,500/bag                      │
│  MOQ: 10 bags                       │
├─────────────────────────────────────┤
│  Seller: [Company] ⭐ 4.8           │
│  📍 Chennai • 🚚 Free Shipping      │
├─────────────────────────────────────┤
│  [Inquire] [Add to Compare]         │
└─────────────────────────────────────┘
```

**Trust Elements:**
- ⭐ Product rating (from buyers)
- 💬 Review count (social proof)
- ✓ Certification badges
- 📦 Stock status (In Stock = reliable)
- 🏢 Seller rating & name (linked to business)
- 📍 Seller location (local preference)
- 🚚 Shipping info (free shipping badge)
- 📊 Sold count (X units sold)
- 🔥 Popular badge (trending products)
- 💰 Best price badge (price match)

**Interactions:**
- Quick view modal
- Save/bookmark
- Inquire/contact seller
- Add to compare (up to 4 products)
- View full details

---

### Phase 5: Organization Discovery (Est. 10-12 hours)
**Priority:** P1 - Should Have

#### 5.1 Organization Directory Page
**File:** `apps/web/src/app/(platform)/discover/organizations/page.tsx`

**Features:**
- Card grid layout
- Organization type quick filters
- Sort: Relevant, Members, Active, Established

**Filters:**
- Organization Type
- Location (City, State)
- Member Count Range
- Membership Type (Open, Invite-only)
- Active (events in last 30 days)
- Has resources
- Industry Focus

#### 5.2 Organization Card Component
**File:** `apps/web/src/components/discovery/cards/OrganizationCard.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│  [Logo]  Organization Name ✓        │
│          Type • 📍 Location          │
├─────────────────────────────────────┤
│  👥 1,250 members                   │
│  📅 12 upcoming events              │
│  📚 45 resources                    │
│  ⭐ 4.7 member satisfaction         │
├─────────────────────────────────────┤
│  Est. 2010 • 🏆 Industry Leader     │
├─────────────────────────────────────┤
│  [Join] [Follow] [···]              │
└─────────────────────────────────────┘
```

**Trust Elements:**
- ✓ Verification badge (official organization)
- 👥 Member count (shows community size)
- 📅 Event count (shows activity level)
- 📚 Resource count (shows value provided)
- ⭐ Member satisfaction rating
- 📅 Established year (shows credibility)
- 🏆 Organization badges (Award Winner, etc.)
- 📈 Growth trend (members joined recently)
- 💬 Engagement rate (active discussions)

**Interactions:**
- Join/Apply for membership
- Follow organization
- View profile
- See upcoming events
- Browse resources

---

### Phase 6: Events Discovery (Est. 10-12 hours)
**Priority:** P1 - Should Have

#### 6.1 Events Directory Page
**File:** `apps/web/src/app/(platform)/discover/events/page.tsx`

**Features:**
- Card grid with calendar view toggle
- Date range selector
- Map view for local events
- Sort: Upcoming, Popular, Nearby, Free

**Filters:**
- Event Type (Conference, Webinar, Workshop, etc.)
- Format (In-person, Online, Hybrid)
- Date Range
- Location (City, State, Online)
- Price (Free, Paid)
- Topics/Tags
- Organizer Type (Business, Organization, Personal)
- Language
- Seats Available

#### 6.2 Event Card Component
**File:** `apps/web/src/components/discovery/cards/EventCard.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│  [Cover Image]  [Online/Offline]    │
│  [Date Badge]                       │
├─────────────────────────────────────┤
│  Event Title                        │
│  Type • Topics                      │
├─────────────────────────────────────┤
│  📅 Mar 15, 2025 • 10:00 AM         │
│  📍 Chennai / 💻 Online             │
├─────────────────────────────────────┤
│  👥 245 registered / 500 capacity   │
│  ⭐ 4.8 (past events)               │
│  🎤 3 speakers                      │
├─────────────────────────────────────┤
│  Organizer: [Name] ⭐ 4.9           │
│  💰 Free • 📜 Certificate           │
├─────────────────────────────────────┤
│  [Register] [Share] [Save]          │
└─────────────────────────────────────┘
```

**Trust Elements:**
- 👥 Registration count (social proof)
- 💚 Capacity indicator (creates urgency)
- ⭐ Organizer rating (past event quality)
- 🎤 Speaker count & names (expertise)
- 📜 Certificate badge (adds value)
- 🏆 Featured event badge
- 📊 Attendance history (X% showed up)
- 💬 Reviews from past attendees
- ✓ Verified organizer
- 🔥 Popular/Trending badge

**Interactions:**
- Register/RSVP
- Add to calendar
- Share event
- Save for later
- View full details

---

### Phase 7: Jobs Discovery (Est. 10-12 hours)
**Priority:** P1 - Should Have

#### 7.1 Jobs Directory Page
**File:** `apps/web/src/app/(platform)/discover/jobs/page.tsx`

**Features:**
- Card list layout (optimized for reading)
- Job alerts setup
- Saved jobs
- Applied jobs tracking
- Sort: Recent, Relevant, Salary

**Filters:**
- Job Type (Full-time, Part-time, Contract, etc.)
- Category (Nutrition, Farm Management, etc.)
- Experience Level
- Salary Range
- Location (City, State, Remote)
- Posted Date (Last 24h, Week, Month)
- Company Size
- Company Rating
- Benefits (Housing, Transport, etc.)

#### 7.2 Job Card Component
**File:** `apps/web/src/components/discovery/cards/JobCard.tsx`

**Layout:**
```
┌─────────────────────────────────────┐
│  [Company Logo]                     │
│  Job Title                          │
│  Company Name ⭐ 4.6                │
├─────────────────────────────────────┤
│  💼 Full-time • 📍 Chennai          │
│  💰 ₹3-5 LPA • 👨‍💼 2-4 years exp    │
├─────────────────────────────────────┤
│  🎯 12 applicants                   │
│  ⏰ Posted 2 days ago               │
│  🚀 Fast hiring                     │
├─────────────────────────────────────┤
│  ✓ Housing • 🚌 Transport           │
│  📊 Company: 50-200 employees       │
├─────────────────────────────────────┤
│  [Apply] [Save] [Share]             │
└─────────────────────────────────────┘
```

**Trust Elements:**
- ⭐ Company rating (from employees)
- 🎯 Applicant count (shows popularity)
- ⏰ Posted date (shows freshness)
- 🚀 Fast hiring badge (response time)
- ✓ Verified employer
- 💬 Company reviews (linked)
- 📊 Company size (stability indicator)
- 🏆 Top employer badge
- 💰 Salary transparency (if shown)
- 📈 Company growth trend

**Interactions:**
- Quick apply (if profile complete)
- Save job
- Share job
- View full details
- Report job

---

## Shared Components

### 8.1 Location Selector with Google Places
**File:** `apps/web/src/components/discovery/LocationSelector.tsx`

**Features:**
- Autocomplete location search
- Current location detection
- Radius selector (5km, 10km, 25km, 50km, 100km+)
- Map preview
- Save favorite locations

### 8.2 Filter Chips Component
**File:** `apps/web/src/components/discovery/FilterChips.tsx`

**Features:**
- Active filters displayed as chips
- Remove individual filter
- Clear all button
- Filter count badge

### 8.3 Trust Badge Component
**File:** `apps/web/src/components/discovery/TrustBadge.tsx`

**Features:**
- Consistent badge styling
- Icon + Text
- Tooltip with explanation
- Color coding (verified=green, premium=gold, etc.)

### 8.4 Rating Display Component
**File:** `apps/web/src/components/discovery/RatingDisplay.tsx`

**Features:**
- Star rating (0-5)
- Review count
- Rating breakdown (hover to see 5★, 4★, etc.)
- Link to reviews

### 8.5 Connection Indicator Component
**File:** `apps/web/src/components/discovery/ConnectionIndicator.tsx`

**Features:**
- Connection degree badge (1st, 2nd, 3rd)
- Mutual connections tooltip
- Connection path (via whom)

---

## Technical Implementation Details

### State Management

**Discovery Store** (`apps/web/src/stores/discoveryStore.ts`)
```typescript
interface DiscoveryStore {
  // Filters
  filters: Record<string, any>;
  activeFilters: FilterChip[];
  
  // Search
  searchQuery: string;
  searchType: 'all' | 'members' | 'businesses' | 'products' | 'organizations' | 'events' | 'jobs';
  
  // Location
  userLocation: { lat: number; lng: number } | null;
  searchRadius: number;
  
  // Results
  results: any[];
  totalCount: number;
  hasMore: boolean;
  
  // UI State
  viewMode: 'grid' | 'list' | 'map';
  sortBy: string;
  isLoading: boolean;
  
  // Actions
  setFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  search: () => Promise<void>;
  loadMore: () => Promise<void>;
}
```

### API Endpoints

**Discovery API** (`apps/web/src/lib/api/discovery.ts`)
```typescript
// Members
export async function searchMembers(params: SearchParams): Promise<MemberResult[]>
export async function getNearbyMembers(lat: number, lng: number, radius: number): Promise<MemberResult[]>

// Businesses
export async function searchBusinesses(params: SearchParams): Promise<BusinessResult[]>
export async function getBusinessesByType(typeId: string): Promise<BusinessResult[]>

// Products
export async function searchProducts(params: ProductSearchParams): Promise<ProductResult[]>
export async function getProductsByCategory(categoryId: string): Promise<ProductResult[]>

// Organizations
export async function searchOrganizations(params: SearchParams): Promise<OrgResult[]>

// Events
export async function searchEvents(params: EventSearchParams): Promise<EventResult[]>
export async function getUpcomingEvents(days: number): Promise<EventResult[]>

// Jobs
export async function searchJobs(params: JobSearchParams): Promise<JobResult[]>
export async function getNearbyJobs(lat: number, lng: number, radius: number): Promise<JobResult[]>
```

### Performance Optimizations

1. **Infinite Scroll with React Query**
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['discover', 'members', filters],
  queryFn: ({ pageParam = 0 }) => searchMembers({ ...filters, page: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

2. **Image Optimization**
- Use Next.js Image component
- Lazy load images below fold
- Placeholder blur while loading

3. **Debounced Search**
```typescript
const debouncedSearch = useDebouncedCallback((query: string) => {
  performSearch(query);
}, 300);
```

4. **Filter Memoization**
```typescript
const filteredResults = useMemo(() => {
  return applyFilters(results, filters);
}, [results, filters]);
```

---

## UI/UX Guidelines

### Card Design System

**Colors:**
- Primary: Green (#16a34a) - CTAs
- Secondary: Gray (#64748b) - Secondary info
- Success: Green (#10b981) - Verified, In Stock
- Warning: Orange (#f59e0b) - Limited, Urgent
- Error: Red (#ef4444) - Unavailable, Expired

**Typography:**
- Card Title: font-semibold text-lg
- Subtitle: font-normal text-sm text-gray-600
- Metadata: font-normal text-xs text-gray-500

**Spacing:**
- Card padding: p-6
- Inner sections: space-y-4
- Horizontal items: gap-2

**Shadows:**
- Default: shadow-sm
- Hover: shadow-lg
- Active: shadow-xl

### Trust Element Hierarchy

**High Trust (Green):**
- Verified badges
- High ratings (4.5+)
- Certifications

**Medium Trust (Blue):**
- Member counts
- Activity indicators
- Established date

**Neutral (Gray):**
- Follower counts
- Product counts
- General stats

### Mobile Responsiveness

**Breakpoints:**
- Mobile: 1 column (< 768px)
- Tablet: 2 columns (768px - 1024px)
- Desktop: 3 columns (> 1024px)
- Large: 4 columns (> 1536px)

**Mobile Adjustments:**
- Bottom sheet for filters
- Horizontal scroll for chips
- Simplified card layout
- Sticky search bar

---

## Analytics & Tracking

### Events to Track

**Discovery Events:**
- `discovery_search` - Search performed
- `discovery_filter_applied` - Filter selected
- `discovery_view_mode_changed` - Grid/List toggle
- `discovery_sort_changed` - Sort option changed

**Card Events:**
- `card_viewed` - Card in viewport
- `card_clicked` - Card clicked
- `card_action_clicked` - CTA clicked (Connect, Inquire, etc.)
- `card_saved` - Card bookmarked

**Conversion Events:**
- `connection_sent_from_discovery`
- `inquiry_sent_from_discovery`
- `profile_visited_from_discovery`
- `product_inquiry_from_discovery`

---

## Testing Strategy

### Unit Tests
- Filter logic
- Search query building
- Rating calculations
- Distance calculations

### Component Tests
- Card rendering with different data
- Filter interactions
- Sort functionality
- Pagination

### E2E Tests
- Complete discovery flow
- Search → Filter → Sort → Click
- Mobile responsiveness
- Performance benchmarks (<3s load)

---

## Implementation Timeline

### Week 1: Core Foundation
- [ ] Discovery navigation component
- [ ] Unified search bar
- [ ] Filter sidebar framework
- [ ] Card base components
- [ ] Discovery store setup

### Week 2: Member & Business Discovery
- [ ] Member directory page
- [ ] Member cards with trust elements
- [ ] Business directory page
- [ ] Business cards with trust elements
- [ ] Location selector integration

### Week 3: Products & Organizations
- [ ] Product marketplace page
- [ ] Product cards with trust elements
- [ ] Organization directory page
- [ ] Organization cards with trust elements
- [ ] Category navigation

### Week 4: Events, Jobs & Polish
- [ ] Events directory page
- [ ] Event cards with trust elements
- [ ] Jobs directory page
- [ ] Job cards with trust elements
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] Testing & bug fixes

---

## Success Metrics

**Engagement:**
- Discovery page visits: Target 40% of active users
- Average session time: Target 5+ minutes
- Filters used per session: Target 3+
- Search refinements: Target 2+

**Conversion:**
- Connection requests from discovery: Target 30% of visitors
- Profile views from discovery: Target 60% of visitors
- Inquiries sent from discovery: Target 15% of visitors

**Trust:**
- Trust element clicks: Track which elements drive engagement
- Verified profile preference: % who filter for verified
- Rating influence: Correlation between rating & clicks

---

## Next Steps After Implementation

1. **A/B Testing:**
   - Card layouts
   - Trust element placement
   - Filter order
   - Sort default

2. **AI Recommendations:**
   - "Members you may know"
   - "Similar businesses"
   - "Recommended for you"

3. **Advanced Features:**
   - Saved searches
   - Email alerts
   - Compare feature (products)
   - Collections/Lists

4. **Gamification:**
   - Discovery achievements
   - "Profile stalker" badge
   - "Connector" badge

---

**Status:** 📋 Implementation Ready  
**Estimated Total Time:** 74-88 hours (2-2.5 weeks for 1 developer)  
**Dependencies:** ✅ Database schema complete  
**Next Action:** Start with Phase 1 - Core Discovery Components

