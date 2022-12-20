import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schema/user.schema';
import { UserUpdateInput } from '../../graphql/dto/user.dto';
import { Project } from '../../schema/project.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,
  ) {}

  async createByWalletAddress(walletAddress: string): Promise<User> {
    const isExist = await this.userModel.exists({
      wallet: {
        address: walletAddress,
      },
    });

    if (isExist) {
      return Promise.reject(new Error('Already exist wallet address'));
    }

    const userModel = new this.userModel({
      walletAddress: walletAddress,
      name: walletAddress,
    });
    return userModel.save();
  }

  async createByGmail(gmail: string): Promise<User> {
    const isExist = await this.userModel.exists({
      gmail: gmail,
    });

    if (isExist) {
      return Promise.reject(new Error('Already exist gmail'));
    }

    const userModel = new this.userModel({
      gmail: gmail,
      name: gmail,
    });
    return userModel.save();
  }

  async createByEmail(email: string): Promise<User> {
    const isExist = await this.userModel.exists({
      email: email,
    });

    if (isExist) {
      return Promise.reject(new Error('Already exist gmail'));
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
    return await this.userModel
      .findOne({ email: email })
      .populate('managedProjects')
      .populate('tickets')
      .exec();
  }

  async findByName(name: string): Promise<User> {
    return await this.userModel
      .findOne({ name: name })
      .populate('managedProjects')
      .populate('tickets')
      .exec();
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
      throw new NotFoundException(`User ${name} not found`);
    }
    return existingUser;
  }

  async remove(name: string) {
    return this.userModel.findOneAndRemove({ name: name });
  }
}
