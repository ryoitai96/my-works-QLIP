import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantServiceGuard } from '../../common/guards/tenant-service.guard';
import { RequireService } from '../../common/decorators/require-service.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { TaskService } from './task.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, TenantServiceGuard)
@RequireService('micro_task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('assign')
  @UseGuards(RolesGuard)
  @Roles('R01', 'R02')
  assign(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      memberId: string;
      microTaskId: string;
      assignedDate: string;
      notes?: string;
    },
  ) {
    return this.taskService.assignTask(user.userId, body);
  }

  @Get('assignments')
  @UseGuards(RolesGuard)
  @Roles('R01', 'R02')
  getAssignments(
    @CurrentUser() user: JwtPayload,
    @Query('date') date?: string,
  ) {
    return this.taskService.getAssignmentsByDate(
      user.tenantId,
      date,
      user.siteId,
    );
  }

  @Get('my-assignments')
  getMyAssignments(@CurrentUser() user: JwtPayload) {
    return this.taskService.getMyAssignments(user.userId);
  }

  @Patch('assignments/:id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.taskService.updateAssignmentStatus(id, body.status, user.userId);
  }
}
