import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  /** JC: Assign a task to a member */
  async assignTask(
    assignedByUserId: string,
    dto: {
      memberId: string;
      microTaskId: string;
      assignedDate: string;
      notes?: string;
    },
  ) {
    const member = await this.prisma.member.findUnique({
      where: { id: dto.memberId },
    });
    if (!member || member.status !== 'active') {
      throw new NotFoundException('Active member not found');
    }

    const microTask = await this.prisma.microTask.findUnique({
      where: { id: dto.microTaskId },
    });
    if (!microTask || !microTask.isActive) {
      throw new NotFoundException('Active micro task not found');
    }

    return this.prisma.taskAssignment.create({
      data: {
        memberId: dto.memberId,
        microTaskId: dto.microTaskId,
        assignedById: assignedByUserId,
        assignedDate: new Date(dto.assignedDate),
        notes: dto.notes ?? null,
      },
      include: {
        member: {
          include: { user: { select: { name: true } } },
        },
        microTask: { select: { taskCode: true, name: true } },
      },
    });
  }

  /** JC: Get assignments for a specific date */
  async getAssignmentsByDate(tenantId: string, date?: string, siteId?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setUTCHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const where: any = {
      assignedDate: {
        gte: targetDate,
        lt: nextDate,
      },
      member: { tenantId },
    };
    if (siteId) where.member.siteId = siteId;

    return this.prisma.taskAssignment.findMany({
      where,
      include: {
        member: {
          include: {
            user: { select: { id: true, name: true } },
            site: { select: { name: true } },
          },
        },
        microTask: {
          select: {
            id: true,
            taskCode: true,
            name: true,
            businessCategory: true,
            difficultyLevel: true,
            standardDuration: true,
          },
        },
        assignedBy: { select: { name: true } },
      },
      orderBy: [
        { member: { user: { name: 'asc' } } },
        { createdAt: 'asc' },
      ],
    });
  }

  /** Member: Get my assignments for today */
  async getMyAssignments(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
    });
    if (!member) {
      throw new ForbiddenException('Member registration required');
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    return this.prisma.taskAssignment.findMany({
      where: {
        memberId: member.id,
        assignedDate: { gte: today, lt: tomorrow },
      },
      include: {
        microTask: {
          select: {
            id: true,
            taskCode: true,
            name: true,
            businessCategory: true,
            difficultyLevel: true,
            standardDuration: true,
          },
        },
        assignedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Update assignment status */
  async updateAssignmentStatus(
    assignmentId: string,
    status: string,
    userId: string,
  ) {
    const assignment = await this.prisma.taskAssignment.findUnique({
      where: { id: assignmentId },
      include: { member: true },
    });
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    const validStatuses = ['assigned', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    const updateData: any = { status };
    if (status === 'in_progress' && !assignment.startedAt) {
      updateData.startedAt = new Date();
    }
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    return this.prisma.taskAssignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: {
        microTask: { select: { id: true, taskCode: true, name: true } },
      },
    });
  }
}
