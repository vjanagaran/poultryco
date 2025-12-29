import { Module } from '@nestjs/common';
import { NeccController } from './necc.controller';
import { NeccService } from './necc.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NeccController],
  providers: [NeccService],
  exports: [NeccService],
})
export class NeccModule {}

