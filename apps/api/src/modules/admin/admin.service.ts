import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { UpdateTenantServicesDto } from './dto/update-tenant-services.dto';

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
            userCode: true,
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
        userCode: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        tenant: { select: { id: true, tenantCode: true, name: true } },
      },
    });
  }

  async findTenantServices(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      select: {
        svcAttendance: true,
        svcHealthCheck: true,
        svcAssessment: true,
        svcMicroTask: true,
        svcMessage: true,
        svcThanks: true,
        svcFlowerOrder: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('企業が見つかりません');
    }

    return {
      attendance: tenant.svcAttendance,
      health_check: tenant.svcHealthCheck,
      assessment: tenant.svcAssessment,
      micro_task: tenant.svcMicroTask,
      message: tenant.svcMessage,
      thanks: tenant.svcThanks,
      flower_order: tenant.svcFlowerOrder,
    };
  }

  async updateTenantServices(id: string, dto: UpdateTenantServicesDto) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('企業が見つかりません');
    }

    const data: Record<string, boolean> = {};
    if (dto.attendance !== undefined) data.svcAttendance = dto.attendance;
    if (dto.health_check !== undefined) data.svcHealthCheck = dto.health_check;
    if (dto.assessment !== undefined) data.svcAssessment = dto.assessment;
    if (dto.micro_task !== undefined) data.svcMicroTask = dto.micro_task;
    if (dto.message !== undefined) data.svcMessage = dto.message;
    if (dto.thanks !== undefined) data.svcThanks = dto.thanks;
    if (dto.flower_order !== undefined) data.svcFlowerOrder = dto.flower_order;

    const updated = await this.prisma.tenant.update({
      where: { id },
      data,
      select: {
        svcAttendance: true,
        svcHealthCheck: true,
        svcAssessment: true,
        svcMicroTask: true,
        svcMessage: true,
        svcThanks: true,
        svcFlowerOrder: true,
      },
    });

    return {
      attendance: updated.svcAttendance,
      health_check: updated.svcHealthCheck,
      assessment: updated.svcAssessment,
      micro_task: updated.svcMicroTask,
      message: updated.svcMessage,
      thanks: updated.svcThanks,
      flower_order: updated.svcFlowerOrder,
    };
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        userCode: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        tenant: { select: { id: true, tenantCode: true, name: true } },
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
