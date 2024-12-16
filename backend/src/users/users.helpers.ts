import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { User } from 'src/schemas/user/user.schema';
import * as bcrypt from 'bcrypt';

export async function validateUserId(userId: string, userModel: Model<User>): Promise<User> {
  if (!isValidObjectId(userId)) {
    Logger.error(`Invalid user ID: ${userId}`);
    throw new BadRequestException(`Invalid user ID: ${userId}`);
  }
  const existingUser = await userModel.findById(userId).exec();
  if (!existingUser) {
    Logger.error(`User with ID ${userId} not found`);
    throw new NotFoundException(`User with ID ${userId} not found`);
  }
  return existingUser;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}