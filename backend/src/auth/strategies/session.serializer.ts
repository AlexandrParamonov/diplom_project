import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

import { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

type SerializeDone = (error: Error | null, userId?: number) => void;

type DeserializeDone = (error: Error | null, user?: User | null) => void;

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: SerializeDone): void {
    done(null, user.id);
  }

  async deserializeUser(userId: number, done: DeserializeDone): Promise<void> {
    try {
      const user = await this.usersService.findById(userId);

      done(null, user);
    } catch (error: unknown) {
      const deserializeError =
        error instanceof Error
          ? error
          : new Error('Не удалось восстановить пользователя из сессии');

      done(deserializeError, null);
    }
  }
}
