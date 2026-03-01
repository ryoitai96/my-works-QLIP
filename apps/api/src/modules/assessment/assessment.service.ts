import {
  Injectable,
  ForbiddenException,
  BadRequestException,
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
}
