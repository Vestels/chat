import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DbConfig } from 'src/config/db';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: DbConfig.jwtSecret,
    });
  }

  async validate(payload: any) {
    try {
      Logger.log(`User validated for request: ${payload.email}`);
      return { id: payload.id, email: payload.email };
    } catch (error) {
      Logger.error(`Error validating user: ${error.message}`);
      throw error;
    }
  }
}
