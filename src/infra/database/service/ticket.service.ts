import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from '../../schema/ticket.schema';
import {
  TicketCreateInput,
  TicketUpdateInput,
} from '../../graphql/dto/ticket.dto';
import { ErrorCode } from '../../../constant/error.constant';
import { Quest } from '../../schema/quest.schema';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<Ticket>,
    @InjectModel(Quest.name)
    private readonly questModel: Model<Quest>,
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
    return await this.ticketModel.findById(id).exec();
  }

  async create(ticketCreateInput: TicketCreateInput): Promise<Ticket> {
    if (!ticketCreateInput.quests) {
      throw ErrorCode.BAD_REQUEST_QUEST;
    }

    const questList: Quest[] = [];
    for (const quest of ticketCreateInput.quests) {
      const questModel = new this.questModel(quest);
      questList.push(await questModel.save());
    }

    const ticketModel = new this.ticketModel(ticketCreateInput);
    ticketModel.quests = questList;

    console.log(ticketModel);

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
}
