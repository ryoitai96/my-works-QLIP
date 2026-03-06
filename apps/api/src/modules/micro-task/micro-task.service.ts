import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MicroTaskService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.microTask.findMany({
      orderBy: { taskCode: 'asc' },
    });
  }

  async createCompletion(
    userId: string,
    microTaskId: string,
    notes?: string,
  ) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
    });
    if (!member) {
      throw new ForbiddenException('Member registration required');
    }

    const microTask = await this.prisma.microTask.findUnique({
      where: { id: microTaskId },
    });
    if (!microTask || !microTask.isActive) {
      throw new NotFoundException('Micro task not found');
    }

    return this.prisma.taskAssignment.create({
      data: {
        memberId: member.id,
        microTaskId,
        assignedById: userId,
        assignedDate: new Date(),
        status: 'completed',
        completedAt: new Date(),
        notes: notes ?? null,
      },
      include: {
        microTask: {
          select: { taskCode: true, name: true },
        },
      },
    });
  }

  /** Create a new micro task (admin/JC) */
  async create(
    tenantId: string,
    siteId: string | undefined,
    dto: {
      taskCode: string;
      name: string;
      businessCategory: string;
      category?: string;
      requiredSkillTags?: string[];
      difficultyLevel: number;
      standardDuration?: number;
      physicalLoad?: string;
      cognitiveLoad?: string;
      description?: string;
    },
  ) {
    if (dto.difficultyLevel < 1 || dto.difficultyLevel > 5) {
      throw new BadRequestException('difficultyLevel must be between 1 and 5');
    }

    return this.prisma.microTask.create({
      data: {
        tenantId,
        siteId: siteId ?? null,
        taskCode: dto.taskCode,
        name: dto.name,
        businessCategory: dto.businessCategory,
        category: dto.category ?? null,
        requiredSkillTags: dto.requiredSkillTags ?? [],
        difficultyLevel: dto.difficultyLevel,
        standardDuration: dto.standardDuration ?? null,
        physicalLoad: dto.physicalLoad ?? null,
        cognitiveLoad: dto.cognitiveLoad ?? null,
        description: dto.description ?? null,
      },
    });
  }

  /** Update a micro task */
  async update(
    id: string,
    dto: {
      name?: string;
      businessCategory?: string;
      category?: string;
      requiredSkillTags?: string[];
      difficultyLevel?: number;
      standardDuration?: number;
      physicalLoad?: string;
      cognitiveLoad?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    const task = await this.prisma.microTask.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Micro task not found');
    }

    if (dto.difficultyLevel != null && (dto.difficultyLevel < 1 || dto.difficultyLevel > 5)) {
      throw new BadRequestException('difficultyLevel must be between 1 and 5');
    }

    return this.prisma.microTask.update({
      where: { id },
      data: {
        ...(dto.name != null && { name: dto.name }),
        ...(dto.businessCategory != null && { businessCategory: dto.businessCategory }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.requiredSkillTags != null && { requiredSkillTags: dto.requiredSkillTags }),
        ...(dto.difficultyLevel != null && { difficultyLevel: dto.difficultyLevel }),
        ...(dto.standardDuration !== undefined && { standardDuration: dto.standardDuration }),
        ...(dto.physicalLoad !== undefined && { physicalLoad: dto.physicalLoad }),
        ...(dto.cognitiveLoad !== undefined && { cognitiveLoad: dto.cognitiveLoad }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isActive != null && { isActive: dto.isActive }),
      },
    });
  }

  /** Soft delete a micro task */
  async softDelete(id: string) {
    const task = await this.prisma.microTask.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Micro task not found');
    }

    return this.prisma.microTask.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
