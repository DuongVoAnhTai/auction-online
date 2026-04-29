import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
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

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        is2faEnabled: true,

        bids: {
          include: {
            auction: {
              include: { product: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateProfile(
    userId: string,
    data: { fullName?: string; avatarUrl?: string },
  ) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async findAllAdmin(search?: string) {
    const users = await this.prisma.user.findMany({
      where: search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {},
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { data: users };
  }

  async changeRole(userId: string, newRole: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any },
    });
  }

  async getPublicProfile(sellerId: string) {
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!seller) throw new NotFoundException('Không tìm thấy người bán');

    const auctions = await this.prisma.auction.findMany({
      where: {
        product: { sellerId: sellerId },
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      include: {
        product: { include: { category: true } },
        _count: { select: { bids: true } },
      },
      orderBy: { startTime: 'desc' },
    });

    return { seller, auctions };
  }
}
