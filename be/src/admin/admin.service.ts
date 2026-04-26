import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, activeAuctions, pendingAuctions, totalRevenue, chartData] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.auction.count({ where: { status: 'ACTIVE' } }),
        this.prisma.auction.count({ where: { status: 'PENDING' } }),
        this.prisma.auction.aggregate({
          _sum: { currentPrice: true },
          where: { status: 'COMPLETED' },
        }),
        this.getChartData(),
      ]);

    return {
      summary: {
        totalUsers,
        activeAuctions,
        pendingAuctions,
        totalRevenue: totalRevenue._sum.currentPrice || 0,
      },
      chartData,
      recentBids: await this.prisma.bid.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { bidder: true, auction: { include: { product: true } } },
      }),
    };
  }

  async getChartData() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Lấy các phiên đã kết thúc trong 7 ngày qua
    const completedAuctions = await this.prisma.auction.findMany({
      where: {
        status: 'COMPLETED',
        endTime: { gte: sevenDaysAgo },
      },
      select: {
        endTime: true,
        currentPrice: true,
      },
      orderBy: { endTime: 'asc' },
    });

    // 2. Tạo mảng 7 ngày gần nhất để đảm bảo ngày nào cũng có dữ liệu (kể cả doanh thu = 0)
    const chartData: { date: string; revenue: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      });

      // Lọc dữ liệu trong DB khớp với ngày này
      const dayData = completedAuctions.filter(
        (a) =>
          new Date(a.endTime).toLocaleDateString('vi-VN') ===
          date.toLocaleDateString('vi-VN'),
      );

      const totalRevenue = dayData.reduce(
        (sum, item) => sum + Number(item.currentPrice),
        0,
      );
      const totalAuctions = dayData.length;

      chartData.push({
        date: dateStr,
        revenue: totalRevenue,
        count: totalAuctions,
      });
    }

    return chartData;
  }
}
