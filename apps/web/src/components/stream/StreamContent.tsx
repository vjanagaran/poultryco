'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PostCreationModal } from './PostCreationModal';
import { PostCard, Post } from './PostCard';
import { setupAutoSync, getSyncStatus } from '@/lib/streamSyncService';
import { cachePosts, getCachedPosts } from '@/lib/streamOfflineService';
import Image from 'next/image';

export function StreamContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [showPostModal, setShowPostModal] = useState(false);
  const [modalPostType, setModalPostType] = useState<'update' | 'problem' | 'article' | 'photo' | 'question'>('update');
  const observerTarget = useRef(null);
  
  // Offline support
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const tagFilter = searchParams.get('tag');
  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Setup offline/online detection and auto-sync
  useEffect(() => {
    if (!user) return;
    
    // Set initial online status
    setIsOnline(navigator.onLine);
    
    // Handle online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      updateSyncStatus();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Setup auto-sync
    const cleanup = setupAutoSync(user.id, (result) => {
      console.log('Sync result:', result);
      updateSyncStatus();
      // Refresh feed after sync
      fetchPosts(true);
    });
    
    // Check sync status on mount
    updateSyncStatus();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      cleanup();
    };
  }, [user]);

  const updateSyncStatus = async () => {
    const status = await getSyncStatus();
    setPendingCount(status.pendingCount);
  };

  useEffect(() => {
    if (user) {
      fetchPosts(true);
    }
  }, [user, tagFilter]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingPosts) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loadingPosts]);

  // Load more posts when page changes
  useEffect(() => {
    if (page > 0) {
      fetchPosts(false);
    }
  }, [page]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    // Subscribe to new posts
    const postsChannel = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: tagFilter ? undefined : `visibility=eq.public`,
        },
        async (payload) => {
          // Fetch full post with author details
          const { data: newPost } = await supabase
            .from('posts')
            .select(`
              *,
              author:profiles!author_id(
                id,
                full_name,
                profile_slug,
                headline,
                profile_photo_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (newPost) {
            setPosts((prev) => [newPost as Post, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          setPosts((prev) => prev.filter((post) => post.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      postsChannel.unsubscribe();
    };
  }, [user, tagFilter]);

  const fetchPosts = async (reset: boolean = false) => {
    if (!user) return;

    setLoadingPosts(true);

    try {
      // If offline, load from cache
      if (!navigator.onLine) {
        const cachedPosts = await getCachedPosts(50);
        setPosts(cachedPosts as Post[]);
        setHasMore(false);
        setLoadingPosts(false);
        return;
      }

      const supabase = createClient();
      const from = reset ? 0 : page * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      let query = supabase
        .from('posts')
        .select(
          `
          *,
          author:profiles!author_id(
            id,
            full_name,
            profile_slug,
            headline,
            profile_photo_url
          )
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(from, to);

      // Apply filters
      if (tagFilter) {
        // Filter by hashtag
        const { data: taggedPosts } = await supabase
          .from('posts_tags')
          .select('post_id')
          .eq('tag_name', tagFilter.toLowerCase());

        const postIds = taggedPosts?.map((t) => t.post_id) || [];
        query = query.in('id', postIds);
      } else {
        // Show public posts
        query = query.eq('visibility', 'public');
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Check if user liked/saved posts
      if (data && data.length > 0) {
        const postIds = data.map((p) => p.id);

        const [{ data: likes }, { data: bookmarks }] = await Promise.all([
          supabase
            .from('post_likes')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds),
          supabase
            .from('post_bookmarks')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds),
        ]);

        const likedPostIds = new Set(likes?.map((l) => l.post_id) || []);
        const savedPostIds = new Set(bookmarks?.map((b) => b.post_id) || []);

        data.forEach((post) => {
          post.user_liked = likedPostIds.has(post.id);
          post.user_saved = savedPostIds.has(post.id);
        });
        
        // Cache posts for offline use
        await cachePosts(data);
      }

      if (reset) {
        setPosts(data as Post[] || []);
        setPage(0);
      } else {
        setPosts((prev) => [...prev, ...(data as Post[] || [])]);
      }

      setHasMore(data && data.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // If fetch fails, try loading from cache
      const cachedPosts = await getCachedPosts(50);
      if (cachedPosts.length > 0) {
        setPosts(cachedPosts as Post[]);
      }
    } finally {
      setLoadingPosts(false);
    }
  };

  const handlePostTypeClick = (type: typeof modalPostType) => {
    setModalPostType(type);
    setShowPostModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-lg shadow h-32"></div>
          <div className="bg-white rounded-lg shadow h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Offline/Sync Status Banner */}
        {!isOnline && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="flex-1">
              <span className="text-gray-700 font-medium">Viewing cached posts (offline)</span>
              <p className="text-sm text-gray-500 mt-1">
                Posts will sync automatically when you're back online
              </p>
            </div>
          </div>
        )}
        
        {pendingCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <div className="animate-spin w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full"></div>
            <div className="flex-1">
              <span className="text-yellow-700 font-medium">
                {syncing ? 'Syncing posts...' : `${pendingCount} post(s) pending sync`}
              </span>
              <p className="text-sm text-yellow-600 mt-1">
                {isOnline ? 'Will sync automatically' : 'Waiting for internet connection'}
              </p>
            </div>
          </div>
        )}

        {/* Tag Filter */}
        {tagFilter && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-700 font-semibold">
                Showing posts tagged with #{tagFilter}
              </span>
            </div>
            <button
              onClick={() => router.push('/stream')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Post Creation Card */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0 overflow-hidden">
              {user?.user_metadata?.avatar_url && (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt="Your avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <button
              className="flex-1 text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
              onClick={() => setShowPostModal(true)}
            >
              Share an update, ask a question, or post a problem...
            </button>
          </div>
          <div className="flex gap-4 mt-3 ml-13 pl-1">
            <button
              onClick={() => handlePostTypeClick('photo')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Photo
            </button>
            <button
              onClick={() => handlePostTypeClick('problem')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Problem
            </button>
            <button
              onClick={() => handlePostTypeClick('article')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Article
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        {loadingPosts && posts.length === 0 ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No posts yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Be the first to share something with the community!
            </p>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Create your first post
            </button>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={() => fetchPosts(true)} />
            ))}

            {/* Infinite Scroll Trigger */}
            <div ref={observerTarget} className="h-10 flex items-center justify-center">
              {loadingPosts && hasMore && (
                <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
              )}
              {!hasMore && posts.length > 0 && (
                <p className="text-gray-400 text-sm">You've reached the end</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Post Creation Modal */}
      <PostCreationModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPostCreated={() => fetchPosts(true)}
        postType={modalPostType}
      />
    </div>
  );
}

