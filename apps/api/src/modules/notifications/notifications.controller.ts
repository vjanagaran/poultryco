import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}
  // TODO: Implement notifications endpoints
}

