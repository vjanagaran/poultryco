'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatTimestamp, renderRichContent, formatCount } from '@/lib/streamUtils';
import { CommentSection } from './CommentSection';

export interface Post {
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
  edited: boolean;
  edited_at: string | null;
  
  // Joined data
  author: {
    id: string;
    full_name: string;
    profile_slug: string;
    headline: string | null;
    profile_photo_url: string | null;
  };
  
  // User engagement
  user_liked?: boolean;
  user_saved?: boolean;
  
  // Problem-specific
  problem_category?: string | null;
  problem_urgency?: string | null;
  problem_resolved?: boolean;
  
  // Article-specific
  article_title?: string | null;
  article_reading_time_minutes?: number | null;
}

interface PostCardProps {
  post: Post;
  onUpdate: () => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.user_liked || false);
  const [saved, setSaved] = useState(post.user_saved || false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [sharesCount, setSharesCount] = useState(post.shares_count);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isAuthor = user?.id === post.author_id;

  // Toggle like
  const handleLike = async () => {
    if (!user) return;

    const supabase = createClient();
    
    try {
      if (liked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        
        setLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id,
          });
        
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Toggle save/bookmark
  const handleSave = async () => {
    if (!user) return;

    const supabase = createClient();
    
    try {
      if (saved) {
        // Unsave
        await supabase
          .from('post_bookmarks')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        
        setSaved(false);
      } else {
        // Save
        await supabase
          .from('post_bookmarks')
          .insert({
            post_id: post.id,
            user_id: user.id,
          });
        
        setSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  // Repost
  const handleRepost = async () => {
    if (!user) return;

    const supabase = createClient();
    
    try {
      // Create a share record
      await supabase
        .from('post_shares')
        .insert({
          post_id: post.id,
          user_id: user.id,
          shared_via: 'repost',
        });
      
      setSharesCount(prev => prev + 1);
      setShowShareMenu(false);
      onUpdate();
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  // Copy link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/stream/post/${post.id}`;
    navigator.clipboard.writeText(url);
    setShowShareMenu(false);
    // Could show a toast notification here
  };

  // Delete post
  const handleDelete = async () => {
    if (!isAuthor || !confirm('Are you sure you want to delete this post?')) return;

    const supabase = createClient();
    
    try {
      await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);
      
      onUpdate();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  // Report post
  const handleReport = async () => {
    if (!user) return;

    const reason = prompt('Why are you reporting this post?');
    if (!reason) return;

    const supabase = createClient();
    
    try {
      await supabase
        .from('post_reports')
        .insert({
          post_id: post.id,
          reporter_id: user.id,
          reason,
        });
      
      setShowMoreMenu(false);
      alert('Post reported. Thank you for helping keep our community safe.');
    } catch (error) {
      console.error('Error reporting post:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <Link href={`/me/${post.author.profile_slug}`}>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0 overflow-hidden cursor-pointer">
              {post.author.profile_photo_url && (
                <Image
                  src={post.author.profile_photo_url}
                  alt={post.author.full_name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </Link>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/me/${post.author.profile_slug}`} className="font-semibold hover:underline">
                {post.author.full_name}
              </Link>
              {post.problem_urgency && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  post.problem_urgency === 'critical' ? 'bg-red-100 text-red-700' :
                  post.problem_urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                  post.problem_urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {post.problem_urgency.toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">{post.author.headline}</div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              {formatTimestamp(post.created_at)}
              {post.edited && ' • Edited'}
              {' • '}
              <span className="flex items-center gap-1">
                {post.visibility === 'public' ? (
                  <>🌍 Public</>
                ) : post.visibility === 'connections' ? (
                  <>👥 Connections</>
                ) : (
                  <>🔒 Private</>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* More Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-10">
              {isAuthor ? (
                <>
                  <button
                    onClick={() => {/* Edit functionality */}}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete post
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {saved ? 'Remove bookmark' : 'Save post'}
                  </button>
                  <button
                    onClick={handleReport}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                    Report post
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Article Title */}
      {post.post_type === 'article' && post.article_title && (
        <div className="px-4 pb-2">
          <h2 className="text-2xl font-bold">{post.article_title}</h2>
          {post.article_reading_time_minutes && (
            <div className="text-sm text-gray-500 mt-1">
              {post.article_reading_time_minutes} min read
            </div>
          )}
        </div>
      )}

      {/* Problem Badge */}
      {post.post_type === 'problem' && post.problem_category && (
        <div className="px-4 pb-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {post.problem_category.charAt(0).toUpperCase() + post.problem_category.slice(1)} Problem
            {post.problem_resolved && ' • ✅ Resolved'}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-3">
        <div className="text-gray-800 whitespace-pre-wrap break-words">
          {renderRichContent(post.content)}
        </div>
      </div>

      {/* Images */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className={`grid gap-1 ${
          post.media_urls.length === 1 ? 'grid-cols-1' :
          post.media_urls.length === 2 ? 'grid-cols-2' :
          post.media_urls.length === 3 ? 'grid-cols-3' :
          'grid-cols-2'
        }`}>
          {post.media_urls.slice(0, 4).map((url, index) => (
            <div key={index} className="relative aspect-video bg-gray-100">
              <Image
                src={url}
                alt={`Post image ${index + 1}`}
                fill
                className="object-cover"
              />
              {index === 3 && post.media_urls.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center text-white text-2xl font-bold">
                  +{post.media_urls.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t">
        <div className="flex items-center gap-4">
          {likesCount > 0 && (
            <span>{formatCount(likesCount)} {likesCount === 1 ? 'like' : 'likes'}</span>
          )}
          {commentsCount > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:underline"
            >
              {formatCount(commentsCount)} {commentsCount === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-4">
          {sharesCount > 0 && (
            <span>{formatCount(sharesCount)} {sharesCount === 1 ? 'share' : 'shares'}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 flex items-center justify-around border-t">
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
            liked ? 'text-green-600 font-semibold' : 'text-gray-600'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          Like
        </button>

        {/* Comment */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Comment
        </button>

        {/* Share/Repost */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share
          </button>

          {showShareMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border rounded-lg shadow-lg z-10">
              <button
                onClick={handleRepost}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Repost
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy link
              </button>
            </div>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
            saved ? 'text-blue-600 font-semibold' : 'text-gray-600'
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          Save
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <div className="border-t">
          <CommentSection
            postId={post.id}
            onCommentAdded={() => {
              setCommentsCount(prev => prev + 1);
              onUpdate();
            }}
          />
        </div>
      )}
    </div>
  );
}

