import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestResolver } from '../infra/graphql/resolver/test.resolver';
import { TestService } from '../service/test.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../infra/schema/user.schema';
import { Ticket, TicketSchema } from '../infra/schema/ticket.schema';
import { Quest, QuestSchema } from '../infra/schema/quest.schema';
import { TicketModule } from './ticket.module';
import { LoggerModule } from './loggerModule';
import { TicketRepository } from '../repository/ticket.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: User.name, schema: UserSchema },
      { name: Quest.name, schema: QuestSchema },
    ]),
    TicketModule,
    ConfigModule,
    LoggerModule,
  ],
  providers: [TestResolver, TicketRepository, TestService],
  exports: [TestService],
})
export class TestModule {}
