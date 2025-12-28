import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search organizations' })
  @ApiResponse({ status: 200, description: 'Organizations found' })
  async searchOrganizations(
    @Query('q') search?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('organizationType') organizationType?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.organizationsService.searchOrganizations({
      search,
      city,
      state,
      organizationType,
      limit,
      offset,
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get organization by slug' })
  @ApiResponse({ status: 200, description: 'Organization found' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrganization(@Param('slug') slug: string) {
    return this.organizationsService.getOrganizationBySlug(slug);
  }
}
