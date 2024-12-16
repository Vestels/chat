// users.controller.ts
import { Body, Controller, Delete, Get, Logger, Param, Patch, Put, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from 'src/schemas/user/dto/update-user.dto';
import { OwnershipGuard } from 'src/auth/ownership.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    Logger.log('Fetching all users');
    return await this.usersService.getAllUsers();
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    Logger.log(`Fetching user with ID: ${userId}`);
    return await this.usersService.getUserById(userId);
  }

  @UseGuards(OwnershipGuard)
  @Patch(':userId')
  async updateUser(@Param('userId') userId: string, @Body() updateUserDto: Partial<UpdateUserDto>) {
    Logger.log(`Updating user with ID: ${userId}`);
    return await this.usersService.updateUserById(userId, updateUserDto);
  }
  @UseGuards(OwnershipGuard)
  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string) {
    Logger.log(`Deleting user with ID: ${userId}`);
    return await this.usersService.deleteUserById(userId);
  }
}