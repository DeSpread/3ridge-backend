import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuestService } from '../service/quest.service';
import { QuestResolver } from '../infra/graphql/resolver/quest.resolver';
import { UserModule } from './user.module';
import { VerifierModule } from './verifier.module';
import { LoggerModule } from './loggerModule';
import { DatabaseModule } from './database.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    UserModule,
    VerifierModule,
    LoggerModule,
  ],
  providers: [QuestResolver, QuestService],
  exports: [QuestService],
})
export class QuestModule {}
