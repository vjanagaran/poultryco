import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JobsService } from './jobs.service';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}
  // TODO: Implement jobs endpoints
}

