import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = request.params.userId;

    if (user.id !== userId) {
      Logger.error(`User ${user.id} is not authorized to access user ${userId}'s data`);
      throw new UnauthorizedException('You can only access your own data');
    }

    return true;
  }
}