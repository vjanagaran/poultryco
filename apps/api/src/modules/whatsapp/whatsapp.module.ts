import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { WhatsAppMessageService } from './whatsapp-message.service';
import { WhatsAppGroupService } from './whatsapp-group.service';
import { WhatsAppGateway } from './whatsapp.gateway';
import { WhatsAppHealthCheckService } from './whatsapp-health-check.service';
import { WhatsAppLoggerService } from './whatsapp-logger.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, ScheduleModule.forRoot()],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    WhatsAppAccountService,
    WhatsAppMessageService,
    WhatsAppGroupService,
    WhatsAppGateway,
    WhatsAppHealthCheckService,
    WhatsAppLoggerService,
  ],
  exports: [
    WhatsAppService,
    WhatsAppAccountService,
    WhatsAppMessageService,
    WhatsAppGroupService,
    WhatsAppGateway,
  ],
})
export class WhatsAppModule {}

