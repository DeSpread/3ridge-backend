import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TicketResolver } from '../infra/graphql/resolver/ticket.resolver';
import { TicketService } from '../service/ticket.service';
import { QuestModule } from './quest.module';
import { UserModule } from './user.module';
import { ProjectModule } from './project.module';
import { RewardModule } from './reward.module';
import { LoggerModule } from './loggerModule';
import { DatabaseModule } from './database.module';

@Module({
  imports: [
    DatabaseModule,
    RewardModule,
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
