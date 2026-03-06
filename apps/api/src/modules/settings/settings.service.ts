import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Role, STAFF_ROLES, DEFAULT_TENANT_SERVICES } from '@qlip/shared';

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

  async createSite(
    user: JwtPayload,
    data: { name: string; siteType: string; address?: string },
  ) {
    if (!(STAFF_ROLES as readonly string[]).includes(user.role)) {
      throw new ForbiddenException('拠点の追加はMW管理者・支援員のみ可能です');
    }

    if (!user.tenantId) {
      throw new BadRequestException('テナント情報がありません');
    }

    return this.prisma.site.create({
      data: {
        tenantId: user.tenantId,
        name: data.name,
        siteType: data.siteType,
        address: data.address ?? null,
      },
      select: { id: true, name: true, siteType: true, address: true, isActive: true },
    });
  }

  async updateSite(
    user: JwtPayload,
    siteId: string,
    data: { name?: string; address?: string; isActive?: boolean },
  ) {
    if (!(STAFF_ROLES as readonly string[]).includes(user.role)) {
      throw new ForbiddenException('拠点の編集はMW管理者・支援員のみ可能です');
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

  async getTenantServices(user: JwtPayload) {
    // MW staff (R01/R02) — always all enabled
    if ((STAFF_ROLES as readonly string[]).includes(user.role)) {
      return { ...DEFAULT_TENANT_SERVICES };
    }

    if (!user.tenantId) {
      return { ...DEFAULT_TENANT_SERVICES };
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: {
        svcAttendance: true,
        svcHealthCheck: true,
        svcAssessment: true,
        svcMicroTask: true,
        svcMessage: true,
        svcThanks: true,
        svcFlowerOrder: true,
        svcSos: true,
      },
    });

    if (!tenant) {
      return { ...DEFAULT_TENANT_SERVICES };
    }

    return {
      attendance: tenant.svcAttendance,
      health_check: tenant.svcHealthCheck,
      assessment: tenant.svcAssessment,
      micro_task: tenant.svcMicroTask,
      message: tenant.svcMessage,
      thanks: tenant.svcThanks,
      flower_order: tenant.svcFlowerOrder,
      sos: tenant.svcSos,
    };
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
