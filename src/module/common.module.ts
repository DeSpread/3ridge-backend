import { Module } from '@nestjs/common';
import { GraphqlModule } from './graphql.module';
import { HealthModule } from './healthModule';
import { DatabaseModule } from './database.module';
import { CustomConfigModule } from './custom.config.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    CustomConfigModule,
    HealthModule,
    DatabaseModule,
    GraphqlModule,
    AuthModule,
  ],
  exports: [
    CustomConfigModule,
    HealthModule,
    DatabaseModule,
    GraphqlModule,
    AuthModule,
  ],
})
export class CommonModule {}
