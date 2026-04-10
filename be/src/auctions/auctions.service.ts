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
      sort?: string;
    } = {},
  ) {
    const { status, limit, categoryId, sort } = query;

    return this.prisma.auction.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(categoryId && { product: { categoryId } }),
      },
      take: limit ? Number(limit) : undefined, // Nếu truyền limit thì lấy đúng số lượng đó
      orderBy: {
        ...(sort === 'price_asc' && { currentPrice: 'asc' }),
        ...(sort === 'ending_soon' && { endTime: 'asc' }),
        ...(!sort && { startTime: 'desc' }), // Mặc định là mới nhất
      },
      include: {
        product: { include: { category: true } },
      },
    });
  }
}
