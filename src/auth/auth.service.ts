import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmailAuth(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid || !user.active) {
      throw new UnauthorizedException('Incorrect email or password.');
    }

    const token = this.jwtService.sign({
      sub: user.id, // identifiant de l'utilisateur. C'est la convention JWT pour le sujet du token.
      email: user.email,
      role: user.role,
    });

    return {
      access_token: token,
    };
  }
}
