import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@/database/database.module';

@Injectable()
export class NeccService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}
  // TODO: Implement NECC market data, prices, annotations
}

