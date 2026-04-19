import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuctionsService } from './auctions.service';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Get()
  async getActiveAuctions(@Query() query: any) {
    return this.auctionsService.findAll(query);
  }

  @Get('suggestions')
  async getSuggestions(@Query('search') search: string) {
    return this.auctionsService.getSuggestions(search);
  }

  @Get(':id')
  async getAuctionDetail(@Param('id') id: string) {
    return this.auctionsService.findOne(id);
  }
}
