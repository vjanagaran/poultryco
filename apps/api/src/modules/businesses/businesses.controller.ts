import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private businessesService: BusinessesService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search businesses' })
  @ApiResponse({ status: 200, description: 'Businesses found' })
  async searchBusinesses(
    @Query('q') search?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('businessType') businessType?: string,
    @Query('verified') verified?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.businessesService.searchBusinesses({
      search,
      city,
      state,
      businessType,
      verified,
      limit,
      offset,
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get business by slug' })
  @ApiResponse({ status: 200, description: 'Business found' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getBusiness(@Param('slug') slug: string) {
    return this.businessesService.getBusinessBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create business' })
  @ApiResponse({ status: 201, description: 'Business created' })
  async createBusiness(@CurrentUser('profileId') profileId: string, @Body() data: any) {
    return this.businessesService.createBusiness(profileId, data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update business' })
  @ApiResponse({ status: 200, description: 'Business updated' })
  async updateBusiness(
    @Param('id') id: string,
    @CurrentUser('profileId') profileId: string,
    @Body() data: any,
  ) {
    return this.businessesService.updateBusiness(id, profileId, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete business' })
  @ApiResponse({ status: 200, description: 'Business deleted' })
  async deleteBusiness(@Param('id') id: string, @CurrentUser('profileId') profileId: string) {
    return this.businessesService.deleteBusiness(id, profileId);
  }
}
