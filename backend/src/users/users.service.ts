// users.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user/user.schema';
import { UpdateUserDto } from 'src/schemas/user/dto/update-user.dto';
import { hashPassword, validateUserId } from './users.helpers';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async getUserById(userId: string): Promise<User | null> {
    const existingUser = await validateUserId(userId, this.userModel);
    Logger.log(`User found: ${userId} - ${existingUser.email}`);
    return existingUser;
  }

  async updateUserById(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await validateUserId(userId, this.userModel);
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true }).exec();
    Logger.log(`User updated: ${userId} - ${existingUser.email}`);
    return updatedUser;
  }

  async deleteUserById(userId: string): Promise<User> {
    const existingUser = await validateUserId(userId, this.userModel);
    const deletedUser = await this.userModel.findByIdAndDelete(userId).exec();
    Logger.log(`User deleted: ${userId} - ${existingUser.email}`);
    return deletedUser;
  }
}