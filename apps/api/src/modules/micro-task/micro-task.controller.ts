import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { MicroTaskService } from './micro-task.service';

@Controller('micro-tasks')
@UseGuards(JwtAuthGuard, TenantServiceGuard)
@RequireService('micro_task')
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

  @Post()
  @UseGuards(RolesGuard)
  @Roles('R01', 'R02')
  create(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      taskCode: string;
      name: string;
      businessCategory: string;
      category?: string;
      requiredSkillTags?: string[];
      difficultyLevel: number;
      standardDuration?: number;
      physicalLoad?: string;
      cognitiveLoad?: string;
      description?: string;
    },
  ) {
    return this.microTaskService.create(user.tenantId, user.siteId, body);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('R01', 'R02')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      businessCategory?: string;
      category?: string;
      requiredSkillTags?: string[];
      difficultyLevel?: number;
      standardDuration?: number;
      physicalLoad?: string;
      cognitiveLoad?: string;
      description?: string;
      isActive?: boolean;
    },
  ) {
    return this.microTaskService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('R01', 'R02')
  remove(@Param('id') id: string) {
    return this.microTaskService.softDelete(id);
  }
}
