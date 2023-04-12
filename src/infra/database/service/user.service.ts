import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserWallet } from '../../schema/user.schema';
import {
  FetchUsersArgs,
  UserCreateByGmailInput,
  UserUpdateInput,
} from '../../graphql/dto/user.dto';
import { Project } from '../../schema/project.schema';
import { ErrorCode } from '../../../constant/error.constant';
import { StringUtil } from '../../../util/string.util';
import { Ticket } from '../../schema/ticket.schema';
import { ObjectUtil } from '../../../util/object.util';

const { ObjectId } = mongoose.Types;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,
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
      name: userCreateByGmailInput.gmail,
      profileImageUrl: userCreateByGmailInput.profileImageUrl,
    });
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
      name: email,
    });
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

  async findAllOrderByRewardPointDesc(
    args: FetchUsersArgs = { skip: 0, take: 25 },
  ): Promise<User[]> {
    return await this.userModel
      .find(null, null, {
        limit: args.take,
        skip: args.skip,
      })
      .sort({ rewardPoint: -1 })
      .populate('userSocial')
      .populate('managedProjects')
      .populate('participatingTickets')
      .exec();
  }

  async findRankByUserId(userId: string, args): Promise<number> {
    const users = await this.findAllOrderByRewardPointDesc(args);
    let rank = 0;
    for (const user of users) {
      rank++;
      if (StringUtil.trimAndEqual(String(user._id), userId)) {
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
      StringUtil.trimAndEqual(String(x._id), ticket._id),
    );

    if (!ObjectUtil.isNull(ticket0)) {
      // Check if this user completed all quests & if then, update winner list
      throw ErrorCode.ALREADY_PARTICIPATED_USER;
    }

    await this.userModel.findOneAndUpdate(
      { _id: user._id },
      {
        $push: {
          participatingTickets: ticket,
        },
      },
    );
  }
}
