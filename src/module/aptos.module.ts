import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AptosService } from '../infra/database/service/aptos.service';
import { AptosResolver } from '../infra/graphql/resolver/aptos.resolver';

@Module({
  imports: [ConfigModule],
  providers: [AptosResolver, AptosService],
  exports: [AptosService],
})
export class AptosModule {}
