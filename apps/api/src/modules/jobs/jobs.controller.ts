import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JobsService } from './jobs.service';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search jobs' })
  @ApiResponse({ status: 200, description: 'Jobs found' })
  async searchJobs(
    @Query('q') search?: string,
    @Query('employmentType') employmentType?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('isRemote') isRemote?: boolean,
    @Query('salaryMin') salaryMin?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.jobsService.searchJobs({
      search,
      employmentType,
      city,
      state,
      isRemote,
      salaryMin,
      limit,
      offset,
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get job by slug' })
  @ApiResponse({ status: 200, description: 'Job found' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJob(@Param('slug') slug: string) {
    return this.jobsService.getJobBySlug(slug);
  }
}
