import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';

import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async register(registerDto: RegisterDto): Promise<User> {
    return this.usersService.create({
      ...registerDto,
      role: UserRole.Client,
    });
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Неверная почта или пароль');
    }

    const passwordMatches = await compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Неверная почта или пароль');
    }

    return user;
  }
}
