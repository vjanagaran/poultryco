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
}
