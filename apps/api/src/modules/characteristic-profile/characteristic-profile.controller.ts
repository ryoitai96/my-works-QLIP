import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantServiceGuard } from '../../common/guards/tenant-service.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequireService } from '../../common/decorators/require-service.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { CharacteristicProfileService } from './characteristic-profile.service';

@Controller('characteristic-profiles')
@UseGuards(JwtAuthGuard, TenantServiceGuard)
@RequireService('assessment')
export class CharacteristicProfileController {
  constructor(
    private readonly profileService: CharacteristicProfileService,
  ) {}

  @Get(':memberId')
  getByMemberId(
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.profileService.getByMemberId(memberId, {
      userId: user.userId,
      role: user.role,
    });
  }

  @Put(':memberId')
  @UseGuards(RolesGuard)
  @Roles('R01', 'R02')
  upsert(
    @Param('memberId') memberId: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      visualCognition?: number | null;
      auditoryCognition?: number | null;
      dexterity?: number | null;
      physicalEndurance?: number | null;
      repetitiveWorkTolerance?: number | null;
      adaptability?: number | null;
      interpersonalCommunication?: number | null;
      concentrationDuration?: number | null;
      stressTolerance?: number | null;
      specialNotes?: string | null;
      clinicSchedule?: string | null;
      medicationTiming?: string | null;
      environmentAccommodation?: string | null;
      communicationAccommodation?: string | null;
    },
  ) {
    return this.profileService.upsert(memberId, body, user.userId);
  }
}
