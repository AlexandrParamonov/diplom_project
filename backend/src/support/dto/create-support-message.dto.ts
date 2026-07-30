import { IsString, Length } from 'class-validator';

export class CreateSupportMessageDto {
  @IsString()
  @Length(1, 4000)
  message!: string;
}
