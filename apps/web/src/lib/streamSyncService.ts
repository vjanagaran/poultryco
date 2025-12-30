/**
 * Stream Sync Service
 * 
 * Handles background synchronization of offline posts and actions
 */

import { createPost } from './api/social';
import { getProfileBySlug } from './api/users';
import { uploadPostImage, parseContent, ensureHashtag } from './streamUtils';
import {
  getPendingPosts,
  removePendingPost,
  updatePendingPostRetry,
  cacheMention,
  cacheHashtag,
} from './streamOfflineService';

// =====================================================
// TYPES
// =====================================================

interface SyncResult {
  success: boolean;
  postId?: string;
  error?: string;
}

// =====================================================
// SYNC PENDING POSTS
// =====================================================

/**
 * Sync all pending posts
 */
export async function syncPendingPosts(userId: string): Promise<{
  synced: number;
  failed: number;
  errors: string[];
}> {
  const pending = await getPendingPosts();
  const results = {
    synced: 0,
    failed: 0,
    errors: [] as string[],
  };
  
  for (const post of pending) {
    // Skip if too many retries
    if (post.retry_count >= 3) {
      results.failed++;
      results.errors.push(`Post "${post.content.substring(0, 30)}..." failed after 3 retries`);
      // Don't remove yet - let user handle
      continue;
    }
    
    const result = await syncPost(post, userId);
    
    if (result.success) {
      results.synced++;
      await removePendingPost(post.temp_id);
      
      // Revoke blob URLs
      post.media_urls.forEach((url: string) => URL.revokeObjectURL(url));
    } else {
      results.failed++;
      results.errors.push(result.error || 'Unknown error');
      await updatePendingPostRetry(post.temp_id, result.error);
    }
    
    // Wait a bit between posts to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

/**
 * Sync a single pending post
 */
async function syncPost(post: any, userId: string): Promise<SyncResult> {
  try {
    // 1. Upload media files first
    const uploadedUrls: string[] = [];
    
    if (post.media_files && post.media_files.length > 0) {
      for (const file of post.media_files) {
        const result = await uploadPostImage(file, userId);
        
        if (!result.success || !result.url) {
          return {
            success: false,
            error: result.error || 'Failed to upload image',
          };
        }
        
        uploadedUrls.push(result.url);
      }
    }
    
    // 2. Parse content for mentions and hashtags
    const parsed = parseContent(post.content);
    
    // 3. Extract tags from hashtags
    const tags: string[] = parsed.hashtags.map(h => h.tag.replace('#', ''));
    
    // 4. Create post via API
    const postData: any = {
      content: post.content,
      postType: post.post_type || 'post',
      mediaUrls: uploadedUrls,
    };
    
    // Add type-specific fields
    if (post.problem_category) {
      postData.title = post.problem_category;
      postData.category = post.problem_category;
      postData.urgency = post.problem_urgency;
    }
    
    if (post.article_title) {
      postData.title = post.article_title;
    }
    
    if (tags.length > 0) {
      postData.tags = tags;
    }
    
    const createdPost = await createPost(postData);
    
    // 5. Cache hashtags
    for (const hashtag of parsed.hashtags) {
      await ensureHashtag(hashtag.tag);
      await cacheHashtag(hashtag.tag);
    }
    
    // 6. Cache mentions used
    for (const mention of parsed.mentions) {
      try {
        const profile = await getProfileBySlug(mention.username);
        await cacheMention({
          id: profile.id,
          full_name: profile.full_name,
          profile_slug: profile.profile_slug,
          profile_photo_url: profile.profile_photo_url,
          headline: profile.headline,
        });
      } catch (error) {
        // Profile not found, skip
        console.warn(`Profile not found for mention: ${mention.username}`);
      }
    }
    
    return {
      success: true,
      postId: createdPost.id,
    };
  } catch (error: any) {
    console.error('Error syncing post:', error);
    return {
      success: false,
      error: error.message || 'Failed to sync post',
    };
  }
}

// =====================================================
// SYNC STATUS
// =====================================================

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  hasPending: boolean;
  pendingCount: number;
  isOnline: boolean;
}> {
  const pending = await getPendingPosts();
  
  return {
    hasPending: pending.length > 0,
    pendingCount: pending.length,
    isOnline: navigator.onLine,
  };
}

// =====================================================
// AUTO-SYNC ON ONLINE
// =====================================================

/**
 * Setup automatic sync when coming online
 */
export function setupAutoSync(userId: string, onSyncComplete?: (result: any) => void): () => void {
  const handleOnline = async () => {
    console.log('Network online - syncing pending posts...');
    
    try {
      const result = await syncPendingPosts(userId);
      console.log('Sync complete:', result);
      
      if (onSyncComplete) {
        onSyncComplete(result);
      }
      
      // Show toast notification
      if (result.synced > 0) {
        // Could integrate with a toast library here
        console.log(`✅ ${result.synced} post(s) synced successfully`);
      }
      
      if (result.failed > 0) {
        console.warn(`⚠️ ${result.failed} post(s) failed to sync`);
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  };
  
  window.addEventListener('online', handleOnline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
}

// =====================================================
// EXPORT
// =====================================================

export default {
  syncPendingPosts,
  getSyncStatus,
  setupAutoSync,
};

