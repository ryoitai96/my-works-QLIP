import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

const VALID_CATEGORIES = ['harassment', 'overwork', 'health', 'other'];
const VALID_STATUSES = ['pending', 'in_progress', 'resolved', 'closed'];

interface CreateSosDto {
  category: string;
  content: string;
  isAnonymous?: boolean;
}

interface UpdateSosStatusDto {
  status: string;
  resolutionNote?: string;
}

@Injectable()
export class SosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: JwtPayload, dto: CreateSosDto) {
    if (!VALID_CATEGORIES.includes(dto.category)) {
      throw new BadRequestException(
        `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
      );
    }
    if (!dto.content || dto.content.trim().length === 0) {
      throw new BadRequestException('content is required');
    }

    // Resolve siteId from the member's profile
    const member = await this.prisma.member.findUnique({
      where: { userId: user.userId },
      select: { siteId: true },
    });
    if (!member) {
      throw new ForbiddenException('Member registration required');
    }

    return this.prisma.sosReport.create({
      data: {
        tenantId: user.tenantId,
        reporterUserId: dto.isAnonymous ? null : user.userId,
        siteId: member.siteId,
        category: dto.category,
        content: dto.content.trim(),
        isAnonymous: dto.isAnonymous ?? false,
      },
    });
  }

  async findAll(user: JwtPayload) {
    const isR01 = user.role === 'R01';
    const isR02 = user.role === 'R02';

    if (!isR01 && !isR02) {
      throw new ForbiddenException('Not authorized');
    }

    const where: any = { tenantId: user.tenantId };

    if (isR02) {
      // R02: own site only, exclude harassment reports
      if (user.siteId) {
        where.siteId = user.siteId;
      }
      where.category = { not: 'harassment' };
    }

    return this.prisma.sosReport.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true } },
        site: { select: { id: true, name: true } },
        resolvedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(user: JwtPayload, id: string, dto: UpdateSosStatusDto) {
    if (user.role !== 'R01') {
      throw new ForbiddenException('Only Super Admin can update SOS status');
    }

    if (!VALID_STATUSES.includes(dto.status)) {
      throw new BadRequestException(
        `status must be one of: ${VALID_STATUSES.join(', ')}`,
      );
    }

    const report = await this.prisma.sosReport.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('SOS report not found');
    }
    if (report.tenantId !== user.tenantId) {
      throw new ForbiddenException('Not authorized');
    }

    const isResolving = dto.status === 'resolved' || dto.status === 'closed';

    return this.prisma.sosReport.update({
      where: { id },
      data: {
        status: dto.status,
        resolutionNote: dto.resolutionNote ?? report.resolutionNote,
        resolvedById: isResolving ? user.userId : report.resolvedById,
        resolvedAt: isResolving ? new Date() : report.resolvedAt,
      },
      include: {
        reporter: { select: { id: true, name: true } },
        site: { select: { id: true, name: true } },
        resolvedBy: { select: { id: true, name: true } },
      },
    });
  }
}
