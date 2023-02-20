import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
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
      .populate('project')
      .exec();
  }

  async findCompletedTickets(): Promise<Ticket[]> {
    return await this.ticketModel
      .find({ completed: true })
      .populate('quests')
      .populate('participants')
      .populate('winners')
      .populate('project')
      .exec();
  }

  async findInCompletedTickets(): Promise<Ticket[]> {
    return await this.ticketModel
      .find({ completed: false })
      .populate('quests')
      .populate('participants')
      .populate('winners')
      .populate('project')
      .exec();
  }

  async findMissedTickets(): Promise<Ticket[]> {
    const current = new Date();
    return this.ticketModel.find({
      untilTime: {
        $gte: current,
      },
    });
  }

  async findById(id: string): Promise<Ticket> {
    return await this.ticketModel
      .findById(id)
      .populate('quests')
      .populate('participants')
      .populate('winners')
      .populate('project')
      .exec();
  }

  async ticketsByProjectId(projectId: string): Promise<Ticket[]> {
    return await this.ticketModel
      .find({ project: new mongoose.Types.ObjectId(projectId) })
      .populate('quests')
      .populate('participants')
      .populate('winners')
      .populate('project')
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

  async update(ticketId: string, ticketInput: TicketUpdateInput) {
    const existingTicket = await this.ticketModel
      .findOneAndUpdate({ _id: ticketId }, { $set: ticketInput }, { new: true })
      .exec();

    if (!existingTicket) {
      throw ErrorCode.NOT_FOUND_PROJECT;
    }
    return existingTicket;
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

    const isAlreadyWinnerUser: User = await ticket.winners.find((x) =>
      StringUtil.trimAndEqual(String(x._id), userId),
    );

    if (!ObjectUtil.isNull(isAlreadyWinnerUser)) {
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

    // check if this user completed all quests & if then, update winner list
    await this.checkAndUpdateWinner(ticketId, userId);

    return ticket0;
  }

  async isCompletedTicket(ticketId: string, userId: string): Promise<boolean> {
    const ticket = await this.findById(ticketId);
    for (const quest of ticket.quests) {
      const completedUsers: User[] = quest.completedUsers.filter((x) => {
        if (StringUtil.trimAndEqual(String(x._id), userId)) {
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

  async checkAndUpdateWinner(
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

    return this.addWinnerToTicket(ticketId, userId);
  }

  async isWinner(ticketId: string, userId: string): Promise<boolean> {
    const ticket: Ticket = await this.findById(ticketId);

    const winnerUsers: boolean = ticket.winners.some((x) =>
      StringUtil.trimAndEqual(String(x._id), userId),
    );

    if (!winnerUsers) {
      this.logger.error(
        `user is not winner. ticketId: [${ticketId}], userId: [${userId}]`,
      );
      return false;
    }

    this.logger.debug(
      `user is winner. ticketId: [${ticketId}], userId: [${userId}]`,
    );
    return true;
  }
}
