import { Module } from '@nestjs/common';
import { GraphqlModule } from './graphql.module';
import { HealthModule } from './healthModule';
import { DatabaseModule } from './database.module';
import { CustomConfigModule } from './custom.config.module';

@Module({
  imports: [CustomConfigModule, HealthModule, DatabaseModule, GraphqlModule],
  exports: [CustomConfigModule, HealthModule, DatabaseModule, GraphqlModule],
})
export class CommonModule {}
