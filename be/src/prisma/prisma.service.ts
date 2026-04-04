import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const url = process.env.DATABASE_URL;

    if (!url) {
      throw new Error('DATABASE_URL is missing in .env file');
    }

    super({
      accelerateUrl: url,
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🚀 Đã kết nối thành công tới Database PostgreSQL');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
