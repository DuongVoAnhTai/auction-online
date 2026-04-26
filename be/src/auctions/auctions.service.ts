import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuctionDto } from './dto/create-auction.dto';

@Injectable()
export class AuctionsService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async findAll(
    query: {
      status?: string;
      limit?: number;
      page?: number;
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      sort?: string;
      search?: string;
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
      search,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const now = new Date();

    const where: any = {
      ...(categoryId && { product: { categoryId } }),
      ...(search && {
        product: {
          name: {
            contains: search,
            mode: 'insensitive' as const, // Tìm kiếm không phân biệt hoa thường
          },
        },
      }),
      currentPrice: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined,
      },
    };

    if (status === 'ACTIVE') {
      // Chỉ lấy những phiên ĐÃ DUYỆT và ĐANG TRONG GIỜ ĐẤU GIÁ
      where.status = 'ACTIVE';
      where.startTime = { lte: now };
      where.endTime = { gt: now };
    } else if (status === 'UPCOMING') {
      // Chỉ lấy những phiên ĐÃ DUYỆT nhưng CHƯA TỚI GIỜ BẮT ĐẦU
      where.status = 'ACTIVE';
      where.startTime = { gt: now };
    } else if (status === 'PENDING') {
      // Chỉ dành cho ADMIN hoặc SELLER xem hàng chờ duyệt của mình
      where.status = 'PENDING';
    } else if (status === 'COMPLETED') {
      where.status = 'COMPLETED';
    }

    // 3. Gọi song song: Lấy dữ liệu và Đếm tổng số bản ghi
    const [totalItems, auctions] = await Promise.all([
      this.prisma.auction.count({ where }), // Đếm tổng để tính tổng số trang
      this.prisma.auction.findMany({
        where,
        skip: skip,
        take: Number(limit),
        include: {
          product: { include: { category: true, seller: true } },
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
              select: {
                fullName: true,
                avatarUrl: true,
                email: true,
                createdAt: true,
              },
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

  async getSuggestions(search: string) {
    if (!search) return [];
    return this.prisma.auction.findMany({
      where: {
        status: 'ACTIVE',
        product: {
          name: { contains: search, mode: 'insensitive' },
        },
      },
      take: 5, // Chỉ lấy 5 kết quả gợi ý nhanh
      include: {
        product: { select: { name: true, images: true } },
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

    if (auction.currentWinnerId && auction.currentWinnerId !== userId) {
      const previousWinnerId = auction.currentWinnerId;
      const notifData = {
        title: 'Bạn đã bị vượt giá!',
        content: `Sản phẩm ${auction.product.name} vừa có người trả giá ${amount.toLocaleString()}đ.`,
        link: `/auctions/${auctionId}`,
        type: 'OUTBID',
      };

      // 1. Lưu vào Database để xem lại sau
      await this.prisma.notification.create({
        data: { userId: previousWinnerId, ...notifData },
      } as any);

      // 2. Bắn Socket Real-time ngay lập tức
      this.notificationsGateway.sendToUser(
        previousWinnerId,
        'newNotification',
        notifData,
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
      completedAuctions: expiredAuctions,
    };
  }

  async findBySeller(userId: string) {
    return this.prisma.auction.findMany({
      where: {
        product: {
          sellerId: userId,
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async create(userId: string, data: CreateAuctionDto, imageUrls: string[]) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Tạo Sản phẩm trước
      const product = await tx.product.create({
        data: {
          name: data.name,
          description: data.description,
          sellerId: userId,
          categoryId: data.categoryId,
          images: imageUrls, // Mảng URL từ Cloudinary
        },
      });

      // 2. Tạo Phiên đấu giá gắn với sản phẩm đó
      const auction = await tx.auction.create({
        data: {
          productId: product.id,
          startingPrice: parseFloat(data.startingPrice),
          currentPrice: parseFloat(data.startingPrice),
          bidIncrement: parseFloat(data.bidIncrement),
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          status: 'PENDING', // Mặc định chờ duyệt
        },
      });

      return auction;
    });
  }

  async update(userId: string, auctionId: string, data: any) {
    // 1. Tìm phiên đấu giá và kiểm tra quyền
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      include: { product: true },
    });

    if (!auction) throw new NotFoundException('Không tìm thấy phiên đấu giá');
    if (auction.product.sellerId !== userId)
      throw new ForbiddenException('Bạn không có quyền sửa sản phẩm này');

    // 2. Chặn sửa nếu phiên đã ACTIVE hoặc COMPLETED
    if (auction.status !== 'PENDING' && auction.status !== 'REJECTED') {
      throw new BadRequestException(
        'Chỉ có thể sửa sản phẩm đang chờ duyệt hoặc bị từ chối',
      );
    }

    // 3. Thực hiện cập nhật bằng Transaction
    return this.prisma.$transaction(async (tx) => {
      // Cập nhật bảng Auction và bảng Product lồng nhau
      return tx.auction.update({
        where: { id: auctionId },
        data: {
          startingPrice: parseFloat(data.startingPrice),
          currentPrice: parseFloat(data.startingPrice), // Reset giá hiện tại bằng giá khởi điểm mới
          bidIncrement: parseFloat(data.bidIncrement),
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          status: 'PENDING', // Sau khi sửa, chuyển về trạng thái chờ duyệt lại
          product: {
            update: {
              name: data.name,
              description: data.description,
              categoryId: data.categoryId,
              // ...(data.images && { images: data.images }),
            },
          },
        },
      });
    });
  }

  async remove(userId: string, auctionId: string) {
    // 1. Tìm và kiểm tra quyền sở hữu + trạng thái
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      include: { product: true },
    });

    if (!auction) throw new NotFoundException('Không tìm thấy phiên đấu giá');
    if (auction.product.sellerId !== userId)
      throw new ForbiddenException('Bạn không có quyền xóa bài đăng này');

    // 2. Chỉ cho phép xóa nếu chưa ACTIVE hoặc COMPLETED
    if (auction.status !== 'PENDING' && auction.status !== 'REJECTED') {
      throw new BadRequestException(
        'Không thể xóa phiên đấu giá đang diễn ra hoặc đã kết thúc',
      );
    }

    // 3. Thực hiện xóa (Dùng transaction để xóa cả 2 bảng)
    return this.prisma.$transaction(async (tx) => {
      await tx.auction.delete({ where: { id: auctionId } });
      await tx.product.delete({ where: { id: auction.productId } });
      return { message: 'Xóa bài đăng thành công' };
    });
  }

  async handleApproval(
    id: string,
    action: 'approve' | 'reject',
    reason?: string,
  ) {
    // 1. Kiểm tra phiên đấu giá có tồn tại không (Lấy ra ngoài transaction để dùng cho Socket sau này)
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!auction) throw new NotFoundException('Không tìm thấy phiên đấu giá');

    const result = await this.prisma.$transaction(async (tx) => {
      const newStatus = action === 'approve' ? 'ACTIVE' : 'REJECTED';

      // 2. Cập nhật trạng thái
      const updatedAuction = await tx.auction.update({
        where: { id },
        data: { status: newStatus },
      });

      // 3. Tạo thông báo cho Seller
      await tx.notification.create({
        data: {
          userId: auction.product.sellerId,
          title:
            action === 'approve'
              ? 'Sản phẩm đã được duyệt!'
              : 'Sản phẩm bị từ chối',
          content:
            action === 'approve'
              ? `Sản phẩm "${auction.product.name}" của bạn đã chính thức lên sàn.`
              : `Lý do từ chối: ${reason}`,
          type: 'SYSTEM',
          link: `/auctions/${id}`,
        },
      });

      return updatedAuction;
    });

    if (action === 'approve') {
      console.log(
        `📢 Emitting globalUpdate for product: ${auction.product.name}`,
      );
      // BẮN TIN NHẮN TOÀN HỆ THỐNG NGAY KHI ADMIN DUYỆTz
      this.notificationsGateway.server.emit('globalUpdate', {
        message: `✨ Sản phẩm "${auction.product.name}" vừa được lên sàn! Đừng bỏ lỡ.`,
        type: 'INFO',
      });
    }

    return result;
  }
}
