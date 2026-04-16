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
import { AuctionsService } from './auctions/auctions.service';
import { AuctionsController } from './auctions/auctions.controller';
import { CategoriesModule } from './categories/categories.module';
import { AuctionsModule } from './auctions/auctions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    MailModule,
    CategoriesModule,
    AuctionsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, AuctionsController],
  providers: [AppService, MailService, CloudinaryService, AuctionsService],
})
export class AppModule {}
