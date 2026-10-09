import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload.type.js';
import { UsersService } from '../../users/users.service.js';
import { UserResponseDto } from '../../users/dto/user-response.dto.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    confService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: confService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(payload.sub);

    if (!user || !user.active) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
