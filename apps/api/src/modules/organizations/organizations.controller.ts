import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}
  // TODO: Implement organization endpoints
}

