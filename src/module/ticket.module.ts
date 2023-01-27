import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketResolver } from '../infra/graphql/resolver/ticket.resolver';
import { TicketService } from '../infra/database/service/ticket.service';
import { Ticket, TicketSchema } from '../infra/schema/ticket.schema';
import { Quest, QuestSchema } from '../infra/schema/quest.schema';
import { QuestService } from '../infra/database/service/quest.service';
import { RewardService } from '../infra/database/service/reward.service';
import { QuestModule } from './quest.module';
import { UserModule } from './user.module';
import { ProjectModule } from './project.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: Quest.name, schema: QuestSchema },
    ]),
    ConfigModule,
    UserModule,
    ProjectModule,
    QuestModule,
  ],
  providers: [TicketResolver, TicketService, RewardService],
})
export class TicketModule {}
