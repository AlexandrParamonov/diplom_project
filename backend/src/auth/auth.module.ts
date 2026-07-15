import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionSerializer } from './strategies/session.serializer';
import { LocalAuthGuard } from './guards/local-auth.guard'; //** */

@Module({
  imports: [
    UsersModule,
    PassportModule.register({
      session: true,
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    SessionSerializer,
    SessionAuthGuard,
    LocalAuthGuard,
  ],
})
export class AuthModule {}
