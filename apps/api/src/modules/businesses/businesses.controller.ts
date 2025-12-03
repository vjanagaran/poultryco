import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BusinessesService } from './businesses.service';

@ApiTags('Businesses')
@Controller('businesses')
export class BusinessesController {
  constructor(private businessesService: BusinessesService) {}

  // TODO: Implement business endpoints
  // GET /businesses - List businesses
  // GET /businesses/:slug - Get business profile
  // POST /businesses - Create business
  // PUT /businesses/:id - Update business
  // DELETE /businesses/:id - Delete business
  // POST /businesses/:id/team - Add team member
  // POST /businesses/:id/products - Add product
}

