// users.controller.ts
import { Controller, Get, Logger } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    Logger.log('Fetching all users');
    return await this.usersService.getAllUsers();
  }
}