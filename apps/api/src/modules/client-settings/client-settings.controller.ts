import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { CLIENT_ROLES } from '@qlip/shared';
import { ClientSettingsService } from './client-settings.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateClientUserDto } from './dto/create-client-user.dto';
import { UpdateClientUserDto } from './dto/update-client-user.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('client-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...CLIENT_ROLES)
export class ClientSettingsController {
  constructor(
    private readonly clientSettingsService: ClientSettingsService,
  ) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.clientSettingsService.getProfile(user);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.clientSettingsService.updateProfile(user, dto);
  }

  @Get('members')
  async getMembers(@CurrentUser() user: JwtPayload) {
    return this.clientSettingsService.getMembers(user);
  }

  @Post('members')
  async createMember(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateClientUserDto,
  ) {
    return this.clientSettingsService.createMember(user, dto);
  }

  @Patch('members/:id')
  async updateMember(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateClientUserDto,
  ) {
    return this.clientSettingsService.updateMember(user, id, dto);
  }

  @Delete('members/:id')
  async deleteMember(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.clientSettingsService.deleteMember(user, id);
  }

  // ===== Team endpoints =====

  @Get('teams')
  async getTeams(@CurrentUser() user: JwtPayload) {
    return this.clientSettingsService.getTeams(user);
  }

  @Post('teams')
  async createTeam(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTeamDto,
  ) {
    return this.clientSettingsService.createTeam(user, dto);
  }

  @Patch('teams/:id')
  async updateTeam(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
  ) {
    return this.clientSettingsService.updateTeam(user, id, dto);
  }

  @Delete('teams/:id')
  async deleteTeam(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.clientSettingsService.deleteTeam(user, id);
  }
}
