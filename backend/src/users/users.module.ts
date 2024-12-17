import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user/user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ChatGateway } from 'src/chat/chat.gateway';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, ChatGateway],
})
export class UsersModule {}