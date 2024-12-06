import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() body: { username: string; email: string; password: string }) {
        Logger.log(`Registering new user: ${body.email}`);
        return this.authService.register(body);
    }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        Logger.log(`Logging in user: ${body.email}`);
        return this.authService.login(body.email, body.password);
    }
}
