import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { STAFF_ROLES } from '@qlip/shared';
import { AdminService } from './admin.service';
import { UpdateTenantServicesDto } from './dto/update-tenant-services.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF_ROLES)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('tenants')
  findAllTenants() {
    return this.adminService.findAllTenants();
  }

  @Get('tenants/:id')
  findTenantById(@Param('id') id: string) {
    return this.adminService.findTenantById(id);
  }

  @Get('tenants/:id/services')
  findTenantServices(@Param('id') id: string) {
    return this.adminService.findTenantServices(id);
  }

  @Patch('tenants/:id/services')
  updateTenantServices(
    @Param('id') id: string,
    @Body() dto: UpdateTenantServicesDto,
  ) {
    return this.adminService.updateTenantServices(id, dto);
  }

  @Get('users')
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('users/:id')
  findUserById(@Param('id') id: string) {
    return this.adminService.findUserById(id);
  }
}
