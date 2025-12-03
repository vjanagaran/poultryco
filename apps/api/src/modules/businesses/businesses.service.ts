import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.module';

@Injectable()
export class BusinessesService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  // Business CRUD operations
  // TODO: Implement business profile management
}

