import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from '../../schema/ticket.schema';
import {
  TicketCreateInput,
  TicketUpdateInput,
} from '../../graphql/dto/ticket.dto';
import { ErrorCode } from '../../../constant/error.constant';
import { Quest } from '../../schema/quest.schema';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { QuestService } from './quest.service';
import { RewardService } from './reward.service';
import { ObjectUtil } from '../../../util/object.util';
import { Args } from '@nestjs/graphql';
import { ParticipateTicketOfUserResponse } from '../../graphql/dto/response.dto';
import { User } from '../../schema/user.schema';
import { UserService } from './user.service';
import { StringUtil } from '../../../util/string.util';

@Injectable()
export class TicketService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: WinstonLogger,
    @InjectModel(Ticket.name)
    private ticketModel: Model<Ticket>,
    @InjectModel(Quest.name)
    private questModel: Model<Quest>,
    @Inject(forwardRef(() => QuestService))
    private questService: QuestService,
    private rewardService: RewardService,
    private userService: UserService,
  ) {}

  async findAll(): Promise<Ticket[]> {
    return await this.ticketModel
      .find()
      .populate('quests')
      .populate('participants')
      .populate('winners')
      .exec();
  }

  async findCompletedTickets(): Promise<Ticket[]> {
    return await this.ticketModel
      .find({ completed: true })
      .populate('quests')
      .populate('participants')
      .populate('winners')
      .exec();
  }

  async findInCompletedTickets(): Promise<Ticket[]> {
    return await this.ticketModel
      .find({ completed: false })
      .populate('quests')
      .populate('participants')
      .populate('winners')
      .exec();
  }

  async findById(id: string): Promise<Ticket> {
    return await this.ticketModel
      .findById(id)
      .populate('quests')
      .populate('participants')
      .populate('winners')
      .exec();
  }

  async create(ticketCreateInput: TicketCreateInput): Promise<Ticket> {
    await this.validateMandatory(ticketCreateInput);

    await this.rewardService.isInvalidReward(ticketCreateInput.rewardPolicy);

    const ticketModel = new this.ticketModel(ticketCreateInput);
    ticketModel.quests = await this.questService.getQuestList(
      ticketCreateInput.quests,
    );

    this.logger.log(ticketCreateInput);
    return ticketModel.save();
  }

  async update(id: string, ticketInput: TicketUpdateInput) {
    const existingTicket = await this.ticketModel
      .findOneAndUpdate({ _id: id }, { $set: ticketInput }, { new: true })
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

    const isAlreadyParticiaptedUser: User = await ticket.participants.find(
      (x) => StringUtil.trimAndEqual(String(x._id), userId),
    );

    console.log(isAlreadyParticiaptedUser);
    if (!ObjectUtil.isNull(isAlreadyParticiaptedUser)) {
      throw ErrorCode.ALREADY_PARTICIPATED_USER;
    }

    const ticket0 = await this.ticketModel.findByIdAndUpdate(
      { _id: ticketId },
      {
        $push: {
          participants: user,
        },
      },
      { new: true },
    );

    this.logger.debug(
      `Successful to participate ticket. ticketId: ${ticketId}, userId: ${userId}`,
    );

    return ticket0;
  }
}
