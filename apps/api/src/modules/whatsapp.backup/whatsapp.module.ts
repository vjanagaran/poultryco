import { Module } from '@nestjs/common';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { WhatsAppMessageService } from './whatsapp-message.service';
import { WhatsAppGroupService } from './whatsapp-group.service';
import { WhatsAppGateway } from './whatsapp.gateway';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WhatsAppController],
  providers: [
    WhatsAppService,
    WhatsAppAccountService,
    WhatsAppMessageService,
    WhatsAppGroupService,
    WhatsAppGateway,
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

