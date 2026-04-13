import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuctionsService } from './auctions.service';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Get()
  async getActiveAuctions(@Query() query: any) {
    return this.auctionsService.findAll(query);
  }

  @Get(':id')
  async getAuctionDetail(@Param('id') id: string) {
    return this.auctionsService.findOne(id);
  }
}
