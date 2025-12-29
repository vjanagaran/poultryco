import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AdminJwtGuard } from '../admin/guards/admin-jwt.guard';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('users/metrics')
  @ApiOperation({ summary: 'Get user metrics' })
  async getUserMetrics() {
    return this.analyticsService.getUserMetrics();
  }

  @Get('users/completion-segments')
  @ApiOperation({ summary: 'Get profile completion segments' })
  async getProfileCompletionSegments() {
    return this.analyticsService.getProfileCompletionSegments();
  }

  @Get('users/location-distribution')
  @ApiOperation({ summary: 'Get location distribution' })
  async getLocationDistribution() {
    return this.analyticsService.getLocationDistribution();
  }

  @Get('users/daily-growth')
  @ApiOperation({ summary: 'Get daily user growth' })
  async getDailyUserGrowth() {
    return this.analyticsService.getDailyUserGrowth();
  }

  @Get('entities/metrics')
  @ApiOperation({ summary: 'Get entity metrics (businesses, organizations)' })
  async getEntityMetrics() {
    return this.analyticsService.getEntityMetrics();
  }

  @Get('users/recent-signups')
  @ApiOperation({ summary: 'Get recent signups' })
  async getRecentSignups(@Query('limit') limit?: string) {
    return this.analyticsService.getRecentSignups(limit ? parseInt(limit, 10) : 10);
  }
}
