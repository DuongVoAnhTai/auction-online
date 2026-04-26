import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get('email')
  async findByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get('profile')
  async getProfile(@Req() req) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Patch('update')
  async updateProfile(
    @Req() req,
    @Body() data: { fullName?: string; avatarUrl?: string },
  ) {
    return this.usersService.updateProfile(req.user.sub, data);
  }

  // API Upload ảnh lên Cloudinary
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadImage(file, 'avatars');
    return { url: result.url };
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAll(@Query('search') search: string) {
    return this.usersService.findAllAdmin(search);
  }

  @Patch('admin/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.usersService.changeRole(id, body.role);
  }
}
