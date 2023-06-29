import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketResolver } from '../infra/graphql/resolver/ticket.resolver';
import { TicketService } from '../service/ticket.service';
import { Ticket, TicketSchema } from '../infra/schema/ticket.schema';
import { QuestModule } from './quest.module';
import { UserModule } from './user.module';
import { ProjectModule } from './project.module';
import { RewardModule } from './reward.module';
import { LoggerModule } from './loggerModule';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    forwardRef(() => RewardModule),
    QuestModule,
    ConfigModule,
    UserModule,
    LoggerModule,
    ProjectModule,
  ],
  providers: [TicketResolver, TicketService],
  exports: [TicketService],
})
export class TicketModule {}
