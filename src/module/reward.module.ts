import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RewardService } from '../service/reward.service';
import { AptosModule } from './aptos.module';
import { UserModule } from './user.module';
import { RewardResolver } from '../infra/graphql/resolver/reward.resolver';
import { LoggerModule } from './loggerModule';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from '../infra/schema/ticket.schema';
import { TicketRepository } from '../repository/ticket.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    ConfigModule,
    AptosModule,
    UserModule,
    LoggerModule,
  ],
  providers: [RewardResolver, TicketRepository, RewardService],
  exports: [RewardService],
})
export class RewardModule {}
