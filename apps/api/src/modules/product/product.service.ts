import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.flowerProduct.findMany({
      orderBy: { productCode: 'asc' },
    });
  }

  async findById(id: string) {
    const product = await this.prisma.flowerProduct.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('商品が見つかりません');
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.flowerProduct.create({
      data: {
        productCode: dto.productCode,
        name: dto.name,
        category: dto.category,
        price: dto.price,
        description: dto.description ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.flowerProduct.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('商品が見つかりません');

    return this.prisma.flowerProduct.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.category !== undefined ? { category: dto.category } : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description || null }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async softDelete(id: string) {
    const product = await this.prisma.flowerProduct.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('商品が見つかりません');

    return this.prisma.flowerProduct.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateImage(id: string, imageUrl: string) {
    const product = await this.prisma.flowerProduct.findUnique({
      where: { id },
    });
    if (!product) throw new NotFoundException('商品が見つかりません');

    return this.prisma.flowerProduct.update({
      where: { id },
      data: { imageUrl },
    });
  }
}
