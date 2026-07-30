import { Expose, Type } from 'class-transformer';

import { SupportChatSummaryResponseDto } from './support-chat-summary-response.dto';
import { SupportMessageResponseDto } from './support-message-response.dto';

export class SupportChatResponseDto extends SupportChatSummaryResponseDto {
  @Expose()
  @Type(() => SupportMessageResponseDto)
  messages!: SupportMessageResponseDto[];
}
