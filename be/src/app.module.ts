import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, MailModule],
  controllers: [AppController],
  providers: [AppService, MailService, CloudinaryService],
})
export class AppModule {}
