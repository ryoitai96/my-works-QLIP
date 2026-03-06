import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Role, STAFF_ROLES } from '@qlip/shared';
import { SiteService } from './site.service';

@Controller('sites')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  @Roles(...STAFF_ROLES, Role.CLIENT_HR)
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.siteService.findAll(user);
  }

  @Get(':id')
  @Roles(...STAFF_ROLES, Role.CLIENT_HR)
  async findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.siteService.findById(id, user);
  }

  @Post()
  @Roles(...STAFF_ROLES)
  async create(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      name: string;
      companyName?: string;
      serviceName?: string;
      siteType: string;
      address?: string;
    },
  ) {
    return this.siteService.create(user, body);
  }

  @Patch(':id')
  @Roles(...STAFF_ROLES)
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      companyName?: string;
      serviceName?: string;
      address?: string;
      isActive?: boolean;
    },
  ) {
    return this.siteService.update(user, id, body);
  }
}
