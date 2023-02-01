import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Ticket } from '../../schema/ticket.schema';
import { TicketService } from '../../database/service/ticket.service';
import { TicketCreateInput, TicketUpdateInput } from '../dto/ticket.dto';

@Resolver(() => Ticket)
export class TicketResolver {
  constructor(private readonly ticketService: TicketService) {}

  @Query(() => [Ticket])
  async tickets() {
    return this.ticketService.findAll();
  }

  @Query(() => Ticket)
  async ticketById(@Args('id') id: string) {
    return this.ticketService.findById(id);
  }

  @Query(() => [Ticket])
  async completedTickets() {
    return this.ticketService.findCompletedTickets();
  }

  @Query(() => [Ticket])
  async inCompletedTickets() {
    return this.ticketService.findInCompletedTickets();
  }

  @Mutation(() => Ticket)
  async createTicket(@Args() ticketCreateInput: TicketCreateInput) {
    return this.ticketService.create(ticketCreateInput);
  }

  @Mutation(() => Ticket)
  async updateTicketById(
    id: string,
    @Args() ticketUpdateInput: TicketUpdateInput,
  ) {
    return this.ticketService.update(id, ticketUpdateInput);
  }

  @Mutation(() => Ticket)
  async removeTicketById(@Args('id') id: string) {
    return this.ticketService.removeById(id);
  }

  @Mutation(() => Ticket)
  async participateTicketOfUser(
    @Args('ticketId') ticketId: string,
    @Args('userId') userId: string,
  ) {
    return this.ticketService.participateTicketOfUser(ticketId, userId);
  }
}
