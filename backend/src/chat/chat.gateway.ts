import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user/user.schema';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },  
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      await this.userModel.findByIdAndUpdate(userId, { online: true })
        .then(() => {
          client.join(userId);
          this.server.emit('userStatus', { userId, online: true });
        })
        .catch((error) => {
          Logger.error(`Error setting user with ID ${userId} online: ${error}`);
        });
  }
}

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userModel.findByIdAndUpdate(userId, { online: false })
        .then(() => {
          client.leave(userId);
          this.server.emit('userStatus', { userId, online: false });
        })
        .catch((error) => {
          Logger.error(`Error setting user with ID ${userId} offline: ${error}`);
        });
  }
}
}
