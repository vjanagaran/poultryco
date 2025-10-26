# 🎨 DISCOVERY SYSTEM - VISUAL MOCKUPS & COMPONENT SPECS

**Date:** October 26, 2025  
**Companion to:** DISCOVERY_NAVIGATION_STRATEGY.md  
**Purpose:** Detailed component specifications for implementation

---

## 📐 COMPONENT SPECIFICATIONS

### 1. Discover Mega Menu Component

**File:** `apps/web/src/components/layout/DiscoverMenu.tsx`

```typescript
interface DiscoverMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  {
    title: "Network",
    icon: "👥",
    items: [
      { label: "Members", href: "/discover/members", count: 2456 },
      { label: "Professionals", href: "/discover/members?role=professional" },
      { label: "Experts", href: "/discover/members?verified=true" },
      { label: "Connections", href: "/me/connections" }
    ]
  },
  {
    title: "Business",
    icon: "🏢",
    items: [
      { label: "Companies", href: "/discover/businesses", count: 890 },
      { label: "Suppliers", href: "/discover/businesses?type=supplier" },
      { label: "Farms", href: "/discover/businesses?type=farm" },
      { label: "Hatcheries", href: "/discover/businesses?type=hatchery" },
      { label: "Feed Mills", href: "/discover/businesses?type=feed_mill" }
    ]
  },
  {
    title: "Marketplace",
    icon: "📦",
    items: [
      { label: "Products & Services", href: "/discover/products", count: 3234 },
      { label: "Equipment", href: "/discover/products?category=equipment" },
      { label: "Feed & Nutrition", href: "/discover/products?category=feed" },
      { label: "Veterinary Supplies", href: "/discover/products?category=vet" },
      { label: "Software & Tools", href: "/discover/products?category=software" }
    ]
  },
  {
    title: "Community",
    icon: "🏛️",
    items: [
      { label: "Organizations", href: "/discover/organizations", count: 156 },
      { label: "Associations", href: "/discover/organizations?type=association" },
      { label: "Universities", href: "/discover/organizations?type=university" },
      { label: "Research", href: "/discover/organizations?type=research" }
    ]
  },
  {
    title: "Jobs",
    icon: "💼",
    items: [
      { label: "Job Board", href: "/jobs" },
      { label: "Post a Job", href: "/jobs/post" },
      { label: "Career Tips", href: "/blog/careers" }
    ]
  },
  {
    title: "Resources",
    icon: "📚",
    items: [
      { label: "Blog & Articles", href: "/blog" },
      { label: "Industry Reports", href: "/resources/reports" },
      { label: "Market Data", href: "/tools/market-data" },
      { label: "Webinars & Events", href: "/events" }
    ]
  }
];
```

**Styling:**
- Dropdown opens on hover/click
- Grid layout: 3 columns on desktop, stacked on mobile
- Smooth fade-in animation (150ms)
- Semi-transparent backdrop
- White background with shadow

---

### 2. Unified Search Component

**File:** `apps/web/src/components/search/UnifiedSearch.tsx`

```typescript
interface SearchResult {
  type: 'member' | 'business' | 'organization' | 'product' | 'article';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
  badge?: string;
}

interface UnifiedSearchProps {
  placeholder?: string;
  defaultCategory?: 'all' | 'members' | 'businesses' | 'products';
  showAdvancedFilters?: boolean;
}

const categoryIcons = {
  member: '👥',
  business: '🏢',
  organization: '🏛️',
  product: '📦',
  article: '📰'
};
```

**Features:**
- Debounced search (300ms)
- Real-time autocomplete
- Categorized results
- Recent searches (stored in localStorage)
- Keyboard navigation (↑↓ arrows, Enter)
- Clear button (×)

**API Integration:**
```typescript
// Endpoint: /api/search
// Query params: q, category, limit
const searchResults = await fetch(
  `/api/search?q=${encodeURIComponent(query)}&category=${category}&limit=10`
);
```

---

### 3. Filter Sidebar Component

**File:** `apps/web/src/components/discover/FilterSidebar.tsx`

```typescript
interface Filter {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'select';
  options?: FilterOption[];
  value?: any;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  icon?: string;
}

interface FilterSidebarProps {
  filters: Filter[];
  activeFilters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  onReset: () => void;
  resultCount: number;
}
```

**Responsive Behavior:**
- Desktop: Fixed sidebar (280px width)
- Tablet: Collapsible sidebar with toggle
- Mobile: Bottom sheet modal

**State Management:**
```typescript
// URL sync for shareable filtered searches
const [searchParams, setSearchParams] = useSearchParams();

// Example: /discover/members?role=farmer&state=tamil_nadu&verified=true
```

---

### 4. Directory Card Components

#### Member Card

**File:** `apps/web/src/components/discover/MemberCard.tsx`

```typescript
interface MemberCardProps {
  member: {
    id: string;
    full_name: string;
    profile_slug: string;
    headline: string;
    profile_photo_url?: string;
    location_city?: string;
    location_state: string;
    primary_role: string;
    is_verified: boolean;
    is_online?: boolean;
    connection_status?: 'connected' | 'pending' | 'none';
  };
  variant?: 'grid' | 'list';
  showActions?: boolean;
}
```

**Actions:**
```typescript
const actions = [
  { icon: MessageCircle, label: "Message", action: () => openChat(member.id) },
  { icon: UserPlus, label: "Connect", action: () => sendRequest(member.id) },
  { icon: Eye, label: "View", action: () => router.push(`/me/${member.profile_slug}`) }
];
```

#### Business Card

**File:** `apps/web/src/components/discover/BusinessCard.tsx`

```typescript
interface BusinessCardProps {
  business: {
    id: string;
    business_name: string;
    slug: string;
    logo_url?: string;
    business_type: string;
    location_state: string;
    rating?: number;
    review_count?: number;
    product_count?: number;
    team_size?: number;
    certifications?: string[];
    is_verified: boolean;
  };
}
```

#### Product Card

**File:** `apps/web/src/components/discover/ProductCard.tsx`

```typescript
interface ProductCardProps {
  product: {
    id: string;
    product_name: string;
    business: {
      name: string;
      slug: string;
      is_verified: boolean;
    };
    image_urls: string[];
    price?: number;
    price_unit?: string;
    price_type: 'fixed' | 'range' | 'quote';
    rating?: number;
    review_count?: number;
    availability: 'in_stock' | 'pre_order' | 'custom';
  };
}
```

---

### 5. Create Business CTA Component

**File:** `apps/web/src/components/profile/CreateBusinessCTA.tsx`

```typescript
interface CreateBusinessCTAProps {
  variant: 'sidebar' | 'header' | 'empty-state';
  userId: string;
  onSuccess?: () => void;
}
```

**Variants:**

1. **Sidebar Widget** (Small, persistent)
```tsx
<div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4">
  <div className="flex items-center gap-2 mb-2">
    <Building className="w-5 h-5 text-green-600" />
    <h3 className="font-semibold">Business Page</h3>
  </div>
  <p className="text-sm text-gray-600 mb-3">
    Showcase your business to 2,400+ professionals
  </p>
  <button className="w-full btn-primary-sm">
    + Create Business
  </button>
</div>
```

2. **Header Button** (Prominent CTA)
```tsx
<button className="btn-secondary flex items-center gap-2">
  <Plus className="w-4 h-4" />
  Create Business
</button>
```

3. **Empty State** (First-time, educational)
```tsx
<div className="text-center max-w-md mx-auto py-12">
  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <Building className="w-8 h-8 text-green-600" />
  </div>
  <h2 className="text-2xl font-bold mb-2">Grow Your Professional Presence</h2>
  <p className="text-gray-600 mb-6">
    Create a Business Page to showcase products, build trust, and connect with buyers
  </p>
  <ul className="text-left space-y-2 mb-8">
    <li className="flex items-center gap-2">
      <Check className="w-5 h-5 text-green-600" />
      <span>Showcase products & services</span>
    </li>
    <li className="flex items-center gap-2">
      <Check className="w-5 h-5 text-green-600" />
      <span>Build trust with certifications</span>
    </li>
    <li className="flex items-center gap-2">
      <Check className="w-5 h-5 text-green-600" />
      <span>Connect with buyers & suppliers</span>
    </li>
  </ul>
  <button className="btn-primary-lg">
    + Create Your Business Page
  </button>
</div>
```

---

### 6. Business Management Widget

**File:** `apps/web/src/components/profile/BusinessManagementWidget.tsx`

```typescript
interface BusinessManagementWidgetProps {
  businesses: Array<{
    id: string;
    business_name: string;
    slug: string;
    logo_url?: string;
    follower_count: number;
    product_count: number;
    is_verified: boolean;
  }>;
  onManage: (businessId: string) => void;
  onCreateNew: () => void;
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│  YOUR BUSINESSES                    │
├─────────────────────────────────────┤
│  [Logo] ABC Poultry Farm       ✓    │
│         👥 45 · 📦 12               │
│         [📊 Analytics] [✏️ Edit]    │
├─────────────────────────────────────┤
│  [Logo] XYZ Feed Mills              │
│         👥 23 · 📦 8                │
│         [📊 Analytics] [✏️ Edit]    │
├─────────────────────────────────────┤
│  [+ Add Another Business]           │
└─────────────────────────────────────┘
```

---

## 🎨 TAILWIND UTILITY CLASSES

### Card Styles
```css
/* Member/Business Card Base */
.directory-card {
  @apply bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-200 cursor-pointer;
}

/* Filter Sidebar */
.filter-sidebar {
  @apply bg-white rounded-lg border border-gray-200 p-6 space-y-6 sticky top-20;
}

/* Filter Group */
.filter-group {
  @apply space-y-3;
}

.filter-group-title {
  @apply font-semibold text-gray-900 flex items-center gap-2 text-sm mb-3;
}

/* Filter Option */
.filter-option {
  @apply flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 cursor-pointer;
}

/* Active Filter Chip */
.filter-chip {
  @apply inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium;
}

.filter-chip-remove {
  @apply ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors;
}
```

### Badge Styles
```css
/* Verification Badge */
.badge-verified {
  @apply inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded;
}

/* Online Indicator */
.badge-online {
  @apply w-3 h-3 bg-green-500 border-2 border-white rounded-full;
}

/* Rating Stars */
.rating-star {
  @apply text-yellow-400;
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px'  // Extra large
    }
  }
}
```

### Responsive Layouts

**Desktop (lg+):**
```
┌───────┬─────────────────┬───────┐
│Filter │   Main Grid     │ Stats │
│280px  │     flex-1      │ 280px │
└───────┴─────────────────┴───────┘
```

**Tablet (md):**
```
┌──────────────────────────┐
│    [Filter Toggle]       │
├──────────────────────────┤
│      Main Grid           │
│      (2 columns)         │
└──────────────────────────┘
```

**Mobile (sm):**
```
┌──────────────────────────┐
│   [🔍] [≡ Filters (3)]   │
├──────────────────────────┤
│      Card (Stacked)      │
│      Card (Stacked)      │
└──────────────────────────┘
```

---

## 🔧 API ENDPOINTS NEEDED

### Search & Discovery

```typescript
// Unified Search
GET /api/search
  ?q=query
  &category=all|members|businesses|products
  &limit=10
  
// Member Directory
GET /api/discover/members
  ?role=farmer
  &state=tamil_nadu
  &verified=true
  &page=1
  &limit=20
  
// Business Directory
GET /api/discover/businesses
  ?type=farm
  &certifications=iso
  &state=tamil_nadu
  &page=1
  
// Product Marketplace
GET /api/discover/products
  ?category=feed
  &price_min=1000
  &price_max=5000
  &in_stock=true
  
// Organization Directory
GET /api/discover/organizations
  ?type=association
  &focus_area=training
  
// User's Businesses
GET /api/users/{userId}/businesses
  
// Create Business
POST /api/businesses
  body: { name, type, location, ... }
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### Week 1: Foundation
- [ ] Create `DiscoverMenu` component
- [ ] Create `UnifiedSearch` component
- [ ] Build `/discover` landing page
- [ ] Create filter sidebar component
- [ ] Set up API routes

### Week 2: Member Directory
- [ ] Enhance existing member directory
- [ ] Add filter sidebar
- [ ] Implement smart search
- [ ] Add sorting options
- [ ] Mobile responsive filters

### Week 3: Business Features
- [ ] Create business directory page
- [ ] Add "Create Business" CTA to profile
- [ ] Build business creation wizard
- [ ] Business management widget
- [ ] Business card component

### Week 4: Products & Organizations
- [ ] Product marketplace page
- [ ] Organization directory page
- [ ] Product card component
- [ ] Organization card component
- [ ] Unified search integration

---

## 💡 QUICK WINS (Can ship in 1 week)

1. **Discover Menu in Header**
   - Simple dropdown with links
   - No backend changes needed
   - Big UX improvement

2. **Enhanced Member Directory**
   - Add filter sidebar to existing page
   - Use existing member API
   - 2-3 days work

3. **Create Business CTA**
   - Add widget to profile page
   - Link to existing business creation
   - 1 day work

4. **Mobile Filter Sheet**
   - Bottom drawer for filters
   - Great mobile UX
   - 2 days work

---

## 🎨 DESIGN TOKENS

```typescript
// colors.ts
export const discoveryColors = {
  primary: {
    DEFAULT: '#16a34a', // green-600
    hover: '#15803d',   // green-700
    light: '#dcfce7',   // green-100
  },
  secondary: {
    DEFAULT: '#3b82f6', // blue-500
    light: '#dbeafe',   // blue-100
  },
  badge: {
    verified: { bg: '#dcfce7', text: '#166534' },
    online: { bg: '#22c55e' },
    premium: { bg: '#fef3c7', text: '#92400e' },
  }
};

// spacing.ts
export const discoverySpacing = {
  cardGap: '1.5rem',
  sidebarWidth: '280px',
  filterGap: '1.5rem',
};
```

---

**This component specification provides everything needed to implement the discovery system with consistent, production-ready code!** 🚀
