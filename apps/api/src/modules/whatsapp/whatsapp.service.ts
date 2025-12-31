import { Injectable } from '@nestjs/common';
import { WhatsAppAccountService } from './whatsapp-account.service';
import { WhatsAppMessageService } from './whatsapp-message.service';
import { WhatsAppGroupService } from './whatsapp-group.service';

@Injectable()
export class WhatsAppService {
  constructor(
    private readonly accountService: WhatsAppAccountService,
    private readonly messageService: WhatsAppMessageService,
    private readonly groupService: WhatsAppGroupService,
  ) {}

  // Delegate to account service
  async getAccounts() {
    // Implementation will be in controller
    return this.accountService;
  }

  async getAccountStatus(accountId: string) {
    return this.accountService.getAccountStatus(accountId);
  }

  async initializeAccount(accountId: string) {
    return this.accountService.initializeAccount(accountId);
  }

  async disconnectAccount(accountId: string) {
    return this.accountService.disconnectAccount(accountId);
  }

  // Delegate to message service
  async sendMessage(data: any) {
    return this.messageService.sendMessage(data);
  }

  async getMessages(filters?: any) {
    return this.messageService.getMessages(filters);
  }

  // Delegate to group service
  async discoverGroups(accountId: string) {
    return this.groupService.discoverGroups(accountId);
  }

  async getGroups(filters?: any) {
    return this.groupService.getGroups(filters);
  }
}

