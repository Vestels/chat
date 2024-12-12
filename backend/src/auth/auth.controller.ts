import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/schemas/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() CreateUserDto: CreateUserDto) {
        Logger.log(`Registering new user: ${CreateUserDto.email}`);
        return this.authService.register(CreateUserDto);
    }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        Logger.log(`Logging in user: ${body.email}`);
        return this.authService.login(body.email, body.password);
    }
}
