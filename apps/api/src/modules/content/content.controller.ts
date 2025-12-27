import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { AdminJwtGuard } from '../admin/guards/admin-jwt.guard';

@ApiTags('Content')
@Controller('content')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get('blog/posts')
  @ApiOperation({ summary: 'Get all blog posts' })
  async getBlogPosts(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.contentService.getBlogPosts({ status, search, categoryId });
  }

  @Get('blog/posts/:id')
  @ApiOperation({ summary: 'Get blog post by ID' })
  async getBlogPostById(@Param('id') id: string) {
    return this.contentService.getBlogPostById(id);
  }

  @Post('blog/posts')
  @ApiOperation({ summary: 'Create blog post' })
  async createBlogPost(@Body() data: any) {
    return this.contentService.createBlogPost(data);
  }

  @Patch('blog/posts/:id')
  @ApiOperation({ summary: 'Update blog post' })
  async updateBlogPost(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateBlogPost(id, data);
  }

  @Delete('blog/posts/:id')
  @ApiOperation({ summary: 'Delete blog post' })
  async deleteBlogPost(@Param('id') id: string) {
    await this.contentService.deleteBlogPost(id);
    return { success: true };
  }

  @Get('blog/categories')
  @ApiOperation({ summary: 'Get all blog categories' })
  async getBlogCategories() {
    return this.contentService.getBlogCategories();
  }

  @Post('blog/categories')
  @ApiOperation({ summary: 'Create blog category' })
  async createBlogCategory(@Body() data: any) {
    return this.contentService.createBlogCategory(data);
  }

  @Patch('blog/categories/:id')
  @ApiOperation({ summary: 'Update blog category' })
  async updateBlogCategory(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateBlogCategory(id, data);
  }

  @Delete('blog/categories/:id')
  @ApiOperation({ summary: 'Delete blog category' })
  async deleteBlogCategory(@Param('id') id: string) {
    await this.contentService.deleteBlogCategory(id);
    return { success: true };
  }

  // =====================================================
  // BLOG TAGS
  // =====================================================

  @Get('blog/tags')
  @ApiOperation({ summary: 'Get all blog tags' })
  async getBlogTags() {
    return this.contentService.getBlogTags();
  }

  @Get('blog/tags/popular')
  @ApiOperation({ summary: 'Get popular blog tags' })
  async getPopularBlogTags(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.contentService.getPopularBlogTags(limitNum);
  }

  @Get('blog/tags/:id')
  @ApiOperation({ summary: 'Get blog tag by ID' })
  async getBlogTagById(@Param('id') id: string) {
    return this.contentService.getBlogTagById(id);
  }

  @Post('blog/tags')
  @ApiOperation({ summary: 'Create blog tag' })
  async createBlogTag(@Body() data: any) {
    return this.contentService.createBlogTag(data);
  }

  @Patch('blog/tags/:id')
  @ApiOperation({ summary: 'Update blog tag' })
  async updateBlogTag(@Param('id') id: string, @Body() data: any) {
    return this.contentService.updateBlogTag(id, data);
  }

  @Delete('blog/tags/:id')
  @ApiOperation({ summary: 'Delete blog tag' })
  async deleteBlogTag(@Param('id') id: string) {
    await this.contentService.deleteBlogTag(id);
    return { success: true };
  }

  // =====================================================
  // POST-TAG RELATIONSHIPS
  // =====================================================

  @Get('blog/posts/:id/tags')
  @ApiOperation({ summary: 'Get tags for a blog post' })
  async getPostTags(@Param('id') id: string) {
    return this.contentService.getPostTags(id);
  }

  @Post('blog/posts/:id/tags')
  @ApiOperation({ summary: 'Set tags for a blog post' })
  async setPostTags(@Param('id') id: string, @Body() data: { tagIds: string[] }) {
    await this.contentService.setPostTags(id, data.tagIds);
    return { success: true };
  }

  @Post('blog/posts/:id/tags/:tagId')
  @ApiOperation({ summary: 'Add a tag to a blog post' })
  async addPostTag(@Param('id') id: string, @Param('tagId') tagId: string) {
    await this.contentService.addPostTag(id, tagId);
    return { success: true };
  }

  @Delete('blog/posts/:id/tags/:tagId')
  @ApiOperation({ summary: 'Remove a tag from a blog post' })
  async removePostTag(@Param('id') id: string, @Param('tagId') tagId: string) {
    await this.contentService.removePostTag(id, tagId);
    return { success: true };
  }
}
