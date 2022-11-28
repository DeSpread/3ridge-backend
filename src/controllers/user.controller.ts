import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';

@Controller('user')
export class UserController {
  @Get()
  @HealthCheck()
  readiness() {
    return { status: 'ok' };
  }
}
