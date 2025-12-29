import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';

@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}
  // TODO: Implement resources endpoints
}

