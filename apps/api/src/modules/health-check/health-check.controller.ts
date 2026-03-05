import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantServiceGuard } from '../../common/guards/tenant-service.guard';
import { RequireService } from '../../common/decorators/require-service.decorator';
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
      note?: string;
    },
  ) {
    return this.healthCheckService.submitOrUpdate(user.userId, body);
  }
}
