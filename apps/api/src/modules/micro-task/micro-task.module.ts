import { Module } from '@nestjs/common';
import { MicroTaskController } from './micro-task.controller';
import { MicroTaskService } from './micro-task.service';

@Module({
  controllers: [MicroTaskController],
  providers: [MicroTaskService],
  exports: [MicroTaskService],
})
export class MicroTaskModule {}
