import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TicketModule } from './ticket.module';
import { RewardService } from '../service/reward.service';
import { AptosModule } from './aptos.module';
import { UserModule } from './user.module';
import { RewardResolver } from '../infra/graphql/resolver/reward.resolver';
import { LoggerModule } from './loggerModule';

@Module({
  imports: [
    ConfigModule,
    AptosModule,
    UserModule,
    LoggerModule,
    forwardRef(() => TicketModule),
  ],
  providers: [RewardResolver, RewardService],
  exports: [RewardService],
})
export class RewardModule {}
