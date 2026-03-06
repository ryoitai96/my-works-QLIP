import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { STAFF_ROLES } from '@qlip/shared';

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: JwtPayload) {
    const sites = await this.prisma.site.findMany({
      where: { tenantId: user.tenantId },
      select: {
        id: true,
        name: true,
        companyName: true,
        serviceName: true,
        siteType: true,
        address: true,
        isActive: true,
        _count: { select: { members: true } },
      },
      orderBy: { name: 'asc' },
    });

    return sites.map((s) => ({
      id: s.id,
      name: s.name,
      companyName: s.companyName,
      serviceName: s.serviceName,
      siteType: s.siteType,
      address: s.address,
      isActive: s.isActive,
      memberCount: s._count.members,
    }));
  }

  async findById(id: string, user: JwtPayload) {
    const site = await this.prisma.site.findFirst({
      where: { id, tenantId: user.tenantId },
      select: {
        id: true,
        name: true,
        companyName: true,
        serviceName: true,
        siteType: true,
        address: true,
        isActive: true,
        _count: { select: { members: true } },
      },
    });

    if (!site) {
      throw new BadRequestException('拠点が見つかりません');
    }

    return {
      id: site.id,
      name: site.name,
      companyName: site.companyName,
      serviceName: site.serviceName,
      siteType: site.siteType,
      address: site.address,
      isActive: site.isActive,
      memberCount: site._count.members,
    };
  }

  async create(
    user: JwtPayload,
    data: {
      name: string;
      companyName?: string;
      serviceName?: string;
      siteType: string;
      address?: string;
    },
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('テナント情報がありません');
    }

    const site = await this.prisma.site.create({
      data: {
        tenantId: user.tenantId,
        name: data.name,
        companyName: data.companyName ?? null,
        serviceName: data.serviceName ?? null,
        siteType: data.siteType,
        address: data.address ?? null,
      },
      select: {
        id: true,
        name: true,
        companyName: true,
        serviceName: true,
        siteType: true,
        address: true,
        isActive: true,
      },
    });

    return { ...site, memberCount: 0 };
  }

  async update(
    user: JwtPayload,
    siteId: string,
    data: {
      name?: string;
      companyName?: string;
      serviceName?: string;
      address?: string;
      isActive?: boolean;
    },
  ) {
    const site = await this.prisma.site.findFirst({
      where: { id: siteId, tenantId: user.tenantId },
    });
    if (!site) {
      throw new BadRequestException('拠点が見つかりません');
    }

    const updated = await this.prisma.site.update({
      where: { id: siteId },
      data,
      select: {
        id: true,
        name: true,
        companyName: true,
        serviceName: true,
        siteType: true,
        address: true,
        isActive: true,
        _count: { select: { members: true } },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      companyName: updated.companyName,
      serviceName: updated.serviceName,
      siteType: updated.siteType,
      address: updated.address,
      isActive: updated.isActive,
      memberCount: updated._count.members,
    };
  }
}
