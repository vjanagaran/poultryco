/**
 * Social API - Posts, connections, feed
 * Replaces Supabase social queries
 */

import { apiClient } from './client';

export interface Post {
  id: string;
  authorId: string;
  postType: 'post' | 'problem' | 'question' | 'article';
  content: string;
  title?: string | null;
  category?: string | null;
  urgency?: string | null;
  status?: string | null;
  mediaUrls?: string[] | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  tags?: string[] | null;
  mentions?: string[] | null;
  location?: string | null;
  isPinned: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    profilePhoto?: string | null;
    headline?: string | null;
  };
}

export interface Connection {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  message?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    profilePhoto?: string | null;
    headline?: string | null;
  };
  addressee?: {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    profilePhoto?: string | null;
    headline?: string | null;
  };
  otherUser?: {
    id: string;
    firstName: string;
    lastName: string;
    slug: string;
    profilePhoto?: string | null;
    headline?: string | null;
  };
}

export interface ConnectionStats {
  connections: number;
  followers: number;
  following: number;
}

/**
 * Get social feed
 */
export async function getFeed(params?: { limit?: number; offset?: number }): Promise<Post[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  return apiClient.get<Post[]>(`/social/feed?${queryParams.toString()}`);
}

/**
 * Get post by ID
 */
export async function getPost(postId: string): Promise<Post> {
  return apiClient.get<Post>(`/social/posts/${postId}`);
}

/**
 * Create a post
 */
export async function createPost(data: {
  content: string;
  title?: string;
  postType?: 'post' | 'problem' | 'question' | 'article';
  mediaUrls?: string[];
  tags?: string[];
}): Promise<Post> {
  return apiClient.post<Post>('/social/posts', data);
}

/**
 * Like a post
 */
export async function likePost(postId: string): Promise<{ success: boolean; liked: boolean }> {
  return apiClient.post<{ success: boolean; liked: boolean }>(`/social/posts/${postId}/like`);
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string): Promise<{ success: boolean; liked: boolean }> {
  return apiClient.delete<{ success: boolean; liked: boolean }>(`/social/posts/${postId}/like`);
}

/**
 * Get connection stats
 */
export async function getConnectionStats(): Promise<ConnectionStats> {
  return apiClient.get<ConnectionStats>('/social/connections/stats');
}

/**
 * Get connections
 */
export async function getConnections(params?: { status?: string }): Promise<Connection[]> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);

  return apiClient.get<Connection[]>(`/social/connections?${queryParams.toString()}`);
}

/**
 * Send connection request
 */
export async function sendConnectionRequest(addresseeId: string, message?: string): Promise<Connection> {
  return apiClient.post<Connection>('/social/connections/request', { addresseeId, message });
}

/**
 * Accept connection request
 */
export async function acceptConnectionRequest(connectionId: string): Promise<{ success: boolean }> {
  return apiClient.put<{ success: boolean }>(`/social/connections/${connectionId}/accept`);
}

/**
 * Reject connection request
 */
export async function rejectConnectionRequest(connectionId: string): Promise<{ success: boolean }> {
  // TODO: Implement reject endpoint in API
  return apiClient.put<{ success: boolean }>(`/social/connections/${connectionId}/reject`);
}

/**
 * Remove connection
 */
export async function removeConnection(connectionId: string): Promise<{ success: boolean }> {
  // TODO: Implement remove endpoint in API
  return apiClient.delete<{ success: boolean }>(`/social/connections/${connectionId}`);
}
