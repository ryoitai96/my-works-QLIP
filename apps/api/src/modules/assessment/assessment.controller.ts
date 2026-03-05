import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantServiceGuard } from '../../common/guards/tenant-service.guard';
import { RequireService } from '../../common/decorators/require-service.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { AssessmentService } from './assessment.service';

@Controller('assessments')
@UseGuards(JwtAuthGuard, TenantServiceGuard)
@RequireService('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Get('latest')
  findLatest(@CurrentUser() user: JwtPayload) {
    return this.assessmentService.findLatest(user.userId);
  }

  @Post()
  submit(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      answers: Array<{
        questionId: string;
        domain: string;
        questionText: string;
        score: number;
      }>;
    },
  ) {
    return this.assessmentService.submit(user.userId, body);
  }
}
