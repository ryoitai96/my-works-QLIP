import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantServiceGuard } from '../../common/guards/tenant-service.guard';
import { RequireService } from '../../common/decorators/require-service.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { AttendanceService } from './attendance.service';
import { SubmitCorrectionDto } from './dto/submit-correction.dto';
import { ReviewCorrectionDto } from './dto/review-correction.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';

const STAFF_ROLES = ['R01', 'R02'];
const HR_ROLE = 'R04';

@Controller('attendance')
@UseGuards(JwtAuthGuard, TenantServiceGuard)
@RequireService('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ========== メンバー打刻 (R03) ==========

  @Post('clock-in')
  clockIn(@CurrentUser() user: JwtPayload) {
    return this.attendanceService.clockIn(user.userId);
  }

  @Post('clock-out')
  clockOut(@CurrentUser() user: JwtPayload) {
    return this.attendanceService.clockOut(user.userId);
  }

  @Post('break-start')
  breakStart(@CurrentUser() user: JwtPayload) {
    return this.attendanceService.breakStart(user.userId);
  }

  @Post('break-end')
  breakEnd(@CurrentUser() user: JwtPayload) {
    return this.attendanceService.breakEnd(user.userId);
  }

  // ========== メンバー閲覧 (R03) ==========

  @Get('today')
  findToday(@CurrentUser() user: JwtPayload) {
    return this.attendanceService.findToday(user.userId);
  }

  @Get('monthly')
  findMonthly(
    @CurrentUser() user: JwtPayload,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.attendanceService.findMonthly(
      user.userId,
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  @Get('summary')
  findSummary(
    @CurrentUser() user: JwtPayload,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.attendanceService.findMonthlySummary(
      user.userId,
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  // ========== 修正申請 (R03) ==========

  @Post('corrections')
  submitCorrection(
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitCorrectionDto,
  ) {
    return this.attendanceService.submitCorrection(user.userId, dto);
  }

  @Get('corrections/mine')
  findMyCorrections(@CurrentUser() user: JwtPayload) {
    return this.attendanceService.findMyCorrections(user.userId);
  }

  // ========== スタッフ閲覧 (R01/R02) ==========

  @Get('members/today')
  findMembersToday(@CurrentUser() user: JwtPayload) {
    if (!STAFF_ROLES.includes(user.role)) {
      throw new ForbiddenException('スタッフ権限が必要です');
    }
    return this.attendanceService.findMembersTodayAll(user.tenantId);
  }

  @Get('members/:memberId/monthly')
  findMemberMonthly(
    @CurrentUser() user: JwtPayload,
    @Param('memberId') memberId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    if (!STAFF_ROLES.includes(user.role)) {
      throw new ForbiddenException('スタッフ権限が必要です');
    }
    return this.attendanceService.findMemberMonthly(
      memberId,
      parseInt(year, 10),
      parseInt(month, 10),
    );
  }

  // ========== 人事承認 (R04) ==========

  @Get('corrections/pending')
  findPendingCorrections(@CurrentUser() user: JwtPayload) {
    if (user.role !== HR_ROLE && !STAFF_ROLES.includes(user.role)) {
      throw new ForbiddenException('人事担当権限が必要です');
    }
    return this.attendanceService.findPendingCorrections(user.tenantId);
  }

  @Patch('corrections/:id/review')
  reviewCorrection(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: ReviewCorrectionDto,
  ) {
    if (user.role !== HR_ROLE && !STAFF_ROLES.includes(user.role)) {
      throw new ForbiddenException('人事担当権限が必要です');
    }
    return this.attendanceService.reviewCorrection(id, user.userId, dto);
  }

  // ========== 勤務スケジュール ==========

  @Get('schedule/:memberId')
  findSchedule(@Param('memberId') memberId: string) {
    return this.attendanceService.findSchedule(memberId);
  }

  @Patch('schedule/:memberId')
  updateSchedule(
    @CurrentUser() user: JwtPayload,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateWorkScheduleDto,
  ) {
    if (!STAFF_ROLES.includes(user.role)) {
      throw new ForbiddenException('スタッフ権限が必要です');
    }
    return this.attendanceService.updateSchedule(memberId, dto);
  }
}
