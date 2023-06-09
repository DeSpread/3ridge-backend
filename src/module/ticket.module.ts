import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketResolver } from '../infra/graphql/resolver/ticket.resolver';
import { TicketService } from '../service/ticket.service';
import { Ticket, TicketSchema } from '../infra/schema/ticket.schema';
import { Quest, QuestSchema } from '../infra/schema/quest.schema';
import { QuestService } from '../service/quest.service';
import { RewardService } from '../service/reward.service';
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
    forwardRef(() => QuestModule),
  ],
  providers: [TicketResolver, TicketService, RewardService],
  exports: [TicketService],
})
export class TicketModule {}
