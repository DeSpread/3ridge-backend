import { Injectable } from '@nestjs/common';
import { User } from '../infra/schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from '../infra/schema/ticket.schema';
import { Quest } from '../infra/schema/quest.schema';
import { ChainType } from '../constant/chain.type';
import { LoggerService } from './logger.service';
import { TicketRepository } from '../repository/ticket.repository';

@Injectable()
export class TestService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<Ticket>,
    @InjectModel(Quest.name)
    private readonly questModel: Model<Quest>,

    private readonly logger: LoggerService,
    private readonly ticketRepository: TicketRepository,
  ) {}

  async clearParticipatedAllEvents(): Promise<boolean> {
    try {
      await this.userModel.updateMany(
        {},
        { $set: { participatingTickets: [] } },
      );
      // Reward 포인트 초기화는 skip
      // await this.userModel.updateMany({}, { $set: { participatingTickets: [] } });
      await this.ticketModel.updateMany(
        {},
        {
          $set: {
            participants: [],
            winners: [],
            completedUsers: [],
            rewardClaimedUsers: [],
            participantCount: 0,
            completed: false,
          },
        },
      );
      await this.questModel.updateMany({}, { $set: { completedUsers: [] } });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async clearParticipatedAllEventsByUserId(userId: string): Promise<boolean> {
    // Reward 포인트 초기화는 skip
    // await this.userModel.updateMany({}, { $set: { participatingTickets: [] } });
    try {
      const results = await Promise.all([
        this.userModel.updateOne(
          { _id: userId },
          { $set: { participatingTickets: [] } },
        ),
        await this.ticketModel.updateMany(
          { participants: { $in: [userId] } },
          {
            $pull: {
              participants: userId,
              winners: userId,
              completedUsers: userId,
              rewardClaimedUsers: userId,
            },
            $inc: { participantCount: -1 },
          },
        ),
        await this.questModel.updateMany(
          { completedUsers: { $in: [userId] } },
          {
            $pull: {
              completedUsers: userId,
            },
          },
        ),
      ]);

      console.log(results);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async testLogMessage(message: string) {
    this.logger.debug(message);
    return true;
  }

  async getWalletAddressOfWinner(ticketId: string, chainType: ChainType) {
    const ticket = await this.ticketRepository.findById(ticketId);
    const winners: User[] = ticket.winners;

    const walletAddress = [];
    for (const user of winners) {
      console.log(user._id);
      if (user && user.wallets) {
        user.wallets.map((value) => {
          if (value.chain === chainType) {
            walletAddress.push(value.address);
          }
        });
      }
    }

    return walletAddress;
  }
}
