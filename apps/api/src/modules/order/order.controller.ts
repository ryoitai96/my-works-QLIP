import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantServiceGuard } from '../../common/guards/tenant-service.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequireService } from '../../common/decorators/require-service.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { STAFF_ROLES, CLIENT_ROLES, MEMBER_ROLES } from '@qlip/shared';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateProductionStatusDto } from './dto/update-production-status.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard, TenantServiceGuard)
@RequireService('flower_order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /** 有効商品一覧（カタログ用） — 全認証ユーザー */
  @Get('catalog')
  async getCatalog() {
    return this.orderService.findCatalog();
  }

  /** 注文作成 — クライアントロール */
  @Post()
  @Roles(...CLIENT_ROLES)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.create(user.userId, dto);
  }

  /** 制作対象注文一覧 — メンバーロール（R03） */
  @Get('production')
  @Roles(...MEMBER_ROLES)
  async getProductionOrders() {
    return this.orderService.findProductionOrders();
  }

  /** 自分の注文一覧 — クライアントロール */
  @Get('mine')
  @Roles(...CLIENT_ROLES)
  async getMyOrders(@CurrentUser() user: JwtPayload) {
    return this.orderService.findMyOrders(user.userId);
  }

  /** 全注文一覧（管理用） — スタッフロール */
  @Get()
  @Roles(...STAFF_ROLES)
  async getAll() {
    return this.orderService.findAll();
  }

  /** 制作ステータス更新 — メンバーロール（R03） */
  @Patch(':id/production-status')
  @Roles(...MEMBER_ROLES)
  async updateProductionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProductionStatusDto,
  ) {
    return this.orderService.updateProductionStatus(id, dto);
  }

  /** ステータス更新 — スタッフロール */
  @Patch(':id/status')
  @Roles(...STAFF_ROLES)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto);
  }
}
