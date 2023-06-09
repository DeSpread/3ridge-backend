import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestResolver } from '../infra/graphql/resolver/test.resolver';
import { TestService } from '../service/test.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../infra/schema/user.schema';
import { Ticket, TicketSchema } from '../infra/schema/ticket.schema';
import { Quest, QuestSchema } from '../infra/schema/quest.schema';
import { LoggerModule } from './loggerModule';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: User.name, schema: UserSchema },
      { name: Quest.name, schema: QuestSchema },
    ]),
    ConfigModule,
    LoggerModule,
  ],
  providers: [TestResolver, TestService],
  exports: [TestService],
})
export class TestModule {}
