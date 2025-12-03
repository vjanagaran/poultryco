import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { AuthModule } from '../auth/auth.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [AuthModule, SocketModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}

