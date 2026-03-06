import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantServiceGuard } from '../../common/guards/tenant-service.guard';
import { RequireService } from '../../common/decorators/require-service.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
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

  @Get('history')
  getHistory(@CurrentUser() user: JwtPayload) {
    return this.assessmentService.getHistory(user.userId);
  }

  @Get('history/:memberId')
  @UseGuards(RolesGuard)
  @Roles('R01', 'R02')
  getMemberHistory(@Param('memberId') memberId: string) {
    return this.assessmentService.getMemberHistory(memberId);
  }

  @Get('team-overview')
  @UseGuards(RolesGuard)
  @Roles('R01', 'R02')
  getTeamOverview(@CurrentUser() user: JwtPayload) {
    return this.assessmentService.getTeamOverview(user.tenantId, user.siteId);
  }

  @Patch('answers/:answerId/strength')
  toggleStrength(@Param('answerId') answerId: string) {
    return this.assessmentService.toggleStrength(answerId);
  }
}
