import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserWallet } from '../../schema/user.schema';
import {
  UserCreateByGmailInput,
  UserUpdateInput,
} from '../../graphql/dto/user.dto';
import { Project } from '../../schema/project.schema';
import { ErrorCode } from '../../../constant/error.constant';

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
      wallet: { $in: [walletInput] },
    });

    if (user.length > 0) {
      return Promise.reject(new Error('Already registered by wallet address'));
    }

    const userModel = new this.userModel({
      wallet: walletInput,
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
      .populate('managedProjects')
      .populate('tickets')
      .exec();
  }

  async findByWalletAddress(walletAddress: string): Promise<User> {
    return await this.userModel
      .findOne({ walletAddress: walletAddress })
      .populate('managedProjects')
      .populate('tickets')
      .exec();
  }

  async findByGmail(gmail: string): Promise<User> {
    return await this.userModel
      .findOne({ gmail: gmail })
      .populate('managedProjects')
      .populate('tickets')
      .exec();
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel
      .findOne({ email: email })
      .populate('managedProjects')
      .populate('tickets')
      .exec();

    if (!user) {
      throw ErrorCode.NOT_FOUND_USER;
    }

    return user;
  }

  async findByName(name: string): Promise<User> {
    return await this.userModel
      .findOne({ name: name })
      .populate('managedProjects')
      .populate('tickets')
      .exec();
  }

  async isExistById(userId: string): Promise<any> {
    if (!ObjectId.isValid(userId)) {
      throw ErrorCode.NOT_FOUND_USER;
    }
    return await this.userModel.findById(userId).exec();
  }

  async update(name: string, userUpdateInput: UserUpdateInput) {
    console.log(userUpdateInput);

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
}
