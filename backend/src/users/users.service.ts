// users.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/user/user.schema';
import { UpdateUserDto } from 'src/schemas/user/dto/update-user.dto';
import { hashPassword, validateUserId } from './users.helpers';
import { Model } from 'mongoose';
import { ChatGateway } from 'src/chat/chat.gateway';
import { Multer } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>,
  private chatGateway: ChatGateway,  
) {}


  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async getUserById(userId: string): Promise<User | null> {
    const existingUser = await validateUserId(userId, this.userModel);
    Logger.log(`User found: ${userId} - ${existingUser.email}`);
    return existingUser;
  }

  async updateUserById(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<User> {
    const existingUser = await validateUserId(userId, this.userModel);
    if (updateUserDto.password) {
      updateUserDto.password = await hashPassword(updateUserDto.password);
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, { new: true }).exec();
    Logger.log(`User updated: ${userId} - ${existingUser.email}`);
    this.chatGateway.server.emit('user-updated', updatedUser);
    return updatedUser;
  }

  async deleteUserById(userId: string): Promise<User> {
    const existingUser = await validateUserId(userId, this.userModel);
    const deletedUser = await this.userModel.findByIdAndDelete(userId).exec();
    Logger.log(`User deleted: ${userId} - ${existingUser.email}`);
    this.chatGateway.server.emit('user-deleted', deletedUser._id);
    return deletedUser;
  }

  async uploadProfilePictureById(userId: string, file: Multer.File): Promise<User> {
    const existingUser = await validateUserId(userId, this.userModel);
    const profilePictureUrl = `/uploads/profile-pictures/${file.filename}`;
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, { profilePicture: profilePictureUrl }, { new: true }).exec();
    Logger.log(`Profile picture uploaded: ${userId} - ${existingUser.email}`);
    this.chatGateway.server.emit('profile-picture-uploaded', updatedUser);
    return updatedUser;
  }

async deleteProfilePictureById(userId: string): Promise<User> {
    const existingUser = await validateUserId(userId, this.userModel);
    if (existingUser.profilePicture) {
        const filePath = path.join(__dirname, '../..', existingUser.profilePicture);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                Logger.log(`Deleted file: ${filePath}`);
            }
        } catch (error) {
            Logger.error(`Error deleting file: ${error.message}`);
        }
        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            { $unset: { profilePicture: 1 } },
            { new: true }
        ).exec();
        Logger.log(`Profile picture removed for user: ${userId}`);
        this.chatGateway.server.emit('profile-picture-uploaded', updatedUser);
        return updatedUser;
    }
    return existingUser;
}
}