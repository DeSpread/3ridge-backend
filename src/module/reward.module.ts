import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TicketModule } from './ticket.module';
import { RewardService } from '../infra/database/service/reward.service';
import { AptosModule } from './aptos.module';
import { UserModule } from './user.module';
import { RewardResolver } from '../infra/graphql/resolver/reward.resolver';

@Module({
  imports: [
    ConfigModule,
    AptosModule,
    UserModule,
    forwardRef(() => TicketModule),
  ],
  providers: [RewardResolver, RewardService],
  exports: [RewardService],
})
export class RewardModule {}
