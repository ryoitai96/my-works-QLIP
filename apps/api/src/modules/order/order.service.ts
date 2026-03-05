import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateProductionStatusDto } from './dto/update-production-status.dto';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  /** 有効商品一覧（カタログ用） */
  async findCatalog() {
    return this.prisma.flowerProduct.findMany({
      where: { isActive: true },
      orderBy: { productCode: 'asc' },
    });
  }

  /** 注文作成 */
  async create(userId: string, dto: CreateOrderDto) {
    const product = await this.prisma.flowerProduct.findUnique({
      where: { id: dto.flowerProductId },
    });
    if (!product) throw new NotFoundException('商品が見つかりません');
    if (!product.isActive)
      throw new BadRequestException('この商品は現在販売停止中です');

    const quantity = dto.quantity ?? 1;
    if (quantity < 1 || quantity > 10)
      throw new BadRequestException('数量は1〜10で指定してください');

    const totalPrice = product.price * quantity;

    // 連番オーダーコード生成
    const lastOrder = await this.prisma.flowerOrder.findFirst({
      orderBy: { orderCode: 'desc' },
    });
    const nextNum = lastOrder
      ? parseInt(lastOrder.orderCode.replace('ORD-', ''), 10) + 1
      : 1;
    const orderCode = `ORD-${String(nextNum).padStart(3, '0')}`;

    return this.prisma.flowerOrder.create({
      data: {
        orderCode,
        userId,
        flowerProductId: dto.flowerProductId,
        quantity,
        totalPrice,
        message: dto.message ?? null,
        recipientName: dto.recipientName ?? null,
        recipientAddress: dto.recipientAddress ?? null,
      },
      include: {
        flowerProduct: true,
      },
    });
  }

  /** 自分の注文一覧 */
  async findMyOrders(userId: string) {
    return this.prisma.flowerOrder.findMany({
      where: { userId },
      include: { flowerProduct: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 全注文一覧（管理用） */
  async findAll() {
    return this.prisma.flowerOrder.findMany({
      include: {
        flowerProduct: true,
        user: { select: { id: true, name: true, userCode: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** ステータス更新 */
  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.flowerOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('注文が見つかりません');

    return this.prisma.flowerOrder.update({
      where: { id },
      data: { status: dto.status },
      include: {
        flowerProduct: true,
        user: { select: { id: true, name: true, userCode: true, role: true } },
      },
    });
  }

  /** 制作対象注文一覧（R03向け: confirmed + in_production） */
  async findProductionOrders() {
    return this.prisma.flowerOrder.findMany({
      where: { status: { in: ['confirmed', 'in_production'] } },
      include: { flowerProduct: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** 制作ステータス更新（R03向け: 前方遷移のみ） */
  async updateProductionStatus(id: string, dto: UpdateProductionStatusDto) {
    const order = await this.prisma.flowerOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('注文が見つかりません');

    const allowedTransitions: Record<string, string> = {
      confirmed: 'in_production',
      in_production: 'delivered',
    };

    if (allowedTransitions[order.status] !== dto.status) {
      throw new BadRequestException(
        `ステータスを「${order.status}」から「${dto.status}」に変更できません`,
      );
    }

    return this.prisma.flowerOrder.update({
      where: { id },
      data: { status: dto.status },
      include: { flowerProduct: true },
    });
  }
}
