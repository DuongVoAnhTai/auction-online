import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuctionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    query: {
      status?: string;
      limit?: number;
      page?: number;
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
    } = {},
  ) {
    const {
      status,
      categoryId,
      limit = 12,
      page = 1,
      minPrice,
      maxPrice,
      sort,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      status: status as any,
      ...(categoryId && { product: { categoryId } }),
      currentPrice: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined,
      },
    };

    // 3. Gọi song song: Lấy dữ liệu và Đếm tổng số bản ghi
    const [totalItems, auctions] = await Promise.all([
      this.prisma.auction.count({ where }), // Đếm tổng để tính tổng số trang
      this.prisma.auction.findMany({
        where,
        skip: skip,
        take: Number(limit),
        include: {
          product: { include: { category: true } },
        },
        orderBy: {
          ...(sort === 'price_asc' && { currentPrice: 'asc' }),
          ...(sort === 'price_desc' && { currentPrice: 'desc' }),
          ...(sort === 'ending_soon' && { endTime: 'asc' }),
          ...(!sort && { startTime: 'desc' }),
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: auctions,
      meta: {
        totalItems,
        itemCount: auctions.length,
        itemsPerPage: Number(limit),
        totalPages,
        currentPage: Number(page),
      },
    };
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

  async placeBid(userId: string, auctionId: string, amount: number) {
    // 1. Kiểm tra phiên đấu giá có tồn tại và đang ACTIVE không
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      include: { product: true },
    });

    if (!auction || auction.status !== 'ACTIVE') {
      throw new BadRequestException(
        'Phiên đấu giá không tồn tại hoặc đã kết thúc',
      );
    }

    // 2. Kiểm tra thời gian
    const now = new Date();
    if (now > auction.endTime || now < auction.startTime) {
      throw new BadRequestException('Ngoài thời gian đấu giá');
    }

    // 3. Kiểm tra người bán (không được tự đấu giá)
    if (userId === auction.product.sellerId) {
      throw new ForbiddenException(
        'Bạn không thể đấu giá sản phẩm của chính mình',
      );
    }

    // 4. Kiểm tra bước giá tối thiểu
    const minNextBid =
      Number(auction.currentPrice) + Number(auction.bidIncrement);
    if (amount < minNextBid) {
      throw new BadRequestException(
        `Số tiền phải lớn hơn hoặc bằng ${minNextBid.toLocaleString()}đ`,
      );
    }

    // 5. SỬ DỤNG TRANSACTION ĐỂ XỬ LÝ TRANH CHẤP (CONCURRENCY)
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Thực hiện Update với điều kiện Optimistic Locking (where version = current_version)
        const updatedAuction = await tx.auction.update({
          where: {
            id: auctionId,
            version: auction.version, // Chỉ update nếu version chưa bị ai thay đổi
          },
          data: {
            currentPrice: amount,
            currentWinnerId: userId,
            version: { increment: 1 }, // Tăng version lên để người sau ko dùng version cũ được nữa
          },
        });

        // Tạo bản ghi lượt Bid chính thức
        const newBid = await tx.bid.create({
          data: {
            auctionId,
            bidderId: userId,
            amount,
          },
          include: {
            bidder: { select: { fullName: true, avatarUrl: true } },
          },
        });

        // Ghi vào nhật ký BidLog (Success)
        await tx.bidLog.create({
          data: {
            auctionId,
            bidderId: userId,
            amount,
            status: 'SUCCESS',
          },
        });

        // LOGIC GIA HẠN THỜI GIAN MỚI (RESET VỀ 30S)
        const timeLeft = updatedAuction.endTime.getTime() - now.getTime();
        let finalAuction = updatedAuction;

        if (updatedAuction.sniperProtection && timeLeft < 30 * 1000) {
          // Nếu thời gian còn lại < 30s, thiết lập endTime mới = thời điểm hiện tại + 30s
          const newEndTime = new Date(now.getTime() + 30 * 1000);

          finalAuction = await tx.auction.update({
            where: { id: auctionId },
            data: { endTime: newEndTime },
          });

          console.log(`⏰ Gia hạn phiên ${auctionId} thêm 30s từ bây giờ.`);
        }

        return { updatedAuction: finalAuction, newBid };
      });
    } catch (error) {
      // Nếu lỗi P2025 nghĩa là version đã bị thay đổi (người khác đã bid nhanh hơn)
      if (error.code === 'P2025') {
        throw new ConflictException(
          'Có người vừa trả giá cao hơn, vui lòng thử lại',
        );
      }
      throw error;
    }
  }

  async updateAuctionStatuses() {
    const now = new Date();

    // 1. Chuyển PENDING -> ACTIVE
    const pendingAuctions = await this.prisma.auction.findMany({
      where: {
        status: 'PENDING',
        startTime: { lte: now },
      },
      select: { id: true },
    });

    const activatedIds = pendingAuctions.map((a) => a.id);

    if (activatedIds.length > 0) {
      await this.prisma.auction.updateMany({
        where: { id: { in: activatedIds } },
        data: { status: 'ACTIVE' },
      });
    }

    // 2. Chuyển ACTIVE -> COMPLETED
    const expiredAuctions = await this.prisma.auction.findMany({
      where: {
        status: 'ACTIVE',
        endTime: { lte: now },
      },
      select: { id: true, currentWinnerId: true, currentPrice: true },
    });

    if (expiredAuctions.length > 0) {
      const expiredIds = expiredAuctions.map((a) => a.id);
      await this.prisma.auction.updateMany({
        where: { id: { in: expiredIds } },
        data: { status: 'COMPLETED' },
      });
    }

    return {
      activatedCount: activatedIds.length,
      activatedIds,
      completedAuctions: expiredAuctions,
    };
  }
}
