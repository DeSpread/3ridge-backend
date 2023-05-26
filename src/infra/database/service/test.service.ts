import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../schema/user.schema';
import { WINSTON_MODULE_PROVIDER, WinstonLogger } from 'nest-winston';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Ticket } from '../../schema/ticket.schema';
import { Quest } from '../../schema/quest.schema';

@Injectable()
export class TestService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: WinstonLogger,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<Ticket>,
    @InjectModel(Quest.name)
    private readonly questModel: Model<Quest>,
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
}
