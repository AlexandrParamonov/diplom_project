import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class JoinSupportChatDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  chatId!: number;
}
