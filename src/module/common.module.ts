import { Module } from '@nestjs/common';
import { GraphqlModule } from './graphql.module';
import { HealthModule } from './healthModule';
import { DatabaseModule } from './database.module';
import { CustomConfigModule } from './custom.config.module';
import { AuthModule } from './auth.module';
import { LoggerModule } from './loggerModule';

@Module({
  imports: [
    CustomConfigModule,
    HealthModule,
    DatabaseModule,
    GraphqlModule,
    AuthModule,
    LoggerModule,
  ],
  exports: [
    CustomConfigModule,
    HealthModule,
    DatabaseModule,
    GraphqlModule,
    AuthModule,
    LoggerModule,
  ],
})
export class CommonModule {}
