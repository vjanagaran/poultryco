# 📱 Stream (Social Feed) Integration - Complete Task List

**Date:** October 26, 2025  
**Feature:** Stream/Social Feed with Offline Support  
**Timeline:** 5-7 days  
**Priority:** High

---

## 🎯 Overview

Integrate the Stream frontend with the `posts` database system, adding full functionality for post creation, likes, comments, shares, and **offline capabilities** with smart caching.

### Key Features
- ✅ Post creation with @mentions and #hashtags
- ✅ Real-time feed updates
- ✅ Like/comment/share system
- ✅ **Offline post creation** (queued for sync)
- ✅ **Smart caching** (limited to X posts, rotating storage)
- ✅ **Cached @mentions** for offline use

---

## 📊 Database Schema Status

**Already Complete** ✅:
- `posts` table with all fields
- `post_likes` table with triggers
- `post_comments` table with nested replies
- `post_comment_likes` table
- `post_shares` table
- `post_views` table
- `post_tags` and `posts_tags` tables
- `post_reports` table (moderation)
- `post_bookmarks` table (save for later)

**All triggers and functions in place** ✅

---

## 🚀 PHASE 1: Backend Integration (2-3 days)

### Day 1: Post Creation & Database Connection

#### Task 1.1: Update streamUtils.ts
- [ ] Create `createPost()` function
  - Insert into `posts` table
  - Extract and save @mentions
  - Extract and save #hashtags
  - Upload images to CDN
  - Return created post with full details
- [ ] Create `updatePost()` function
- [ ] Create `deletePost()` function (soft delete)
- [ ] Add error handling and validation

#### Task 1.2: Fix PostCreationModal Integration
Current issues to fix:
- [ ] Remove mock `uploadPostImage()` - integrate with actual CDN upload
- [ ] Remove mock `searchUsers()` - integrate with profiles table
- [ ] Remove mock `parseContent()` - implement actual parsing
- [ ] Update `handleSubmit()` to use real database inserts
- [ ] Add proper error handling
- [ ] Add success toast notifications

#### Task 1.3: Hashtag System
- [ ] Create function to extract hashtags from content
- [ ] Insert hashtags into `post_tags` table
- [ ] Create junction records in `posts_tags` table
- [ ] Update tag `usage_count` on insert
- [ ] Handle tag slug generation
- [ ] Add tag autocomplete in post creation

#### Task 1.4: @Mention System
- [ ] Create function to extract mentions from content
- [ ] Search profiles table for mentioned users
- [ ] Store mentions metadata in post
- [ ] Create notifications for mentioned users
- [ ] Add mention autocomplete (already in UI)
- [ ] Handle invalid mentions gracefully

**Deliverable:** Posts can be created and stored in database with hashtags and mentions

---

### Day 2: Like, Comment, Share System

#### Task 2.1: Like Functionality
- [ ] Update PostCard to use real `post_likes` table
- [ ] Implement `likePost()` function
  - INSERT into `post_likes`
  - Handle duplicate (UPSERT)
  - Trigger increments `likes_count` automatically
- [ ] Implement `unlikePost()` function
  - DELETE from `post_likes`
  - Trigger decrements `likes_count` automatically
- [ ] Add optimistic UI updates
- [ ] Real-time like counter updates

#### Task 2.2: Comment System
- [ ] Update CommentSection to use `post_comments` table
- [ ] Implement `addComment()` function
  - INSERT into `post_comments`
  - Trigger increments `comments_count` automatically
  - Parse for @mentions in comments
  - Set `is_author_reply` flag
- [ ] Implement nested replies (parent_comment_id)
- [ ] Implement `deleteComment()` function
- [ ] Comment like functionality
  - INSERT/DELETE from `post_comment_likes`
  - Trigger updates `likes_count`

#### Task 2.3: Share/Repost System
- [ ] Create share modal component
- [ ] Implement `sharePost()` function
  - INSERT into `post_shares`
  - Optional share comment
  - Trigger increments `shares_count`
- [ ] Display shared posts in feed
- [ ] Show "shared by" attribution

#### Task 2.4: Save/Bookmark System
- [ ] Add bookmark button to PostCard
- [ ] Implement `bookmarkPost()` function
  - INSERT into `post_bookmarks`
  - Optional collection name
- [ ] Implement `unbookmarkPost()` function
- [ ] Create "Saved Posts" page/section

**Deliverable:** Full engagement system working (like, comment, share, save)

---

### Day 3: Real-time Updates & Feed Optimization

#### Task 3.1: Real-time Subscriptions
- [ ] Subscribe to INSERT on `posts` table
- [ ] Subscribe to UPDATE on `posts` (likes_count, comments_count)
- [ ] Subscribe to INSERT/DELETE on `post_likes`
- [ ] Subscribe to INSERT on `post_comments`
- [ ] Handle real-time UI updates (prepend new posts)
- [ ] Debounce rapid updates

#### Task 3.2: Feed Algorithm
Currently showing all public posts. Enhance:
- [ ] Show posts from connections first
- [ ] Show posts with hashtags user follows
- [ ] Show posts from same location/role
- [ ] Add "Sort by" options:
  - Latest (default)
  - Most liked
  - Most commented
  - Trending (likes + comments + recency)

#### Task 3.3: Infinite Scroll Optimization
- [ ] Fix pagination (currently working but can optimize)
- [ ] Add "Load More" button as fallback
- [ ] Implement virtual scrolling for long feeds (optional)
- [ ] Cache already-loaded posts

#### Task 3.4: Post Views Tracking
- [ ] Create intersection observer for post visibility
- [ ] INSERT into `post_views` when post is in viewport >2 seconds
- [ ] Track device type (mobile/desktop)
- [ ] Update `views_count` in posts table

**Deliverable:** Real-time, optimized feed with view tracking

---

## 💾 PHASE 2: Offline Capabilities (2-3 days)

### Day 4: Offline Storage Infrastructure

#### Task 4.1: Create streamOfflineService.ts
```typescript
// apps/web/src/lib/streamOfflineService.ts

interface StreamDB extends DBSchema {
  posts: {
    key: string; // post_id
    value: {
      id: string;
      author_id: string;
      content: string;
      post_type: string;
      media_urls: string[];
      visibility: string;
      likes_count: number;
      comments_count: number;
      shares_count: number;
      author: {
        id: string;
        full_name: string;
        profile_slug: string;
        profile_photo_url: string;
      };
      user_liked: boolean;
      user_saved: boolean;
      cached_at: number;
      priority: number; // For cache rotation
    };
    indexes: {
      'by-cached-at': number;
      'by-priority': number;
    };
  };
  
  pending_posts: {
    key: string; // temp_id
    value: {
      temp_id: string;
      content: string;
      post_type: string;
      visibility: string;
      media_files?: File[];
      mentions: string[]; // profile_slugs
      hashtags: string[];
      created_at: number;
      retry_count: number;
    };
    indexes: {
      'by-created-at': number;
    };
  };
  
  mention_cache: {
    key: string; // profile_slug
    value: {
      id: string;
      full_name: string;
      profile_slug: string;
      profile_photo_url: string;
      headline: string;
      last_used: number;
      use_count: number;
    };
    indexes: {
      'by-use-count': number;
      'by-last-used': number;
    };
  };
  
  hashtag_cache: {
    key: string; // tag_name
    value: {
      tag_name: string;
      tag_slug: string;
      usage_count: number;
      last_used: number;
    };
    indexes: {
      'by-usage-count': number;
      'by-last-used': number;
    };
  };
}
```

- [ ] Create IndexedDB database `poultryco_stream`
- [ ] Define object stores (posts, pending_posts, mention_cache, hashtag_cache)
- [ ] Add indexes for efficient queries
- [ ] Create helper functions for CRUD operations

#### Task 4.2: Smart Cache Strategy
**Cache Limits:**
- Max posts in cache: 100 (configurable)
- Max age: 7 days
- Rotation strategy: LRU + Priority Score

**Priority Scoring:**
```typescript
priority = (
  likes_count * 2 +
  comments_count * 3 +
  shares_count * 1.5 +
  (user_liked ? 10 : 0) +
  (user_saved ? 20 : 0) +
  (is_own_post ? 15 : 0) +
  recency_factor
)
```

- [ ] Implement `cachePost()` function
- [ ] Implement `getCachedPosts()` function
- [ ] Implement `evictOldPosts()` function (LRU)
- [ ] Implement `calculatePriority()` function
- [ ] Implement `rotateCacheSpace()` function

#### Task 4.3: Mention Cache for Offline
Cache frequently mentioned users:
- [ ] Track @mention usage frequency
- [ ] Cache top 50 most-mentioned users
- [ ] Update cache on each mention
- [ ] Provide cached suggestions offline
- [ ] Sync new mentions when online

#### Task 4.4: Hashtag Cache
Cache frequently used hashtags:
- [ ] Track hashtag usage frequency
- [ ] Cache top 50 hashtags
- [ ] Provide cached suggestions offline
- [ ] Sync new hashtags when online

**Deliverable:** Complete offline storage infrastructure

---

### Day 5: Offline Post Creation

#### Task 5.1: Offline Post Queue
- [ ] Detect offline status (`navigator.onLine`)
- [ ] Add post to `pending_posts` store when offline
- [ ] Generate temp_id for optimistic UI
- [ ] Display post in feed with "Pending" indicator
- [ ] Store media files as blobs in IndexedDB

#### Task 5.2: Optimistic UI Updates
- [ ] Add post to feed immediately (optimistic)
- [ ] Show "Posting..." or "Queued" indicator
- [ ] Gray out or add overlay to pending posts
- [ ] Prevent interactions on pending posts
- [ ] Update UI when post syncs successfully

#### Task 5.3: Background Sync
- [ ] Listen for `online` event
- [ ] Process `pending_posts` queue
- [ ] Upload media to CDN first
- [ ] Create post in database
- [ ] Update temp_id with real post_id
- [ ] Remove from pending queue
- [ ] Retry on failure (exponential backoff)

#### Task 5.4: Offline @Mentions
- [ ] Load cached mentions from `mention_cache`
- [ ] Show cached suggestions when typing @
- [ ] Mark as "offline cache" in dropdown
- [ ] Allow manual username entry if not cached
- [ ] Validate mentions when online

#### Task 5.5: Offline Media Handling
- [ ] Store selected images as blobs
- [ ] Generate thumbnail previews
- [ ] Upload when online
- [ ] Show upload progress
- [ ] Handle upload failures

**Deliverable:** Full offline post creation capability

---

### Day 6: Feed Offline Viewing

#### Task 6.1: Cache Feed on Load
- [ ] Cache last 50-100 posts on load
- [ ] Prioritize posts with high engagement
- [ ] Cache user's own posts always
- [ ] Cache saved posts always
- [ ] Evict low-priority posts when cache full

#### Task 6.2: Offline Feed Display
- [ ] Load cached posts when offline
- [ ] Show "Viewing cached posts" banner
- [ ] Disable actions that require network (like, comment)
- [ ] Allow reading cached posts
- [ ] Show cached post count

#### Task 6.3: Sync Indicator
- [ ] Show sync status in UI
  - "All synced" (green)
  - "X posts pending" (yellow)
  - "Offline - viewing cache" (gray)
- [ ] Show last sync timestamp
- [ ] Manual refresh button

#### Task 6.4: Cache Management UI
- [ ] Add settings for cache preferences
  - Max cached posts (50/100/200)
  - Max cache age (3/7/14 days)
  - Auto-cache saved posts (on/off)
- [ ] Show cache usage stats
- [ ] "Clear cache" button
- [ ] "Sync now" button

**Deliverable:** Offline feed viewing with cache management

---

## 🧪 PHASE 3: Testing & Polish (1 day)

### Day 7: Testing & Optimization

#### Task 7.1: End-to-End Testing
- [ ] Test post creation (online)
- [ ] Test post creation (offline → online sync)
- [ ] Test like/comment/share (online)
- [ ] Test like/comment/share (blocked offline with feedback)
- [ ] Test @mentions autocomplete
- [ ] Test #hashtags autocomplete
- [ ] Test real-time updates
- [ ] Test cache rotation
- [ ] Test offline feed viewing

#### Task 7.2: Edge Cases
- [ ] Very long posts (5000 chars)
- [ ] Posts with 10+ images
- [ ] Posts with 20+ mentions
- [ ] Posts with 20+ hashtags
- [ ] Rapid post creation
- [ ] Network interruption mid-upload
- [ ] Corrupted cache recovery

#### Task 7.3: Performance Optimization
- [ ] Optimize image uploads (compression)
- [ ] Batch database operations
- [ ] Debounce real-time updates
- [ ] Lazy load images in feed
- [ ] Virtual scrolling for long feeds
- [ ] Cache query optimization

#### Task 7.4: UI/UX Polish
- [ ] Loading states for all actions
- [ ] Error messages user-friendly
- [ ] Success toast notifications
- [ ] Smooth animations
- [ ] Responsive design verification
- [ ] Accessibility (keyboard navigation, ARIA labels)

**Deliverable:** Production-ready, tested Stream feature

---

## 📋 Implementation Checklist

### Pre-requisites ✅
- [x] Database schema complete (15_social_posts_system.sql)
- [x] UI components ready (StreamContent, PostCreationModal, PostCard)
- [x] CDN storage configured
- [x] Authentication working

### Phase 1: Backend Integration
- [ ] Post creation working
- [ ] Like system working
- [ ] Comment system working
- [ ] Share system working
- [ ] Bookmark system working
- [ ] @Mention system working
- [ ] #Hashtag system working
- [ ] Real-time updates working
- [ ] Feed algorithm implemented

### Phase 2: Offline Capabilities
- [ ] Offline storage created (streamOfflineService.ts)
- [ ] Smart cache strategy implemented
- [ ] Mention cache working
- [ ] Hashtag cache working
- [ ] Offline post creation working
- [ ] Background sync working
- [ ] Offline feed viewing working
- [ ] Cache management UI added

### Phase 3: Testing & Polish
- [ ] All features tested
- [ ] Edge cases handled
- [ ] Performance optimized
- [ ] UI/UX polished

---

## 🗂️ Files to Create/Update

### New Files
```
apps/web/src/lib/
├── streamOfflineService.ts        # NEW - Offline storage
├── streamSyncService.ts            # NEW - Background sync
└── streamUtils.ts                  # UPDATE - Add real functions

apps/web/src/components/stream/
├── ShareModal.tsx                  # NEW - Share post UI
├── CacheSettings.tsx               # NEW - Cache management
└── SyncIndicator.tsx               # NEW - Sync status display
```

### Update Files
```
apps/web/src/components/stream/
├── StreamContent.tsx               # UPDATE - Add offline support
├── PostCreationModal.tsx           # UPDATE - Fix mock functions
├── PostCard.tsx                    # UPDATE - Real like/comment
└── CommentSection.tsx              # UPDATE - Real database

apps/web/src/lib/
└── streamUtils.tsx                 # UPDATE - Implement all functions
```

---

## 📊 Cache Strategy Details

### Post Caching (Max 100 posts)

**Priority Scoring:**
```
High Priority (Always Cache):
- User's own posts
- Saved/bookmarked posts
- Posts with user interactions (liked/commented)

Medium Priority (Cache if space):
- Posts from connections
- Posts with high engagement
- Recent posts (<24 hours)

Low Priority (Rotate out first):
- Old posts (>7 days)
- Low engagement posts
- Public posts from non-connections
```

**Rotation Strategy:**
```
When cache reaches 100 posts:
1. Remove posts older than 7 days
2. Remove low-priority posts (score < threshold)
3. Keep minimum 20 most recent posts
4. Keep all user's own posts
5. Keep all saved posts
```

### Mention Cache (Max 50 users)

**Caching Strategy:**
```
Cache users when:
- User mentions them in a post
- User views their profile
- They appear in user's connections

Update cache:
- Increment use_count on mention
- Update last_used timestamp
- Evict least-used when cache full
```

### Hashtag Cache (Max 50 tags)

**Caching Strategy:**
```
Cache hashtags when:
- User uses in a post
- User clicks on hashtag
- Hashtag is trending

Update cache:
- Increment usage_count
- Update last_used timestamp
- Sync with server periodically
```

---

## 🎯 Success Metrics

### Performance
- Post creation: < 2 seconds
- Like action: < 500ms
- Comment submission: < 1 second
- Feed load: < 2 seconds (20 posts)
- Offline sync: < 5 seconds per post

### Cache Efficiency
- Cache hit rate: > 80% (offline)
- Average cache size: ~50-60 posts
- Mention cache accuracy: > 90%
- Hashtag cache coverage: > 85%

### User Experience
- Offline post creation success: > 95%
- Background sync success: > 98%
- Zero data loss on network interruption
- Smooth offline → online transition

---

## 🚨 Risk Mitigation

### Data Loss Prevention
- Queue all posts locally before upload
- Retry failed uploads with exponential backoff
- Show clear status indicators
- Allow manual retry

### Storage Limits
- Monitor IndexedDB quota
- Implement graceful degradation
- Allow user to clear cache
- Warn when approaching limits

### Sync Conflicts
- Use server timestamp as source of truth
- Handle duplicate posts (temp_id vs real_id)
- Merge offline and online changes carefully

---

## 📝 Notes

### Offline Limitations
Users cannot perform these actions offline:
- Like posts (requires database write)
- Comment on posts (requires database write)
- Share posts (requires database write)
- View other users' profiles
- Search for new users/hashtags

These will show a toast: "This action requires an internet connection"

### Offline Capabilities
Users CAN do these offline:
- Create posts (queued for sync)
- View cached posts
- Read cached comments
- Use cached @mention suggestions
- Use cached #hashtag suggestions
- Edit draft posts

---

## 📚 Related Documentation

- `MESSAGING_SYSTEM.md` - Similar offline patterns
- `offlineStorageService.ts` - Messaging offline service (reference)
- `mediaStorageService.ts` - CDN upload patterns

---

**Created:** October 26, 2025  
**Estimated Time:** 5-7 days  
**Status:** Ready to start  
**Priority:** High (2% remaining for web platform completion)

---

🚀 **Let's make Stream fully functional with best-in-class offline support!**

