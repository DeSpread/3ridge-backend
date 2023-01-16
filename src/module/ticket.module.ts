import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketResolver } from '../infra/graphql/resolver/ticket.resolver';
import { TicketService } from '../infra/database/service/ticket.service';
import { Ticket, TicketSchema } from '../infra/schema/ticket.schema';
import { Quest, QuestSchema } from '../infra/schema/quest.schema';
import { QuestService } from '../infra/database/service/quest.service';
import { RewardService } from '../infra/database/service/reward.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: Quest.name, schema: QuestSchema },
    ]),
    ConfigModule,
  ],
  providers: [TicketResolver, TicketService, QuestService, RewardService],
})
export class TicketModule {}
