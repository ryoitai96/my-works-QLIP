import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantServiceGuard } from '../../common/guards/tenant-service.guard';
import { RequireService } from '../../common/decorators/require-service.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { MessageService } from './message.service';
import {
  CreateMessageDto,
  CreateCommentDto,
  UpdateMessageStatusDto,
} from './dto/create-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard, TenantServiceGuard)
@RequireService('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('recipients')
  findRecipients(@CurrentUser() user: JwtPayload) {
    return this.messageService.findRecipients(user.role, user.tenantId);
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateMessageDto) {
    return this.messageService.create(user.userId, user.tenantId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.messageService.findAll(user.userId, user.role, user.tenantId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.messageService.findOne(id, user.userId, user.role, user.tenantId);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateMessageStatusDto,
  ) {
    return this.messageService.updateStatus(id, user.userId, user.role, dto);
  }

  @Post(':id/comments')
  addComment(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.messageService.addComment(
      id,
      user.userId,
      user.role,
      user.tenantId,
      dto,
    );
  }
}
