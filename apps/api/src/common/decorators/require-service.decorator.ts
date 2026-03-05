import { SetMetadata } from '@nestjs/common';
import type { TenantServiceKey } from '@qlip/shared';

export const REQUIRE_SERVICE_KEY = 'require_service';

export const RequireService = (service: TenantServiceKey) =>
  SetMetadata(REQUIRE_SERVICE_KEY, service);
