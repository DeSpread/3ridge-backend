import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schema/user.schema';
import { UserInput } from '../../graphql/dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async findByUsername(username): Promise<User> {
    return await this.userModel.findOne({ username: username }).exec();
  }

  async create(userInput: UserInput): Promise<User> {
    const isExist = await this.userModel.exists({
      username: userInput.username,
    });

    if (isExist) {
      return Promise.reject(new Error('Already exist user'));
    }

    const userModel = new this.userModel(userInput);
    return userModel.save();
  }

  async update(username: string, userInput: UserInput) {
    const existingUser = await this.userModel
      .findOneAndUpdate(
        { username: username },
        { $set: userInput },
        { new: true },
      )
      .exec();

    if (!existingUser) {
      throw new NotFoundException(`User ${username} not found`);
    }
    return existingUser;
  }

  async remove(username: string) {
    return this.userModel.findByIdAndRemove(username);
  }
}
