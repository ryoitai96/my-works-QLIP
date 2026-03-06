import { Module } from '@nestjs/common';
import { QrThanksController } from './qr-thanks.controller';
import { QrThanksService } from './qr-thanks.service';

@Module({
  controllers: [QrThanksController],
  providers: [QrThanksService],
  exports: [QrThanksService],
})
export class QrThanksModule {}
