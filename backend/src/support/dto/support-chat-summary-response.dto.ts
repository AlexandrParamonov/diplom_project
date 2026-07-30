import { Expose, Type } from 'class-transformer';

import { UserResponseDto } from '../../users/dto/user-response.dto';
import { SupportChatStatus } from '../entities/support-chat.entity';

export class SupportChatSummaryResponseDto {
  @Expose()
  id!: number;

  @Expose()
  clientId!: number;

  @Expose()
  assignedToId!: number | null;

  @Expose()
  subject!: string;

  @Expose()
  status!: SupportChatStatus;

  @Expose()
  lastMessageAt!: Date | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Expose()
  @Type(() => UserResponseDto)
  client!: UserResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  assignedTo!: UserResponseDto | null;
}
