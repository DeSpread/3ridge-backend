import { Module } from '@nestjs/common';
import { GraphqlModule } from './graphql.module';
import { HealthModule } from './healthModule';
import { DatabaseModule } from './database.module';
import { CustomConfigModule } from './custom.config.module';
import { AuthModule } from './auth.module';
import { LoggerModule } from './loggerModule';
import { SearchModule } from './search.module';
import { RequestIdModule } from './request.id.module';

@Module({
  imports: [
    CustomConfigModule,
    HealthModule,
    DatabaseModule,
    GraphqlModule,
    AuthModule,
    LoggerModule,
    SearchModule,
    RequestIdModule,
  ],
  exports: [
    CustomConfigModule,
    HealthModule,
    DatabaseModule,
    GraphqlModule,
    AuthModule,
    LoggerModule,
    SearchModule,
    RequestIdModule,
  ],
})
export class CommonModule {}
