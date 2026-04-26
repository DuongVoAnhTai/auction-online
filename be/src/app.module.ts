import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';
import { CategoriesModule } from './categories/categories.module';
import { AuctionsModule } from './auctions/auctions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    MailModule,
    CategoriesModule,
    AuctionsModule,
    ScheduleModule.forRoot(),
    NotificationsModule,
    CloudinaryModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService, CloudinaryService],
})
export class AppModule {}
