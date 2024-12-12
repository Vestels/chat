// users.service.ts
import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User } from 'src/schemas/user/user.schema';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/schemas/user/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async getUserById(userId: string): Promise<User | null> {
    if (!isValidObjectId(userId)) {
      Logger.error(`Invalid user ID: ${userId}`);
      throw new BadRequestException(`Invalid user ID: ${userId}`);
    }
    const existingUser = await this.userModel.findById(userId).exec();
    if (!existingUser) {
      Logger.error(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    Logger.log(`User found: ${userId} - ${existingUser.email}`);
    return existingUser
  }

  async updateUserById(userId: string, updateUserDto: UpdateUserDto, currentUserId: string): Promise<User> {
    if (!isValidObjectId(userId)) {
      Logger.error(`Invalid user ID: ${userId}`);
      throw new BadRequestException(`Invalid user ID: ${userId}`);
    }
    const existingUser = await this.userModel.findById(userId).exec();
    if (!existingUser) {
      Logger.error(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (existingUser._id.toString() !== currentUserId) {
      Logger.error(`User ${currentUserId} is not authorized to update user ${userId}`);
      throw new UnauthorizedException('You can only update your own data');
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true }).exec();
    Logger.log(`User updated: ${userId} - ${updatedUser.email}`);
    return updatedUser;
  }

  async deleteUserById(userId: string, currentUserId: string): Promise<User> {
    if (!isValidObjectId(userId)) {
      Logger.error(`Invalid user ID: ${userId}`);
      throw new BadRequestException(`Invalid user ID: ${userId}`);
    }
    const existingUser = await this.userModel.findById(userId).exec();
    if (!existingUser) {
      Logger.error(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (existingUser._id.toString() !== currentUserId) {
      Logger.error(`User ${currentUserId} is not authorized to delete user ${userId}`);
      throw new UnauthorizedException('You can only delete your own data');
    }
    const deletedUser = await this.userModel.findByIdAndDelete(userId).exec();
    Logger.log(`User deleted: ${userId} - ${deletedUser.email}`);
    return deletedUser;
  }
}