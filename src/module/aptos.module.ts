import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AptosService } from '../service/aptos.service';
import { AptosResolver } from '../infra/graphql/resolver/aptos.resolver';
import { TicketModule } from './ticket.module';

@Module({
  imports: [ConfigModule, TicketModule],
  providers: [AptosResolver, AptosService],
  exports: [AptosService],
})
export class AptosModule {}
