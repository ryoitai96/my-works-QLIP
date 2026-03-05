import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Role, CLIENT_ROLES } from '@qlip/shared';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateClientUserDto } from './dto/create-client-user.dto';
import { UpdateClientUserDto } from './dto/update-client-user.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class ClientSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(user: JwtPayload) {
    return this.prisma.tenant.findUniqueOrThrow({
      where: { id: user.tenantId },
      select: {
        id: true,
        name: true,
        industry: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(user: JwtPayload, dto: UpdateProfileDto) {
    this.requireClientHR(user);

    return this.prisma.tenant.update({
      where: { id: user.tenantId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.industry !== undefined ? { industry: dto.industry } : {}),
      },
      select: {
        id: true,
        name: true,
        industry: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async getMembers(user: JwtPayload) {
    return this.prisma.user.findMany({
      where: {
        tenantId: user.tenantId,
        role: { in: [...CLIENT_ROLES] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMember(user: JwtPayload, dto: CreateClientUserDto) {
    this.requireClientHR(user);

    if (!CLIENT_ROLES.includes(dto.role as (typeof CLIENT_ROLES)[number])) {
      throw new BadRequestException(
        '権限はクライアント人事担当者またはクライアント一般従業員のみ指定できます',
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('このメールアドレスは既に使用されています');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userCode = await this.generateUserCode();

    return this.prisma.user.create({
      data: {
        userCode,
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role,
        tenantId: user.tenantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async updateMember(
    user: JwtPayload,
    id: string,
    dto: UpdateClientUserDto,
  ) {
    this.requireClientHR(user);

    const target = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
        role: { in: [...CLIENT_ROLES] },
      },
    });
    if (!target) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    if (dto.role && !CLIENT_ROLES.includes(dto.role as (typeof CLIENT_ROLES)[number])) {
      throw new BadRequestException(
        '権限はクライアント人事担当者またはクライアント一般従業員のみ指定できます',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async deleteMember(user: JwtPayload, id: string) {
    this.requireClientHR(user);

    if (id === user.userId) {
      throw new BadRequestException('自分自身を無効化することはできません');
    }

    const target = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
        role: { in: [...CLIENT_ROLES] },
      },
    });
    if (!target) {
      throw new NotFoundException('ユーザーが見つかりません');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true };
  }

  // ===== Team methods =====

  async getTeams(user: JwtPayload) {
    return this.prisma.team.findMany({
      where: { tenantId: user.tenantId },
      include: {
        memberships: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTeam(user: JwtPayload, dto: CreateTeamDto) {
    this.requireClientHR(user);

    await this.validateUserIds(user.tenantId, [
      ...(dto.managerIds ?? []),
      ...(dto.memberIds ?? []),
    ]);

    return this.prisma.team.create({
      data: {
        tenantId: user.tenantId,
        name: dto.name,
        departmentCode: dto.departmentCode,
        memberships: {
          create: [
            ...(dto.managerIds ?? []).map((userId) => ({
              userId,
              role: 'manager',
            })),
            ...(dto.memberIds ?? []).map((userId) => ({
              userId,
              role: 'member',
            })),
          ],
        },
      },
      include: {
        memberships: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });
  }

  async updateTeam(user: JwtPayload, id: string, dto: UpdateTeamDto) {
    this.requireClientHR(user);

    const team = await this.prisma.team.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!team) {
      throw new NotFoundException('チームが見つかりません');
    }

    const hasNewMemberships =
      dto.managerIds !== undefined || dto.memberIds !== undefined;

    if (hasNewMemberships) {
      await this.validateUserIds(user.tenantId, [
        ...(dto.managerIds ?? []),
        ...(dto.memberIds ?? []),
      ]);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.team.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.departmentCode !== undefined
            ? { departmentCode: dto.departmentCode }
            : {}),
        },
      });

      if (hasNewMemberships) {
        await tx.teamMembership.deleteMany({ where: { teamId: id } });
        const newMemberships = [
          ...(dto.managerIds ?? []).map((userId) => ({
            teamId: id,
            userId,
            role: 'manager',
          })),
          ...(dto.memberIds ?? []).map((userId) => ({
            teamId: id,
            userId,
            role: 'member',
          })),
        ];
        if (newMemberships.length > 0) {
          await tx.teamMembership.createMany({ data: newMemberships });
        }
      }

      return tx.team.findUniqueOrThrow({
        where: { id },
        include: {
          memberships: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      });
    });
  }

  async deleteTeam(user: JwtPayload, id: string) {
    this.requireClientHR(user);

    const team = await this.prisma.team.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!team) {
      throw new NotFoundException('チームが見つかりません');
    }

    await this.prisma.team.delete({ where: { id } });
    return { success: true };
  }

  private async validateUserIds(tenantId: string, userIds: string[]) {
    if (userIds.length === 0) return;

    const uniqueIds = [...new Set(userIds)];
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: uniqueIds },
        tenantId,
        role: { in: [...CLIENT_ROLES] },
      },
      select: { id: true },
    });

    if (users.length !== uniqueIds.length) {
      throw new BadRequestException(
        '指定されたユーザーの一部が見つからないか、同一テナントに所属していません',
      );
    }
  }

  /** 次の連番 userCode を生成（例: U-011） */
  private async generateUserCode(): Promise<string> {
    const last = await this.prisma.user.findFirst({
      orderBy: { userCode: 'desc' },
      select: { userCode: true },
    });
    const num = last ? parseInt(last.userCode.replace('U-', ''), 10) + 1 : 1;
    return `U-${String(num).padStart(3, '0')}`;
  }

  private requireClientHR(user: JwtPayload) {
    if (user.role !== Role.CLIENT_HR) {
      throw new ForbiddenException('この操作はクライアント人事担当者のみ可能です');
    }
  }
}
