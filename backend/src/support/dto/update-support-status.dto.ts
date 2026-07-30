import { IsEnum } from 'class-validator';

import { SupportChatStatus } from '../entities/support-chat.entity';

export class UpdateSupportStatusDto {
  @IsEnum(SupportChatStatus)
  status!: SupportChatStatus;
}
