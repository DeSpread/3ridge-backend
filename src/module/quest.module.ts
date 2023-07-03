import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Quest, QuestSchema } from '../infra/schema/quest.schema';
import { QuestService } from '../service/quest.service';
import { QuestResolver } from '../infra/graphql/resolver/quest.resolver';
import { UserModule } from './user.module';
import { VerifierModule } from './verifier.module';
import { LoggerModule } from './loggerModule';
import { Ticket, TicketSchema } from '../infra/schema/ticket.schema';
import { TicketRepository } from '../repository/ticket.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Quest.name, schema: QuestSchema },
      { name: Ticket.name, schema: TicketSchema },
    ]),
    ConfigModule,
    UserModule,
    VerifierModule,
    LoggerModule,
  ],
  providers: [QuestResolver, TicketRepository, QuestService],
  exports: [QuestService],
})
export class QuestModule {}
