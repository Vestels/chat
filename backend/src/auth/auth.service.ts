import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/schemas/user/dto/create-user.dto';
import { ChatGateway } from 'src/chat/chat.gateway';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private chatGateway: ChatGateway,
  ) {}

 
  async register(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      Logger.error(`Email ${email} is already taken!`);
      throw new ConflictException('Email is already taken!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    Logger.log(`New User successfully registered: ${newUser.email}`);
    this.chatGateway.server.emit('new-user', newUser);
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
      user
    };
  }
}
