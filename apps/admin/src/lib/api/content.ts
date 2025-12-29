import { apiClient } from './client';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt: string | null;
  viewCount: number;
  authorName: string | null;
  authorId?: string | null; // Author ID for creating/updating
  categoryId: string | null;
  scheduledFor?: string | null; // For scheduled posts
  metaTitle?: string | null;
  metaDescription?: string | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  tagIds?: string[]; // Tag assignments from API
  wordCount?: number; // Word count for creating posts
  readingTimeMinutes?: number; // Reading time for creating posts
  createdAt: string;
  updatedAt: string;
  // Legacy snake_case fields for backward compatibility
  published_at?: string | null;
  view_count?: number;
  author_name?: string | null;
  category_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  color?: string | null;
  icon?: string | null;
  post_count?: number;
  created_at: string;
}

// Blog Posts
export async function getBlogPosts(filters?: {
  status?: string;
  search?: string;
  categoryId?: string;
}): Promise<BlogPost[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.categoryId) params.append('categoryId', filters.categoryId);
  
  const query = params.toString();
  return apiClient.get<BlogPost[]>(`/content/blog/posts${query ? `?${query}` : ''}`);
}

export async function getBlogPostById(id: string): Promise<BlogPost> {
  return apiClient.get<BlogPost>(`/content/blog/posts/${id}`);
}

export async function createBlogPost(data: Partial<BlogPost>): Promise<BlogPost> {
  return apiClient.post<BlogPost>('/content/blog/posts', data);
}

export async function updateBlogPost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
  return apiClient.patch<BlogPost>(`/content/blog/posts/${id}`, data);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await apiClient.delete(`/content/blog/posts/${id}`);
}

// Blog Categories
export async function getBlogCategories(): Promise<BlogCategory[]> {
  return apiClient.get<BlogCategory[]>('/content/blog/categories');
}

export async function createBlogCategory(data: Partial<BlogCategory>): Promise<BlogCategory> {
  return apiClient.post<BlogCategory>('/content/blog/categories', data);
}

export async function updateBlogCategory(id: string, data: Partial<BlogCategory>): Promise<BlogCategory> {
  return apiClient.patch<BlogCategory>(`/content/blog/categories/${id}`, data);
}

export async function deleteBlogCategory(id: string): Promise<void> {
  await apiClient.delete(`/content/blog/categories/${id}`);
}

// =====================================================
// BLOG TAGS
// =====================================================

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function getBlogTags(): Promise<BlogTag[]> {
  return apiClient.get<BlogTag[]>('/content/blog/tags');
}

export async function getPopularBlogTags(limit: number = 10): Promise<BlogTag[]> {
  return apiClient.get<BlogTag[]>(`/content/blog/tags/popular?limit=${limit}`);
}

export async function getBlogTagById(id: string): Promise<BlogTag> {
  return apiClient.get<BlogTag>(`/content/blog/tags/${id}`);
}

export async function createBlogTag(data: Partial<BlogTag>): Promise<BlogTag> {
  return apiClient.post<BlogTag>('/content/blog/tags', data);
}

export async function updateBlogTag(id: string, data: Partial<BlogTag>): Promise<BlogTag> {
  return apiClient.patch<BlogTag>(`/content/blog/tags/${id}`, data);
}

export async function deleteBlogTag(id: string): Promise<void> {
  await apiClient.delete(`/content/blog/tags/${id}`);
}

// =====================================================
// POST-TAG RELATIONSHIPS
// =====================================================

export async function getPostTags(postId: string): Promise<BlogTag[]> {
  return apiClient.get<BlogTag[]>(`/content/blog/posts/${postId}/tags`);
}

export async function setPostTags(postId: string, tagIds: string[]): Promise<void> {
  await apiClient.post(`/content/blog/posts/${postId}/tags`, { tagIds });
}

export async function addPostTag(postId: string, tagId: string): Promise<void> {
  await apiClient.post(`/content/blog/posts/${postId}/tags/${tagId}`);
}

export async function removePostTag(postId: string, tagId: string): Promise<void> {
  await apiClient.delete(`/content/blog/posts/${postId}/tags/${tagId}`);
}
