import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Social')
@Controller('social')
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get social feed' })
  @ApiResponse({ status: 200, description: 'Feed retrieved' })
  async getFeed(
    @CurrentUser('profileId') profileId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.socialService.getFeed(profileId, { limit, offset });
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiResponse({ status: 200, description: 'Post retrieved' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPost(@Param('id') id: string) {
    return this.socialService.getPost(id);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a post' })
  @ApiResponse({ status: 201, description: 'Post created' })
  async createPost(
    @CurrentUser('profileId') profileId: string,
    @Body() data: { content: string; title?: string; postType?: string; mediaUrls?: string[]; tags?: string[] },
  ) {
    return this.socialService.createPost(profileId, data);
  }

  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Like a post' })
  @ApiResponse({ status: 200, description: 'Post liked' })
  async likePost(@Param('id') postId: string, @CurrentUser('profileId') profileId: string) {
    return this.socialService.likePost(postId, profileId);
  }

  @Delete('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiResponse({ status: 200, description: 'Post unliked' })
  async unlikePost(@Param('id') postId: string, @CurrentUser('profileId') profileId: string) {
    return this.socialService.unlikePost(postId, profileId);
  }

  @Get('connections/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get connection stats' })
  @ApiResponse({ status: 200, description: 'Stats retrieved' })
  async getConnectionStats(@CurrentUser('profileId') profileId: string) {
    return this.socialService.getConnectionStats(profileId);
  }

  @Get('connections')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get connections' })
  @ApiResponse({ status: 200, description: 'Connections retrieved' })
  async getConnections(
    @CurrentUser('profileId') profileId: string,
    @Query('status') status?: string,
  ) {
    return this.socialService.getConnections(profileId, { status });
  }

  @Post('connections/request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Send connection request' })
  @ApiResponse({ status: 201, description: 'Connection request sent' })
  async sendConnectionRequest(
    @CurrentUser('profileId') profileId: string,
    @Body() data: { addresseeId: string; message?: string },
  ) {
    return this.socialService.sendConnectionRequest(profileId, data.addresseeId, data.message);
  }

  @Put('connections/:id/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Accept connection request' })
  @ApiResponse({ status: 200, description: 'Connection request accepted' })
  async acceptConnectionRequest(
    @Param('id') connectionId: string,
    @CurrentUser('profileId') profileId: string,
  ) {
    return this.socialService.acceptConnectionRequest(connectionId, profileId);
  }
}
