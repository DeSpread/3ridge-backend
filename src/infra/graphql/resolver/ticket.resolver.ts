import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Ticket } from '../../schema/ticket.schema';
import { TicketService } from '../../database/service/ticket.service';
import { TicketInput } from '../dto/ticket.dto';

@Resolver(() => Ticket)
export class TicketResolver {
  constructor(private readonly ticketService: TicketService) {}

  @Query(() => [Ticket])
  async tickets() {
    return this.ticketService.findAll();
  }

  @Query(() => Ticket)
  async ticketByParticipant(@Args('username') username: string) {
    return this.ticketService.findByParticipant(username);
  }

  @Query(() => Ticket)
  async ticketById(@Args('id') id: string) {
    return this.ticketService.findById(id);
  }

  @Mutation(() => Ticket)
  async createTicket(@Args() ticketInput: TicketInput) {
    return this.ticketService.create(ticketInput);
  }

  @Mutation(() => Ticket)
  async updateTicket(id: string, @Args() ticketInput: TicketInput) {
    return this.ticketService.update(id, ticketInput);
  }

  @Mutation(() => Ticket)
  async removeById(@Args('id') id: string) {
    return this.ticketService.removeById(id);
  }
}
