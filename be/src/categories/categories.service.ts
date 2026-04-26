import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async create(data: CategoryDto) {
    return this.prisma.category.create({ data });
  }

  async update(id: string, data: CategoryDto) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
    const count = await this.prisma.product.count({
      where: { categoryId: id },
    });
    if (count > 0) {
      throw new BadRequestException('Không thể xóa danh mục đang có sản phẩm');
    }
    return this.prisma.category.delete({ where: { id } });
  }
}
