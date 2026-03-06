import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { Role } from '@qlip/shared';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(user: JwtPayload) {
    const isTenantWide = user.role === Role.SUPER_ADMIN || user.role === Role.CLIENT_HR;
    const tenantId = user.tenantId;

    // SUPER_ADMIN and CLIENT_HR see the whole tenant; JOB_COACH sees only their site
    const siteFilter = isTenantWide ? {} : { siteId: user.siteId };
    const memberWhere = { tenantId, ...siteFilter };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [members, tasks, thanks, sites, healthCheck] = await Promise.all([
      this.getMemberStats(memberWhere),
      this.getTaskStats(memberWhere, todayStart, weekStart, monthStart),
      this.getThanksStats(tenantId, isTenantWide, user.siteId, weekStart, monthStart),
      this.getSiteStats(tenantId, isTenantWide, user.siteId),
      this.getHealthCheckStats(memberWhere, todayStart, weekStart),
    ]);

    return { members, tasks, thanks, sites, healthCheck };
  }

  private async getMemberStats(memberWhere: Record<string, unknown>) {
    const allMembers = await this.prisma.member.findMany({
      where: memberWhere,
      select: { status: true, siteId: true, site: { select: { id: true, name: true } } },
    });

    const total = allMembers.length;
    const active = allMembers.filter((m) => m.status === 'active').length;
    const onLeave = allMembers.filter((m) => m.status === 'on_leave').length;

    const bySiteMap = new Map<string, { siteId: string; siteName: string; count: number }>();
    for (const m of allMembers) {
      const existing = bySiteMap.get(m.siteId);
      if (existing) {
        existing.count++;
      } else {
        bySiteMap.set(m.siteId, { siteId: m.siteId, siteName: m.site.name, count: 1 });
      }
    }

    return { total, active, onLeave, bySite: Array.from(bySiteMap.values()) };
  }

  private async getTaskStats(
    memberWhere: Record<string, unknown>,
    todayStart: Date,
    weekStart: Date,
    monthStart: Date,
  ) {
    const memberIds = (
      await this.prisma.member.findMany({
        where: memberWhere,
        select: { id: true },
      })
    ).map((m) => m.id);

    if (memberIds.length === 0) {
      return { totalCompletionsToday: 0, totalCompletionsThisWeek: 0, totalCompletionsThisMonth: 0, completionRate: 0 };
    }

    const assignmentWhere = { memberId: { in: memberIds } };

    const [todayCount, weekCount, monthCount, totalAssigned, totalCompleted] = await Promise.all([
      this.prisma.taskAssignment.count({
        where: { ...assignmentWhere, status: 'completed', completedAt: { gte: todayStart } },
      }),
      this.prisma.taskAssignment.count({
        where: { ...assignmentWhere, status: 'completed', completedAt: { gte: weekStart } },
      }),
      this.prisma.taskAssignment.count({
        where: { ...assignmentWhere, status: 'completed', completedAt: { gte: monthStart } },
      }),
      this.prisma.taskAssignment.count({ where: assignmentWhere }),
      this.prisma.taskAssignment.count({ where: { ...assignmentWhere, status: 'completed' } }),
    ]);

    const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

    return {
      totalCompletionsToday: todayCount,
      totalCompletionsThisWeek: weekCount,
      totalCompletionsThisMonth: monthCount,
      completionRate,
    };
  }

  private async getThanksStats(
    tenantId: string,
    isTenantWide: boolean,
    siteId: string | undefined,
    weekStart: Date,
    monthStart: Date,
  ) {
    // Filter thanks cards by users belonging to the tenant/site
    const userWhere = isTenantWide
      ? { tenantId }
      : { tenantId, siteId };

    const userIds = (
      await this.prisma.user.findMany({ where: userWhere, select: { id: true } })
    ).map((u) => u.id);

    if (userIds.length === 0) {
      return { totalThisMonth: 0, totalThisWeek: 0, topCategories: [] };
    }

    const thanksWhere = { fromUserId: { in: userIds } };

    const [monthCount, weekCount, categoryGroups] = await Promise.all([
      this.prisma.thanksCard.count({ where: { ...thanksWhere, createdAt: { gte: monthStart } } }),
      this.prisma.thanksCard.count({ where: { ...thanksWhere, createdAt: { gte: weekStart } } }),
      this.prisma.thanksCard.groupBy({
        by: ['category'],
        where: { ...thanksWhere, createdAt: { gte: monthStart } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      totalThisMonth: monthCount,
      totalThisWeek: weekCount,
      topCategories: categoryGroups.map((g) => ({ category: g.category, count: g._count.id })),
    };
  }

  private async getSiteStats(tenantId: string, isTenantWide: boolean, siteId?: string) {
    const siteWhere = isTenantWide ? { tenantId } : { tenantId, id: siteId };

    const allSites = await this.prisma.site.findMany({
      where: siteWhere,
      select: { siteType: true },
    });

    const bySiteTypeMap = new Map<string, number>();
    for (const s of allSites) {
      bySiteTypeMap.set(s.siteType, (bySiteTypeMap.get(s.siteType) ?? 0) + 1);
    }

    return {
      total: allSites.length,
      bySiteType: Array.from(bySiteTypeMap.entries()).map(([siteType, count]) => ({ siteType, count })),
    };
  }

  async getProductionProgress() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const todayFilter = { createdAt: { gte: todayStart, lt: tomorrowStart } };

    const [pending, confirmed, inProduction, delivered, total] = await Promise.all([
      this.prisma.flowerOrder.count({ where: { ...todayFilter, status: 'pending' } }),
      this.prisma.flowerOrder.count({ where: { ...todayFilter, status: 'confirmed' } }),
      this.prisma.flowerOrder.count({ where: { ...todayFilter, status: 'in_production' } }),
      this.prisma.flowerOrder.count({ where: { ...todayFilter, status: 'delivered' } }),
      this.prisma.flowerOrder.count({ where: todayFilter }),
    ]);

    return { total, pending, confirmed, inProduction, delivered };
  }

  async getMemberDashboardStats(user: JwtPayload) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [production, thanks, todayTasks, healthCheck] = await Promise.all([
      this.getProductionStats(todayStart, weekStart, monthStart),
      this.getReceivedThanksStats(user.userId, monthStart),
      this.getMemberTodayTasks(user.userId, todayStart),
      this.getMemberHealthCheck(user.userId, todayStart),
    ]);

    const badgesAndPoints = await this.getMemberBadgesAndPoints(
      user.userId,
      healthCheck.streakDays,
    );

    return { production, thanks, todayTasks, healthCheck, ...badgesAndPoints };
  }

  private async getProductionStats(
    todayStart: Date,
    weekStart: Date,
    monthStart: Date,
  ) {
    const [deliveredTotal, deliveredToday, deliveredThisWeek, deliveredThisMonth, inProgressCount, waitingCount, pendingCount] =
      await Promise.all([
        this.prisma.flowerOrder.count({ where: { status: 'delivered' } }),
        this.prisma.flowerOrder.count({
          where: { status: 'delivered', updatedAt: { gte: todayStart } },
        }),
        this.prisma.flowerOrder.count({
          where: { status: 'delivered', updatedAt: { gte: weekStart } },
        }),
        this.prisma.flowerOrder.count({
          where: { status: 'delivered', updatedAt: { gte: monthStart } },
        }),
        this.prisma.flowerOrder.count({ where: { status: 'in_production' } }),
        this.prisma.flowerOrder.count({ where: { status: 'confirmed' } }),
        this.prisma.flowerOrder.count({ where: { status: 'pending' } }),
      ]);

    return { deliveredTotal, deliveredToday, deliveredThisWeek, deliveredThisMonth, inProgressCount, waitingCount, pendingCount };
  }

  private async getReceivedThanksStats(userId: string, monthStart: Date) {
    const [receivedTotal, receivedThisMonth, recentCards] = await Promise.all([
      this.prisma.thanksCard.count({ where: { toUserId: userId } }),
      this.prisma.thanksCard.count({
        where: { toUserId: userId, createdAt: { gte: monthStart } },
      }),
      this.prisma.thanksCard.findMany({
        where: { toUserId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { fromUser: { select: { id: true, name: true } } },
      }),
    ]);

    return { receivedTotal, receivedThisMonth, recentCards };
  }

  private async getHealthCheckStats(
    memberWhere: Record<string, unknown>,
    todayStart: Date,
    weekStart: Date,
  ) {
    const memberIds = (
      await this.prisma.member.findMany({
        where: memberWhere,
        select: { id: true },
      })
    ).map((m) => m.id);

    const activeMemberCount = (
      await this.prisma.member.count({ where: { ...memberWhere, status: 'active' } })
    );

    if (memberIds.length === 0 || activeMemberCount === 0) {
      return { todaySubmissions: 0, todayParticipationRate: 0, weeklyAvgParticipationRate: 0 };
    }

    const todaySubmissions = await this.prisma.vitalScore.count({
      where: { memberId: { in: memberIds }, recordDate: todayStart },
    });

    const todayParticipationRate = Math.round((todaySubmissions / activeMemberCount) * 100);

    // Weekly: count distinct days with submissions
    const weeklyScores = await this.prisma.vitalScore.findMany({
      where: { memberId: { in: memberIds }, recordDate: { gte: weekStart } },
      select: { recordDate: true },
    });

    const daySubmissions = new Map<string, number>();
    for (const vs of weeklyScores) {
      const dayKey = vs.recordDate.toISOString().split('T')[0];
      daySubmissions.set(dayKey, (daySubmissions.get(dayKey) ?? 0) + 1);
    }

    const daysInWeek = Math.max(1, daySubmissions.size);
    const totalWeeklySubmissions = weeklyScores.length;
    const weeklyAvgParticipationRate = Math.round(
      (totalWeeklySubmissions / (daysInWeek * activeMemberCount)) * 100,
    );

    return { todaySubmissions, todayParticipationRate, weeklyAvgParticipationRate };
  }

  private async getMemberTodayTasks(userId: string, todayStart: Date) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!member) return [];

    return this.prisma.taskAssignment.findMany({
      where: {
        memberId: member.id,
        assignedDate: todayStart,
        status: { not: 'cancelled' },
      },
      select: {
        id: true,
        status: true,
        microTask: {
          select: { taskCode: true, name: true, standardDuration: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async getMemberHealthCheck(userId: string, todayStart: Date) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!member) return { submittedToday: false, streakDays: 0 };

    const todayRecord = await this.prisma.vitalScore.findFirst({
      where: { memberId: member.id, recordDate: todayStart },
      select: { id: true },
    });

    // Calculate streak: count consecutive days with records going backwards from today
    let streakDays = 0;
    const checkDate = new Date(todayStart);

    // If today is submitted, count it; otherwise start from yesterday
    if (todayRecord) {
      streakDays = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Check up to 365 days back
    for (let i = 0; i < 365; i++) {
      const record = await this.prisma.vitalScore.findFirst({
        where: { memberId: member.id, recordDate: checkDate },
        select: { id: true },
      });
      if (!record) break;
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return { submittedToday: !!todayRecord, streakDays };
  }

  private async getMemberBadgesAndPoints(userId: string, streakDays: number) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!member) {
      return {
        points: 0,
        badges: [],
        badgeStats: { healthReports: 0, tasksCompleted: 0, thanksSent: 0, thanksReceived: 0, assessments: 0 },
      };
    }

    const [healthReports, tasksCompleted, thanksSent, thanksReceived, assessments] =
      await Promise.all([
        this.prisma.vitalScore.count({ where: { memberId: member.id } }),
        this.prisma.taskAssignment.count({
          where: { memberId: member.id, status: 'completed' },
        }),
        this.prisma.thanksCard.count({ where: { fromUserId: userId } }),
        this.prisma.thanksCard.count({ where: { toUserId: userId } }),
        this.prisma.assessmentResult.count({
          where: { memberId: member.id, status: 'completed' },
        }),
      ]);

    const points =
      healthReports * 10 +
      tasksCompleted * 20 +
      thanksSent * 15 +
      thanksReceived * 15 +
      assessments * 30;

    const badges = [
      { id: 'first_task', earned: tasksCompleted >= 1 },
      { id: 'attendance_streak_7', earned: streakDays >= 7 },
      { id: 'attendance_streak_30', earned: streakDays >= 30 },
      { id: 'health_report_10', earned: healthReports >= 10 },
      { id: 'health_report_50', earned: healthReports >= 50 },
      { id: 'task_complete_10', earned: tasksCompleted >= 10 },
      { id: 'task_complete_50', earned: tasksCompleted >= 50 },
      { id: 'thanks_sent_5', earned: thanksSent >= 5 },
      { id: 'thanks_received_10', earned: thanksReceived >= 10 },
      { id: 'assessment_3', earned: assessments >= 3 },
    ];

    return {
      points,
      badges,
      badgeStats: { healthReports, tasksCompleted, thanksSent, thanksReceived, assessments },
    };
  }
}
