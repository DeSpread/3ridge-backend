import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AptosService } from '../service/aptos.service';
import { AptosResolver } from '../infra/graphql/resolver/aptos.resolver';
import { LoggerModule } from './loggerModule';

@Module({
  imports: [ConfigModule, LoggerModule],
  providers: [AptosResolver, AptosService],
  exports: [AptosService],
})
export class AptosModule {}
