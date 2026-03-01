import {
  Injectable,
  ForbiddenException,
  NotFoundException,
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
}
