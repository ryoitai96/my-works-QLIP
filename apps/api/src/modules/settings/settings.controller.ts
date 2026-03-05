import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { STAFF_ROLES, Role } from '@qlip/shared';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF_ROLES)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('account')
  async getAccount(@CurrentUser() user: JwtPayload) {
    return this.settingsService.getAccount(user);
  }

  @Patch('account')
  async updateAccount(@CurrentUser() user: JwtPayload, @Body() body: { name: string }) {
    return this.settingsService.updateAccount(user, body);
  }

  @Patch('account/password')
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.settingsService.changePassword(user, body);
  }

  @Get('sites')
  async getSites(@CurrentUser() user: JwtPayload) {
    return this.settingsService.getSites(user);
  }

  @Patch('sites/:siteId')
  async updateSite(
    @CurrentUser() user: JwtPayload,
    @Param('siteId') siteId: string,
    @Body() body: { name?: string; address?: string; isActive?: boolean },
  ) {
    return this.settingsService.updateSite(user, siteId, body);
  }

  @Get('tenant')
  async getTenant(@CurrentUser() user: JwtPayload) {
    return this.settingsService.getTenant(user);
  }

  @Get('tenant-services')
  @Roles(Role.SUPER_ADMIN, Role.JOB_COACH, Role.MEMBER, Role.CLIENT_HR, Role.CLIENT_EMPLOYEE)
  async getTenantServices(@CurrentUser() user: JwtPayload) {
    return this.settingsService.getTenantServices(user);
  }
}
