import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SocialService } from './social.service';

@ApiTags('Social')
@Controller('social')
export class SocialController {
  constructor(private socialService: SocialService) {}
  // TODO: Implement social feed, connections, posts endpoints
}

