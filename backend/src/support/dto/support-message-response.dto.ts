import { Expose, Type } from 'class-transformer';

import { UserResponseDto } from '../../users/dto/user-response.dto';

export class SupportMessageResponseDto {
  @Expose()
  id!: number;

  @Expose()
  chatId!: number;

  @Expose()
  senderId!: number;

  @Expose()
  message!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  @Type(() => UserResponseDto)
  sender!: UserResponseDto;
}
