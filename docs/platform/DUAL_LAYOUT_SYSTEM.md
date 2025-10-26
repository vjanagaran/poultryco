# LinkedIn-Style Dual Layout System Implementation

## Overview
PoultryCo now has a sophisticated dual-layout system that provides different experiences for guests (marketing) and authenticated users (platform), similar to LinkedIn's approach.

## Architecture

### 1. Two Distinct Experiences

#### Guest Experience (Marketing)
- **URL**: `/` (homepage)
- **Layout**: Marketing layout with header, footer
- **Header Navigation**:
  - Features
  - About
  - Contact
  - Blog
  - Sign in (ghost button)
  - Join now (primary button)

#### Authenticated Experience (Platform)
- **URL**: `/feed` (new homepage for logged-in users)
- **Layout**: Platform layout with sticky header, no footer
- **Header Navigation**:
  - Home 🏠 → `/feed`
  - Network 👥 → `/members`
  - Messages 💬 → `/messages`
  - Tools 🛠️ → `/tools`
  - Notifications 🔔
  - Profile avatar → `/me`
  - Sign out

### 2. Smart Homepage Routing

The homepage (`/`) automatically detects auth state:

**For Guests**: Shows landing page with marketing copy
**For Authenticated Users**: Redirects to `/feed`

This is handled by the `<HomepageRouter />` component:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function HomepageRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/feed'); // Redirect authenticated users
    }
  }, [user, loading, router]);

  return null;
}
```

### 3. File Structure

```
apps/web/src/
├── app/
│   ├── (marketing)/           # Guest routes with marketing layout
│   │   ├── layout.tsx          # Marketing header + footer
│   │   ├── page.tsx            # Homepage (redirects if authenticated)
│   │   ├── about/
│   │   ├── features/
│   │   ├── contact/
│   │   └── blog/
│   │
│   ├── (auth)/                 # Authentication routes (no layout)
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   └── (platform)/             # Authenticated routes with platform layout
│       ├── layout.tsx          # Platform header only
│       ├── feed/               # ✨ NEW - Main feed/home
│       ├── me/                 # Profile routes
│       ├── members/            # Network/directory
│       ├── messages/           # Messaging (coming soon)
│       ├── tools/              # Poultry tools (coming soon)
│       ├── notifications/      # Notifications (coming soon)
│       ├── search/             # Search (coming soon)
│       └── dashboard/          # Redirects to /feed
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Marketing header
│   │   ├── PlatformHeader.tsx  # ✨ NEW - Platform header
│   │   └── Footer.tsx          # Marketing footer
│   │
│   ├── feed/
│   │   └── FeedContent.tsx     # ✨ NEW - Feed/home content
│   │
│   └── HomepageRouter.tsx      # ✨ NEW - Smart routing
```

## Components

### PlatformHeader (`components/layout/PlatformHeader.tsx`)

LinkedIn-inspired header with:
- **Logo** → Links to `/feed`
- **Search bar** (desktop) → Focuses redirects to `/search`
- **Navigation** → Home, Network, Messages, Tools
- **Notifications icon** → Badge with unread count
- **Profile avatar** → Dropdown with "View Profile", "Settings", "Sign Out"
- **Mobile menu** → Hamburger with full nav

**Features**:
- Sticky positioning
- Real-time auth state
- Profile photo display
- Active route highlighting
- Responsive design
- Mobile-optimized menu

### FeedContent (`components/feed/FeedContent.tsx`)

Homepage feed with:

**Left Column (Main Feed)**:
- Market prices widget (Broiler, Feed, Eggs)
- Post creation box ("Share an update...")
- Feed posts with like/comment/share
- Photo/Problem/Article buttons

**Right Column (Sidebar)**:
- Quick Tools (FCR Calculator, Feed Projection, Profit Calculator)
- Community Stats (Members, States, Experts)
- Platform Status (Build progress: 65%)

**Inspired by wireframe**:
- Clean, card-based design
- Actionable widgets
- Real-time data display
- Community engagement focus

## User Flows

### 1. Guest Visits Homepage
```
Visit poultryco.net
  ↓
Sees marketing landing page
  ↓
Clicks "Join now"
  ↓
Registers with name, email, phone
  ↓
Profile created with slug
  ↓
Redirects to /welcome
  ↓
After welcome, redirects to /feed
```

### 2. Returning User Visits Homepage
```
Visit poultryco.net
  ↓
<HomepageRouter /> detects authentication
  ↓
Automatically redirects to /feed
  ↓
Sees personalized feed with market data
```

### 3. Direct URL Access
```
User clicks /feed (or /me, /members, etc.)
  ↓
Platform layout renders
  ↓
If not authenticated → Redirects to /login
  ↓
After login → Returns to original URL
```

## Comparison: LinkedIn vs PoultryCo

| Feature | LinkedIn | PoultryCo |
|---------|----------|-----------|
| **Guest Homepage** | Marketing landing | Marketing landing ✅ |
| **Authenticated Homepage** | Feed | Feed ✅ |
| **Header (Guest)** | About, Products, Sign in | Features, About, Sign in ✅ |
| **Header (Authenticated)** | Home, Network, Jobs, Messaging, Notifications, Me | Home, Network, Messages, Tools, Notifications, Me ✅ |
| **Search** | Prominent search bar | Prominent search bar ✅ |
| **Profile URL** | `/in/username` | `/me/username` ✅ |
| **Auto-redirect** | Yes | Yes ✅ |

## State Management

### AuthContext (`contexts/AuthContext.tsx`)
Provides:
- `user`: Current Supabase auth user
- `loading`: Auth loading state
- `signOut()`: Sign out function

### ProfileContext (`contexts/ProfileContext.tsx`)
Provides:
- `profile`: User profile data (name, photo, slug, etc.)
- `loading`: Profile loading state
- `fetchProfile()`: Refresh profile
- `updateProfile()`: Update profile fields

Both contexts wrap the entire app in `app/layout.tsx`:

```typescript
<AuthProvider>
  <ProfileContext>
    {children}
  </ProfileContext>
</AuthProvider>
```

## Route Protection

All routes under `(platform)/` automatically require authentication:

```typescript
// In platform layout or individual pages
const { user, loading } = useAuth();

useEffect(() => {
  if (!loading && !user) {
    router.push('/login');
  }
}, [user, loading, router]);
```

## Responsive Design

### Desktop
- Full navigation in header
- Search bar visible
- 2-column feed layout
- Sidebar with widgets

### Tablet
- Condensed navigation
- Search bar visible
- 2-column layout
- Reduced sidebar

### Mobile
- Hamburger menu
- Search redirects to dedicated page
- Single-column layout
- No sidebar (widgets scroll below)
- Bottom navigation (future)

## Features by Status

### ✅ Completed
- [x] Dual layout system (marketing/platform)
- [x] Smart homepage routing
- [x] Platform header with navigation
- [x] Feed page with market data
- [x] Auth state management
- [x] Profile state management
- [x] Responsive design
- [x] Route protection

### 🚧 In Progress
- [ ] Feed post creation
- [ ] Feed post interactions (like, comment, share)
- [ ] Real-time market data
- [ ] Actual search functionality

### 📋 Planned
- [ ] Messages/chat system
- [ ] Notifications system
- [ ] Poultry tools (FCR, Feed Projection, etc.)
- [ ] Bottom navigation for mobile
- [ ] Progressive Web App (PWA)
- [ ] Push notifications

## SEO & Performance

### Marketing Pages
- Server-side rendered (SSR)
- Static generation where possible
- Full SEO metadata
- Open Graph tags
- Twitter cards

### Platform Pages
- Client-side rendered (CSR) for interactivity
- Protected by authentication
- No SEO needed (logged-in only)
- Optimized for fast interactions

## Next Steps

1. **Complete Feed**:
   - Post creation modal
   - Rich text editor
   - Photo upload
   - Like/comment/share interactions

2. **Search Implementation**:
   - Members search
   - Business search
   - Product search
   - Filters (role, location, etc.)

3. **Messages System**:
   - Real-time chat
   - 1-on-1 conversations
   - Group conversations
   - File sharing

4. **Tools Development**:
   - FCR Calculator
   - Feed Projection
   - Mortality Calculator
   - Profit Calculator

5. **Mobile App Parity**:
   - Ensure web platform matches mobile wireframes
   - Add bottom navigation for mobile web
   - PWA installation prompt

## Testing Checklist

- [ ] Guest visits `/` → Sees landing page
- [ ] Guest clicks "Join now" → Registers → Redirects to feed
- [ ] Authenticated user visits `/` → Auto-redirects to `/feed`
- [ ] Click "Home" in nav → Goes to `/feed`
- [ ] Click "Network" → Goes to `/members`
- [ ] Click profile avatar → Goes to `/me`
- [ ] Click "Sign out" → Returns to `/` (marketing)
- [ ] Mobile menu works correctly
- [ ] Search bar focuses → Redirects to `/search`
- [ ] All routes protected by auth

## Documentation
- [Profile URL Structure](../profile/PROFILE_URL_STRUCTURE.md)
- [Authentication System](../website/AUTH_SYSTEM_COMPLETE.md)
- [Progressive Profile](../../PROFILE_SYSTEM_APPROVED.md)
- [Wireframes](../../wireframes/poultryco_wireframe.html)

