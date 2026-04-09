import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuctionsService {
  constructor(private prisma: PrismaService) {}

  async findAllActive() {
    return this.prisma.auction.findMany({
      where: {
        status: 'ACTIVE', // Chỉ lấy những phiên đang diễn ra
      },
      include: {
        product: {
          include: {
            category: true, // Lấy luôn tên danh mục
          },
        },
      },
      orderBy: {
        endTime: 'asc', // Phiên nào sắp kết thúc thì hiện lên đầu
      },
    });
  }
}
