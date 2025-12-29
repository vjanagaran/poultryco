import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.module';
import { eq, and, or, like, desc, asc, inArray, sql, count, lte, ne } from 'drizzle-orm';
import { 
  blogPosts, 
  blogCategories, 
  blogTags, 
  blogPostTags 
} from '@/database/schema';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[] | null;
  ogImage: string | null;
  featuredImage: string | null;
  featuredImageAlt: string | null;
  categoryId: string | null;
  authorId: string | null;
  authorName: string | null;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  publishedAt: string | null;
  scheduledFor: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  readingTimeMinutes: number | null;
  wordCount: number | null;
  isFeatured: boolean;
  isPinned: boolean;
  featuredOrder: number | null;
  createdAt: string;
  updatedAt: string;
  tags?: BlogTag[];
  category?: BlogCategory;
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
  createdAt: string;
  updatedAt: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ContentService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  // =====================================================
  // BLOG POSTS
  // =====================================================

  async getBlogPosts(filters?: {
    status?: string;
    search?: string;
    categoryId?: string;
  }): Promise<BlogPost[]> {
    let query = this.db.select().from(blogPosts);

    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(blogPosts.status, filters.status as any));
    }

    if (filters?.categoryId) {
      conditions.push(eq(blogPosts.categoryId, filters.categoryId));
    }

    if (filters?.search) {
      conditions.push(
        or(
          like(blogPosts.title, `%${filters.search}%`),
          like(blogPosts.excerpt, `%${filters.search}%`),
          like(blogPosts.content, `%${filters.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const posts = await query.orderBy(desc(blogPosts.createdAt));

    // Load tags and category for each post
    const postsWithRelations = await Promise.all(
      posts.map(async (post: any) => {
        const [tags, category] = await Promise.all([
          this.getPostTags(post.id),
          post.categoryId ? this.getBlogCategoryById(post.categoryId) : null,
        ]);

        return {
          ...post,
          tags,
          category: category || undefined,
        };
      })
    );

    return postsWithRelations;
  }

  async getBlogPostById(id: string): Promise<BlogPost | null> {
    const [post] = await this.db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    if (!post) {
      return null;
    }

    const [tags, category] = await Promise.all([
      this.getPostTags(id),
      post.categoryId ? this.getBlogCategoryById(post.categoryId) : null,
    ]);

    return {
      ...post,
      tags,
      category: category || undefined,
    };
  }

  async createBlogPost(data: Partial<BlogPost>): Promise<BlogPost> {
    // Generate slug if not provided
    if (!data.slug && data.title) {
      data.slug = this.generateSlug(data.title);
    }

    // Check for duplicate slug
    if (data.slug) {
      const existing = await this.db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, data.slug))
        .limit(1);

      if (existing.length > 0) {
        throw new BadRequestException('A post with this slug already exists');
      }
    }

    // Set published_at if status is published
    if (data.status === 'published' && !data.publishedAt) {
      data.publishedAt = new Date().toISOString();
    }

    const [post] = await this.db
      .insert(blogPosts)
      .values({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null,
        ogImage: data.ogImage || null,
        featuredImage: data.featuredImage || null,
        featuredImageAlt: data.featuredImageAlt || null,
        categoryId: data.categoryId || null,
        authorId: data.authorId || null,
        authorName: data.authorName || null,
        status: (data.status || 'draft') as any,
        publishedAt: data.publishedAt || null,
        scheduledFor: data.scheduledFor || null,
        isFeatured: data.isFeatured || false,
        isPinned: data.isPinned || false,
        featuredOrder: data.featuredOrder || null,
      })
      .returning();

    // Add tags if provided
    if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
      await this.setPostTags(post.id, data.tags.map((t: any) => t.id || t));
    }

    return this.getBlogPostById(post.id) as Promise<BlogPost>;
  }

  async updateBlogPost(id: string, data: Partial<BlogPost>): Promise<BlogPost> {
    const existing = await this.getBlogPostById(id);
    if (!existing) {
      throw new NotFoundException('Blog post not found');
    }

    // Generate slug if title changed and slug not provided
    if (data.title && !data.slug && data.title !== existing.title) {
      data.slug = this.generateSlug(data.title);
    }

    // Check for duplicate slug
    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await this.db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.slug, data.slug))
        .limit(1);

      if (duplicate.length > 0) {
        throw new BadRequestException('A post with this slug already exists');
      }
    }

    // Set published_at if status changed to published
    if (data.status === 'published' && existing.status !== 'published' && !data.publishedAt) {
      data.publishedAt = new Date().toISOString();
    }

    await this.db
      .update(blogPosts)
      .set({
        ...(data.title && { title: data.title }),
        ...(data.slug && { slug: data.slug }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.content && { content: data.content }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
        ...(data.metaKeywords !== undefined && { metaKeywords: data.metaKeywords }),
        ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
        ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage }),
        ...(data.featuredImageAlt !== undefined && { featuredImageAlt: data.featuredImageAlt }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.authorName !== undefined && { authorName: data.authorName }),
        ...(data.status && { status: data.status as any }),
        ...(data.publishedAt !== undefined && { publishedAt: data.publishedAt }),
        ...(data.scheduledFor !== undefined && { scheduledFor: data.scheduledFor }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isPinned !== undefined && { isPinned: data.isPinned }),
        ...(data.featuredOrder !== undefined && { featuredOrder: data.featuredOrder }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(blogPosts.id, id));

    // Update tags if provided
    if (data.tags !== undefined) {
      await this.setPostTags(id, Array.isArray(data.tags) ? data.tags.map((t: any) => t.id || t) : []);
    }

    return this.getBlogPostById(id) as Promise<BlogPost>;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    const existing = await this.getBlogPostById(id);
    if (!existing) {
      throw new NotFoundException('Blog post not found');
    }

    await this.db.delete(blogPosts).where(eq(blogPosts.id, id));
    return true;
  }

  // =====================================================
  // BLOG CATEGORIES
  // =====================================================

  async getBlogCategories(): Promise<BlogCategory[]> {
    return this.db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.isActive, true))
      .orderBy(asc(blogCategories.name));
  }

  async getBlogCategoryById(id: string): Promise<BlogCategory | null> {
    const [category] = await this.db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.id, id))
      .limit(1);

    return category || null;
  }

  async createBlogCategory(data: Partial<BlogCategory>): Promise<BlogCategory> {
    if (!data.name) {
      throw new BadRequestException('Category name is required');
    }

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = this.generateSlug(data.name);
    }

    // Check for duplicate slug
    const existing = await this.db
      .select()
      .from(blogCategories)
      .where(eq(blogCategories.slug, data.slug!))
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('A category with this slug already exists');
    }

    const [category] = await this.db
      .insert(blogCategories)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        color: data.color || null,
        icon: data.icon || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      })
      .returning();

    return category;
  }

  async updateBlogCategory(id: string, data: Partial<BlogCategory>): Promise<BlogCategory> {
    const existing = await this.getBlogCategoryById(id);
    if (!existing) {
      throw new NotFoundException('Blog category not found');
    }

    // Generate slug if name changed and slug not provided
    if (data.name && !data.slug && data.name !== existing.name) {
      data.slug = this.generateSlug(data.name);
    }

    // Check for duplicate slug
    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await this.db
        .select()
        .from(blogCategories)
        .where(eq(blogCategories.slug, data.slug!))
        .limit(1);

      if (duplicate.length > 0) {
        throw new BadRequestException('A category with this slug already exists');
      }
    }

    const [category] = await this.db
      .update(blogCategories)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(blogCategories.id, id))
      .returning();

    return category;
  }

  async deleteBlogCategory(id: string): Promise<boolean> {
    const existing = await this.getBlogCategoryById(id);
    if (!existing) {
      throw new NotFoundException('Blog category not found');
    }

    await this.db.delete(blogCategories).where(eq(blogCategories.id, id));
    return true;
  }

  // =====================================================
  // BLOG TAGS
  // =====================================================

  async getBlogTags(): Promise<BlogTag[]> {
    return this.db
      .select()
      .from(blogTags)
      .orderBy(asc(blogTags.name));
  }

  async getBlogTagById(id: string): Promise<BlogTag | null> {
    const [tag] = await this.db
      .select()
      .from(blogTags)
      .where(eq(blogTags.id, id))
      .limit(1);

    return tag || null;
  }

  async getPopularBlogTags(limit: number = 10): Promise<BlogTag[]> {
    return this.db
      .select()
      .from(blogTags)
      .orderBy(desc(blogTags.postCount))
      .limit(limit);
  }

  async createBlogTag(data: Partial<BlogTag>): Promise<BlogTag> {
    if (!data.name) {
      throw new BadRequestException('Tag name is required');
    }

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = this.generateSlug(data.name);
    }

    // Check for duplicate slug
    const existing = await this.db
      .select()
      .from(blogTags)
      .where(eq(blogTags.slug, data.slug!))
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException('A tag with this slug already exists');
    }

    const [tag] = await this.db
      .insert(blogTags)
      .values({
        name: data.name,
        slug: data.slug,
      })
      .returning();

    return tag;
  }

  async updateBlogTag(id: string, data: Partial<BlogTag>): Promise<BlogTag> {
    const existing = await this.getBlogTagById(id);
    if (!existing) {
      throw new NotFoundException('Blog tag not found');
    }

    // Generate slug if name changed and slug not provided
    if (data.name && !data.slug && data.name !== existing.name) {
      data.slug = this.generateSlug(data.name);
    }

    // Check for duplicate slug
    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await this.db
        .select()
        .from(blogTags)
        .where(eq(blogTags.slug, data.slug!))
        .limit(1);

      if (duplicate.length > 0) {
        throw new BadRequestException('A tag with this slug already exists');
      }
    }

    const [tag] = await this.db
      .update(blogTags)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(blogTags.id, id))
      .returning();

    return tag;
  }

  async deleteBlogTag(id: string): Promise<boolean> {
    const existing = await this.getBlogTagById(id);
    if (!existing) {
      throw new NotFoundException('Blog tag not found');
    }

    await this.db.delete(blogTags).where(eq(blogTags.id, id));
    return true;
  }

  // =====================================================
  // POST-TAG RELATIONSHIPS
  // =====================================================

  async getPostTags(postId: string): Promise<BlogTag[]> {
    const tags = await this.db
      .select({
        id: blogTags.id,
        name: blogTags.name,
        slug: blogTags.slug,
        postCount: blogTags.postCount,
        createdAt: blogTags.createdAt,
        updatedAt: blogTags.updatedAt,
      })
      .from(blogPostTags)
      .innerJoin(blogTags, eq(blogPostTags.tagId, blogTags.id))
      .where(eq(blogPostTags.postId, postId));

    return tags;
  }

  async setPostTags(postId: string, tagIds: string[]): Promise<void> {
    // Remove existing tags
    await this.db.delete(blogPostTags).where(eq(blogPostTags.postId, postId));

    // Add new tags
    if (tagIds.length > 0) {
      await this.db.insert(blogPostTags).values(
        tagIds.map((tagId) => ({
          postId,
          tagId,
        }))
      );
    }
  }

  async addPostTag(postId: string, tagId: string): Promise<void> {
    // Check if already exists
    const existing = await this.db
      .select()
      .from(blogPostTags)
      .where(and(eq(blogPostTags.postId, postId), eq(blogPostTags.tagId, tagId)))
      .limit(1);

    if (existing.length === 0) {
      await this.db.insert(blogPostTags).values({ postId, tagId });
    }
  }

  async removePostTag(postId: string, tagId: string): Promise<void> {
    await this.db
      .delete(blogPostTags)
      .where(and(eq(blogPostTags.postId, postId), eq(blogPostTags.tagId, tagId)));
  }

  // =====================================================
  // PUBLIC BLOG METHODS (No Authentication Required)
  // =====================================================

  /**
   * Get published blog posts for public access
   */
  async getPublicBlogPosts(filters?: {
    limit?: number;
    offset?: number;
    categoryId?: string;
    tagId?: string;
    search?: string;
    isFeatured?: boolean;
    excludeId?: string;
    publishedAt?: string; // For adjacent posts
  }): Promise<{ posts: BlogPost[]; total: number }> {
    const limit = filters?.limit || 12;
    const offset = filters?.offset || 0;
    const now = new Date();

    const conditions = [
      eq(blogPosts.status, 'published'),
      sql`${blogPosts.publishedAt} IS NOT NULL`,
      lte(blogPosts.publishedAt, now),
    ];

    if (filters?.categoryId) {
      conditions.push(eq(blogPosts.categoryId, filters.categoryId));
    }

    if (filters?.excludeId) {
      conditions.push(ne(blogPosts.id, filters.excludeId));
    }

    if (filters?.isFeatured) {
      conditions.push(eq(blogPosts.isFeatured, true));
    }

    if (filters?.search) {
      conditions.push(
        or(
          like(blogPosts.title, `%${filters.search}%`),
          like(blogPosts.excerpt, `%${filters.search}%`)
        )!
      );
    }

    if (filters?.publishedAt) {
      // For adjacent posts - exclude the current post
      const publishedDate = new Date(filters.publishedAt);
      conditions.push(ne(blogPosts.publishedAt, publishedDate));
    }

    // Handle tag filter separately (requires join)
    let postsQuery;
    let total = 0;

    if (filters?.tagId) {
      // Count query with tag join
      const countResult = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(blogPosts)
        .innerJoin(blogPostTags, eq(blogPosts.id, blogPostTags.postId))
        .where(
          and(
            ...conditions,
            eq(blogPostTags.tagId, filters.tagId)
          )
        );

      total = countResult[0]?.count || 0;

      // Posts query with tag join
      postsQuery = this.db
        .select()
        .from(blogPosts)
        .innerJoin(blogPostTags, eq(blogPosts.id, blogPostTags.postId))
        .where(
          and(
            ...conditions,
            eq(blogPostTags.tagId, filters.tagId)
          )
        );
    } else {
      // Get total count
      const countResult = await this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(blogPosts)
        .where(and(...conditions));

      total = countResult[0]?.count || 0;

      // Get posts
      postsQuery = this.db
        .select()
        .from(blogPosts)
        .where(and(...conditions));
    }

    // Order and paginate
    if (filters?.isFeatured) {
      postsQuery = postsQuery
        .orderBy(asc(blogPosts.featuredOrder), desc(blogPosts.publishedAt));
    } else {
      postsQuery = postsQuery.orderBy(desc(blogPosts.publishedAt));
    }

    const posts = await postsQuery.limit(limit).offset(offset);

    // Load tags and category for each post
    const postsWithRelations = await Promise.all(
      posts.map(async (post: any) => {
        const [tags, category] = await Promise.all([
          this.getPostTags(post.id),
          post.categoryId ? this.getBlogCategoryById(post.categoryId) : null,
        ]);

        return {
          ...post,
          tags,
          category: category || undefined,
        };
      })
    );

    return {
      posts: postsWithRelations,
      total,
    };
  }

  /**
   * Get blog post by slug (public, only published)
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const now = new Date();
    const [post] = await this.db
      .select()
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.status, 'published'),
          lte(blogPosts.publishedAt, now)
        )
      )
      .limit(1);

    if (!post) {
      return null;
    }

    const [tags, category] = await Promise.all([
      this.getPostTags(post.id),
      post.categoryId ? this.getBlogCategoryById(post.categoryId) : null,
    ]);

    return {
      ...post,
      tags,
      category: category || undefined,
    };
  }

  /**
   * Increment view count for a blog post
   */
  async incrementBlogPostViewCount(postId: string): Promise<void> {
    await this.db
      .update(blogPosts)
      .set({
        viewCount: sql`${blogPosts.viewCount} + 1`,
      })
      .where(eq(blogPosts.id, postId));
  }

  /**
   * Get blog category by slug (public)
   */
  async getBlogCategoryBySlug(slug: string): Promise<BlogCategory | null> {
    const [category] = await this.db
      .select()
      .from(blogCategories)
      .where(
        and(
          eq(blogCategories.slug, slug),
          eq(blogCategories.isActive, true)
        )
      )
      .limit(1);

    return category || null;
  }

  /**
   * Get blog tag by slug (public)
   */
  async getBlogTagBySlug(slug: string): Promise<BlogTag | null> {
    const [tag] = await this.db
      .select()
      .from(blogTags)
      .where(eq(blogTags.slug, slug))
      .limit(1);

    return tag || null;
  }

  // =====================================================
  // UTILITIES
  // =====================================================

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
