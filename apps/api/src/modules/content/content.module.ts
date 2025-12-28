import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { PublicBlogController } from './public-blog.controller';
import { ContentService } from './content.service';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ContentController, PublicBlogController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
