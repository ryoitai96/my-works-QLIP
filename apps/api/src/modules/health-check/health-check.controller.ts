import { Controller } from '@nestjs/common';
import { HealthCheckService } from './health-check.service';

@Controller('health-checks')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckService) {}
}
