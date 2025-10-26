# Profile URL Structure Implementation

## Overview
PoultryCo now implements LinkedIn-style profile URLs with proper slug-based routing for personal, business, and organization profiles.

## URL Structure

### Personal Profiles
- **Pattern**: `https://www.poultryco.net/me/<slug>`
- **Example**: `https://www.poultryco.net/me/janagaran-varadharaj-tamil-nadu`
- **My Profile**: `https://www.poultryco.net/me` (redirects to own profile for editing)

### Business Profiles (Future)
- **Pattern**: `https://www.poultryco.net/com/<slug>`
- **Example**: `https://www.poultryco.net/com/venky-poultry-farm`

### Organization Profiles (Future)
- **Pattern**: `https://www.poultryco.net/org/<slug>`
- **Example**: `https://www.poultryco.net/org/necc-india`

## Implementation

### 1. Profile Slug Generation
When a user registers, a unique slug is automatically generated:

```typescript
// Generate from full name: "Janagaran Varadharaj" → "janagaran-varadharaj"
function generateSlug(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}
```

**Uniqueness**: If slug exists, append counter (`janagaran-varadharaj-1`, `janagaran-varadharaj-2`, etc.)

### 2. Profile Creation During Registration
Profile is automatically created with:
- `id`: User's auth ID
- `full_name`: From registration form
- `email`: From registration form
- `phone_number`: From registration form
- `whatsapp_number`: Same as phone
- `profile_slug`: Unique generated slug
- `profile_type`: 'personal'
- `country`: 'India' (default, can be updated)

### 3. Routes

#### `/me` (Own Profile)
**File**: `apps/web/src/app/(platform)/me/page.tsx`
- Shows current user's profile
- Always editable
- Fetches by user ID

#### `/me/[slug]` (Other's Profile)
**File**: `apps/web/src/app/(platform)/me/[slug]/page.tsx`
- Shows profile by slug
- Read-only (unless it's your own profile)
- Fetches by `profile_slug`

### 4. ProfileView Component
**File**: `apps/web/src/components/profile/ProfileView.tsx`

```typescript
interface ProfileViewProps {
  profileSlug?: string;
  isOwnProfile: boolean;
}

export function ProfileView({ profileSlug, isOwnProfile }: ProfileViewProps) {
  // If isOwnProfile=true, fetch by user ID
  // If isOwnProfile=false, fetch by profileSlug
  // Show edit buttons only if isOwner=true
}
```

### 5. Profile Sections
All sections support:
- **View Mode**: Clean, professional display
- **Edit Mode**: Inline editing with modal forms (only for profile owner)

**Sections**:
- Profile Header (photo, name, headline, location, URL)
- Profile Strength Card (only visible to owner)
- About Section
- Roles Section
- Experience Section
- Education Section
- Skills Section

## User Flow

### Registration
1. User signs up with name, email, phone, password
2. System creates auth user
3. System generates unique slug
4. System creates profile record
5. User redirected to `/welcome`

### Viewing Own Profile
1. User clicks "My Profile" → `/me`
2. System fetches profile by user ID
3. Profile displayed with edit buttons
4. User can click any section to edit

### Viewing Others' Profiles
1. User finds member in directory
2. Clicks on profile card → `/me/janagaran-varadharaj`
3. System fetches profile by slug
4. Profile displayed (read-only)
5. If logged-in user owns profile, edit buttons appear

### Sharing Profile
- Copy link: `https://www.poultryco.net/me/janagaran-varadharaj`
- Share on WhatsApp, LinkedIn, etc.
- Works even when not logged in (public profiles)

## Database Schema

### `profiles` Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  profile_slug TEXT UNIQUE NOT NULL,
  profile_type TEXT CHECK (profile_type IN ('personal', 'business', 'organization')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  whatsapp_number TEXT,
  headline TEXT,
  bio TEXT,
  profile_photo_url TEXT,
  location_city TEXT,
  location_district TEXT,
  location_state TEXT,
  country TEXT DEFAULT 'India',
  -- ... other fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX profiles_slug_idx ON profiles(profile_slug);
```

## Features

### ✅ Completed
- [x] Automatic slug generation from name
- [x] Unique slug enforcement
- [x] Profile creation during registration
- [x] `/me` route for own profile
- [x] `/me/[slug]` route for viewing others
- [x] Dynamic profile fetching (by ID or slug)
- [x] Owner detection (show edit buttons only to owner)
- [x] Profile URL display in header
- [x] Progressive profile system (no mandatory wizard)

### 🚧 In Progress
- [ ] Profile photo upload to Supabase Storage
- [ ] Experience/Education/Skills CRUD
- [ ] RLS policies for profile privacy
- [ ] Profile strength calculation
- [ ] Smart suggestions for profile completion

### 📋 Planned
- [ ] Business profile routes (`/com/[slug]`)
- [ ] Organization profile routes (`/org/[slug]`)
- [ ] Custom slug editing (change username)
- [ ] Profile verification badges
- [ ] Profile analytics (views, searches)

## SEO & Metadata

Each profile route generates dynamic metadata:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await fetchProfileBySlug(slug);

  return {
    title: `${profile.full_name} | PoultryCo`,
    description: profile.headline || `${profile.full_name}'s profile on PoultryCo`,
    openGraph: {
      title: profile.full_name,
      description: profile.headline,
      images: [profile.profile_photo_url],
    },
  };
}
```

## Testing

### Manual Test Cases
1. **Register new user "Test User"**
   - ✅ Profile created with slug `test-user`
   - ✅ Accessible at `/me/test-user`

2. **Register another "Test User"**
   - ✅ Profile created with slug `test-user-1`
   - ✅ No slug conflicts

3. **View own profile**
   - ✅ Go to `/me`
   - ✅ See edit buttons
   - ✅ See profile strength card

4. **View someone else's profile**
   - ✅ Go to `/me/janagaran-varadharaj`
   - ✅ No edit buttons
   - ✅ No profile strength card

5. **Share profile link**
   - ✅ Copy `/me/test-user`
   - ✅ Open in incognito (not logged in)
   - ✅ Profile visible

## Next Steps

1. **Deploy to production**
   - Push to GitHub
   - Vercel will auto-deploy
   - Test live URLs

2. **Complete profile sections**
   - Implement photo upload
   - Add experience CRUD
   - Add education CRUD
   - Add skills CRUD

3. **Add privacy controls**
   - Public/private toggle
   - Control what's visible
   - RLS policies

4. **Business/Org profiles**
   - Create `/com/[slug]` routes
   - Create `/org/[slug]` routes
   - Different profile schema

## Related Documentation
- [Profile System Specification](../PROFILE_SYSTEM_SPECIFICATION.md)
- [Progressive Profile Design](../PROFILE_SYSTEM_APPROVED.md)
- [Authentication System](../website/AUTH_SYSTEM_COMPLETE.md)

