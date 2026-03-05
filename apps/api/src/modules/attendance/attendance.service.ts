import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SubmitCorrectionDto } from './dto/submit-correction.dto';
import { ReviewCorrectionDto } from './dto/review-correction.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ========== 打刻 ==========

  async clockIn(userId: string) {
    const member = await this.requireMember(userId);
    const today = this.todayDate();

    const existing = await this.prisma.attendanceRecord.findUnique({
      where: { memberId_recordDate: { memberId: member.id, recordDate: today } },
    });

    if (existing && existing.status !== 'not_clocked_in') {
      throw new BadRequestException('既に出勤打刻済みです');
    }

    return this.prisma.attendanceRecord.upsert({
      where: { memberId_recordDate: { memberId: member.id, recordDate: today } },
      create: {
        memberId: member.id,
        recordDate: today,
        clockIn: new Date(),
        status: 'clocked_in',
      },
      update: {
        clockIn: new Date(),
        status: 'clocked_in',
      },
      include: { breaks: true },
    });
  }

  async clockOut(userId: string) {
    const member = await this.requireMember(userId);
    const record = await this.requireTodayRecord(member.id);

    if (record.status === 'not_clocked_in') {
      throw new BadRequestException('出勤打刻がありません');
    }
    if (record.status === 'clocked_out') {
      throw new BadRequestException('既に退勤打刻済みです');
    }
    if (record.status === 'on_break') {
      throw new BadRequestException('休憩中です。先に休憩を終了してください');
    }

    const now = new Date();
    const breaks = await this.prisma.attendanceBreak.findMany({
      where: { attendanceRecordId: record.id },
    });

    const totalBreakMs = breaks.reduce((sum, b) => {
      if (b.breakEnd) {
        return sum + (b.breakEnd.getTime() - b.breakStart.getTime());
      }
      return sum;
    }, 0);

    const breakMinutes = Math.round(totalBreakMs / 60000);
    const totalMs = now.getTime() - record.clockIn!.getTime();
    const workMinutes = Math.round(totalMs / 60000) - breakMinutes;

    return this.prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        clockOut: now,
        status: 'clocked_out',
        workMinutes: Math.max(workMinutes, 0),
        breakMinutes,
      },
      include: { breaks: true },
    });
  }

  async breakStart(userId: string) {
    const member = await this.requireMember(userId);
    const record = await this.requireTodayRecord(member.id);

    if (record.status !== 'clocked_in') {
      throw new BadRequestException('出勤中でないため休憩を開始できません');
    }

    await this.prisma.attendanceBreak.create({
      data: {
        attendanceRecordId: record.id,
        breakStart: new Date(),
      },
    });

    return this.prisma.attendanceRecord.update({
      where: { id: record.id },
      data: { status: 'on_break' },
      include: { breaks: true },
    });
  }

  async breakEnd(userId: string) {
    const member = await this.requireMember(userId);
    const record = await this.requireTodayRecord(member.id);

    if (record.status !== 'on_break') {
      throw new BadRequestException('休憩中ではありません');
    }

    const openBreak = await this.prisma.attendanceBreak.findFirst({
      where: { attendanceRecordId: record.id, breakEnd: null },
      orderBy: { breakStart: 'desc' },
    });

    if (openBreak) {
      await this.prisma.attendanceBreak.update({
        where: { id: openBreak.id },
        data: { breakEnd: new Date() },
      });
    }

    return this.prisma.attendanceRecord.update({
      where: { id: record.id },
      data: { status: 'clocked_in' },
      include: { breaks: true },
    });
  }

  // ========== メンバー閲覧 ==========

  async findToday(userId: string) {
    const member = await this.requireMember(userId);
    const today = this.todayDate();

    return this.prisma.attendanceRecord.findUnique({
      where: { memberId_recordDate: { memberId: member.id, recordDate: today } },
      include: { breaks: true },
    });
  }

  async findMonthly(userId: string, year: number, month: number) {
    const member = await this.requireMember(userId);
    const { start, end } = this.monthRange(year, month);

    return this.prisma.attendanceRecord.findMany({
      where: {
        memberId: member.id,
        recordDate: { gte: start, lt: end },
      },
      include: { breaks: true },
      orderBy: { recordDate: 'asc' },
    });
  }

  async findMonthlySummary(userId: string, year: number, month: number) {
    const records = await this.findMonthly(userId, year, month);
    const member = await this.requireMember(userId);

    const corrections = await this.prisma.attendanceCorrectionRequest.count({
      where: {
        requestedByUserId: userId,
        createdAt: { gte: this.monthRange(year, month).start, lt: this.monthRange(year, month).end },
      },
    });

    const workedDays = records.filter((r) => r.status === 'clocked_out').length;
    const totalWorkMinutes = records.reduce((sum, r) => sum + (r.workMinutes ?? 0), 0);
    const totalBreakMinutes = records.reduce((sum, r) => sum + (r.breakMinutes ?? 0), 0);

    const schedule = await this.prisma.memberWorkSchedule.findUnique({
      where: { memberId: member.id },
    });

    return {
      year,
      month,
      workedDays,
      totalWorkMinutes,
      totalBreakMinutes,
      correctionCount: corrections,
      schedule,
    };
  }

  // ========== 修正申請 ==========

  async submitCorrection(userId: string, dto: SubmitCorrectionDto) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: dto.attendanceRecordId },
      include: { member: true },
    });

    if (!record) {
      throw new NotFoundException('勤怠レコードが見つかりません');
    }

    const member = await this.requireMember(userId);
    if (record.memberId !== member.id) {
      throw new ForbiddenException('他のメンバーの勤怠は修正申請できません');
    }

    return this.prisma.attendanceCorrectionRequest.create({
      data: {
        attendanceRecordId: dto.attendanceRecordId,
        requestedByUserId: userId,
        correctionType: dto.correctionType,
        requestedValue: dto.requestedValue,
        reason: dto.reason,
      },
    });
  }

  async findMyCorrections(userId: string) {
    return this.prisma.attendanceCorrectionRequest.findMany({
      where: { requestedByUserId: userId },
      include: {
        attendanceRecord: true,
        reviewedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ========== スタッフ閲覧 ==========

  async findMembersTodayAll(tenantId: string) {
    const today = this.todayDate();

    const members = await this.prisma.member.findMany({
      where: { tenantId, status: 'active' },
      include: {
        user: { select: { name: true } },
        attendanceRecords: {
          where: { recordDate: today },
          include: { breaks: true },
        },
      },
      orderBy: { user: { name: 'asc' } },
    });

    return members.map((m) => ({
      memberId: m.id,
      memberName: m.user.name,
      avatarId: m.avatarId,
      attendance: m.attendanceRecords[0] ?? null,
    }));
  }

  async findMemberMonthly(memberId: string, year: number, month: number) {
    const { start, end } = this.monthRange(year, month);

    return this.prisma.attendanceRecord.findMany({
      where: {
        memberId,
        recordDate: { gte: start, lt: end },
      },
      include: { breaks: true },
      orderBy: { recordDate: 'asc' },
    });
  }

  // ========== 人事承認 ==========

  async findPendingCorrections(tenantId: string) {
    return this.prisma.attendanceCorrectionRequest.findMany({
      where: {
        status: 'pending',
        attendanceRecord: { member: { tenantId } },
      },
      include: {
        attendanceRecord: {
          include: { member: { include: { user: { select: { name: true } } } } },
        },
        requestedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async reviewCorrection(
    correctionId: string,
    reviewerUserId: string,
    dto: ReviewCorrectionDto,
  ) {
    const correction = await this.prisma.attendanceCorrectionRequest.findUnique({
      where: { id: correctionId },
    });

    if (!correction) {
      throw new NotFoundException('修正申請が見つかりません');
    }
    if (correction.status !== 'pending') {
      throw new BadRequestException('この申請は既に処理済みです');
    }

    return this.prisma.attendanceCorrectionRequest.update({
      where: { id: correctionId },
      data: {
        status: dto.status,
        reviewedByUserId: reviewerUserId,
        reviewComment: dto.reviewComment ?? null,
        reviewedAt: new Date(),
      },
    });
  }

  // ========== 勤務スケジュール ==========

  async findSchedule(memberId: string) {
    const schedule = await this.prisma.memberWorkSchedule.findUnique({
      where: { memberId },
    });

    if (!schedule) {
      return { memberId, startTime: '09:00', endTime: '18:00', breakMinutes: 60, workDaysPerWeek: 5 };
    }

    return schedule;
  }

  async updateSchedule(memberId: string, dto: UpdateWorkScheduleDto) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      throw new NotFoundException('メンバーが見つかりません');
    }

    return this.prisma.memberWorkSchedule.upsert({
      where: { memberId },
      create: {
        memberId,
        startTime: dto.startTime ?? '09:00',
        endTime: dto.endTime ?? '18:00',
        breakMinutes: dto.breakMinutes ?? 60,
        workDaysPerWeek: dto.workDaysPerWeek ?? 5,
      },
      update: {
        ...(dto.startTime !== undefined && { startTime: dto.startTime }),
        ...(dto.endTime !== undefined && { endTime: dto.endTime }),
        ...(dto.breakMinutes !== undefined && { breakMinutes: dto.breakMinutes }),
        ...(dto.workDaysPerWeek !== undefined && { workDaysPerWeek: dto.workDaysPerWeek }),
      },
    });
  }

  // ========== ヘルパー ==========

  private async requireMember(userId: string) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) {
      throw new ForbiddenException('メンバー登録が必要です');
    }
    return member;
  }

  private async requireTodayRecord(memberId: string) {
    const today = this.todayDate();
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { memberId_recordDate: { memberId, recordDate: today } },
      include: { breaks: true },
    });
    if (!record) {
      throw new NotFoundException('本日の勤怠レコードが見つかりません');
    }
    return record;
  }

  private todayDate(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  private monthRange(year: number, month: number) {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    return { start, end };
  }
}
