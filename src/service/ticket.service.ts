import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Ticket } from '../infra/schema/ticket.schema';
import {
  TicketCreateInput,
  TicketStatusInputType,
  TicketUpdateInput,
} from '../infra/graphql/dto/ticket.dto';
import { ErrorCode } from '../constant/error.constant';
import { Quest } from '../infra/schema/quest.schema';
import { QuestService } from './quest.service';
import { RewardService } from './reward.service';
import { ObjectUtil } from '../util/object.util';
import { User } from '../infra/schema/user.schema';
import { UserService } from './user.service';
import { StringUtil } from '../util/string.util';
import { TicketSortType, TicketStatusType } from '../constant/ticket.type';
import { QueryOptions } from '../infra/graphql/dto/argument.dto';
import { RewardPolicyType } from '../constant/reward.type';
import { FcfsReward } from '../model/reward.model';
import { LoggerService } from './loggerService';

@Injectable()
export class TicketService {
  constructor(
    private readonly logger: LoggerService,
    @InjectModel(Ticket.name)
    private ticketModel: Model<Ticket>,
    @InjectModel(Quest.name)
    private questModel: Model<Quest>,
    @Inject(forwardRef(() => QuestService))
    private questService: QuestService,
    private rewardService: RewardService,
    private userService: UserService,
  ) {}

  async find(
    ticketStatus: TicketStatusInputType,
    filter: FilterQuery<any> = {},
    queryOptions: QueryOptions = new QueryOptions(),
    isVisibleOnly = true,
  ): Promise<Ticket[]> {
    let filter0;
    if (isVisibleOnly) {
      filter0 = {
        ...filter,
        visible: true,
      };
    }

    let sortQuery;
    switch (ticketStatus.sort) {
      case TicketSortType.NEWEST:
        sortQuery = { updatedAt: -1 };
        break;
      case TicketSortType.TRENDING:
      default:
        sortQuery = { participantCount: -1 };
        break;
    }

    switch (ticketStatus.status) {
      case TicketStatusType.ALL:
        return this.findAll(filter0, sortQuery, queryOptions);
      case TicketStatusType.AVAILABLE:
        return this.findInCompletedTickets(filter0, sortQuery, queryOptions);
      case TicketStatusType.COMPLETED:
        return this.findCompletedTickets(filter0, sortQuery, queryOptions);
      case TicketStatusType.MISSED:
        return this.findMissedTickets(filter0, sortQuery, queryOptions);
    }
  }

  async findAll(
    filter: FilterQuery<any> = {},
    sortQuery = {},
    options,
  ): Promise<Ticket[]> {
    return await this.ticketModel
      .find(filter, null, options)
      .sort(sortQuery)
      .populate('quests')
      .populate('participants')
      .populate('completedUsers')
      .populate('winners')
      .populate('project')
      .exec();
  }

  async findCompletedTickets(
    filter: FilterQuery<any> = {},
    sortQuery = {},
    options = {},
  ): Promise<Ticket[]> {
    return await this.ticketModel
      .find(filter, null, options)
      .find({
        completed: true,
      })
      .sort(sortQuery)
      .populate('quests')
      .populate('participants')
      .populate('completedUsers')
      .populate('winners')
      .populate('project')
      .exec();
  }

  async findInCompletedTickets(
    filter: FilterQuery<any> = {},
    sortQuery = {},
    options = {},
  ): Promise<Ticket[]> {
    const current = new Date();
    return await this.ticketModel
      .find(filter, null, options)
      .find({
        completed: false,
        untilTime: {
          $gte: current,
        },
      })
      .sort(sortQuery)
      .populate('quests')
      .populate('participants')
      .populate('completedUsers')
      .populate('winners')
      .populate('project')
      .exec();
  }

  async findMissedTickets(
    filter: FilterQuery<any> = {},
    sortQuery = {},
    options = {},
  ): Promise<Ticket[]> {
    const current = new Date();
    return await this.ticketModel
      .find(filter, null, options)
      .find({
        untilTime: {
          $lte: current,
        },
      })
      .sort(sortQuery)
      .populate('quests')
      .populate('participants')
      .populate('completedUsers')
      .populate('winners')
      .populate('project')
      .exec();
  }

  async findById(id: string): Promise<Ticket> {
    return await this.ticketModel
      .findById(id)
      .populate('quests')
      .populate('participants')
      .populate('completedUsers')
      .populate('winners')
      .populate('project')
      .exec();
  }

  async ticketsByProjectId(
    projectId: string,
    ticketStatus: TicketStatusInputType,
  ): Promise<Ticket[]> {
    return this.find(ticketStatus, {
      project: new mongoose.Types.ObjectId(projectId),
    });
  }

  async create(ticketCreateInput: TicketCreateInput): Promise<Ticket> {
    await this.validateMandatory(ticketCreateInput);

    await this.rewardService.isInvalidReward(ticketCreateInput.rewardPolicy);

    const ticketModel = new this.ticketModel(ticketCreateInput);
    ticketModel.quests = await this.questService.getQuestList(
      ticketCreateInput.quests,
    );

    this.logger.debug(ticketCreateInput);
    return ticketModel.save();
  }

  async update(ticketId: string, ticketInput: TicketUpdateInput) {
    const existingTicket = await this.ticketModel
      .findOneAndUpdate({ _id: ticketId }, { $set: ticketInput }, { new: true })
      .exec();

    if (!existingTicket) {
      throw ErrorCode.NOT_FOUND_PROJECT;
    }
    return existingTicket;
  }

  private async addCompletedUserToTicket(
    ticketId: string,
    userId: string,
  ): Promise<Ticket> {
    let user: User;
    try {
      user = await this.userService.findUserById(userId);
    } catch (e) {
      this.logger.error(e.message);
      throw ErrorCode.NOT_FOUND_USER;
    }

    if (ObjectUtil.isNull(user)) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    const ticket: Ticket = await this.ticketModel.findById(ticketId);

    if (ObjectUtil.isNull(ticket)) {
      throw ErrorCode.NOT_FOUND_TICKET;
    }

    const isAlreadyCompletedUser: User = await ticket.completedUsers.find((x) =>
      StringUtil.isEqualsIgnoreCase(x._id, userId),
    );

    this.logger.debug(`isAlreadyCompletedUser: ${isAlreadyCompletedUser}`);

    if (!ObjectUtil.isNull(isAlreadyCompletedUser)) {
      throw ErrorCode.ALREADY_INCLUDED_COMPLETED_USER;
    }

    const ticket0 = await this.ticketModel.findByIdAndUpdate(
      { _id: ticketId },
      {
        $push: {
          completedUsers: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to add completed user to ticket. ticketId: ${ticketId}, userId: ${userId}`,
    );

    return ticket0;
  }

  private async addWinnerToTicket(
    ticketId: string,
    userId: string,
  ): Promise<Ticket> {
    let user: User;
    try {
      user = await this.userService.findUserById(userId);
    } catch (e) {
      this.logger.error(e.message);
      throw ErrorCode.NOT_FOUND_USER;
    }

    if (ObjectUtil.isNull(user)) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    const ticket: Ticket = await this.ticketModel.findById(ticketId);

    if (ObjectUtil.isNull(ticket)) {
      throw ErrorCode.NOT_FOUND_TICKET;
    }

    const isAlreadyWinnersUser: User = await ticket.winners.find((x) =>
      StringUtil.isEqualsIgnoreCase(x._id, userId),
    );

    if (!ObjectUtil.isNull(isAlreadyWinnersUser)) {
      throw ErrorCode.ALREADY_INCLUDED_WINNER_USER;
    }

    const ticket0 = await this.ticketModel.findByIdAndUpdate(
      { _id: ticketId },
      {
        $push: {
          winners: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to add winner to ticket. ticketId: ${ticketId}, userId: ${userId}`,
    );

    return ticket0;
  }

  async removeById(id: string) {
    return this.ticketModel.findByIdAndRemove(id);
  }

  async validateMandatory(ticketCreateInput: TicketCreateInput) {
    if (
      ObjectUtil.isAnyNull(
        ticketCreateInput.quests,
        ticketCreateInput.rewardPolicy,
      )
    ) {
      throw ErrorCode.BAD_REQUEST_TICKET_MANDATORY;
    }
  }

  async participateTicketOfUser(
    ticketId: string,
    userId: string,
  ): Promise<Ticket> {
    let user: User;
    try {
      user = await this.userService.findUserById(userId);
    } catch (e) {
      this.logger.error(e.message);
      throw ErrorCode.NOT_FOUND_USER;
    }

    if (ObjectUtil.isNull(user)) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    const ticket: Ticket = await this.ticketModel.findById(ticketId);

    if (ObjectUtil.isNull(ticket)) {
      throw ErrorCode.NOT_FOUND_TICKET;
    }

    // 1. Check if the ticket exceed limit of participants
    const fcfsRewardInput: FcfsReward = JSON.parse(ticket.rewardPolicy.context);
    const isExceedLimitOfParticipants =
      ticket.participantCount >= fcfsRewardInput.limitNumber;

    if (isExceedLimitOfParticipants) {
      throw ErrorCode.EXCEED_LIMIT_PARTICIPANTS_TICKET;
    }

    // 2. Check if user participate ticket and update
    const isAlreadyParticiaptedUser: User = await ticket.participants.find(
      (x) => StringUtil.isEqualsIgnoreCase(x._id, userId),
    );

    if (ObjectUtil.isNull(isAlreadyParticiaptedUser)) {
      // Check if this user completed all quests & if then, update winner list
      await this.ticketModel.findByIdAndUpdate(
        { _id: ticketId },
        {
          $push: {
            participants: user,
          },
          $inc: {
            participantCount: 1,
          },
        },
        { new: true },
      );

      this.logger.debug(
        `This quest is first in user's participating ticket. Successful to participate ticket. ticketId: ${ticketId}, userId: ${userId}`,
      );
    } else {
      this.logger.debug(
        `Already user's participating ticket include this ticket. ticketId: ${ticketId}, userId: ${userId}`,
      );
    }
    // 3. Check if user's participatingTicket list has this ticket and update list
    await this.userService.checkParticipatedTicketAndUpdate(user, ticket);

    // 4. Check if user complete all quest in the ticket and update to complete ticket
    await this.checkAndUpdateCompleteTicket(ticketId, userId);

    this.logger.debug(
      `Successful update to check and participate ticket. ticketId: ${ticketId}, userId: ${userId}`,
    );
    return ticket;
  }

  async isCompletedTicket(ticketId: string, userId: string): Promise<boolean> {
    const ticket = await this.findById(ticketId);
    for (const quest of ticket.quests) {
      const completedUsers: User[] = quest.completedUsers.filter((x) => {
        if (StringUtil.isEqualsIgnoreCase(x._id, userId)) {
          return true;
        }
      });
      if (completedUsers.length <= 0) {
        this.logger.error(
          `user doest not complete qeust. questId: [${quest._id}], userId: [${userId}]`,
        );
        return false;
      }

      this.logger.debug(
        `user completed qeust. questId: [${quest._id}], userId: [${userId}]`,
      );
    }
    return true;
  }

  async checkAndUpdateCompleteTicket(
    ticketId: string,
    userId: string,
  ): Promise<Ticket> {
    const isCompletedTicket = await this.isCompletedTicket(ticketId, userId);

    if (!isCompletedTicket) {
      this.logger.error(
        `user does not complete all quests in ticket. ticketId: [${ticketId}], userId: [${userId}]`,
      );
      return null;
    }

    const ticket = await this.addCompletedUserToTicket(ticketId, userId);
    await this.userService.rewardPointToUser(
      userId,
      ticket.rewardPolicy.rewardPoint,
    );

    if (ticket.rewardPolicy.rewardPolicyType === RewardPolicyType.FCFS) {
      this.logger.debug(
        'since the ticket reward selection method is FCFS, so should consider adding a winner list',
      );
      await this.addWinnerToTicket(ticketId, userId);
    } else {
      this.logger.debug(
        'Since the reward selection method is FCFS, does not consider adding a winner list',
      );
    }

    return ticket;
  }

  async isRewardClaimed(ticketId: string, userId: string): Promise<boolean> {
    const ticket: Ticket = await this.findById(ticketId);

    const isRewardClaimed: boolean = ticket.rewardClaimedUsers.some((x) =>
      StringUtil.isEqualsIgnoreCase(x._id, userId),
    );

    if (isRewardClaimed) {
      this.logger.error(
        `user already claimed reward. ticketId: [${ticketId}], userId: [${userId}]`,
      );
      return true;
    }

    return false;
  }

  async checkAndUpdateRewardClaimedUser(
    ticketId: string,
    userId: string,
  ): Promise<Ticket> {
    let user: User;
    try {
      user = await this.userService.findUserById(userId);
    } catch (e) {
      this.logger.error(e.message);
      throw ErrorCode.NOT_FOUND_USER;
    }

    if (ObjectUtil.isNull(user)) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    const ticket: Ticket = await this.ticketModel.findById(ticketId);

    if (ObjectUtil.isNull(ticket)) {
      throw ErrorCode.NOT_FOUND_TICKET;
    }

    const isAlreadyClaimed: User = await ticket.rewardClaimedUsers.find((x) =>
      StringUtil.isEqualsIgnoreCase(x._id, userId),
    );

    if (!ObjectUtil.isNull(isAlreadyClaimed)) {
      throw ErrorCode.ALREADY_INCLUDED_WINNER_USER;
    }

    const ticket0 = await this.ticketModel.findByIdAndUpdate(
      { _id: ticketId },
      {
        $push: {
          rewardClaimedUsers: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to add winner to ticket. ticketId: ${ticketId}, userId: ${userId}`,
    );

    return ticket0;
  }
}
