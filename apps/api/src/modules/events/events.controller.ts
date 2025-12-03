import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}
  // TODO: Implement events endpoints
}

