import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantServiceGuard } from '../../common/guards/tenant-service.guard';
import { RequireService } from '../../common/decorators/require-service.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { HealthCheckService } from './health-check.service';

@Controller('health-checks')
@UseGuards(JwtAuthGuard, TenantServiceGuard)
@RequireService('health_check')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get('today')
  findToday(@CurrentUser() user: JwtPayload) {
    return this.healthCheckService.findToday(user.userId);
  }

  @Post()
  submit(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
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
    },
  ) {
    return this.healthCheckService.submitOrUpdate(user.userId, body);
  }

  @Get('team-overview')
  @UseGuards(RolesGuard)
  @Roles('R01', 'R02')
  getTeamOverview(@CurrentUser() user: JwtPayload) {
    return this.healthCheckService.getTeamOverview(user.tenantId, user.siteId);
  }

  @Get('alerts')
  @UseGuards(RolesGuard)
  @Roles('R01', 'R02')
  getAlerts(@CurrentUser() user: JwtPayload) {
    return this.healthCheckService.getAlerts(user.tenantId, user.siteId);
  }

  @Post('alerts/manual')
  @UseGuards(RolesGuard)
  @Roles('R01', 'R02')
  setManualAlert(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      memberId: string;
      alertLevel: string | null;
      alertReason: string | null;
    },
  ) {
    return this.healthCheckService.setManualAlert(
      body.memberId,
      body.alertLevel,
      body.alertReason,
      user.userId,
    );
  }
}
