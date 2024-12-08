import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

  handleRequest(err: any, user: any) {
    if (err || !user) {
        Logger.error(`Unauthorized access: Please login to continue!`);
        throw new UnauthorizedException('Unauthorized access: Please login to continue!');
    }
    return user;
  }
}