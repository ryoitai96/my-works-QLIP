import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllTenants() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, members: true, sites: true } },
      },
    });
  }

  async findTenantById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        sites: {
          select: { id: true, name: true, siteType: true, isActive: true },
          orderBy: { name: 'asc' },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { members: true } },
      },
    });

    if (!tenant) {
      throw new NotFoundException('企業が見つかりません');
    }

    return tenant;
  }

  async findAllUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        tenant: { select: { id: true, name: true } },
      },
    });
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        tenant: { select: { id: true, name: true } },
        site: { select: { id: true, name: true, siteType: true } },
        member: {
          select: {
            id: true,
            employeeNumber: true,
            employmentType: true,
            enrolledAt: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    return user;
  }
}
