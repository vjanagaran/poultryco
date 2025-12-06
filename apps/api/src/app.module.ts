import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { SocialModule } from './modules/social/social.module';
import { MessagesModule } from './modules/messages/messages.module';
import { EventsModule } from './modules/events/events.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { NeccModule } from './modules/necc/necc.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadModule } from './modules/upload/upload.module';
import { SocketModule } from './modules/socket/socket.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ContentModule } from './modules/content/content.module';
import { FormsModule } from './modules/forms/forms.module';
import { MarketingModule } from './modules/marketing/marketing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    BusinessesModule,
    OrganizationsModule,
    SocialModule,
    MessagesModule,
    EventsModule,
    JobsModule,
    ResourcesModule,
    NeccModule,
    NotificationsModule,
    UploadModule,
    SocketModule,
    AdminModule,
    AnalyticsModule,
    ContentModule,
    FormsModule,
    MarketingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

