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

  @SubscribeMessage('placeBid')
  async handlePlaceBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auctionId: string; amount: number },
  ) {
    // 1. Ở đây Tài sẽ phải gọi Service để:
    // - Kiểm tra xem user có token không (Xác thực)
    // - Kiểm tra giá mới có lớn hơn giá cũ + bước giá không
    // - Kiểm tra phiên còn thời gian không
    // - Lưu lượt Bid mới vào bảng Bids, cập nhật currentPrice ở bảng Auction

    // Tạm thời mình giả lập xử lý thành công:
    const newPrice = data.amount;
    const bidderName = 'Người dùng ẩn danh'; // Sau này lấy từ JWT

    // 2. Phát tín hiệu cho tất cả mọi người trong phòng
    this.server.to(`auction_${data.auctionId}`).emit('bidUpdated', {
      newPrice: newPrice,
      bidderName: bidderName,
      newBid: {
        /* dữ liệu lượt bid vừa lưu */
      },
    });
  }
}
