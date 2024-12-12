// users.controller.ts
import { Body, Controller, Delete, Get, Logger, Param, Put, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from 'src/schemas/user/dto/update-user.dto';

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

  @UseGuards(JwtAuthGuard)
  @Put(':userId')
  async updateUser(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    Logger.log(`Updating user with ID: ${userId}`);
    return await this.usersService.updateUserById(userId, updateUserDto, req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string, @Request() req) {
    Logger.log(`Deleting user with ID: ${userId}`);
    return await this.usersService.deleteUserById(userId, req.user.id);
  }
}