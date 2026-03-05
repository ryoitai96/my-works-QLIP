import { Module } from '@nestjs/common';
import { ClientSettingsController } from './client-settings.controller';
import { ClientSettingsService } from './client-settings.service';

@Module({
  controllers: [ClientSettingsController],
  providers: [ClientSettingsService],
})
export class ClientSettingsModule {}
