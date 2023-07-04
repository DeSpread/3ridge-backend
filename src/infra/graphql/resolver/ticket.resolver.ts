import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Ticket } from '../../schema/ticket.schema';
import { TicketService } from '../../../service/ticket.service';
import {
  TicketCreateInput, TicketFilterInputType,
  TicketStatusInputType,
  TicketUpdateInput,
} from '../dto/ticket.dto';
import { QueryOptions } from '../dto/argument.dto';
import { QuestService } from '../../../service/quest.service';

@Resolver(() => Ticket)
export class TicketResolver {
  constructor(
    private readonly ticketService: TicketService,
    private readonly questService: QuestService,
  ) {}

  @Query(() => [Ticket])
  async tickets(
    @Args() ticketStatus: TicketStatusInputType,
    @Args() queryOptions: QueryOptions,
    @Args() ticketFilter: TicketFilterInputType,
    @Args('isVisibleOnly', { defaultValue: true }) isVisibleOnly: boolean,
  ) {
    return this.ticketService.find(
      ticketStatus,
      ticketFilter.eventTypes ? {eventTypes: {$all: ticketFilter.eventTypes}} : {},
      queryOptions,
      isVisibleOnly,
    );
  }

  @Query(() => Boolean)
  async isCompletedTicket(
    @Args('ticketId') ticketId: string,
    @Args('userId') userId: string,
  ) {
    return this.questService.isCompletedTicket(ticketId, userId);
  }

  @Query(() => Ticket)
  async ticketById(@Args('ticketId') ticketId: string) {
    return this.ticketService.findById(ticketId);
  }

  @Query(() => [Ticket])
  async ticketsByProjectId(
    @Args() ticketStatus: TicketStatusInputType,
    @Args() queryOptions: QueryOptions,
    @Args() ticketFilter: TicketFilterInputType,
    @Args('isVisibleOnly', { defaultValue: true }) isVisibleOnly: boolean,
    @Args('projectId') projectId: string,
  ) {
    return this.ticketService.ticketsByProjectId(projectId, ticketStatus, ticketFilter.eventTypes ? {eventTypes: {$all: ticketFilter.eventTypes}} : {}, queryOptions, isVisibleOnly);
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
    return this.questService.participateTicketOfUser(ticketId, userId);
  }

  @Mutation(() => Ticket)
  async checkAndUpdateWinner(
    @Args('ticketId') ticketId: string,
    @Args('userId') userId: string,
  ) {
    return this.questService.checkAndUpdateCompleteTicket(ticketId, userId);
  }
}
