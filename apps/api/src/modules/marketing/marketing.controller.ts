import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MarketingService } from './marketing.service';
import { AdminJwtGuard } from '../admin/guards/admin-jwt.guard';

@ApiTags('Marketing')
@Controller('marketing')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class MarketingController {
  constructor(private marketingService: MarketingService) {}

  // Dashboard
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get marketing dashboard statistics' })
  async getDashboardStats() {
    return this.marketingService.getMarketingDashboardStats();
  }

  // NDP Categories
  @Get('ndp-categories')
  @ApiOperation({ summary: 'Get NDP categories' })
  async getNdpCategories() {
    return this.marketingService.getNdpCategories();
  }

  // Stakeholder Segments
  @Get('segments')
  @ApiOperation({ summary: 'Get stakeholder segments' })
  async getStakeholderSegments() {
    return this.marketingService.getStakeholderSegments();
  }

  @Get('segments/:id')
  @ApiOperation({ summary: 'Get stakeholder segment by ID' })
  async getStakeholderSegmentById(@Param('id') id: string) {
    return this.marketingService.getStakeholderSegmentById(id);
  }

  @Post('segments')
  @ApiOperation({ summary: 'Create stakeholder segment' })
  async createStakeholderSegment(@Body() data: any) {
    return this.marketingService.createStakeholderSegment(data);
  }

  @Patch('segments/:id')
  @ApiOperation({ summary: 'Update stakeholder segment' })
  async updateStakeholderSegment(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateStakeholderSegment(id, data);
  }

  @Delete('segments/:id')
  @ApiOperation({ summary: 'Delete stakeholder segment' })
  async deleteStakeholderSegment(@Param('id') id: string) {
    await this.marketingService.deleteStakeholderSegment(id);
    return { success: true };
  }

  // Content Topics
  @Get('topics')
  @ApiOperation({ summary: 'Get content topics' })
  async getContentTopics(
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.marketingService.getContentTopics({ categoryId, search });
  }

  @Get('topics/:id')
  @ApiOperation({ summary: 'Get content topic by ID' })
  async getContentTopicById(@Param('id') id: string) {
    return this.marketingService.getContentTopicById(id);
  }

  @Post('topics')
  @ApiOperation({ summary: 'Create content topic' })
  async createContentTopic(@Body() data: any) {
    return this.marketingService.createContentTopic(data);
  }

  @Patch('topics/:id')
  @ApiOperation({ summary: 'Update content topic' })
  async updateContentTopic(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateContentTopic(id, data);
  }

  @Delete('topics/:id')
  @ApiOperation({ summary: 'Delete content topic' })
  async deleteContentTopic(@Param('id') id: string) {
    await this.marketingService.deleteContentTopic(id);
    return { success: true };
  }

  // Content Pillars
  @Get('pillars')
  @ApiOperation({ summary: 'Get content pillars' })
  async getContentPillars(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.marketingService.getContentPillars({ status, search });
  }

  @Get('pillars/:id')
  @ApiOperation({ summary: 'Get content pillar by ID' })
  async getContentPillarById(@Param('id') id: string) {
    return this.marketingService.getContentPillarById(id);
  }

  @Post('pillars')
  @ApiOperation({ summary: 'Create content pillar' })
  async createContentPillar(@Body() data: any) {
    return this.marketingService.createContentPillar(data);
  }

  @Patch('pillars/:id')
  @ApiOperation({ summary: 'Update content pillar' })
  async updateContentPillar(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateContentPillar(id, data);
  }

  @Delete('pillars/:id')
  @ApiOperation({ summary: 'Delete content pillar' })
  async deleteContentPillar(@Param('id') id: string) {
    await this.marketingService.deleteContentPillar(id);
    return { success: true };
  }

  // Content
  @Get('content')
  @ApiOperation({ summary: 'Get content' })
  async getContent(
    @Query('status') status?: string,
    @Query('pillarId') pillarId?: string,
    @Query('topicId') topicId?: string,
  ) {
    return this.marketingService.getContent({ status, pillarId, topicId });
  }

  @Get('content/:id')
  @ApiOperation({ summary: 'Get content by ID' })
  async getContentById(@Param('id') id: string) {
    return this.marketingService.getContentById(id);
  }

  @Post('content')
  @ApiOperation({ summary: 'Create content' })
  async createContent(@Body() data: any) {
    return this.marketingService.createContent(data);
  }

  @Patch('content/:id')
  @ApiOperation({ summary: 'Update content' })
  async updateContent(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateContent(id, data);
  }

  @Delete('content/:id')
  @ApiOperation({ summary: 'Delete content' })
  async deleteContent(@Param('id') id: string) {
    await this.marketingService.deleteContent(id);
    return { success: true };
  }

  // Content Ideas
  @Get('ideas')
  @ApiOperation({ summary: 'Get content ideas' })
  async getContentIdeas(
    @Query('status') status?: string,
    @Query('pillarId') pillarId?: string,
    @Query('topicId') topicId?: string,
  ) {
    return this.marketingService.getContentIdeas({ status, pillarId, topicId });
  }

  @Get('ideas/:id')
  @ApiOperation({ summary: 'Get content idea by ID' })
  async getContentIdeaById(@Param('id') id: string) {
    return this.marketingService.getContentIdeaById(id);
  }

  @Post('ideas')
  @ApiOperation({ summary: 'Create content idea' })
  async createContentIdea(@Body() data: any) {
    return this.marketingService.createContentIdea(data);
  }

  @Patch('ideas/:id')
  @ApiOperation({ summary: 'Update content idea' })
  async updateContentIdea(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateContentIdea(id, data);
  }

  @Delete('ideas/:id')
  @ApiOperation({ summary: 'Delete content idea' })
  async deleteContentIdea(@Param('id') id: string) {
    await this.marketingService.deleteContentIdea(id);
    return { success: true };
  }

  // Marketing Channels
  @Get('channels')
  @ApiOperation({ summary: 'Get marketing channels' })
  async getMarketingChannels() {
    return this.marketingService.getMarketingChannels();
  }

  @Get('channels/:id')
  @ApiOperation({ summary: 'Get marketing channel by ID' })
  async getMarketingChannelById(@Param('id') id: string) {
    return this.marketingService.getMarketingChannelById(id);
  }

  @Post('channels')
  @ApiOperation({ summary: 'Create marketing channel' })
  async createMarketingChannel(@Body() data: any) {
    return this.marketingService.createMarketingChannel(data);
  }

  @Patch('channels/:id')
  @ApiOperation({ summary: 'Update marketing channel' })
  async updateMarketingChannel(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateMarketingChannel(id, data);
  }

  @Delete('channels/:id')
  @ApiOperation({ summary: 'Delete marketing channel' })
  async deleteMarketingChannel(@Param('id') id: string) {
    await this.marketingService.deleteMarketingChannel(id);
    return { success: true };
  }

  // Content Schedule
  @Get('schedule')
  @ApiOperation({ summary: 'Get content schedule' })
  async getContentSchedule(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('channelId') channelId?: string,
    @Query('status') status?: string,
  ) {
    return this.marketingService.getContentSchedule({ startDate, endDate, channelId, status });
  }

  @Get('schedule/:id')
  @ApiOperation({ summary: 'Get content schedule item by ID' })
  async getContentScheduleById(@Param('id') id: string) {
    return this.marketingService.getContentScheduleById(id);
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Create content schedule item' })
  async createContentSchedule(@Body() data: any) {
    return this.marketingService.createContentSchedule(data);
  }

  @Patch('schedule/:id')
  @ApiOperation({ summary: 'Update content schedule item' })
  async updateContentSchedule(@Param('id') id: string, @Body() data: any) {
    return this.marketingService.updateContentSchedule(id, data);
  }

  @Delete('schedule/:id')
  @ApiOperation({ summary: 'Delete content schedule item' })
  async deleteContentSchedule(@Param('id') id: string) {
    await this.marketingService.deleteContentSchedule(id);
    return { success: true };
  }

  // KPIs
  @Get('kpis/social-media')
  @ApiOperation({ summary: 'Get social media KPIs' })
  async getSocialMediaKpis(
    @Query('channelId') channelId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.marketingService.getSocialMediaKpis({ channelId, startDate, endDate });
  }

  @Get('kpis/platform')
  @ApiOperation({ summary: 'Get platform KPIs' })
  async getPlatformKpis(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.marketingService.getPlatformKpis({ startDate, endDate });
  }

  @Post('kpis/social-media')
  @ApiOperation({ summary: 'Create social media KPI entry' })
  async createSocialMediaKpi(@Body() data: any) {
    return this.marketingService.createSocialMediaKpi(data);
  }

  @Post('kpis/platform')
  @ApiOperation({ summary: 'Create platform KPI entry' })
  async createPlatformKpi(@Body() data: any) {
    return this.marketingService.createPlatformKpi(data);
  }
}
