import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MicroTaskService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.microTask.findMany({
      orderBy: { taskCode: 'asc' },
    });
  }
}
