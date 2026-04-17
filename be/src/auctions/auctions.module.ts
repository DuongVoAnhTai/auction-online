import { Module } from '@nestjs/common';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { AuctionsGateway } from './auctions.gateway';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsGateway],
  exports: [AuctionsService],
})
export class AuctionsModule {}
