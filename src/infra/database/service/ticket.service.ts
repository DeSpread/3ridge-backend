import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from '../../schema/ticket.schema';
import { TicketInput } from '../../graphql/dto/ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<Ticket>,
  ) {}

  async findAll(): Promise<Ticket[]> {
    return await this.ticketModel.find().populate('participatedUser').exec();
  }

  async findById(id): Promise<Ticket> {
    return await this.ticketModel
      .findOne({ _id: id })
      .populate('participatedUser')
      .exec();
  }

  async findByParticipant(participant): Promise<Ticket[]> {
    return await this.ticketModel.find({ participant: participant }).exec();
  }

  async create(ticketInput: TicketInput): Promise<Ticket> {
    const ticketModel = new this.ticketModel(ticketInput);
    return ticketModel.save();
  }

  async update(id: string, ticketInput: TicketInput) {
    const existingTicket = await this.ticketModel
      .findOneAndUpdate({ _id: id }, { $set: ticketInput }, { new: true })
      .exec();

    if (!existingTicket) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    return existingTicket;
  }

  async removeById(id: string) {
    return this.ticketModel.findByIdAndRemove(id);
  }
}
