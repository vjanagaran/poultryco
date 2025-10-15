# 🎨 Design Assets & Layout Analysis

## 📊 Current Status

### ✅ Available Logo Assets

Located in `docs/brand/logo/`:

| Asset | Format | Size | Usage |
|-------|--------|------|-------|
| `icon.png` | PNG | 512x512 | ✅ App icon (perfect size) |
| `icon.svg` | SVG | Vector | ✅ Scalable icon |
| `icon_white.svg` | SVG | Vector | ✅ Dark mode icon |
| `logo.png` | PNG | 480x120 | ✅ Horizontal logo |
| `logo.svg` | SVG | Vector | ✅ Scalable logo |
| `logo_white.svg` | SVG | Vector | ✅ Dark mode logo |
| `poultryco.svg` | SVG | Vector | ✅ Full wordmark |
| `poultryco_white.svg` | SVG | Vector | ✅ Dark mode wordmark |

### ❌ Missing Assets for Mobile App

Current mobile assets in `apps/mobile/assets/`:
- `adaptive-icon.png` - Generic placeholder
- `favicon.png` - Generic placeholder
- `icon.png` - Generic placeholder
- `splash-icon.png` - Generic placeholder

**Need to replace with actual PoultryCo branding!**

---

## 📱 Wireframe Analysis

Based on `docs/wireframes/poultryco_wireframe.html`:

### 🎯 Core Screens (6 screens)

#### 1. **Home Feed** (Lines 479-582)
**Components:**
- Status bar (time, battery)
- Nav header with menu, logo, notifications
- Market prices widget (₹ prices for Broiler, Feed, Eggs)
- Weather alerts widget
- Quick actions grid (3 columns)
- Community updates feed
- Bottom navigation (5 tabs)

**Key Features:**
- Real-time market data
- Weather-based alerts
- Quick access to tools
- Social feed integration

---

#### 2. **Personal Profile** (Lines 584-677)
**Components:**
- Profile header (gradient background: `#2B7A4B` → `#3a8d5d`)
- Profile picture (80px circle)
- Name, roles, trust badge
- Stats row (Connections, Posts, Rating)
- About section (location, phone, email)
- Farm details
- Veterinary credentials
- Recent activity

**Key Features:**
- Multi-stakeholder roles (Farmer + Vet)
- Trust scoring system
- Professional credentials
- Activity tracking

---

#### 3. **Business Profile** (Lines 679-779)
**Components:**
- Business header (gradient: `#1E3A5F` → `#2B7A4B`)
- Company logo/icon
- Stats (Followers, Products, Rating)
- Company info
- Product catalog cards
- Service areas
- Certifications

**Key Features:**
- B2B profile type
- Product listings
- Geographic coverage
- Verification badges

---

#### 4. **Search/Directory** (Lines 782-888)
**Components:**
- Search bar with icon
- Tab bar (All, People, Business, Products)
- Category filter chips
- Mixed search results (People, Business, Products)
- Location-based results ("Near You")

**Key Features:**
- Universal search
- Category filtering
- Location awareness
- Mixed content types

---

#### 5. **Messages/Chat** (Lines 891-994)
**Components:**
- Search messages bar
- Tab bar (Chats, Groups, Broadcast)
- Chat list items with avatars
- Message previews
- Timestamps
- Message requests section

**Key Features:**
- 1:1 chats
- Group chats
- Broadcast lists
- Message requests

---

#### 6. **Tools & Learning** (Lines 996-1092)
**Components:**
- Quick calculators grid (2x2)
- Learning guides list
- Industry glossary
- Best practices checklist

**Key Features:**
- FCR calculator
- Feed projection
- Mortality tracking
- Educational content

---

## 🎨 Design System (from Wireframe)

### Colors
```javascript
// Primary Colors
primary: '#2B7A4B',      // PoultryCo Green
secondary: '#1E3A5F',    // Deep Navy
accent: '#E67E22',       // Sunrise Orange
success: '#27AE60',      // Trust Green
info: '#3498DB',         // Info Blue
purple: '#9B59B6',       // Tool Purple

// Neutral Colors
background: '#FFFFFF',
surface: '#F8F8F8',
border: '#E0E0E0',
text: '#333333',
textSecondary: '#666666',
textLight: '#999999',

// Gradients
headerGradient: 'linear-gradient(135deg, #2B7A4B 0%, #3a8d5d 100%)',
businessGradient: 'linear-gradient(135deg, #1E3A5F 0%, #2B7A4B 100%)',
```

### Typography
```javascript
// Font Family
fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',

// Font Sizes
h1: 24,
h2: 20,
h3: 18,
h4: 16,
body: 14,
caption: 13,
small: 12,
tiny: 11,
```

### Spacing
```javascript
padding: {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
}
```

### Border Radius
```javascript
borderRadius: {
  sm: 5,
  md: 10,
  lg: 15,
  xl: 20,
  xxl: 25,
  full: 9999,
}
```

### Components

#### Bottom Navigation
- Height: ~60px
- 5 tabs: Home, Search, Messages, Tools, Profile
- Active state: `#2B7A4B` color
- Icons: 24x24px
- Labels: 11px

#### Profile Header
- Background: Gradient
- Profile pic: 80px circle
- Text: White on gradient
- Trust badge: Rounded pill

#### Cards
- Background: `#F8F8F8`
- Border radius: 10px
- Padding: 12-15px
- Shadow: Subtle

#### Search Bar
- Background: `#F0F0F0`
- Border radius: 25px (pill shape)
- Height: ~40px
- Icon: 20x20px

#### Tab Bar
- Background: `#F8F8F8`
- Active tab: `#2B7A4B` background, white text
- Border radius: 8-10px
- Height: ~35px

---

## 📋 Asset Requirements for MVP

### 1. **App Icons** (High Priority)
Need to create from existing `icon.png` (512x512):

```
✅ Have: icon.png (512x512)

Need to generate:
- icon@1x.png (1024x1024) - iOS
- icon@2x.png (2048x2048) - iOS
- icon@3x.png (3072x3072) - iOS
- adaptive-icon.png (1024x1024) - Android
- adaptive-icon-foreground.png - Android
- adaptive-icon-background.png - Android
- favicon.png (48x48) - Web
```

### 2. **Splash Screen** (High Priority)
```
Current: splash-icon.png (generic)

Need:
- splash-icon.png (1284x1284) - PoultryCo logo on brand color
- Background color: #2B7A4B (brand green)
```

### 3. **In-App Assets** (Medium Priority)
```
Navigation Icons (24x24):
- home-icon.svg
- search-icon.svg
- messages-icon.svg
- tools-icon.svg
- profile-icon.svg

Status Icons (20x20):
- notification-icon.svg
- menu-icon.svg
- back-icon.svg
- edit-icon.svg
- settings-icon.svg

Feature Icons (40x40):
- calculator-icon.svg
- feed-icon.svg
- mortality-icon.svg
- formula-icon.svg
```

### 4. **Profile Placeholders** (Low Priority)
```
- avatar-placeholder.png (80x80)
- business-placeholder.png (80x80)
- product-placeholder.png (120x120)
```

---

## 🚀 Immediate Action Items

### Phase 1: Replace Placeholder Assets (Today)
```bash
# Copy existing brand assets to mobile app
cp docs/brand/logo/icon.png apps/mobile/assets/icon.png
cp docs/brand/logo/icon.png apps/mobile/assets/adaptive-icon.png
cp docs/brand/logo/icon.png apps/mobile/assets/favicon.png
cp docs/brand/logo/icon.png apps/mobile/assets/splash-icon.png
```

### Phase 2: Update app.config.js (Today)
```javascript
// Update splash screen config
splash: {
  image: "./assets/splash-icon.png",
  resizeMode: "contain",
  backgroundColor: "#2B7A4B"  // Brand green
}
```

### Phase 3: Create Design System Package (Week 1)
```
packages/design-system/
├── colors.ts          # Brand colors
├── typography.ts      # Font sizes, weights
├── spacing.ts         # Spacing scale
├── components/        # Reusable components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Avatar.tsx
│   └── Badge.tsx
└── icons/            # SVG icon components
```

### Phase 4: Build Screen Layouts (Week 1-2)
```
apps/mobile/src/screens/
├── HomeScreen.tsx           # Home feed
├── ProfileScreen.tsx        # Personal profile
├── BusinessProfileScreen.tsx # Business profile
├── SearchScreen.tsx         # Directory
├── MessagesScreen.tsx       # Chat list
└── ToolsScreen.tsx          # Tools & learning
```

---

## 📐 Layout Components to Build

### 1. **Bottom Navigation** (Priority 1)
```typescript
// apps/mobile/src/navigation/BottomTabNavigator.tsx
- 5 tabs: Home, Search, Messages, Tools, Profile
- Active state styling
- Icon + label
- Badge for notifications
```

### 2. **Profile Header** (Priority 1)
```typescript
// packages/ui/src/components/ProfileHeader.tsx
- Gradient background
- Avatar (80px)
- Name, role, badge
- Stats row
- Reusable for Personal & Business
```

### 3. **Market Widget** (Priority 2)
```typescript
// apps/mobile/src/components/MarketWidget.tsx
- Real-time price display
- Location-based data
- Refresh functionality
```

### 4. **Chat List Item** (Priority 2)
```typescript
// packages/ui/src/components/ChatListItem.tsx
- Avatar (50px)
- Name + badge
- Message preview
- Timestamp
- Unread indicator
```

### 5. **Tool Card** (Priority 2)
```typescript
// packages/ui/src/components/ToolCard.tsx
- Icon (40x40)
- Title
- Description
- Tap handler
```

### 6. **Search Bar** (Priority 1)
```typescript
// packages/ui/src/components/SearchBar.tsx
- Pill shape
- Icon
- Placeholder
- Clear button
```

### 7. **Tab Bar** (Priority 1)
```typescript
// packages/ui/src/components/TabBar.tsx
- Horizontal tabs
- Active state
- Smooth animation
```

---

## 🎯 Design Decisions from Wireframe

### Navigation Pattern
- **Bottom Tab Navigation** (5 tabs)
- Persistent across all screens
- Active state clearly visible
- Icons + labels for clarity

### Profile Strategy
- **Dual Profile Types**: Personal & Business
- Users can have multiple roles (Farmer + Vet)
- Trust scoring system
- Verification badges

### Communication
- **WhatsApp-style messaging**
- 1:1 chats, groups, broadcast
- Message requests for new connections
- Voice notes & media sharing

### Content Organization
- **Card-based layouts**
- Clear visual hierarchy
- Generous whitespace
- Touch-friendly targets (44px min)

### Color Usage
- **Green (#2B7A4B)**: Primary actions, active states
- **Navy (#1E3A5F)**: Business profiles, secondary
- **Orange (#E67E22)**: Alerts, highlights
- **Gray shades**: Text hierarchy

---

## 📊 Information Architecture

### Home Feed
```
Home
├── Market Prices Widget
├── Weather Alerts
├── Quick Actions (3-column grid)
├── Community Updates
└── Expert Q&A
```

### Profiles
```
Profile
├── Personal Profile
│   ├── Basic Info
│   ├── Farm Details
│   ├── Credentials
│   └── Activity
└── Business Profile
    ├── Company Info
    ├── Products
    ├── Service Areas
    └── Certifications
```

### Directory
```
Search
├── Universal Search
├── Filters (People, Business, Products)
├── Category Tags
└── Location-based Results
```

### Communication
```
Messages
├── Chats (1:1)
├── Groups
├── Broadcast Lists
└── Message Requests
```

### Tools
```
Tools
├── Calculators
│   ├── FCR
│   ├── Feed Projection
│   ├── Mortality
│   └── Formula Optimizer
└── Learning
    ├── Guides
    ├── Glossary
    └── Best Practices
```

---

## ✅ Next Steps

### Immediate (This Week)
1. ✅ Copy brand assets to mobile app
2. ⬜ Update app.config.js with brand colors
3. ⬜ Create design system package
4. ⬜ Build bottom navigation
5. ⬜ Create reusable UI components

### Short-term (Week 2)
1. ⬜ Build Home screen layout
2. ⬜ Build Profile screen layouts
3. ⬜ Implement search/directory
4. ⬜ Create messaging UI
5. ⬜ Build tools screens

### Medium-term (Week 3-4)
1. ⬜ Connect to Supabase
2. ⬜ Implement authentication
3. ⬜ Build real-time features
4. ⬜ Add data fetching
5. ⬜ Test on devices

---

## 📝 Notes

### Design Strengths
- ✅ Clear visual hierarchy
- ✅ Consistent component patterns
- ✅ Farmer-friendly interface
- ✅ Multi-language ready (Tamil support)
- ✅ Professional yet approachable

### Technical Considerations
- Use React Navigation for bottom tabs
- NativeWind for styling (Tailwind for RN)
- SVG icons for scalability
- AsyncStorage for offline data
- Supabase Realtime for live updates

### Accessibility
- Touch targets: 44x44px minimum
- Color contrast: WCAG AA compliant
- Font sizes: Readable on small screens
- Icons: Always paired with labels
- Voice-over support for screen readers

---

**Document created:** October 15, 2025  
**Last updated:** October 15, 2025  
**Status:** Ready for development

