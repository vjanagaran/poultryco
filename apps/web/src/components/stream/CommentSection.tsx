'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatTimestamp, renderRichContent, formatCount } from '@/lib/streamUtils';
import { createCommentMentionNotifications } from '@/lib/notificationService';

interface Comment {
  id: string;
  post_id: string;
  commenter_id: string;
  content: string;
  parent_comment_id: string | null;
  likes_count: number;
  replies_count: number;
  created_at: string;
  edited: boolean;
  
  commenter: {
    id: string;
    full_name: string;
    profile_slug: string;
    profile_photo_url: string | null;
    headline: string | null;
  };
  
  user_liked?: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  onCommentAdded: () => void;
}

export function CommentSection({ postId, onCommentAdded }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const supabase = createClient();
    
    try {
      // Fetch top-level comments
      const { data: topComments, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          commenter:profiles!commenter_id(
            id,
            full_name,
            profile_slug,
            profile_photo_url,
            headline
          )
        `)
        .eq('post_id', postId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Check if user liked comments
      if (user) {
        const commentIds = topComments?.map((c) => c.id) || [];
        const { data: likes } = await supabase
          .from('post_comment_likes')
          .select('comment_id')
          .eq('user_id', user.id)
          .in('comment_id', commentIds);

        const likedCommentIds = new Set(likes?.map((l) => l.comment_id) || []);
        
        topComments?.forEach((comment) => {
          comment.user_liked = likedCommentIds.has(comment.id);
        });
      }

      setComments(topComments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (parentId: string | null = null) => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);

    try {
      const supabase = createClient();

      const { data: comment, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          commenter_id: user.id,
          parent_comment_id: parentId,
          content: newComment.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create mention notifications
      if (comment) {
        await createCommentMentionNotifications(
          comment.id,
          postId,
          newComment.trim(),
          user.id,
          user.user_metadata?.full_name || 'Someone'
        );
      }

      setNewComment('');
      setReplyingTo(null);
      await fetchComments();
      onCommentAdded();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string, currentlyLiked: boolean) => {
    if (!user) return;

    const supabase = createClient();

    try {
      if (currentlyLiked) {
        await supabase
          .from('post_comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id,
          });
      }

      // Update local state
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                likes_count: currentlyLiked
                  ? comment.likes_count - 1
                  : comment.likes_count + 1,
                user_liked: !currentlyLiked,
              }
            : comment
        )
      );
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    const supabase = createClient();

    try {
      await supabase.from('post_comments').delete().eq('id', commentId);
      await fetchComments();
      onCommentAdded(); // Update parent comment count
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Comment Input */}
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0 overflow-hidden">
          {user?.user_metadata?.avatar_url && (
            <Image
              src={user.user_metadata.avatar_url}
              alt="Your avatar"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={2}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={() => handleSubmitComment(null)}
              disabled={submitting || !newComment.trim()}
              className="px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onLike={handleLikeComment}
              onDelete={handleDeleteComment}
              onReply={(commentId) => setReplyingTo(commentId)}
              currentUserId={user?.id || ''}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string, currentlyLiked: boolean) => void;
  onDelete: (commentId: string) => void;
  onReply: (commentId: string) => void;
  currentUserId: string;
  isReply?: boolean;
}

function CommentItem({
  comment,
  onLike,
  onDelete,
  onReply,
  currentUserId,
  isReply = false,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const isAuthor = currentUserId === comment.commenter_id;

  return (
    <div className={isReply ? 'ml-10' : ''}>
      <div className="flex gap-3">
        <Link href={`/me/${comment.commenter.profile_slug}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0 overflow-hidden cursor-pointer">
            {comment.commenter.profile_photo_url && (
              <Image
                src={comment.commenter.profile_photo_url}
                alt={comment.commenter.full_name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-2xl px-4 py-2">
            <div className="flex items-center gap-2 mb-1">
              <Link
                href={`/me/${comment.commenter.profile_slug}`}
                className="font-semibold text-sm hover:underline"
              >
                {comment.commenter.full_name}
              </Link>
              <span className="text-xs text-gray-400">
                {formatTimestamp(comment.created_at)}
              </span>
              {comment.edited && (
                <span className="text-xs text-gray-400">• Edited</span>
              )}
            </div>
            <div className="text-sm text-gray-800 break-words">
              {renderRichContent(comment.content)}
            </div>
          </div>

          {/* Comment Actions */}
          <div className="flex items-center gap-4 mt-1 ml-4 text-xs">
            <button
              onClick={() => onLike(comment.id, comment.user_liked || false)}
              className={`font-semibold ${
                comment.user_liked ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
              }`}
            >
              {comment.user_liked ? 'Liked' : 'Like'}
              {comment.likes_count > 0 && ` (${formatCount(comment.likes_count)})`}
            </button>

            {!isReply && (
              <button
                onClick={() => onReply(comment.id)}
                className="font-semibold text-gray-600 hover:text-green-600"
              >
                Reply
              </button>
            )}

            {isAuthor && (
              <button
                onClick={() => onDelete(comment.id)}
                className="font-semibold text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            )}

            {comment.replies_count > 0 && !showReplies && (
              <button
                onClick={() => setShowReplies(true)}
                className="font-semibold text-gray-600 hover:text-green-600"
              >
                View {comment.replies_count} {comment.replies_count === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onLike={onLike}
                  onDelete={onDelete}
                  onReply={onReply}
                  currentUserId={currentUserId}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

