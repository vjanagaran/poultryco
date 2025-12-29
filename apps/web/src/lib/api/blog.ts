/**
 * Blog API Client
 * Handles all blog-related API calls
 */

import { apiClient } from './client';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  publishedAt: string | null;
  readingTimeMinutes: number | null;
  viewCount: number;
  authorName: string | null;
  categoryId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  category?: BlogCategory;
  tags?: BlogTag[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  postCount: number;
  isActive: boolean;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

/**
 * Get blog posts with pagination and filters
 */
export async function getBlogPosts(params?: {
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
  search?: string;
}): Promise<{ posts: BlogPost[]; totalPages: number; currentPage: number }> {
  const page = params?.page || 1;
  const limit = params?.limit || 12;
  const offset = (page - 1) * limit;

  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.search) queryParams.append('search', params.search);
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());

  const response = await apiClient.get<{ posts: BlogPost[]; total: number }>(
    `/public/blog/posts?${queryParams.toString()}`
  );

  const totalPages = Math.ceil((response.total || 0) / limit);
  return {
    posts: response.posts || [],
    totalPages,
    currentPage: page,
  };
}

/**
 * Get featured blog post
 */
export async function getFeaturedPost(): Promise<BlogPost | null> {
  try {
    const response = await apiClient.get<BlogPost[]>('/public/blog/posts?isFeatured=true&limit=1');
    return response[0] || null;
  } catch (error) {
    console.error('Error fetching featured post:', error);
    return null;
  }
}

/**
 * Get blog post by slug
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const response = await apiClient.get<BlogPost>(`/public/blog/posts/slug/${slug}`);
    return response;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

/**
 * Increment view count for a blog post
 */
export async function incrementBlogPostView(postId: string): Promise<void> {
  try {
    await apiClient.post(`/public/blog/posts/${postId}/view`);
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

/**
 * Get blog categories
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const response = await apiClient.get<BlogCategory[]>('/public/blog/categories');
    return response || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Get blog category by slug
 */
export async function getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  try {
    const response = await apiClient.get<BlogCategory>(`/public/blog/categories/slug/${slug}`);
    return response;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
}

/**
 * Get blog tag by slug
 */
export async function getBlogTagBySlug(slug: string): Promise<BlogTag | null> {
  try {
    const response = await apiClient.get<BlogTag>(`/public/blog/tags/slug/${slug}`);
    return response;
  } catch (error) {
    console.error('Error fetching tag:', error);
    return null;
  }
}

/**
 * Get posts for a tag
 */
export async function getTagPosts(tagId: string, params?: {
  page?: number;
  limit?: number;
}): Promise<{ posts: BlogPost[]; totalPages: number }> {
  const page = params?.page || 1;
  const limit = params?.limit || 12;
  const offset = (page - 1) * limit;

  const queryParams = new URLSearchParams();
  queryParams.append('tagId', tagId);
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());

  const response = await apiClient.get<{ posts: BlogPost[]; total: number }>(
    `/public/blog/posts?${queryParams.toString()}`
  );

  const totalPages = Math.ceil((response.total || 0) / limit);
  return {
    posts: response.posts || [],
    totalPages,
  };
}

/**
 * Get related posts
 */
export async function getRelatedPosts(categoryId: string, excludePostId: string, limit: number = 3): Promise<BlogPost[]> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('categoryId', categoryId);
    queryParams.append('excludeId', excludePostId);
    queryParams.append('limit', limit.toString());

    const response = await apiClient.get<BlogPost[]>(`/public/blog/posts?${queryParams.toString()}`);
    return response || [];
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

/**
 * Get next/previous posts
 */
export async function getAdjacentPosts(publishedAt: string, currentPostId: string): Promise<{
  next: BlogPost | null;
  previous: BlogPost | null;
}> {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('publishedAt', publishedAt);
    queryParams.append('excludeId', currentPostId);
    queryParams.append('limit', '2');

    const response = await apiClient.get<BlogPost[]>(`/public/blog/posts?${queryParams.toString()}`);
    
    // Sort by publishedAt to determine next/previous
    const sorted = (response || []).sort((a, b) => {
      const dateA = new Date(a.publishedAt || '').getTime();
      const dateB = new Date(b.publishedAt || '').getTime();
      return dateB - dateA; // Descending
    });

    const currentDate = new Date(publishedAt).getTime();
    const next = sorted.find(p => new Date(p.publishedAt || '').getTime() < currentDate) || null;
    const previous = sorted.find(p => new Date(p.publishedAt || '').getTime() > currentDate) || null;

    return { next, previous };
  } catch (error) {
    console.error('Error fetching adjacent posts:', error);
    return { next: null, previous: null };
  }
}

