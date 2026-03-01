import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '@qlip/shared';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAccount(user: JwtPayload) {
    const found = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return found;
  }

  async updateAccount(user: JwtPayload, data: { name: string }) {
    const updated = await this.prisma.user.update({
      where: { id: user.userId },
      data: { name: data.name },
      select: { id: true, email: true, name: true, role: true },
    });
    return updated;
  }

  async changePassword(user: JwtPayload, data: { currentPassword: string; newPassword: string }) {
    const found = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.userId },
      select: { passwordHash: true },
    });

    const isValid = await bcrypt.compare(data.currentPassword, found.passwordHash);
    if (!isValid) {
      throw new BadRequestException('現在のパスワードが正しくありません');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.userId },
      data: { passwordHash },
    });

    return { message: 'パスワードを変更しました' };
  }

  async getSites(user: JwtPayload) {
    const isSuperAdmin = user.role === Role.SUPER_ADMIN;
    const where = isSuperAdmin
      ? { tenantId: user.tenantId }
      : { tenantId: user.tenantId, id: user.siteId };

    return this.prisma.site.findMany({
      where,
      select: { id: true, name: true, siteType: true, address: true, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateSite(
    user: JwtPayload,
    siteId: string,
    data: { name?: string; address?: string; isActive?: boolean },
  ) {
    if (user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('拠点の編集はスーパーアドミンのみ可能です');
    }

    // Verify the site belongs to the user's tenant
    const site = await this.prisma.site.findFirst({
      where: { id: siteId, tenantId: user.tenantId },
    });
    if (!site) {
      throw new BadRequestException('拠点が見つかりません');
    }

    return this.prisma.site.update({
      where: { id: siteId },
      data,
      select: { id: true, name: true, siteType: true, address: true, isActive: true },
    });
  }

  async getTenant(user: JwtPayload) {
    if (user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('テナント情報の閲覧はスーパーアドミンのみ可能です');
    }

    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id: user.tenantId },
      select: { id: true, name: true, industry: true, isActive: true, createdAt: true },
    });

    // Calculate employment stats
    const memberCount = await this.prisma.member.count({
      where: { tenantId: user.tenantId, status: 'active' },
    });

    return {
      ...tenant,
      legalEmploymentRate: 2.5, // 2026年法定雇用率
      currentDisabilityEmployeeCount: memberCount,
    };
  }
}
