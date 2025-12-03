import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.module';

@Injectable()
export class MessagesService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}
  // TODO: Implement messaging, conversations, participants
}

