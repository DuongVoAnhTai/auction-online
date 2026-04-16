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

    // Nếu có phiên vừa bắt đầu
    if (result.activatedCount > 0) {
      this.server.emit('globalUpdate', {
        message: `🎉 Có ${result.activatedCount} phiên đấu giá mới vừa bắt đầu! Khám phá ngay.`,
        type: 'INFO',
      });
    }

    // Auction Started
    if (result.activatedIds && result.activatedIds.length > 0) {
      for (const id of result.activatedIds) {
        this.server.to(`auction_${id}`).emit('auctionStarted', {
          auctionId: id,
          status: 'ACTIVE',
        });
        console.log(`⚡ Phiên ${id} đã chính thức bắt đầu!`);
      }
    }

    // Nếu có phiên vừa kết thúc
    for (const auction of result.completedAuctions) {
      // Bắn tin nhắn vào phòng riêng của phiên đó
      this.server.to(`auction_${auction.id}`).emit('auctionFinished', {
        auctionId: auction.id,
        winnerId: auction.currentWinnerId,
        finalPrice: auction.currentPrice,
      });

      console.log(
        `🏁 Phiên ${auction.id} đã kết thúc. Winner: ${auction.currentWinnerId}`,
      );
    }
  }
}
