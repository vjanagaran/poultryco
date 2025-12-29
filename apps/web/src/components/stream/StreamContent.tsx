'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { PostCreationModal } from './PostCreationModal';
import { PostCard, Post } from './PostCard';
import * as socialApi from '@/lib/api/social';
import { initSocket, getSocket, disconnectSocket } from '@/lib/socket/client';
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
  
  const tagFilter = searchParams.get('tag');
  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchPosts(true);
    }
  }, [user, tagFilter]);

  // Initialize Socket.io for real-time updates
  useEffect(() => {
    if (!user) return;

    try {
      const socket = initSocket();

      // Listen for new posts
      socket.on('post:new', (newPost: Post) => {
        setPosts((prev) => [newPost, ...prev]);
      });

      // Listen for post updates
      socket.on('post:updated', (updatedPost: Post) => {
        setPosts((prev) =>
          prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
        );
      });

      // Listen for post deletions
      socket.on('post:deleted', (postId: string) => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      });

      return () => {
        socket.off('post:new');
        socket.off('post:updated');
        socket.off('post:deleted');
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }, [user]);

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

  const fetchPosts = async (reset: boolean = false) => {
    if (!user) return;

    setLoadingPosts(true);

    try {
      const currentPage = reset ? 0 : page;
      const result = await socialApi.getFeed({
        page: currentPage,
        limit: POSTS_PER_PAGE,
        tag: tagFilter || undefined,
      });

      if (reset) {
        setPosts(result.data);
        setPage(1);
      } else {
        setPosts((prev) => [...prev, ...result.data]);
      }

      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await socialApi.unlikePost(postId);
      } else {
        await socialApi.likePost(postId);
      }

      // Update local state
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: !isLiked,
                likes_count: (post.likes_count || 0) + (isLiked ? -1 : 1),
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await socialApi.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Create Post Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setModalPostType('update');
            setShowPostModal(true);
          }}
          className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary hover:bg-primary/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3 text-gray-600">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-medium">Share an update, problem, or question...</span>
          </div>
        </button>
      </div>

      {/* Post Type Buttons */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['update', 'problem', 'article', 'photo', 'question'] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              setModalPostType(type);
              setShowPostModal(true);
            }}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors whitespace-nowrap capitalize"
          >
            {type}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onDelete={handleDelete}
            isOwnPost={post.author_id === user.id}
          />
        ))}
      </div>

      {/* Loading More */}
      {loadingPosts && posts.length > 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      )}

      {/* Infinite Scroll Target */}
      {hasMore && !loadingPosts && <div ref={observerTarget} className="h-1" />}

      {/* Empty State */}
      {!loadingPosts && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts yet. Be the first to share!</p>
        </div>
      )}

      {/* Post Creation Modal */}
      {showPostModal && (
        <PostCreationModal
          type={modalPostType}
          onClose={() => setShowPostModal(false)}
          onSuccess={() => {
            setShowPostModal(false);
            fetchPosts(true);
          }}
        />
      )}
    </div>
  );
}
