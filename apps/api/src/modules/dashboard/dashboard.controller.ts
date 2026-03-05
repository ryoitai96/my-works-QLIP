import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { STAFF_ROLES, MEMBER_ROLES, Role } from '@qlip/shared';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(...STAFF_ROLES, Role.CLIENT_HR)
  async getStats(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getStats(user);
  }

  @Get('member-stats')
  @Roles(...MEMBER_ROLES)
  async getMemberStats(@CurrentUser() user: JwtPayload) {
    return this.dashboardService.getMemberDashboardStats(user);
  }
}
