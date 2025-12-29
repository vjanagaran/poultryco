import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContentService } from './content.service';

@ApiTags('Public Blog')
@Controller('public/blog')
export class PublicBlogController {
  constructor(private contentService: ContentService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Get published blog posts (public)' })
  @ApiResponse({ status: 200, description: 'List of published blog posts' })
  async getBlogPosts(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('categoryId') categoryId?: string,
    @Query('tagId') tagId?: string,
    @Query('search') search?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('excludeId') excludeId?: string,
    @Query('publishedAt') publishedAt?: string,
  ) {
    const result = await this.contentService.getPublicBlogPosts({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      categoryId,
      tagId,
      search,
      isFeatured: isFeatured === 'true',
      excludeId,
      publishedAt,
    });

    return result;
  }

  @Get('posts/slug/:slug')
  @ApiOperation({ summary: 'Get blog post by slug (public)' })
  @ApiResponse({ status: 200, description: 'Blog post found' })
  @ApiResponse({ status: 404, description: 'Blog post not found' })
  async getBlogPostBySlug(@Param('slug') slug: string) {
    const post = await this.contentService.getBlogPostBySlug(slug);
    if (!post) {
      return { error: 'Post not found' };
    }
    return post;
  }

  @Post('posts/:id/view')
  @ApiOperation({ summary: 'Increment view count for a blog post (public)' })
  @ApiResponse({ status: 200, description: 'View count incremented' })
  async incrementViewCount(@Param('id') id: string) {
    await this.contentService.incrementBlogPostViewCount(id);
    return { success: true };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all active blog categories (public)' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getBlogCategories() {
    return this.contentService.getBlogCategories();
  }

  @Get('categories/slug/:slug')
  @ApiOperation({ summary: 'Get blog category by slug (public)' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async getBlogCategoryBySlug(@Param('slug') slug: string) {
    const category = await this.contentService.getBlogCategoryBySlug(slug);
    if (!category) {
      return { error: 'Category not found' };
    }
    return category;
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all blog tags (public)' })
  @ApiResponse({ status: 200, description: 'List of tags' })
  async getBlogTags() {
    return this.contentService.getBlogTags();
  }

  @Get('tags/slug/:slug')
  @ApiOperation({ summary: 'Get blog tag by slug (public)' })
  @ApiResponse({ status: 200, description: 'Tag found' })
  @ApiResponse({ status: 404, description: 'Tag not found' })
  async getBlogTagBySlug(@Param('slug') slug: string) {
    const tag = await this.contentService.getBlogTagBySlug(slug);
    if (!tag) {
      return { error: 'Tag not found' };
    }
    return tag;
  }
}

