import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { createClient } from 'redis';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Pub phát tin nhắn từ server lên redis
  // Sub nhận tin nhắn từ redis lên server
  const pubClient = createClient({
    url: process.env.REDIS_URL,
  });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);
  console.log('🚀 Đã kết nối thành công tới Cloud Redis');

  // 2. Thiết lập Adapter cho Socket.io
  app.useWebSocketAdapter(
    new (class extends IoAdapter {
      createIOServer(port: number, options?: any): any {
        const server = super.createIOServer(port, options);
        server.adapter(createAdapter(pubClient, subClient));
        return server;
      }
    })(app),
  );

  app.setGlobalPrefix('api/v1');
  const allowedOrigins = process.env.CLIENT_URL?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Kích hoạt pipe để NestJS đọc các Decorator @IsNotEmpty, @IsEmail.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các field không khai báo trong DTO
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
