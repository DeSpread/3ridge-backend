import { Module } from '@nestjs/common';
import { HealthController } from '../controller/health.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [HealthController],
})
export class HealthModule {}
