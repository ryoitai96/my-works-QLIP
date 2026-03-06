import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { QrThanksService } from './qr-thanks.service';

@Controller('qr-thanks')
export class QrThanksController {
  constructor(private readonly qrThanksService: QrThanksService) {}

  /** QRトークン生成（R01, R02のみ） */
  @Post('tokens')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('R01', 'R02')
  createToken(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      memberId: string;
      storyText: string;
      flowerOrderId?: string;
      expiresInDays?: number;
    },
  ) {
    return this.qrThanksService.createToken(user, body);
  }

  /** トークン一覧（R01, R02のみ） */
  @Get('tokens')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('R01', 'R02')
  listTokens(@CurrentUser() user: JwtPayload) {
    return this.qrThanksService.listTokens(user);
  }

  /** ストーリーページデータ取得（公開） */
  @Get('story/:token')
  getStory(@Param('token') token: string) {
    return this.qrThanksService.getStory(token);
  }

  /** 「ありがとう」送信（公開） */
  @Post('story/:token/thanks')
  submitThanks(
    @Param('token') token: string,
    @Body() body?: { senderDisplayName?: string; message?: string },
  ) {
    return this.qrThanksService.submitThanks(token, body);
  }
}
