# Discovery System - Card Design Reference

**Quick Visual Guide for Card-Based Layouts with Trust Elements**

---

## Card Layout Principles

### 1. Visual Hierarchy
```
┌─────────────────────────────────────┐
│ 1. PRIMARY IDENTIFIER               │  ← Avatar/Logo + Name/Title
│    (Avatar/Logo + Name)             │     [Most Important]
├─────────────────────────────────────┤
│ 2. CONTEXT & LOCATION               │  ← Type, Location, Date
│    (Type • Location • Date)         │     [Quick Scanability]
├─────────────────────────────────────┤
│ 3. TRUST INDICATORS                 │  ← Social Proof
│    ⭐ Rating • 👥 Count • ✓ Verify  │     [Decision Making]
├─────────────────────────────────────┤
│ 4. VALUE PROPOSITIONS               │  ← What they offer
│    (Products, Services, Benefits)   │     [Interest Building]
├─────────────────────────────────────┤
│ 5. CALL TO ACTION                   │  ← Primary action
│    [Primary CTA] [Secondary]        │     [Conversion]
└─────────────────────────────────────┘
```

---

## Trust Elements by Category

### Members 👤
**High Impact:**
- ⭐ Rating (from endorsements)
- 🔗 Connection count
- ✓ Verification badge

**Medium Impact:**
- 👥 Follower count
- 💚 Mutual connections
- 🏆 Badges (Expert, Top Contributor)

**Low Impact:**
- 📊 Profile completeness
- 📅 Member since

### Businesses 🏢
**High Impact:**
- ⭐ Rating (from customers)
- 📜 Certifications
- ✓ Verified business badge

**Medium Impact:**
- 📦 Product count
- 👥 Team member count
- 📅 Established year

**Low Impact:**
- 💬 Response rate
- 📈 Transaction history

### Products 📦
**High Impact:**
- ⭐ Product rating
- ✓ Certification badges
- 📦 Stock status

**Medium Impact:**
- 💬 Review count
- 🏢 Seller rating
- 🚚 Shipping info

**Low Impact:**
- 📊 Units sold
- 🔥 Trending badge

### Organizations 🌐
**High Impact:**
- ✓ Official verification
- 👥 Member count
- ⭐ Member satisfaction

**Medium Impact:**
- 📅 Event count
- 📚 Resource count
- 📅 Established year

**Low Impact:**
- 📈 Growth trend
- 💬 Engagement rate

### Events 📅
**High Impact:**
- 👥 Registration count
- 💚 Capacity indicator
- ⭐ Organizer rating

**Medium Impact:**
- 🎤 Speaker quality
- 📜 Certificate offered
- 🏆 Featured badge

**Low Impact:**
- 📊 Attendance history
- 💬 Past reviews

### Jobs 💼
**High Impact:**
- ⭐ Company rating
- ✓ Verified employer
- 🚀 Fast hiring badge

**Medium Impact:**
- 🎯 Applicant count
- 📊 Company size
- 💰 Salary transparency

**Low Impact:**
- ⏰ Posted date
- 🏆 Top employer badge

---

## Color Coding for Trust

### Status Colors
```css
/* Verified/Active */
.trust-verified { color: #10b981; } /* Green */

/* Warning/Limited */
.trust-warning { color: #f59e0b; } /* Orange */

/* Inactive/Unavailable */
.trust-inactive { color: #ef4444; } /* Red */

/* Neutral/Info */
.trust-neutral { color: #64748b; } /* Gray */

/* Premium/Featured */
.trust-premium { color: #f59e0b; } /* Gold */
```

### Badge Examples
```tsx
// Verified Badge
<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
  <CheckCircle className="w-4 h-4" />
  <span className="text-xs font-medium">Verified</span>
</span>

// Rating Badge
<span className="inline-flex items-center gap-1">
  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
  <span className="text-sm font-semibold">4.8</span>
  <span className="text-xs text-gray-500">(124)</span>
</span>

// Count Badge
<span className="inline-flex items-center gap-1 text-gray-600">
  <Users className="w-4 h-4" />
  <span className="text-sm">1,250 members</span>
</span>
```

---

## Responsive Grid Layout

```css
/* Mobile First */
.discovery-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .discovery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .discovery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop */
@media (min-width: 1536px) {
  .discovery-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## Card Interaction States

### Hover State
```css
.discovery-card {
  transition: all 0.2s ease-in-out;
}

.discovery-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

### Loading Skeleton
```tsx
<div className="animate-pulse">
  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
  <div className="h-4 bg-gray-200 rounded w-3/4 mt-4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
</div>
```

### Empty State
```tsx
<div className="text-center py-12">
  <SearchX className="w-16 h-16 mx-auto text-gray-300" />
  <h3 className="mt-4 text-lg font-semibold">No results found</h3>
  <p className="mt-2 text-sm text-gray-500">
    Try adjusting your filters or search terms
  </p>
  <button className="mt-4 btn-primary">Clear Filters</button>
</div>
```

---

## Filter UI Patterns

### Active Filter Chips
```tsx
<div className="flex flex-wrap gap-2 mb-4">
  {activeFilters.map(filter => (
    <span 
      key={filter.key}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700"
    >
      <span className="text-sm">{filter.label}</span>
      <X 
        className="w-4 h-4 cursor-pointer" 
        onClick={() => removeFilter(filter.key)}
      />
    </span>
  ))}
  {activeFilters.length > 0 && (
    <button 
      className="text-sm text-gray-500 hover:text-gray-700"
      onClick={clearAllFilters}
    >
      Clear all
    </button>
  )}
</div>
```

### Filter Sidebar
```tsx
<aside className="w-64 space-y-6">
  {/* Location Filter */}
  <div>
    <h3 className="font-semibold mb-3">Location</h3>
    <LocationSelector />
    <RadiusSlider />
  </div>
  
  {/* Category Filter */}
  <div>
    <h3 className="font-semibold mb-3">Category</h3>
    <CategoryTree />
  </div>
  
  {/* Price Range */}
  <div>
    <h3 className="font-semibold mb-3">Price Range</h3>
    <PriceRangeSlider />
  </div>
  
  {/* Quick Filters */}
  <div>
    <h3 className="font-semibold mb-3">Quick Filters</h3>
    <div className="space-y-2">
      <Checkbox label="Verified only" count={145} />
      <Checkbox label="In Stock" count={89} />
      <Checkbox label="Free Shipping" count={56} />
    </div>
  </div>
</aside>
```

---

## Sort & View Controls

```tsx
<div className="flex items-center justify-between mb-6">
  {/* Result Count */}
  <p className="text-sm text-gray-600">
    {totalCount} results found
  </p>
  
  {/* Controls */}
  <div className="flex items-center gap-4">
    {/* Sort */}
    <Select value={sortBy} onChange={setSortBy}>
      <option value="relevant">Most Relevant</option>
      <option value="recent">Most Recent</option>
      <option value="rating">Highest Rated</option>
      <option value="nearby">Nearest First</option>
    </Select>
    
    {/* View Toggle */}
    <div className="flex rounded-lg border border-gray-300">
      <button 
        className={viewMode === 'grid' ? 'active' : ''}
        onClick={() => setViewMode('grid')}
      >
        <Grid className="w-5 h-5" />
      </button>
      <button 
        className={viewMode === 'list' ? 'active' : ''}
        onClick={() => setViewMode('list')}
      >
        <List className="w-5 h-5" />
      </button>
      <button 
        className={viewMode === 'map' ? 'active' : ''}
        onClick={() => setViewMode('map')}
      >
        <MapPin className="w-5 h-5" />
      </button>
    </div>
  </div>
</div>
```

---

## Performance Tips

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src={imageUrl}
  alt={title}
  width={400}
  height={300}
  className="rounded-lg"
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>
```

### Infinite Scroll
```tsx
import { useInView } from 'react-intersection-observer';

const { ref, inView } = useInView();

useEffect(() => {
  if (inView && hasMore) {
    loadMore();
  }
}, [inView]);

return (
  <>
    {results.map(item => <Card key={item.id} {...item} />)}
    <div ref={ref} className="h-10" />
  </>
);
```

### Debounced Search
```tsx
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value: string) => {
    performSearch(value);
  },
  300
);
```

---

## Accessibility Considerations

### Keyboard Navigation
- All cards should be keyboard accessible
- Tab order: Image → Title → Actions
- Enter/Space to activate

### Screen Readers
```tsx
<article 
  role="article" 
  aria-label={`${name} - ${type} - ${location}`}
>
  {/* Card content */}
</article>
```

### Color Contrast
- Minimum 4.5:1 for text
- Minimum 3:1 for UI elements
- Don't rely solely on color for information

---

## Animation Guidelines

### Card Entry Animation
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.05 }}
>
  <Card {...item} />
</motion.div>
```

### Stagger Children
```tsx
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
  initial="hidden"
  animate="show"
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      <Card {...item} />
    </motion.div>
  ))}
</motion.div>
```

---

**Reference Complete**  
Use this guide while implementing the Discovery System UI components.

