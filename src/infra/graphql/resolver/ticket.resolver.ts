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

  @Query(() => Boolean)
  async isCompletedTicket(
    @Args('ticketId') ticketId: string,
    @Args('userId') userId: string,
  ) {
    return this.ticketService.isCompletedTicket(ticketId, userId);
  }

  @Query(() => Ticket)
  async ticketById(@Args('ticketId') ticketId: string) {
    return this.ticketService.findById(ticketId);
  }

  @Query(() => [Ticket])
  async ticketsByProjectId(@Args('projectId') projectId: string) {
    return this.ticketService.ticketsByProjectId(projectId);
  }

  @Query(() => [Ticket])
  async completedTickets() {
    return this.ticketService.findCompletedTickets();
  }

  @Query(() => [Ticket])
  async availableTickets() {
    return this.ticketService.findInCompletedTickets();
  }

  @Query(() => [Ticket])
  async findMissedTickets() {
    return this.ticketService.findMissedTickets();
  }

  @Query(() => Boolean)
  async isWinner(
    @Args('ticketId') ticketId: string,
    @Args('userId') userId: string,
  ) {
    return this.ticketService.isWinner(ticketId, userId);
  }

  @Mutation(() => Ticket)
  async createTicket(@Args() ticketCreateInput: TicketCreateInput) {
    return this.ticketService.create(ticketCreateInput);
  }

  @Mutation(() => Ticket)
  async updateTicketById(
    @Args('ticketId') ticketId: string,
    @Args() ticketUpdateInput: TicketUpdateInput,
  ) {
    return this.ticketService.update(ticketId, ticketUpdateInput);
  }

  @Mutation(() => Ticket)
  async removeTicketById(@Args('ticketId') ticketId: string) {
    return this.ticketService.removeById(ticketId);
  }

  @Mutation(() => Ticket)
  async participateTicketOfUser(
    @Args('ticketId') ticketId: string,
    @Args('userId') userId: string,
  ) {
    return this.ticketService.participateTicketOfUser(ticketId, userId);
  }

  @Mutation(() => Ticket)
  async checkAndUpdateWinner(
    @Args('ticketId') ticketId: string,
    @Args('userId') userId: string,
  ) {
    return this.ticketService.checkAndUpdateWinner(ticketId, userId);
  }
}
