import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(user: User): Promise<User> {
    const userModel = new this.userModel(user);
    return userModel.save();
  }

  async readAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async readById(id): Promise<User> {
    return await this.userModel.findById(id).exec();
  }

  async update(id, user: User): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, user, { new: true });
  }

  async delete(id): Promise<any> {
    return this.userModel.findByIdAndRemove(id);
  }
}
