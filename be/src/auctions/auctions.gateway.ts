import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuctionsService } from './auctions.service';
import { JwtService } from '@nestjs/jwt';
import { Cron } from '@nestjs/schedule';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

// Cấu hình Gateway với CORS để cho phép Frontend truy cập
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000', // Đổi từ '*' thành origin cụ thể của frontend
    credentials: true,
  },
  namespace: 'auctions', // Tách biệt không gian cho đấu giá
})
export class AuctionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly jwtService: JwtService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  // 1. Chạy khi có một người dùng kết nối vào Socket
  handleConnection(client: Socket) {
    console.log(`🔌 Thiết bị kết nối mới: ${client.id}`);
  }

  // 2. Chạy khi người dùng ngắt kết nối (tắt trình duyệt)
  handleDisconnect(client: Socket) {
    console.log(`❌ Thiết bị đã ngắt kết nối: ${client.id}`);
  }

  // 3. Sự kiện: Người dùng tham gia vào room của một phiên đấu giá
  @SubscribeMessage('joinAuction')
  handleJoinAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() auctionId: string,
  ) {
    client.join(`auction_${auctionId}`);
    console.log(
      `👤 Client ${client.id} đã tham gia phòng: auction_${auctionId}`,
    );

    return { event: 'joined', data: auctionId };
  }

  // 4. Sự kiện: Rời khỏi phòng (khi chuyển sang xem sản phẩm khác)
  @SubscribeMessage('leaveAuction')
  handleLeaveAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() auctionId: string,
  ) {
    client.leave(`auction_${auctionId}`);
    console.log(`👤 Client ${client.id} đã rời phòng: auction_${auctionId}`);
  }

  // 5. Sự kiện: Đặt giá
  @SubscribeMessage('placeBid')
  async handlePlaceBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auctionId: string; amount: number },
  ) {
    try {
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (!token) throw new Error('Unauthorized');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      const userId = payload.sub;

      // 2. Gọi service xử lý
      const result = await this.auctionsService.placeBid(
        userId,
        data.auctionId,
        data.amount,
      );

      // 3. Phát tán cho TẤT CẢ mọi người trong phòng
      this.server.to(`auction_${data.auctionId}`).emit('bidUpdated', {
        newPrice: Number(result.updatedAuction.currentPrice),
        bidderName: result.newBid.bidder.fullName,
        newBid: result.newBid,
        newEndTime: result.updatedAuction.endTime, // Gửi kèm thời gian mới nếu có gia hạn
        bidCount: Number(result.updatedAuction._count.bids),
      });

      return { status: 'success' };
    } catch (error) {
      // Gửi lỗi riêng cho người vừa bid thất bại
      client.emit('exception', { message: error.message });
    }
  }

  @Cron('*/10 * * * * *')
  async handleAuctionCron() {
    const result = await this.auctionsService.updateAuctionStatuses();

    // Nếu có phiên vừa kết thúc
    for (const auction of result.completedAuctions) {
      // 1. Gửi cho người thắng (WINNER)
      if (auction.currentWinnerId) {
        this.notificationsGateway.sendToUser(
          auction.currentWinnerId,
          'newNotification',
          {
            title: '🎉 Chúc mừng! Bạn đã thắng cuộc',
            content: `Sản phẩm "${auction.product.name}" đã thuộc về bạn!`,
            type: 'WINNER',
            link: `/auctions/${auction.id}`,
          },
        );
      }

      // 2. Gửi cho người bán (AUCTION_END)
      this.notificationsGateway.sendToUser(
        auction.product.sellerId,
        'newNotification',
        {
          title: '🏁 Phiên đấu giá kết thúc',
          content: `Phiên đấu giá sản phẩm "${auction.product.name}" đã kết thúc.`,
          type: 'AUCTION_END',
          link: `/auctions/${auction.id}`,
        },
      );

      // 3. Thông báo chung trong phòng (để mọi người biết phiên đã đóng)
      this.server.to(`auction_${auction.id}`).emit('auctionFinished', {
        auctionId: auction.id,
        winnerId: auction.currentWinnerId,
      });
    }
  }
}
