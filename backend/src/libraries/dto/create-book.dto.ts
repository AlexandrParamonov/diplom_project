import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(2)
  author!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  year?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  libraryId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalCopies?: number = 1;
}
