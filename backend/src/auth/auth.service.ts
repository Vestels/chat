import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(userId: string): Promise<User | null> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      Logger.error(`User not found!`);
      throw new UnauthorizedException('User not found!');
    }
    Logger.log(`User validated: ${user}`);
    return user;
  }

  async register(data: { name: string; email: string; password: string }) {
    const existingUser = await this.userModel.findOne({ email: data.email }).exec();
    if (existingUser) {
      Logger.error(`Email ${data.email} is already taken!`);
      throw new ConflictException('Email is already taken!');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = new this.userModel({
      ...data,
      password: hashedPassword,
    });
    Logger.log(`New User successfully registered: ${newUser}`);
    return newUser.save();
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      Logger.error(`Incorrect email or password!`);
      throw new UnauthorizedException('Incorrect email or password!');
    }
    const payload = { sub: user._id, email: user.email };
    Logger.log(`User successfully logged in: ${user}`);
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
  
  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
