import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import { randomUUID } from 'crypto';
import { join, extname } from 'path';
import type { Response } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { STAFF_ROLES, MEMBER_ROLES, Role } from '@qlip/shared';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

const storage = diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (_req, file, cb) => {
    const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...STAFF_ROLES, Role.CLIENT_HR)
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    return this.memberService.findByTenant(user.tenantId);
  }

  @Get('me')
  @Roles(...STAFF_ROLES, Role.CLIENT_HR, ...MEMBER_ROLES)
  async findMe(@CurrentUser() user: JwtPayload) {
    return this.memberService.findByUserId(user.userId);
  }

  @Patch('me')
  @Roles(...STAFF_ROLES, Role.CLIENT_HR, ...MEMBER_ROLES)
  async updateMe(
    @Body() dto: UpdateMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.updateSelf(user.userId, dto);
  }

  @Get('sites')
  async findSites(@CurrentUser() user: JwtPayload) {
    return this.memberService.fetchSites(user.tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.findById(id, user.tenantId);
  }

  @Post()
  async create(
    @Body() dto: CreateMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.create(dto, user.tenantId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.softDelete(id, user.tenantId);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.uploadDocument(id, file, user.userId, user.tenantId);
  }

  @Get(':id/documents')
  async findDocuments(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.memberService.findDocuments(id, user.tenantId);
  }

  @Get(':id/documents/:docId')
  async downloadDocument(
    @Param('id') id: string,
    @Param('docId') docId: string,
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const doc = await this.memberService.findDocument(id, docId, user.tenantId);
    const stream = createReadStream(doc.filePath);
    res.set({
      'Content-Type': doc.fileType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.fileName)}"`,
    });
    return new StreamableFile(stream);
  }
}
