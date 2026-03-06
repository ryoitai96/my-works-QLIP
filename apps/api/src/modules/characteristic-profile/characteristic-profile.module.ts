import { Module } from '@nestjs/common';
import { CharacteristicProfileController } from './characteristic-profile.controller';
import { CharacteristicProfileService } from './characteristic-profile.service';

@Module({
  controllers: [CharacteristicProfileController],
  providers: [CharacteristicProfileService],
  exports: [CharacteristicProfileService],
})
export class CharacteristicProfileModule {}
