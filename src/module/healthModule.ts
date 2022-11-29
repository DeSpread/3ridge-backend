import { Module } from '@nestjs/common';
import { HealthController } from '../controllers/health.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [HealthController],
})
export class HealthModule {}
