import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { HealthCheckService } from './health-check.service';

@Controller('health-checks')
@UseGuards(JwtAuthGuard)
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}

  @Get('today')
  findToday(@CurrentUser() user: JwtPayload) {
    return this.healthCheckService.findToday(user.userId);
  }

  @Post()
  submit(
    @CurrentUser() user: JwtPayload,
    @Body() body: { mood: number; sleep: number; condition: number; note?: string },
  ) {
    return this.healthCheckService.submitOrUpdate(user.userId, body);
  }
}
