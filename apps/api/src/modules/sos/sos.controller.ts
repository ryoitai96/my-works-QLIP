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
import { SosService } from './sos.service';

@Controller('sos')
@UseGuards(JwtAuthGuard, TenantServiceGuard)
@RequireService('sos')
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('R03')
  create(
    @CurrentUser() user: JwtPayload,
    @Body() body: { category: string; content: string; isAnonymous?: boolean },
  ) {
    return this.sosService.create(user, body);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('R01', 'R02')
  findAll(@CurrentUser() user: JwtPayload) {
    return this.sosService.findAll(user);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('R01')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { status: string; resolutionNote?: string },
  ) {
    return this.sosService.updateStatus(user, id, body);
  }
}
