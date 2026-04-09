import { Controller, Get } from '@nestjs/common';
import { AuctionsService } from './auctions.service';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Get()
  async getActiveAuctions() {
    return this.auctionsService.findAllActive();
  }
}
