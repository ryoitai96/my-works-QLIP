import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface SubmitHealthCheckDto {
  mood: number;
  sleep: number;
  condition: number;
  note?: string;
}

@Injectable()
export class HealthCheckService {
  constructor(private readonly prisma: PrismaService) {}

  async submitOrUpdate(userId: string, dto: SubmitHealthCheckDto) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
    });
    if (!member) {
      throw new ForbiddenException('Member registration required');
    }

    for (const field of ['mood', 'sleep', 'condition'] as const) {
      const value = dto[field];
      if (!Number.isInteger(value) || value < 1 || value > 5) {
        throw new BadRequestException(
          `${field} must be an integer between 1 and 5`,
        );
      }
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Check if record already exists for today
    const existing = await this.prisma.vitalScore.findUnique({
      where: {
        memberId_recordDate: {
          memberId: member.id,
          recordDate: today,
        },
      },
    });

    // Calculate streak days
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    let streakDays = 1;
    if (!existing) {
      const yesterdayRecord = await this.prisma.vitalScore.findUnique({
        where: {
          memberId_recordDate: {
            memberId: member.id,
            recordDate: yesterday,
          },
        },
      });
      streakDays = yesterdayRecord ? yesterdayRecord.streakDays + 1 : 1;
    }

    const record = await this.prisma.vitalScore.upsert({
      where: {
        memberId_recordDate: {
          memberId: member.id,
          recordDate: today,
        },
      },
      create: {
        memberId: member.id,
        recordDate: today,
        mood: dto.mood,
        sleep: dto.sleep,
        condition: dto.condition,
        note: dto.note ?? null,
        streakDays,
      },
      update: {
        mood: dto.mood,
        sleep: dto.sleep,
        condition: dto.condition,
        note: dto.note ?? null,
      },
    });

    return {
      ...record,
      isUpdate: !!existing,
    };
  }

  async findToday(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
    });
    if (!member) {
      throw new ForbiddenException('Member registration required');
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return this.prisma.vitalScore.findUnique({
      where: {
        memberId_recordDate: {
          memberId: member.id,
          recordDate: today,
        },
      },
    });
  }
}
