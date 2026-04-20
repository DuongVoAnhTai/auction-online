import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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

  @Get('my-auctions')
  @UseGuards(JwtAuthGuard)
  async getMyAuctions(@Req() req) {
    return this.auctionsService.findBySeller(req.user.sub);
  }

  @Get(':id')
  async getAuctionDetail(@Param('id') id: string) {
    return this.auctionsService.findOne(id);
  }
}
