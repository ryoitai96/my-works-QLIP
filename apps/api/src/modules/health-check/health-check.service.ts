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
  bodyTemperature?: number;
  sleepHours?: number;
  mealBreakfast?: boolean;
  mealLunch?: boolean;
  mealDinner?: boolean;
  moodComment?: string;
  conditionComment?: string;
  bedTime?: string;
  wakeTime?: string;
  appetite?: string;
  medicationTaken?: string;
  medicationNote?: string;
  prnMedicationUsed?: boolean;
  prnMedicationEffect?: string;
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

    if (
      dto.bodyTemperature != null &&
      (dto.bodyTemperature < 35.0 || dto.bodyTemperature > 42.0)
    ) {
      throw new BadRequestException(
        'bodyTemperature must be between 35.0 and 42.0',
      );
    }

    if (
      dto.sleepHours != null &&
      (dto.sleepHours < 0 || dto.sleepHours > 12)
    ) {
      throw new BadRequestException(
        'sleepHours must be between 0 and 12',
      );
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
        bodyTemperature: dto.bodyTemperature ?? null,
        sleepHours: dto.sleepHours ?? null,
        mealBreakfast: dto.mealBreakfast ?? null,
        mealLunch: dto.mealLunch ?? null,
        mealDinner: dto.mealDinner ?? null,
        moodComment: dto.moodComment ?? null,
        conditionComment: dto.conditionComment ?? null,
        bedTime: dto.bedTime ?? null,
        wakeTime: dto.wakeTime ?? null,
        appetite: dto.appetite ?? null,
        medicationTaken: dto.medicationTaken ?? null,
        medicationNote: dto.medicationNote ?? null,
        prnMedicationUsed: dto.prnMedicationUsed ?? null,
        prnMedicationEffect: dto.prnMedicationEffect ?? null,
        note: dto.note ?? null,
        streakDays,
      },
      update: {
        mood: dto.mood,
        sleep: dto.sleep,
        condition: dto.condition,
        bodyTemperature: dto.bodyTemperature ?? null,
        sleepHours: dto.sleepHours ?? null,
        mealBreakfast: dto.mealBreakfast ?? null,
        mealLunch: dto.mealLunch ?? null,
        mealDinner: dto.mealDinner ?? null,
        moodComment: dto.moodComment ?? null,
        conditionComment: dto.conditionComment ?? null,
        bedTime: dto.bedTime ?? null,
        wakeTime: dto.wakeTime ?? null,
        appetite: dto.appetite ?? null,
        medicationTaken: dto.medicationTaken ?? null,
        medicationNote: dto.medicationNote ?? null,
        prnMedicationUsed: dto.prnMedicationUsed ?? null,
        prnMedicationEffect: dto.prnMedicationEffect ?? null,
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

  /** チーム概観: 全メンバーの本日バイタル一覧 */
  async getTeamOverview(tenantId: string, siteId?: string) {
    const where: any = { tenantId, status: 'active' };
    if (siteId) where.siteId = siteId;

    const members = await this.prisma.member.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        site: { select: { name: true } },
      },
      orderBy: { user: { name: 'asc' } },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayScores = await this.prisma.vitalScore.findMany({
      where: {
        memberId: { in: members.map((m) => m.id) },
        recordDate: today,
      },
    });

    const scoreMap = new Map(todayScores.map((s) => [s.memberId, s]));

    return members.map((m) => {
      const score = scoreMap.get(m.id);
      const avg = score
        ? Math.round(((score.mood + score.sleep + score.condition) / 3) * 10) / 10
        : null;

      let status: 'good' | 'caution' | 'warning' | 'not_submitted' = 'not_submitted';
      if (score) {
        if (avg !== null && avg >= 3.5) status = 'good';
        else if (avg !== null && avg >= 2.5) status = 'caution';
        else status = 'warning';
      }

      // Manual alert overrides
      if (m.alertLevel === 'CRITICAL') status = 'warning';
      else if (m.alertLevel === 'WARNING') status = 'caution';

      return {
        memberId: m.id,
        userId: m.user.id,
        name: m.user.name,
        avatarId: m.avatarId,
        siteName: m.site.name,
        status,
        alertLevel: m.alertLevel,
        alertReason: m.alertReason,
        vitalScore: score
          ? {
              mood: score.mood,
              sleep: score.sleep,
              condition: score.condition,
              average: avg,
              streakDays: score.streakDays,
            }
          : null,
      };
    });
  }

  /** アラート一覧: 閾値以下 or 未入力 or 手動フラグのメンバー */
  async getAlerts(tenantId: string, siteId?: string) {
    const overview = await this.getTeamOverview(tenantId, siteId);

    return overview
      .filter((m) => m.status !== 'good')
      .map((m) => {
        const reasons: string[] = [];
        if (m.status === 'not_submitted') reasons.push('本日未入力');
        if (m.vitalScore && m.vitalScore.average !== null && m.vitalScore.average < 2.5)
          reasons.push('バイタルスコアが低い');
        if (m.alertLevel) reasons.push(`手動: ${m.alertReason ?? m.alertLevel}`);

        return {
          ...m,
          alertReasons: reasons,
          recommendedActions: this.getRecommendedActions(m.status, reasons),
        };
      })
      .sort((a, b) => {
        const order = { warning: 0, caution: 1, not_submitted: 2, good: 3 };
        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
      });
  }

  private getRecommendedActions(
    status: string,
    reasons: string[],
  ): string[] {
    const actions: string[] = [];
    if (status === 'warning') actions.push('本人に直接声がけ');
    if (status === 'not_submitted') actions.push('入力リマインド');
    if (reasons.some((r) => r.includes('バイタル'))) actions.push('1on1面談を検討');
    if (status === 'caution') actions.push('様子を見守る');
    return actions;
  }

  /** 手動アラート設定 */
  async setManualAlert(
    memberId: string,
    alertLevel: string | null,
    alertReason: string | null,
    setByUserId: string,
  ) {
    return this.prisma.member.update({
      where: { id: memberId },
      data: {
        alertLevel,
        alertReason,
        alertSetById: alertLevel ? setByUserId : null,
      },
      select: {
        id: true,
        alertLevel: true,
        alertReason: true,
        alertSetById: true,
      },
    });
  }
}
