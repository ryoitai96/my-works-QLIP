import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MicroTaskService } from './micro-task.service';

@Controller('micro-tasks')
@UseGuards(JwtAuthGuard)
export class MicroTaskController {
  constructor(private readonly microTaskService: MicroTaskService) {}

  @Get()
  findAll() {
    return this.microTaskService.findAll();
  }
}
