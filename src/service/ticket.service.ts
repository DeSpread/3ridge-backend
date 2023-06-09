import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Ticket } from '../infra/schema/ticket.schema';
import {
  TicketCreateInput,
  TicketStatusInputType,
  TicketUpdateInput,
} from '../infra/graphql/dto/ticket.dto';
import { ErrorCode } from '../constant/error.constant';
import { RewardService } from './reward.service';
import { ObjectUtil } from '../util/object.util';
import { UserService } from './user.service';
import { TicketSortType, TicketStatusType } from '../constant/ticket.type';
import { QueryOptions } from '../infra/graphql/dto/argument.dto';
import { LoggerService } from './logger.service';
import { QuestService } from './quest.service';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name)
    private ticketModel: Model<Ticket>,

    private readonly logger: LoggerService,
    private readonly userService: UserService,
    private readonly questService: QuestService,
    private readonly rewardService: RewardService,
  ) {}

  async find(
    ticketStatus: TicketStatusInputType,
    filter: FilterQuery<any> = {},
    queryOptions: QueryOptions = new QueryOptions(),
    isVisibleOnly = true,
  ): Promise<Ticket[]> {
    let filter0 = {
      ...filter,
    };
    if (isVisibleOnly) {
      filter0 = {
        ...filter0,
        visible: true,
      };
    }

    let sortQuery;
    switch (ticketStatus.sort) {
      case TicketSortType.NEWEST:
        sortQuery = { priority: -1, updatedAt: -1 };
        break;
      case TicketSortType.TRENDING:
      default:
        sortQuery = { priority: -1, participantCount: -1 };
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
    filter: FilterQuery<any> = {},
    queryOptions: QueryOptions = new QueryOptions(),
    isVisibleOnly = true,
  ): Promise<Ticket[]> {
    return this.find(
      ticketStatus,
      {
        project: new mongoose.Types.ObjectId(projectId),
        ...filter,
      },
      queryOptions,
      isVisibleOnly,
    );
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
}
