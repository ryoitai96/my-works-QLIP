import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { MicroTaskService } from './micro-task.service';

@Controller('micro-tasks')
@UseGuards(JwtAuthGuard)
export class MicroTaskController {
  constructor(private readonly microTaskService: MicroTaskService) {}

  @Get()
  findAll() {
    return this.microTaskService.findAll();
  }

  @Post(':microTaskId/completions')
  createCompletion(
    @CurrentUser() user: JwtPayload,
    @Param('microTaskId') microTaskId: string,
    @Body() body: { notes?: string },
  ) {
    return this.microTaskService.createCompletion(
      user.userId,
      microTaskId,
      body.notes,
    );
  }
}
