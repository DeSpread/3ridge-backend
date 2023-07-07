import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserResolver } from '../infra/graphql/resolver/user.resolver';
import { UserService } from '../service/user.service';
import { LoggerModule } from './loggerModule';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule, ConfigModule, LoggerModule],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
