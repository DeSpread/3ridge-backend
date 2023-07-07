import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TestResolver } from '../infra/graphql/resolver/test.resolver';
import { TestService } from '../service/test.service';
import { TicketModule } from './ticket.module';
import { LoggerModule } from './loggerModule';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule, TicketModule, ConfigModule, LoggerModule],
  providers: [TestResolver, TestService],
  exports: [TestService],
})
export class TestModule {}
