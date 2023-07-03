import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryOptions, QueryWithHelpers, UpdateQuery } from 'mongoose';
import { Ticket } from '../infra/schema/ticket.schema';

@Injectable()
export class TicketRepository {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<Ticket>,
  ) {}

  async withPopulateTicket(query: QueryWithHelpers<any, any>) {
    return query
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

  async findByIdAndUpdate(
    id?: string,
    update?: UpdateQuery<any>,
    options?: QueryOptions,
  ) {
    return this.ticketModel.findByIdAndUpdate(id, update, options);
  }
}
