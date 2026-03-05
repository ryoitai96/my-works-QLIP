import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_SERVICE_KEY } from '../decorators/require-service.decorator';
import { PrismaService } from '../../database/prisma.service';
import { STAFF_ROLES, type TenantServiceKey } from '@qlip/shared';

@Injectable()
export class TenantServiceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredService = this.reflector.getAllAndOverride<TenantServiceKey>(
      REQUIRE_SERVICE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredService) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return true;

    // R01/R02 bypass — MW staff always have full access
    if ((STAFF_ROLES as readonly string[]).includes(user.role)) {
      return true;
    }

    // No tenant → deny
    if (!user.tenantId) {
      throw new ForbiddenException('このサービスは現在利用できません');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: {
        svcAttendance: true,
        svcHealthCheck: true,
        svcAssessment: true,
        svcMicroTask: true,
        svcMessage: true,
        svcThanks: true,
        svcFlowerOrder: true,
      },
    });

    if (!tenant) {
      throw new ForbiddenException('このサービスは現在利用できません');
    }

    const serviceMap: Record<TenantServiceKey, boolean> = {
      attendance: tenant.svcAttendance,
      health_check: tenant.svcHealthCheck,
      assessment: tenant.svcAssessment,
      micro_task: tenant.svcMicroTask,
      message: tenant.svcMessage,
      thanks: tenant.svcThanks,
      flower_order: tenant.svcFlowerOrder,
    };

    if (!serviceMap[requiredService]) {
      throw new ForbiddenException('このサービスは現在利用できません');
    }

    return true;
  }
}
