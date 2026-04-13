import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuctionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    query: {
      status?: string;
      limit?: number;
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
    } = {},
  ) {
    const { status, categoryId, limit, minPrice, maxPrice, sort } = query;

    return this.prisma.auction.findMany({
      where: {
        status: status as any,
        ...(categoryId && { product: { categoryId } }),
        // Lọc theo giá hiện tại
        currentPrice: {
          gte: minPrice ? Number(minPrice) : undefined,
          lte: maxPrice ? Number(maxPrice) : undefined,
        },
      },
      take: limit ? Number(limit) : undefined,
      include: {
        product: { include: { category: true } },
      },
      orderBy: {
        ...(sort === 'price_asc' && { currentPrice: 'asc' }),
        ...(sort === 'price_desc' && { currentPrice: 'desc' }),
        ...(sort === 'ending_soon' && { endTime: 'asc' }),
        ...(!sort && { startTime: 'desc' }),
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.auction.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
            seller: {
              // Lấy thông tin người bán
              select: { fullName: true, avatarUrl: true, email: true },
            },
          },
        },
        bids: {
          orderBy: { amount: 'desc' },
          take: 10, // Lấy 10 lượt trả giá gần nhất để hiện lịch sử
          include: {
            bidder: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });
  }
}
