import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.module';

@Injectable()
export class EventsService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}
  // TODO: Implement events, registrations, attendees
}

