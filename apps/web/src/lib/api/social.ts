/**
 * Social API - Posts, Feed, Connections, Follows
 * Replaces Supabase social queries
 */

import { apiClient } from './client';

export interface Post {
  id: string;
  author_id: string;
  content: string;
  visibility: 'public' | 'connections' | 'private';
  media_urls?: string[];
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string;
    profile_slug: string;
    headline: string | null;
    profile_photo_url: string | null;
  };
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface Connection {
  id: string;
  profile_id_1: string;
  profile_id_2: string;
  status: 'pending' | 'connected' | 'blocked';
  requested_by: string;
  requested_at: string;
  responded_at?: string;
  profile?: {
    id: string;
    full_name: string;
    profile_slug: string;
    headline: string | null;
    profile_photo_url: string | null;
    location_city?: string;
    location_state?: string;
  };
}

/**
 * Get personalized feed
 */
export async function getFeed(params?: {
  page?: number;
  limit?: number;
  tag?: string;
}): Promise<{ data: Post[]; count: number; hasMore: boolean }> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.tag) queryParams.append('tag', params.tag);

  const result = await apiClient.get<{ data: Post[]; count: number; hasMore: boolean }>(
    `/social/feed?${queryParams.toString()}`
  );
  return result;
}

/**
 * Create a new post
 */
export async function createPost(data: {
  content: string;
  visibility?: 'public' | 'connections' | 'private';
  media_urls?: string[];
  tags?: string[];
}): Promise<Post> {
  return apiClient.post<Post>('/social/posts', data);
}

/**
 * Get a post by ID
 */
export async function getPost(id: string): Promise<Post> {
  return apiClient.get<Post>(`/social/posts/${id}`);
}

/**
 * Update a post
 */
export async function updatePost(id: string, data: Partial<Post>): Promise<Post> {
  return apiClient.put<Post>(`/social/posts/${id}`, data);
}

/**
 * Delete a post
 */
export async function deletePost(id: string): Promise<void> {
  return apiClient.delete(`/social/posts/${id}`);
}

/**
 * Like a post
 */
export async function likePost(id: string): Promise<{ success: boolean }> {
  return apiClient.post(`/social/posts/${id}/like`);
}

/**
 * Unlike a post
 */
export async function unlikePost(id: string): Promise<{ success: boolean }> {
  return apiClient.delete(`/social/posts/${id}/like`);
}

/**
 * Comment on a post
 */
export async function commentOnPost(id: string, content: string, parentCommentId?: string): Promise<any> {
  return apiClient.post(`/social/posts/${id}/comment`, { content, parentCommentId });
}

/**
 * Get comments for a post
 */
export async function getPostComments(postId: string): Promise<any[]> {
  return apiClient.get(`/social/posts/${postId}/comments`);
}

/**
 * Like a comment
 */
export async function likeComment(commentId: string): Promise<{ success: boolean }> {
  return apiClient.post(`/social/comments/${commentId}/like`);
}

/**
 * Unlike a comment
 */
export async function unlikeComment(commentId: string): Promise<{ success: boolean }> {
  return apiClient.delete(`/social/comments/${commentId}/like`);
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<{ success: boolean }> {
  return apiClient.delete(`/social/comments/${commentId}`);
}

/**
 * Get connections
 */
export async function getConnections(params?: {
  status?: 'pending' | 'connected';
  limit?: number;
  offset?: number;
}): Promise<{ data: Connection[]; count: number }> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  return apiClient.get<{ data: Connection[]; count: number }>(
    `/social/connections?${queryParams.toString()}`
  );
}

/**
 * Send connection request
 */
export async function sendConnectionRequest(targetProfileId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await apiClient.post<{ success: boolean; error?: string }>('/social/connections', {
      targetProfileId,
    });
    return result;
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send connection request' };
  }
}

/**
 * Accept connection request
 */
export async function acceptConnectionRequest(connectionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await apiClient.put<{ success: boolean; error?: string }>(
      `/social/connections/${connectionId}`,
      { status: 'connected' }
    );
    return result;
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to accept connection request' };
  }
}

/**
 * Reject connection request
 */
export async function rejectConnectionRequest(connectionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.delete(`/social/connections/${connectionId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to reject connection request' };
  }
}

/**
 * Remove connection
 */
export async function removeConnection(connectionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.delete(`/social/connections/${connectionId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove connection' };
  }
}

/**
 * Check connection status
 */
export async function checkConnectionStatus(targetProfileId: string): Promise<{
  exists: boolean;
  status?: string;
  isRequester?: boolean;
  connectionId?: string;
}> {
  try {
    const result = await apiClient.get<{
      exists: boolean;
      status?: string;
      isRequester?: boolean;
      connectionId?: string;
    }>(`/social/connections/status/${targetProfileId}`);
    return result;
  } catch (error) {
    return { exists: false };
  }
}

/**
 * Follow a user
 */
export async function followUser(profileId: string): Promise<{ success: boolean }> {
  return apiClient.post('/social/follows', { profileId });
}

/**
 * Unfollow a user
 */
export async function unfollowUser(profileId: string): Promise<{ success: boolean }> {
  return apiClient.delete(`/social/follows/${profileId}`);
}

