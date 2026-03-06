import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

interface AnswerDto {
  questionId: string;
  domain: string;
  questionText: string;
  score: number;
}

interface SubmitAssessmentDto {
  answers: AnswerDto[];
}

@Injectable()
export class AssessmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findLatest(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
    });
    if (!member) {
      throw new ForbiddenException('Member registration required');
    }

    return this.prisma.assessmentResult.findFirst({
      where: { memberId: member.id },
      orderBy: { assessmentDate: 'desc' },
      include: {
        answers: {
          orderBy: { questionId: 'asc' },
        },
      },
    });
  }

  async submit(userId: string, dto: SubmitAssessmentDto) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
    });
    if (!member) {
      throw new ForbiddenException('Member registration required');
    }

    if (!dto.answers || dto.answers.length === 0) {
      throw new BadRequestException('At least one answer is required');
    }

    for (const answer of dto.answers) {
      if (
        !Number.isInteger(answer.score) ||
        answer.score < 1 ||
        answer.score > 5
      ) {
        throw new BadRequestException(
          `Score for ${answer.questionId} must be an integer between 1 and 5`,
        );
      }
    }

    // Calculate domain averages
    const domainScores: Record<string, number[]> = {};
    for (const answer of dto.answers) {
      if (!domainScores[answer.domain]) {
        domainScores[answer.domain] = [];
      }
      domainScores[answer.domain].push(answer.score);
    }

    const avg = (arr: number[] | undefined) =>
      arr && arr.length > 0
        ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
        : null;

    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return this.prisma.assessmentResult.create({
      data: {
        memberId: member.id,
        assessmentType: 'monthly_simple',
        assessmentDate: now,
        period,
        status: 'completed',
        conductedById: userId,
        d1Score: avg(domainScores['D1']),
        d2Score: avg(domainScores['D2']),
        d3Score: avg(domainScores['D3']),
        d4Score: avg(domainScores['D4']),
        d5Score: avg(domainScores['D5']),
        answers: {
          create: dto.answers.map((a) => ({
            domain: a.domain,
            questionId: a.questionId,
            questionText: a.questionText,
            evaluationType: 'self',
            score: a.score,
          })),
        },
      },
      include: {
        answers: {
          orderBy: { questionId: 'asc' },
        },
      },
    });
  }

  /** Get assessment history for a member (self) */
  async getHistory(userId: string) {
    const member = await this.prisma.member.findUnique({
      where: { userId },
    });
    if (!member) {
      throw new ForbiddenException('Member registration required');
    }

    return this.prisma.assessmentResult.findMany({
      where: { memberId: member.id },
      orderBy: { assessmentDate: 'desc' },
      include: {
        answers: {
          orderBy: { questionId: 'asc' },
        },
      },
    });
  }

  /** Get assessment history for a specific member (JC view) */
  async getMemberHistory(memberId: string) {
    return this.prisma.assessmentResult.findMany({
      where: { memberId },
      orderBy: { assessmentDate: 'desc' },
      include: {
        answers: {
          orderBy: { questionId: 'asc' },
        },
      },
    });
  }

  /** Get team overview: latest scores for all active members */
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

    const results = await Promise.all(
      members.map(async (m) => {
        const latest = await this.prisma.assessmentResult.findFirst({
          where: { memberId: m.id },
          orderBy: { assessmentDate: 'desc' },
        });

        return {
          memberId: m.id,
          userId: m.user.id,
          name: m.user.name,
          avatarId: m.avatarId,
          siteName: m.site.name,
          latestAssessment: latest
            ? {
                id: latest.id,
                period: latest.period,
                assessmentDate: latest.assessmentDate,
                d1Score: latest.d1Score,
                d2Score: latest.d2Score,
                d3Score: latest.d3Score,
                d4Score: latest.d4Score,
                d5Score: latest.d5Score,
              }
            : null,
        };
      }),
    );

    return results;
  }

  /** Toggle strength flag on an answer */
  async toggleStrength(answerId: string) {
    const answer = await this.prisma.assessmentAnswer.findUnique({
      where: { id: answerId },
    });
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    return this.prisma.assessmentAnswer.update({
      where: { id: answerId },
      data: { isStrength: !answer.isStrength },
    });
  }
}
