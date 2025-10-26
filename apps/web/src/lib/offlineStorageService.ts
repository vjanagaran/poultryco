/**
 * Offline Storage Service for Messaging
 * 
 * Handles offline capability by caching conversations, messages, and media
 * using IndexedDB for persistent storage
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';

// =====================================================
// INDEXEDDB SCHEMA
// =====================================================

interface MessagingDB extends DBSchema {
  conversations: {
    key: string; // conversation_id
    value: {
      id: string;
      is_group: boolean;
      group_name?: string;
      group_photo_url?: string;
      group_description?: string;
      last_message_at?: string;
      last_message_preview?: string;
      participants?: any[];
      other_participant?: any;
      unread_count: number;
      cached_at: number;
    };
    indexes: {
      'by-cached-at': number;
      'by-last-message': string;
    };
  };
  
  messages: {
    key: string; // message_id
    value: {
      id: string;
      conversation_id: string;
      sender_id: string;
      content: string;
      message_type: string;
      media_urls: string[];
      media_metadata?: any;
      reply_to?: any;
      created_at: string;
      sender?: any;
      read_by: string[];
      delivered_to: string[];
      cached_at: number;
    };
    indexes: {
      'by-conversation': string;
      'by-conversation-date': [string, string];
      'by-cached-at': number;
    };
  };
  
  media_cache: {
    key: string; // media URL
    value: {
      url: string;
      blob: Blob;
      type: string;
      size: number;
      conversation_id: string;
      message_id: string;
      cached_at: number;
      last_accessed: number;
    };
    indexes: {
      'by-conversation': string;
      'by-size': number;
      'by-last-accessed': number;
    };
  };
  
  pending_messages: {
    key: string; // temp_id
    value: {
      temp_id: string;
      conversation_id: string;
      content: string;
      message_type: string;
      media_files?: File[];
      reply_to_message_id?: string;
      created_at: number;
      retry_count: number;
      last_retry: number;
    };
    indexes: {
      'by-conversation': string;
      'by-created-at': number;
    };
  };
  
  sync_queue: {
    key: number;
    value: {
      id?: number;
      action: 'send_message' | 'mark_read' | 'delete_message' | 'update_message';
      payload: any;
      created_at: number;
      retry_count: number;
    };
    indexes: {
      'by-action': string;
    };
  };
}

// =====================================================
// DATABASE INITIALIZATION
// =====================================================

const DB_NAME = 'poultryco_messaging';
const DB_VERSION = 1;
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB max cache
const MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

let dbInstance: IDBPDatabase<MessagingDB> | null = null;

async function getDB(): Promise<IDBPDatabase<MessagingDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<MessagingDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Conversations store
      if (!db.objectStoreNames.contains('conversations')) {
        const conversationsStore = db.createObjectStore('conversations', { keyPath: 'id' });
        conversationsStore.createIndex('by-cached-at', 'cached_at');
        conversationsStore.createIndex('by-last-message', 'last_message_at');
      }
      
      // Messages store
      if (!db.objectStoreNames.contains('messages')) {
        const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
        messagesStore.createIndex('by-conversation', 'conversation_id');
        messagesStore.createIndex('by-conversation-date', ['conversation_id', 'created_at']);
        messagesStore.createIndex('by-cached-at', 'cached_at');
      }
      
      // Media cache store
      if (!db.objectStoreNames.contains('media_cache')) {
        const mediaStore = db.createObjectStore('media_cache', { keyPath: 'url' });
        mediaStore.createIndex('by-conversation', 'conversation_id');
        mediaStore.createIndex('by-size', 'size');
        mediaStore.createIndex('by-last-accessed', 'last_accessed');
      }
      
      // Pending messages store
      if (!db.objectStoreNames.contains('pending_messages')) {
        const pendingStore = db.createObjectStore('pending_messages', { keyPath: 'temp_id' });
        pendingStore.createIndex('by-conversation', 'conversation_id');
        pendingStore.createIndex('by-created-at', 'created_at');
      }
      
      // Sync queue store
      if (!db.objectStoreNames.contains('sync_queue')) {
        const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('by-action', 'action');
      }
    },
  });
  
  return dbInstance;
}

// =====================================================
// CONVERSATION CACHING
// =====================================================

/**
 * Cache conversation
 */
export async function cacheConversation(conversation: any): Promise<void> {
  const db = await getDB();
  
  await db.put('conversations', {
    ...conversation,
    cached_at: Date.now(),
  });
}

/**
 * Get cached conversation
 */
export async function getCachedConversation(conversationId: string): Promise<any | null> {
  const db = await getDB();
  return await db.get('conversations', conversationId);
}

/**
 * Get all cached conversations
 */
export async function getAllCachedConversations(): Promise<any[]> {
  const db = await getDB();
  return await db.getAll('conversations');
}

/**
 * Delete cached conversation
 */
export async function deleteCachedConversation(conversationId: string): Promise<void> {
  const db = await getDB();
  await db.delete('conversations', conversationId);
}

// =====================================================
// MESSAGE CACHING
// =====================================================

/**
 * Cache message
 */
export async function cacheMessage(message: any): Promise<void> {
  const db = await getDB();
  
  await db.put('messages', {
    ...message,
    cached_at: Date.now(),
  });
}

/**
 * Cache multiple messages
 */
export async function cacheMessages(messages: any[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('messages', 'readwrite');
  
  await Promise.all([
    ...messages.map((message) =>
      tx.store.put({
        ...message,
        cached_at: Date.now(),
      })
    ),
    tx.done,
  ]);
}

/**
 * Get cached messages for conversation
 */
export async function getCachedMessages(conversationId: string, limit: number = 50): Promise<any[]> {
  const db = await getDB();
  const index = db.transaction('messages').store.index('by-conversation-date');
  
  const messages = await index.getAll(
    IDBKeyRange.bound([conversationId, ''], [conversationId, '\uffff']),
    limit
  );
  
  return messages.reverse(); // Most recent first
}

/**
 * Delete cached messages for conversation
 */
export async function deleteCachedMessages(conversationId: string): Promise<void> {
  const db = await getDB();
  const messages = await getCachedMessages(conversationId, 1000);
  
  const tx = db.transaction('messages', 'readwrite');
  await Promise.all([
    ...messages.map((message) => tx.store.delete(message.id)),
    tx.done,
  ]);
}

// =====================================================
// MEDIA CACHING
// =====================================================

/**
 * Cache media file
 */
export async function cacheMediaFile(
  url: string,
  blob: Blob,
  conversationId: string,
  messageId: string
): Promise<void> {
  const db = await getDB();
  
  // Check cache size before adding
  await enforceMaxCacheSize();
  
  await db.put('media_cache', {
    url,
    blob,
    type: blob.type,
    size: blob.size,
    conversation_id: conversationId,
    message_id: messageId,
    cached_at: Date.now(),
    last_accessed: Date.now(),
  });
}

/**
 * Get cached media file
 */
export async function getCachedMediaFile(url: string): Promise<Blob | null> {
  const db = await getDB();
  const cached = await db.get('media_cache', url);
  
  if (cached) {
    // Update last accessed time
    await db.put('media_cache', {
      ...cached,
      last_accessed: Date.now(),
    });
    
    return cached.blob;
  }
  
  return null;
}

/**
 * Download and cache media file
 */
export async function downloadAndCacheMedia(
  url: string,
  conversationId: string,
  messageId: string
): Promise<Blob> {
  // Try to get from cache first
  const cached = await getCachedMediaFile(url);
  if (cached) return cached;
  
  // Download from CDN
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to download media');
  
  const blob = await response.blob();
  
  // Cache for offline use
  await cacheMediaFile(url, blob, conversationId, messageId);
  
  return blob;
}

/**
 * Get cached media URL (object URL)
 */
export async function getCachedMediaURL(url: string): Promise<string | null> {
  const blob = await getCachedMediaFile(url);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return null;
}

/**
 * Delete cached media
 */
export async function deleteCachedMedia(url: string): Promise<void> {
  const db = await getDB();
  await db.delete('media_cache', url);
}

/**
 * Enforce max cache size by removing oldest/least accessed items
 */
async function enforceMaxCacheSize(): Promise<void> {
  const db = await getDB();
  const allMedia = await db.getAll('media_cache');
  
  const totalSize = allMedia.reduce((sum, item) => sum + item.size, 0);
  
  if (totalSize > MAX_CACHE_SIZE) {
    // Sort by last accessed (oldest first)
    const sorted = allMedia.sort((a, b) => a.last_accessed - b.last_accessed);
    
    let sizeToFree = totalSize - MAX_CACHE_SIZE;
    const toDelete: string[] = [];
    
    for (const item of sorted) {
      if (sizeToFree <= 0) break;
      toDelete.push(item.url);
      sizeToFree -= item.size;
    }
    
    // Delete old items
    const tx = db.transaction('media_cache', 'readwrite');
    await Promise.all([
      ...toDelete.map((url) => tx.store.delete(url)),
      tx.done,
    ]);
  }
}

// =====================================================
// PENDING MESSAGES (OFFLINE QUEUE)
// =====================================================

/**
 * Add message to pending queue
 */
export async function addPendingMessage(
  tempId: string,
  conversationId: string,
  content: string,
  messageType: string,
  mediaFiles?: File[],
  replyToMessageId?: string
): Promise<void> {
  const db = await getDB();
  
  await db.put('pending_messages', {
    temp_id: tempId,
    conversation_id: conversationId,
    content,
    message_type: messageType,
    media_files: mediaFiles,
    reply_to_message_id: replyToMessageId,
    created_at: Date.now(),
    retry_count: 0,
    last_retry: 0,
  });
}

/**
 * Get all pending messages
 */
export async function getPendingMessages(): Promise<any[]> {
  const db = await getDB();
  return await db.getAll('pending_messages');
}

/**
 * Get pending messages for conversation
 */
export async function getPendingMessagesForConversation(conversationId: string): Promise<any[]> {
  const db = await getDB();
  const index = db.transaction('pending_messages').store.index('by-conversation');
  return await index.getAll(conversationId);
}

/**
 * Remove pending message
 */
export async function removePendingMessage(tempId: string): Promise<void> {
  const db = await getDB();
  await db.delete('pending_messages', tempId);
}

/**
 * Update pending message retry count
 */
export async function updatePendingMessageRetry(tempId: string): Promise<void> {
  const db = await getDB();
  const message = await db.get('pending_messages', tempId);
  
  if (message) {
    await db.put('pending_messages', {
      ...message,
      retry_count: message.retry_count + 1,
      last_retry: Date.now(),
    });
  }
}

// =====================================================
// SYNC QUEUE
// =====================================================

/**
 * Add action to sync queue
 */
export async function addToSyncQueue(action: string, payload: any): Promise<void> {
  const db = await getDB();
  
  await db.add('sync_queue', {
    action: action as any,
    payload,
    created_at: Date.now(),
    retry_count: 0,
  });
}

/**
 * Get sync queue
 */
export async function getSyncQueue(): Promise<any[]> {
  const db = await getDB();
  return await db.getAll('sync_queue');
}

/**
 * Remove from sync queue
 */
export async function removeFromSyncQueue(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('sync_queue', id);
}

/**
 * Clear sync queue
 */
export async function clearSyncQueue(): Promise<void> {
  const db = await getDB();
  await db.clear('sync_queue');
}

// =====================================================
// CLEANUP FUNCTIONS
// =====================================================

/**
 * Clear old cached data
 */
export async function clearOldCache(): Promise<void> {
  const db = await getDB();
  const now = Date.now();
  const cutoff = now - MAX_CACHE_AGE;
  
  // Clear old conversations
  const conversations = await db.getAll('conversations');
  const oldConversations = conversations.filter((c) => c.cached_at < cutoff);
  await Promise.all(oldConversations.map((c) => db.delete('conversations', c.id)));
  
  // Clear old messages
  const messages = await db.getAll('messages');
  const oldMessages = messages.filter((m) => m.cached_at < cutoff);
  await Promise.all(oldMessages.map((m) => db.delete('messages', m.id)));
  
  // Clear old media (handled by enforceMaxCacheSize)
}

/**
 * Clear all cached data
 */
export async function clearAllCache(): Promise<void> {
  const db = await getDB();
  
  await Promise.all([
    db.clear('conversations'),
    db.clear('messages'),
    db.clear('media_cache'),
    db.clear('pending_messages'),
    db.clear('sync_queue'),
  ]);
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  conversations: number;
  messages: number;
  media: { count: number; size: number };
  pending: number;
  syncQueue: number;
}> {
  const db = await getDB();
  
  const [conversations, messages, media, pending, syncQueue] = await Promise.all([
    db.count('conversations'),
    db.count('messages'),
    db.getAll('media_cache'),
    db.count('pending_messages'),
    db.count('sync_queue'),
  ]);
  
  const mediaSize = media.reduce((sum, item) => sum + item.size, 0);
  
  return {
    conversations,
    messages,
    media: { count: media.length, size: mediaSize },
    pending,
    syncQueue,
  };
}

// =====================================================
// EXPORT ALL FUNCTIONS
// =====================================================

export default {
  // Conversations
  cacheConversation,
  getCachedConversation,
  getAllCachedConversations,
  deleteCachedConversation,
  
  // Messages
  cacheMessage,
  cacheMessages,
  getCachedMessages,
  deleteCachedMessages,
  
  // Media
  cacheMediaFile,
  getCachedMediaFile,
  downloadAndCacheMedia,
  getCachedMediaURL,
  deleteCachedMedia,
  
  // Pending
  addPendingMessage,
  getPendingMessages,
  getPendingMessagesForConversation,
  removePendingMessage,
  updatePendingMessageRetry,
  
  // Sync
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  clearSyncQueue,
  
  // Cleanup
  clearOldCache,
  clearAllCache,
  getCacheStats,
};

