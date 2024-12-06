import { Logger, Module, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';
import { DbConfig } from './config/db';
import { UsersModule } from './users/users.module';
import mongoose from 'mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(DbConfig.uri, {}),
    AuthModule,
    ChatModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit  {
  constructor() {}

  // Real time database connection status logging
  // to test in npm run start:dev
  // in cmd: net stop MongoDB (to stop the service)
  // in cmd: net start MongoDB (to start the service)
  async onModuleInit() {
    try {
      await mongoose.connect(DbConfig.uri, {});

      this.logConnectionState();

      mongoose.connection.on('connected', () => {
        Logger.log('MongoDB connection established.');
      });

      mongoose.connection.on('disconnected', () => {
        Logger.warn('MongoDB connection lost.');
      });

      mongoose.connection.on('connecting', () => {
        Logger.log('MongoDB is connecting...');
      });

      mongoose.connection.on('disconnecting', () => {
        Logger.warn('MongoDB is disconnecting...');
      });

      mongoose.connection.on('error', (error) => {
        Logger.error(`MongoDB error: ${error.message}`);
      });

    } catch (error) {
      Logger.error(`Failed to connect to MongoDB: ${error.message}`);
    }

    Logger.log('AppModule initialized');
  }

  private logConnectionState() {
    const stateMap = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };
    const state = mongoose.connection.readyState;
    const stateMessage = stateMap[state] || 'Unknown state';
    Logger.log(`MongoDB initial state: ${stateMessage}`);
  }
}