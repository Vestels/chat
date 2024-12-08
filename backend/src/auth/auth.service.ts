import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
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

  async register(payload: { username: string; email: string; password: string }) {
    const missingProperties = [];
    if (!payload.username) missingProperties.push('username');
    if (!payload.email) missingProperties.push('email');
    if (!payload.password) missingProperties.push('password');

    if (missingProperties.length > 0) {
      const missingPropsString = missingProperties.join(', ');
      Logger.error(`Missing properties in register request: ${missingPropsString}`);
      throw new BadRequestException(`Missing properties: ${missingPropsString}`);
    }
    const existingUser = await this.userModel.findOne({ email: payload.email }).exec();
    if (existingUser) {
      Logger.error(`Email ${payload.email} is already taken!`);
      throw new ConflictException('Email is already taken!');
    }
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const newUser = new this.userModel({
      ...payload,
      password: hashedPassword,
    });
    Logger.log(`New User successfully registered: ${newUser.email}`);
    return newUser.save();
  }

  async login(email: string, password: string) {
    const missingProperties = [];
    if (!email) missingProperties.push('email');
    if (!password) missingProperties.push('password');

    if (missingProperties.length > 0) {
      const missingPropsString = missingProperties.join(', ');
      Logger.error(`Missing properties in login request: ${missingPropsString}`);
      throw new BadRequestException(`Missing properties: ${missingPropsString}`);
    }
    const user = await this.userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      Logger.error(`Incorrect email or password!`);
      throw new UnauthorizedException('Incorrect email or password!');
    }
    const payload = { id: user._id, email: user.email };
    Logger.log(`User successfully logged in: ${user.email}`);
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
