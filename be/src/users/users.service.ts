import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email này đã được đăng ký sử dụng');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Sinh avatar mặc định
    const nameForAvatar = data.fullName.replace(/\s+/g, '+'); // Đổi khoảng trắng thành dấu +
    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${nameForAvatar}&background=random&color=ffff&size=128`;

    return this.prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        passwordHash: hashedPassword,
        avatarUrl: defaultAvatarUrl,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
