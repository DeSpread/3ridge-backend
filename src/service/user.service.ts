import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserWallet } from '../infra/schema/user.schema';
import {
  UserCreateByGmailInput,
  UserUpdateInput,
} from '../infra/graphql/dto/user.dto';
import { Project } from '../infra/schema/project.schema';
import { ErrorCode } from '../constant/error.constant';
import { StringUtil } from '../util/string.util';
import { Ticket } from '../infra/schema/ticket.schema';
import { ObjectUtil } from '../util/object.util';
import { QueryOptions } from '../infra/graphql/dto/argument.dto';
import { LoggerService } from './logger.service';

const { ObjectId } = mongoose.Types;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,

    private readonly logger: LoggerService,
  ) {}

  async createByWallet(walletInput: UserWallet): Promise<User> {
    const user = await this.userModel.find({
      wallets: { $in: [walletInput] },
    });

    if (user.length > 0) {
      return Promise.reject(new Error('Already registered by wallet address'));
    }

    const userModel = new this.userModel({
      wallets: walletInput,
      name: walletInput.address,
    });
    return userModel.save();
  }

  async createByGmail(
    userCreateByGmailInput: UserCreateByGmailInput,
  ): Promise<User> {
    const isExist = await this.userModel.exists({
      gmail: userCreateByGmailInput.gmail,
    });

    if (isExist) {
      return Promise.reject(new Error('Already registered by gmail'));
    }

    const userModel = new this.userModel({
      gmail: userCreateByGmailInput.gmail,
    });
    userModel.name = userModel._id;
    return userModel.save();
  }

  async createByEmail(email: string): Promise<User> {
    const isExist = await this.userModel.exists({
      email: email,
    });

    if (isExist) {
      return Promise.reject(new Error('Already registered by email'));
    }

    const userModel = new this.userModel({
      email: email,
    });
    userModel.name = userModel._id;
    return userModel.save();
  }

  async findAll(): Promise<User[]> {
    return await this.userModel
      .find()
      .populate('userSocial')
      .populate('managedProjects')
      .populate('participatingTickets')
      .exec();
  }

  async findById(id: string): Promise<User> {
    return await this.userModel
      .findById(id)
      .populate('userSocial')
      .populate('managedProjects')
      .populate('participatingTickets')
      .exec();
  }

  async findAllOrderByRewardPointDesc(
    queryOptions: QueryOptions = { skip: 0, limit: 25 },
  ): Promise<User[]> {
    return await this.userModel
      .find(null, null, queryOptions)
      .sort({ rewardPoint: -1 })
      .populate('userSocial')
      .populate('managedProjects')
      .populate('participatingTickets')
      .exec();
  }

  async findRankByUserId(
    userId: string,
    queryOptions: QueryOptions,
  ): Promise<number> {
    const users = await this.findAllOrderByRewardPointDesc(queryOptions);
    let rank = 0;
    for (const user of users) {
      rank++;
      if (StringUtil.isEqualsIgnoreCase(user._id, userId)) {
        return rank;
      }
    }
    return rank;
  }

  async findByWalletAddress(walletAddress: string): Promise<User> {
    return await this.userModel
      .findOne({
        wallets: {
          $elemMatch: {
            address: walletAddress,
          },
        },
      })
      .populate('userSocial')
      .populate('managedProjects')
      .populate('participatingTickets')
      .exec();
  }

  async findByGmail(gmail: string): Promise<User> {
    return await this.userModel
      .findOne({ gmail: gmail })
      .populate('userSocial')
      .populate('managedProjects')
      .populate('participatingTickets')
      .exec();
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel
      .findOne({ email: email })
      .populate('userSocial')
      .populate('managedProjects')
      .populate('participatingTickets')
      .exec();

    if (!user) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    return user;
  }

  async findByName(name: string): Promise<User> {
    return await this.userModel
      .findOne({ name: name })
      .populate('userSocial')
      .populate('managedProjects')
      .populate('participatingTickets')
      .populate({ path: 'participatingTickets', populate: { path: 'project' } })
      .populate({
        path: 'participatingTickets',
        populate: { path: 'winners' },
      })
      .exec();
  }

  async isExistById(userId: string): Promise<any> {
    if (!ObjectId.isValid(userId)) {
      throw ErrorCode.NOT_FOUND_USER;
    }
    return await this.userModel.findById(userId).exec();
  }

  async update(name: string, userUpdateInput: UserUpdateInput) {
    const existingUser = await this.userModel
      .findOneAndUpdate(
        { name: name },
        {
          $set: userUpdateInput,
        },
        { new: true },
      )
      .exec();

    if (!existingUser) {
      throw ErrorCode.NOT_FOUND_USER;
    }
    return existingUser;
  }

  async remove(name: string) {
    return this.userModel.findOneAndRemove({ name: name });
  }

  async findUserById(userId: string): Promise<User> {
    return await this.userModel
      .findById(userId)
      .populate('userSocial')
      .populate('managedProjects')
      .populate('participatingTickets')
      .exec();
  }

  async rewardPointToUser(userId: string, rewardPoint: number) {
    return await this.userModel
      .updateOne(
        { _id: userId },
        { $inc: { rewardPoint: rewardPoint } },
        { new: true },
      )
      .exec();
  }

  async checkParticipatedTicketAndUpdate(user: User, ticket: Ticket) {
    const ticket0: Ticket = await user.participatingTickets.find((x) =>
      StringUtil.isEqualsIgnoreCase(x._id, ticket._id),
    );

    if (!ObjectUtil.isNull(ticket0)) {
      // Check if this user completed all quests & if then, update winner list
      this.logger.debug(
        `Already user's participating ticket list has the ticket. ticketId: ${ticket0._id}, userId: ${user._id}`,
      );
      return;
    }

    await this.userModel.findOneAndUpdate(
      { _id: user._id },
      {
        $addToSet: {
          participatingTickets: ticket,
        },
      },
    );
  }

  async isRegisteredWallet(userWallet: UserWallet): Promise<boolean> {
    const users: User[] = await this.findAll();
    const searchedUserCount: number = users.filter((user: User) => {
      const registeredUsers: UserWallet[] = user.wallets.filter(
        (wallet: UserWallet) => {
          if (
            StringUtil.isEqualsIgnoreCase(wallet.address, userWallet.address)
          ) {
            return true;
          }
          return false;
        },
      );
      if (registeredUsers.length > 0) {
        this.logger.debug(
          `Already registered wallet address. userId: ${user._id}, userName: ${user.name}`,
        );
        return true;
      }
      return false;
    }).length;

    const isAlreadyRegisteredUser: boolean = searchedUserCount > 0;
    return isAlreadyRegisteredUser;
  }
}
