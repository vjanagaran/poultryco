/**
 * Stream Offline Storage Service
 * 
 * Handles offline capabilities for Stream (Social Feed)
 * - Cache posts (max 100, LRU rotation)
 * - Queue posts created offline
 * - Cache frequently used @mentions
 * - Cache frequently used #hashtags
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// =====================================================
// INDEXEDDB SCHEMA
// =====================================================

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
      views_count: number;
      created_at: string;
      author: {
        id: string;
        full_name: string;
        profile_slug: string;
        profile_photo_url: string | null;
        headline: string | null;
      };
      user_liked: boolean;
      user_saved: boolean;
      cached_at: number;
      priority: number;
    };
    indexes: {
      'by-cached-at': number;
      'by-priority': number;
      'by-created-at': string;
    };
  };
  
  pending_posts: {
    key: string; // temp_id
    value: {
      temp_id: string;
      content: string;
      post_type: string;
      visibility: string;
      media_urls: string[]; // Blob URLs for preview
      media_files: File[];
      mentions: string[]; // profile_slugs
      hashtags: string[];
      problem_category?: string;
      problem_urgency?: string;
      article_title?: string;
      created_at: number;
      retry_count: number;
      last_retry: number;
      error?: string;
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
      profile_photo_url: string | null;
      headline: string | null;
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

// =====================================================
// CONFIGURATION
// =====================================================

const DB_NAME = 'poultryco_stream';
const DB_VERSION = 1;
const MAX_CACHED_POSTS = 100; // Configurable
const MAX_POST_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_MENTIONS = 50;
const MAX_HASHTAGS = 50;

let dbInstance: IDBPDatabase<StreamDB> | null = null;

// =====================================================
// DATABASE INITIALIZATION
// =====================================================

async function getDB(): Promise<IDBPDatabase<StreamDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<StreamDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Posts store
      if (!db.objectStoreNames.contains('posts')) {
        const postsStore = db.createObjectStore('posts', { keyPath: 'id' });
        postsStore.createIndex('by-cached-at', 'cached_at');
        postsStore.createIndex('by-priority', 'priority');
        postsStore.createIndex('by-created-at', 'created_at');
      }
      
      // Pending posts store
      if (!db.objectStoreNames.contains('pending_posts')) {
        const pendingStore = db.createObjectStore('pending_posts', { keyPath: 'temp_id' });
        pendingStore.createIndex('by-created-at', 'created_at');
      }
      
      // Mention cache store
      if (!db.objectStoreNames.contains('mention_cache')) {
        const mentionStore = db.createObjectStore('mention_cache', { keyPath: 'profile_slug' });
        mentionStore.createIndex('by-use-count', 'use_count');
        mentionStore.createIndex('by-last-used', 'last_used');
      }
      
      // Hashtag cache store
      if (!db.objectStoreNames.contains('hashtag_cache')) {
        const hashtagStore = db.createObjectStore('hashtag_cache', { keyPath: 'tag_name' });
        hashtagStore.createIndex('by-usage-count', 'usage_count');
        hashtagStore.createIndex('by-last-used', 'last_used');
      }
    },
  });
  
  return dbInstance;
}

// =====================================================
// PRIORITY CALCULATION
// =====================================================

function calculatePriority(post: any): number {
  const isOwn = post.user_id === post.author_id; // Will be set by caller
  const recencyFactor = Date.now() - new Date(post.created_at).getTime();
  const recencyScore = Math.max(0, 100 - (recencyFactor / (24 * 60 * 60 * 1000))); // 0-100 based on age
  
  return (
    post.likes_count * 2 +
    post.comments_count * 3 +
    post.shares_count * 1.5 +
    (post.user_liked ? 10 : 0) +
    (post.user_saved ? 20 : 0) +
    (isOwn ? 15 : 0) +
    recencyScore
  );
}

// =====================================================
// POST CACHING
// =====================================================

/**
 * Cache a post
 */
export async function cachePost(post: any): Promise<void> {
  const db = await getDB();
  
  await db.put('posts', {
    ...post,
    cached_at: Date.now(),
    priority: calculatePriority(post),
  });
  
  // Check if cache needs rotation
  await rotateCacheSpace();
}

/**
 * Cache multiple posts
 */
export async function cachePosts(posts: any[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('posts', 'readwrite');
  
  await Promise.all([
    ...posts.map((post) =>
      tx.store.put({
        ...post,
        cached_at: Date.now(),
        priority: calculatePriority(post),
      })
    ),
    tx.done,
  ]);
  
  await rotateCacheSpace();
}

/**
 * Get cached posts
 */
export async function getCachedPosts(limit: number = 20): Promise<any[]> {
  const db = await getDB();
  const tx = db.transaction('posts');
  const index = tx.store.index('by-created-at');
  
  const posts = await index.getAll();
  return posts.reverse().slice(0, limit); // Most recent first
}

/**
 * Delete cached post
 */
export async function deleteCachedPost(postId: string): Promise<void> {
  const db = await getDB();
  await db.delete('posts', postId);
}

/**
 * Rotate cache space (evict old/low-priority posts)
 */
async function rotateCacheSpace(): Promise<void> {
  const db = await getDB();
  const allPosts = await db.getAll('posts');
  
  if (allPosts.length <= MAX_CACHED_POSTS) return;
  
  const now = Date.now();
  
  // Sort by priority (lowest first)
  const sorted = allPosts.sort((a, b) => {
    // Always keep user's saved posts
    if (a.user_saved && !b.user_saved) return 1;
    if (!a.user_saved && b.user_saved) return -1;
    
    // Then by priority
    return a.priority - b.priority;
  });
  
  // Calculate how many to remove
  const toRemove = allPosts.length - MAX_CACHED_POSTS;
  const postsToDelete: string[] = [];
  
  for (let i = 0; i < toRemove; i++) {
    const post = sorted[i];
    
    // Don't delete saved posts
    if (post.user_saved) continue;
    
    // Don't delete very recent posts (< 24 hours)
    if (now - new Date(post.created_at).getTime() < 24 * 60 * 60 * 1000) continue;
    
    postsToDelete.push(post.id);
  }
  
  // Delete low-priority posts
  const tx = db.transaction('posts', 'readwrite');
  await Promise.all([
    ...postsToDelete.map((id) => tx.store.delete(id)),
    tx.done,
  ]);
}

/**
 * Clear old cached posts (> 7 days)
 */
export async function clearOldPosts(): Promise<void> {
  const db = await getDB();
  const allPosts = await db.getAll('posts');
  const cutoff = Date.now() - MAX_POST_AGE;
  
  const oldPosts = allPosts.filter((post) => post.cached_at < cutoff && !post.user_saved);
  
  const tx = db.transaction('posts', 'readwrite');
  await Promise.all([
    ...oldPosts.map((post) => tx.store.delete(post.id)),
    tx.done,
  ]);
}

// =====================================================
// PENDING POSTS (OFFLINE QUEUE)
// =====================================================

/**
 * Add post to pending queue
 */
export async function addPendingPost(postData: {
  content: string;
  post_type: string;
  visibility: string;
  media_files?: File[];
  problem_category?: string;
  problem_urgency?: string;
  article_title?: string;
}): Promise<string> {
  const db = await getDB();
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create blob URLs for preview
  const mediaUrls = postData.media_files?.map((file) => URL.createObjectURL(file)) || [];
  
  await db.put('pending_posts', {
    temp_id: tempId,
    content: postData.content,
    post_type: postData.post_type,
    visibility: postData.visibility,
    media_urls: mediaUrls,
    media_files: postData.media_files || [],
    mentions: [], // Will be extracted from content
    hashtags: [], // Will be extracted from content
    problem_category: postData.problem_category,
    problem_urgency: postData.problem_urgency,
    article_title: postData.article_title,
    created_at: Date.now(),
    retry_count: 0,
    last_retry: 0,
  });
  
  return tempId;
}

/**
 * Get all pending posts
 */
export async function getPendingPosts(): Promise<any[]> {
  const db = await getDB();
  return await db.getAll('pending_posts');
}

/**
 * Remove pending post
 */
export async function removePendingPost(tempId: string): Promise<void> {
  const db = await getDB();
  await db.delete('pending_posts', tempId);
}

/**
 * Update pending post retry
 */
export async function updatePendingPostRetry(tempId: string, error?: string): Promise<void> {
  const db = await getDB();
  const post = await db.get('pending_posts', tempId);
  
  if (post) {
    await db.put('pending_posts', {
      ...post,
      retry_count: post.retry_count + 1,
      last_retry: Date.now(),
      error,
    });
  }
}

// =====================================================
// MENTION CACHE
// =====================================================

/**
 * Cache a mention
 */
export async function cacheMention(profile: {
  id: string;
  full_name: string;
  profile_slug: string;
  profile_photo_url: string | null;
  headline: string | null;
}): Promise<void> {
  const db = await getDB();
  
  const existing = await db.get('mention_cache', profile.profile_slug);
  
  await db.put('mention_cache', {
    ...profile,
    last_used: Date.now(),
    use_count: (existing?.use_count || 0) + 1,
  });
  
  // Evict if over limit
  await evictOldMentions();
}

/**
 * Get cached mentions
 */
export async function getCachedMentions(query?: string): Promise<any[]> {
  const db = await getDB();
  const allMentions = await db.getAll('mention_cache');
  
  // Sort by use count
  const sorted = allMentions.sort((a, b) => b.use_count - a.use_count);
  
  if (query) {
    return sorted.filter(
      (m) =>
        m.full_name.toLowerCase().includes(query.toLowerCase()) ||
        m.profile_slug.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  return sorted;
}

/**
 * Evict old mentions
 */
async function evictOldMentions(): Promise<void> {
  const db = await getDB();
  const allMentions = await db.getAll('mention_cache');
  
  if (allMentions.length <= MAX_MENTIONS) return;
  
  // Sort by use count (lowest first)
  const sorted = allMentions.sort((a, b) => a.use_count - b.use_count);
  
  const toRemove = allMentions.length - MAX_MENTIONS;
  const tx = db.transaction('mention_cache', 'readwrite');
  
  await Promise.all([
    ...sorted.slice(0, toRemove).map((m) => tx.store.delete(m.profile_slug)),
    tx.done,
  ]);
}

// =====================================================
// HASHTAG CACHE
// =====================================================

/**
 * Cache a hashtag
 */
export async function cacheHashtag(tag: string): Promise<void> {
  const db = await getDB();
  
  const existing = await db.get('hashtag_cache', tag.toLowerCase());
  
  await db.put('hashtag_cache', {
    tag_name: tag.toLowerCase(),
    tag_slug: tag.toLowerCase().replace(/[^a-z0-9]/g, ''),
    usage_count: (existing?.usage_count || 0) + 1,
    last_used: Date.now(),
  });
  
  // Evict if over limit
  await evictOldHashtags();
}

/**
 * Get cached hashtags
 */
export async function getCachedHashtags(query?: string): Promise<any[]> {
  const db = await getDB();
  const allHashtags = await db.getAll('hashtag_cache');
  
  // Sort by usage count
  const sorted = allHashtags.sort((a, b) => b.usage_count - a.usage_count);
  
  if (query) {
    return sorted.filter((h) => h.tag_name.includes(query.toLowerCase()));
  }
  
  return sorted;
}

/**
 * Evict old hashtags
 */
async function evictOldHashtags(): Promise<void> {
  const db = await getDB();
  const allHashtags = await db.getAll('hashtag_cache');
  
  if (allHashtags.length <= MAX_HASHTAGS) return;
  
  // Sort by usage count (lowest first)
  const sorted = allHashtags.sort((a, b) => a.usage_count - b.usage_count);
  
  const toRemove = allHashtags.length - MAX_HASHTAGS;
  const tx = db.transaction('hashtag_cache', 'readwrite');
  
  await Promise.all([
    ...sorted.slice(0, toRemove).map((h) => tx.store.delete(h.tag_name)),
    tx.done,
  ]);
}

// =====================================================
// CACHE STATISTICS
// =====================================================

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  posts: number;
  pending: number;
  mentions: number;
  hashtags: number;
}> {
  const db = await getDB();
  
  const [posts, pending, mentions, hashtags] = await Promise.all([
    db.count('posts'),
    db.count('pending_posts'),
    db.count('mention_cache'),
    db.count('hashtag_cache'),
  ]);
  
  return { posts, pending, mentions, hashtags };
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  const db = await getDB();
  
  await Promise.all([
    db.clear('posts'),
    db.clear('pending_posts'),
    db.clear('mention_cache'),
    db.clear('hashtag_cache'),
  ]);
}

// =====================================================
// EXPORT ALL
// =====================================================

export default {
  // Posts
  cachePost,
  cachePosts,
  getCachedPosts,
  deleteCachedPost,
  clearOldPosts,
  
  // Pending
  addPendingPost,
  getPendingPosts,
  removePendingPost,
  updatePendingPostRetry,
  
  // Mentions
  cacheMention,
  getCachedMentions,
  
  // Hashtags
  cacheHashtag,
  getCachedHashtags,
  
  // Stats
  getCacheStats,
  clearAllCache,
};

