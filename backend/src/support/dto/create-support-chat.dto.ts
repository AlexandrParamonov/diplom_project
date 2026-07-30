import { IsString, Length } from 'class-validator';

export class CreateSupportChatDto {
  @IsString()
  @Length(3, 150)
  subject!: string;

  @IsString()
  @Length(1, 4000)
  message!: string;
}
