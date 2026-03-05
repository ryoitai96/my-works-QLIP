import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';

@Module({
  imports: [DatabaseModule],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
