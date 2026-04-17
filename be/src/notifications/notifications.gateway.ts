import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: 'notifications',
  cors: { origin: 'http://localhost:3000' },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      // Mỗi User tham gia vào 1 room riêng dựa trên ID của họ
      client.join(`user_${userId}`);
      console.log(
        `🔔 User ${userId} đã kết nối vào đường ống thông báo (Socket ID: ${client.id})`,
      );
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`🔕 Một thiết bị đã ngắt kết nối thông báo`);
  }

  // Hàm tiện ích để bắn thông báo từ Service
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }
}
