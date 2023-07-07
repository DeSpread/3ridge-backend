import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RewardService } from '../service/reward.service';
import { AptosModule } from './aptos.module';
import { UserModule } from './user.module';
import { RewardResolver } from '../infra/graphql/resolver/reward.resolver';
import { LoggerModule } from './loggerModule';
import { DatabaseModule } from './database.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    AptosModule,
    UserModule,
    LoggerModule,
  ],
  providers: [RewardResolver, RewardService],
  exports: [RewardService],
})
export class RewardModule {}
