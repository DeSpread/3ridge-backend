import { Module } from '@nestjs/common';
import { HealthController } from '../controllers/healthController';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [HealthController],
})
export class HealthModule {}
