import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('auctions')
export class AuctionsController {
  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 5)) // Cho phép tối đa 5 ảnh
  async createAuction(
    @Req() req,
    @Body() createAuctionDto: CreateAuctionDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // 1. Upload toàn bộ ảnh lên Cloudinary
    const uploadPromises = files.map((file) =>
      this.cloudinaryService.uploadImage(file, 'products'),
    );
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((res) => res.secure_url);

    // 2. Lưu vào Database
    return this.auctionsService.create(
      req.user.sub,
      createAuctionDto,
      imageUrls,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateAuction(
    @Req() req,
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    return this.auctionsService.update(req.user.sub, id, updateData);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteAuction(@Req() req, @Param('id') id: string) {
    return this.auctionsService.remove(req.user.sub, id);
  }

  @Get(':id')
  async getAuctionDetail(@Param('id') id: string) {
    return this.auctionsService.findOne(id);
  }

  @Get('admin/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getPending() {
    return this.auctionsService.findAll({ status: 'PENDING' });
  }

  // Xử lý duyệt hoặc từ chối
  @Patch('admin/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async reviewAuction(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; reason?: string },
  ) {
    return this.auctionsService.handleApproval(id, body.action, body.reason);
  }
}
