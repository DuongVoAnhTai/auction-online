import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

const prisma = new PrismaService();

async function main() {
  console.log('🚀 Đang bắt đầu seed dữ liệu...');

  // 1. Xóa dữ liệu cũ (để tránh trùng lặp khi chạy lại)
  await prisma.notification.deleteMany();
  await prisma.bidLog.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.authOTP.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 2. Tạo User mẫu
  const passwordHash = await bcrypt.hash('Password123@', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      fullName: 'Quản trị viên',
      passwordHash,
      role: 'ADMIN',
      avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=random',
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: 'seller@test.com',
      fullName: 'Người bán hàng',
      passwordHash,
      role: 'SELLER',
      avatarUrl: 'https://ui-avatars.com/api/?name=Seller&background=random',
    },
  });

  const bidder = await prisma.user.create({
    data: {
      email: 'bidder@test.com',
      fullName: 'Người đấu giá',
      passwordHash,
      role: 'BIDDER',
      avatarUrl: 'https://ui-avatars.com/api/?name=Bidder&background=random',
    },
  });

  // 3. Tạo Category
  const categories = await Promise.all(
    ['Đồ điện tử', 'Đồ cổ', 'Xe cộ', 'Bất động sản', 'Đồ sưu tầm'].map((name) =>
      prisma.category.create({
        data: { name, slug: faker.helpers.slugify(name).toLowerCase() },
      }),
    ),
  );

  // 4. Tạo Product và Auction mẫu (20 cái)
  for (let i = 0; i < 20; i++) {
    const productName = faker.commerce.productName();
    const product = await prisma.product.create({
      data: {
        name: productName,
        description: faker.commerce.productDescription(),
        sellerId: seller.id,
        categoryId:
          categories[Math.floor(Math.random() * categories.length)].id,
        images: [
          faker.image.urlLoremFlickr({
            category: 'technics',
            width: 640,
            height: 480,
          }),
          faker.image.urlLoremFlickr({
            category: 'business',
            width: 640,
            height: 480,
          }),
        ],
      },
    });

    // Tạo trạng thái ngẫu nhiên cho Auction
    const statusRand = Math.random();
    let startTime, endTime, status;

    if (statusRand < 0.6) {
      // 60% đang diễn ra
      status = 'ACTIVE';
      startTime = faker.date.recent();
      endTime = faker.date.soon({ days: 1 }); // Kết thúc trong vòng 24h tới
    } else if (statusRand < 0.8) {
      // 20% sắp diễn ra
      status = 'PENDING';
      startTime = faker.date.soon({ days: 2 });
      endTime = faker.date.soon({ days: 5 });
    } else {
      // 20% đã kết thúc
      status = 'COMPLETED';
      startTime = faker.date.past();
      endTime = faker.date.recent();
    }

    const startingPrice = parseFloat(
      faker.commerce.price({ min: 100000, max: 1000000 }),
    );

    await prisma.auction.create({
      data: {
        productId: product.id,
        startingPrice: startingPrice,
        currentPrice: startingPrice,
        bidIncrement: 50000,
        startTime,
        endTime,
        status: status as any,
        sniperProtection: true,
      },
    });
  }

  console.log('✅ Seed dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
