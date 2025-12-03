import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { AuthModule } from '../auth/auth.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [AuthModule, SocketModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

