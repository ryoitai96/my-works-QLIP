import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantServiceGuard } from '../../common/guards/tenant-service.guard';
import { RequireService } from '../../common/decorators/require-service.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { ThanksService } from './thanks.service';

@Controller('thanks')
@UseGuards(JwtAuthGuard, TenantServiceGuard)
@RequireService('thanks')
export class ThanksController {
  constructor(private readonly thanksService: ThanksService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() body: { toUserId: string; content: string; category: string },
  ) {
    return this.thanksService.create(user.userId, body);
  }

  @Get()
  findReceived(@CurrentUser() user: JwtPayload) {
    return this.thanksService.findReceivedByUserId(user.userId);
  }
}
