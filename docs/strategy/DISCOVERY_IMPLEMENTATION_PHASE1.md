# 🚀 DISCOVERY V2 - IMMEDIATE IMPLEMENTATION GUIDE

**Date:** October 26, 2025  
**Phase:** 1 (Week 1-2)  
**Priority:** CRITICAL - Product-Led Growth Foundation

---

## 🎯 WHAT WE'RE BUILDING (Phase 1)

### 5 Critical Features:

1. **Google Places API Integration** → Standardized locations
2. **Connection + Follow System** → LinkedIn-style networking
3. **Updated Navigation** → Discover vs. Tools separation
4. **Product Taxonomy (3-level)** → Better product discovery
5. **Business Type Taxonomy** → Industry-specific categories

---

## 1️⃣ GOOGLE PLACES API INTEGRATION

### Setup (15 minutes)

```bash
# 1. Get API key from Google Cloud Console
https://console.cloud.google.com/apis/credentials

# 2. Enable APIs:
- Places API
- Geocoding API
- Maps JavaScript API

# 3. Add to .env.local
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key_here
```

### Install Package

```bash
npm install @googlemaps/js-api-loader
```

### Create Hook

**File:** `apps/web/src/hooks/useGooglePlaces.ts`

```typescript
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface PlaceResult {
  place_id: string;
  formatted_address: string;
  address_components: google.maps.GeocoderAddressComponent[];
  geometry: {
    location: google.maps.LatLng;
  };
}

interface StandardizedLocation {
  place_id: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  postal_code?: string;
  formatted_address: string;
  coordinates: { lat: number; lng: number };
}

export function useGooglePlaces() {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (inputRef.current) {
        const autocompleteInstance = new google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ['(cities)'], // Only cities
            componentRestrictions: { country: 'in' }, // India only
            fields: ['place_id', 'formatted_address', 'address_components', 'geometry']
          }
        );

        setAutocomplete(autocompleteInstance);
      }
    });
  }, []);

  const extractLocation = (place: PlaceResult): StandardizedLocation => {
    const components = place.address_components;
    
    const getComponent = (type: string) => {
      const comp = components.find(c => c.types.includes(type));
      return comp?.long_name || '';
    };

    return {
      place_id: place.place_id,
      city: getComponent('locality') || getComponent('administrative_area_level_3'),
      district: getComponent('administrative_area_level_3'),
      state: getComponent('administrative_area_level_1'),
      country: getComponent('country'),
      postal_code: getComponent('postal_code'),
      formatted_address: place.formatted_address,
      coordinates: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }
    };
  };

  return { autocomplete, inputRef, extractLocation };
}
```

### Use in Profile Form

```typescript
import { useGooglePlaces } from '@/hooks/useGooglePlaces';

function ProfileForm() {
  const { autocomplete, inputRef, extractLocation } = useGooglePlaces();
  const [location, setLocation] = useState<StandardizedLocation | null>(null);

  useEffect(() => {
    if (autocomplete) {
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place) {
          const standardized = extractLocation(place as any);
          setLocation(standardized);
          
          // Save to profile
          updateProfile({
            location_place_id: standardized.place_id,
            location_city: standardized.city,
            location_state: standardized.state,
            location_coordinates: standardized.coordinates
          });
        }
      });
    }
  }, [autocomplete]);

  return (
    <div>
      <label>Location</label>
      <input
        ref={inputRef}
        type="text"
        placeholder="Start typing your city..."
        className="form-input"
      />
    </div>
  );
}
```

---

## 2️⃣ CONNECTION + FOLLOW SYSTEM

### Database Migration

**File:** `supabase/migrations/24_connection_follow_system.sql`

```sql
-- Connections Table (Mutual)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  requested_by UUID NOT NULL REFERENCES profiles(id),
  requested_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  
  CONSTRAINT connections_different_users CHECK (user_id_1 != user_id_2),
  CONSTRAINT connections_ordered CHECK (user_id_1 < user_id_2),
  UNIQUE(user_id_1, user_id_2)
);

-- Follows Table (One-way)
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  followed_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT follows_different_users CHECK (follower_id != following_id),
  UNIQUE(follower_id, following_id)
);

-- Indexes
CREATE INDEX idx_connections_user1 ON connections(user_id_1) WHERE status = 'accepted';
CREATE INDEX idx_connections_user2 ON connections(user_id_2) WHERE status = 'accepted';
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- Functions
CREATE OR REPLACE FUNCTION get_connection_status(user1_id UUID, user2_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  result VARCHAR;
BEGIN
  SELECT status INTO result
  FROM connections
  WHERE (user_id_1 = LEAST(user1_id, user2_id) AND user_id_2 = GREATEST(user1_id, user2_id));
  
  RETURN COALESCE(result, 'none');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_following(follower_id_param UUID, following_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM follows 
    WHERE follower_id = follower_id_param 
    AND following_id = following_id_param
  );
END;
$$ LANGUAGE plpgsql;

-- Materialized view for stats
CREATE MATERIALIZED VIEW profile_network_stats AS
SELECT 
  p.id as profile_id,
  COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'accepted') as connections_count,
  COUNT(DISTINCT f1.follower_id) as followers_count,
  COUNT(DISTINCT f2.following_id) as following_count
FROM profiles p
LEFT JOIN connections c ON ((c.user_id_1 = p.id OR c.user_id_2 = p.id) AND c.status = 'accepted')
LEFT JOIN follows f1 ON f1.following_id = p.id
LEFT JOIN follows f2 ON f2.follower_id = p.id
GROUP BY p.id;

CREATE UNIQUE INDEX ON profile_network_stats(profile_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_network_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY profile_network_stats;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Connections: Users can see their own connections
CREATE POLICY connections_view_policy ON connections
  FOR SELECT USING (
    auth.uid() = user_id_1 OR 
    auth.uid() = user_id_2
  );

-- Follows: Anyone can see follows
CREATE POLICY follows_view_policy ON follows
  FOR SELECT USING (true);

-- Insert policies
CREATE POLICY connections_insert_policy ON connections
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

CREATE POLICY follows_insert_policy ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);
```

### API Routes

**File:** `apps/web/src/app/api/connections/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { user } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { targetUserId } = await request.json();
  
  // Create connection request
  const { data, error } = await supabase.rpc('send_connection_request', {
    sender_id: user.id,
    receiver_id: targetUserId
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

### UI Components

**File:** `apps/web/src/components/profile/ConnectionButton.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserPlus, Check, Clock, X } from 'lucide-react';

interface ConnectionButtonProps {
  targetUserId: string;
  currentUserId: string;
}

export function ConnectionButton({ targetUserId, currentUserId }: ConnectionButtonProps) {
  const [status, setStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted'>('none');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [targetUserId]);

  const fetchStatus = async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc('get_connection_status', {
      user1_id: currentUserId,
      user2_id: targetUserId
    });
    setStatus(data || 'none');
  };

  const sendRequest = async () => {
    setLoading(true);
    const response = await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId })
    });
    
    if (response.ok) {
      setStatus('pending_sent');
    }
    setLoading(false);
  };

  if (status === 'accepted') {
    return (
      <button className="btn-secondary">
        <Check className="w-4 h-4" />
        Connected
      </button>
    );
  }

  if (status === 'pending_sent') {
    return (
      <button className="btn-secondary" disabled>
        <Clock className="w-4 h-4" />
        Pending
      </button>
    );
  }

  return (
    <button 
      className="btn-primary" 
      onClick={sendRequest}
      disabled={loading}
    >
      <UserPlus className="w-4 h-4" />
      Connect
    </button>
  );
}
```

**File:** `apps/web/src/components/profile/FollowButton.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Check } from 'lucide-react';

export function FollowButton({ targetUserId, currentUserId }: { targetUserId: string; currentUserId: string }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [targetUserId]);

  const checkFollowStatus = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
      .single();
    
    setIsFollowing(!!data);
  };

  const toggleFollow = async () => {
    setLoading(true);
    const supabase = createClient();

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);
      setIsFollowing(false);
    } else {
      await supabase
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId });
      setIsFollowing(true);
    }
    
    setLoading(false);
  };

  return (
    <button 
      className={isFollowing ? 'btn-secondary' : 'btn-outline'}
      onClick={toggleFollow}
      disabled={loading}
    >
      {isFollowing ? (
        <><Check className="w-4 h-4" /> Following</>
      ) : (
        <><Plus className="w-4 h-4" /> Follow</>
      )}
    </button>
  );
}
```

---

## 3️⃣ NAVIGATION UPDATE

### Header Component

**File:** `apps/web/src/components/layout/PlatformHeader.tsx` (Update)

```typescript
<nav className="flex items-center gap-6">
  <Link href="/home">Home</Link>
  
  {/* Discover Dropdown */}
  <DiscoverMenu />
  
  <Link href="/stream">Stream</Link>
  <Link href="/messages">Messages</Link>
  
  {/* Tools Dropdown */}
  <ToolsMenu />
  
  <ProfileDropdown />
</nav>
```

**File:** `apps/web/src/components/layout/DiscoverMenu.tsx` (New)

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export function DiscoverMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        className="flex items-center gap-1 hover:text-green-600"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        Discover
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-lg shadow-xl border border-gray-200 p-6 grid grid-cols-3 gap-6 z-50"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Network */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              👥 Network
            </h3>
            <ul className="space-y-2">
              <li><Link href="/discover/members" className="text-sm hover:text-green-600">Members</Link></li>
              <li><Link href="/discover/members?role=professional" className="text-sm hover:text-green-600">Professionals</Link></li>
              <li><Link href="/me/connections" className="text-sm hover:text-green-600">Connections</Link></li>
            </ul>
          </div>

          {/* Business */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🏢 Business
            </h3>
            <ul className="space-y-2">
              <li><Link href="/discover/businesses" className="text-sm hover:text-green-600">Companies</Link></li>
              <li><Link href="/discover/businesses?type=farm" className="text-sm hover:text-green-600">Farms</Link></li>
              <li><Link href="/discover/businesses?type=feed_mill" className="text-sm hover:text-green-600">Feed Mills</Link></li>
            </ul>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📦 Marketplace
            </h3>
            <ul className="space-y-2">
              <li><Link href="/discover/products" className="text-sm hover:text-green-600">Products</Link></li>
              <li><Link href="/discover/products?category=feed" className="text-sm hover:text-green-600">Feed & Nutrition</Link></li>
              <li><Link href="/discover/products?category=equipment" className="text-sm hover:text-green-600">Equipment</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              🏛️ Community
            </h3>
            <ul className="space-y-2">
              <li><Link href="/discover/organizations" className="text-sm hover:text-green-600">Organizations</Link></li>
              <li><Link href="/discover/organizations?type=association" className="text-sm hover:text-green-600">Associations</Link></li>
            </ul>
          </div>

          {/* Events */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              📅 Events
            </h3>
            <ul className="space-y-2">
              <li><Link href="/discover/events" className="text-sm hover:text-green-600">Webinars</Link></li>
              <li><Link href="/discover/events?type=conference" className="text-sm hover:text-green-600">Conferences</Link></li>
            </ul>
          </div>

          {/* Jobs */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              💼 Jobs
            </h3>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="text-sm hover:text-green-600">Job Board</Link></li>
              <li><Link href="/jobs/post" className="text-sm hover:text-green-600">Post a Job</Link></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## ⏱️ ESTIMATED TIME

| Task | Time | Priority |
|------|------|----------|
| Google Places API | 4 hours | HIGH |
| Connection System DB | 2 hours | HIGH |
| Connection UI Components | 3 hours | HIGH |
| Follow System | 2 hours | HIGH |
| Navigation Update | 3 hours | MEDIUM |
| Product Taxonomy | 4 hours | MEDIUM |
| Business Types | 2 hours | MEDIUM |

**Total: ~20 hours (2.5 days with 2 developers)**

---

## ✅ CHECKLIST

### Week 1
- [ ] Google Places API setup
- [ ] Location input component
- [ ] Connection system database
- [ ] Connection button component
- [ ] Follow button component
- [ ] Network stats display

### Week 2
- [ ] Navigation update (Discover/Tools split)
- [ ] Product taxonomy seed data
- [ ] Business type taxonomy
- [ ] Mobile responsive testing
- [ ] Documentation update

---

**Let's start with Google Places API and Connection System - these will have the biggest impact on user experience and growth!** 🚀
