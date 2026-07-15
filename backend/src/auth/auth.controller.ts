import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { plainToInstance } from 'class-transformer';
import type { Response } from 'express';

import { User } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionAuthGuard } from './guards/session-auth.guard';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('client/register')
  async register(@Body() registerDto: RegisterDto): Promise<UserResponseDto> {
    const user = await this.authService.register(registerDto);

    return this.toResponse(user);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  login(
    @Body() loginDto: LoginDto,
    @Req() request: AuthenticatedRequest,
  ): UserResponseDto {
    void loginDto;

    return this.toResponse(request.user);
  }

  @UseGuards(SessionAuthGuard)
  @Get('auth/me')
  getCurrentUser(@Req() request: AuthenticatedRequest): UserResponseDto {
    return this.toResponse(request.user);
  }

  @UseGuards(SessionAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('auth/logout')
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      request.logout((logoutError: unknown) => {
        if (logoutError) {
          reject(
            this.toError(
              logoutError,
              'Не удалось завершить авторизацию пользователя',
            ),
          );
          return;
        }

        resolve();
      });
    });

    await new Promise<void>((resolve, reject) => {
      request.session.destroy((sessionError: unknown) => {
        if (sessionError) {
          reject(
            this.toError(
              sessionError,
              'Не удалось удалить сессию пользователя',
            ),
          );
          return;
        }

        resolve();
      });
    });

    response.clearCookie('library.sid');
  }

  private toResponse(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
  private toError(error: unknown, defaultMessage: string): Error {
    return error instanceof Error ? error : new Error(defaultMessage);
  }
}
