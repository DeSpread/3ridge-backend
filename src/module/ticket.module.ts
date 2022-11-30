import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketResolver } from '../infra/graphql/resolver/ticket.resolver';
import { TicketService } from '../infra/database/service/ticket.service';
import { Ticket, TicketSchema } from '../infra/schema/ticket.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    ConfigModule,
  ],
  providers: [TicketResolver, TicketService],
})
export class TicketModule {}
