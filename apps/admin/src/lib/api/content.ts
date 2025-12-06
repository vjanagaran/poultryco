import { apiClient } from './client';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  published_at: string | null;
  view_count: number;
  author_name: string | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
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
