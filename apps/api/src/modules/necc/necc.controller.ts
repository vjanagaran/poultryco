import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NeccService } from './necc.service';

@ApiTags('NECC')
@Controller('necc')
export class NeccController {
  constructor(private neccService: NeccService) {}
  // TODO: Implement NECC endpoints
}

