import { Expose, Type } from 'class-transformer';

import { LibraryResponseDto } from './library-response.dto';

export class BookResponseDto {
  @Expose()
  id!: number;

  @Expose()
  libraryId!: number;

  @Expose()
  title!: string;

  @Expose()
  author!: string;

  @Expose()
  year!: number | null;

  @Expose()
  description!: string | null;

  @Expose()
  coverImage!: string | null;

  @Expose()
  isAvailable!: boolean;

  @Expose()
  totalCopies!: number;

  @Expose()
  availableCopies!: number;

  @Expose()
  @Type(() => LibraryResponseDto)
  library!: LibraryResponseDto;
}
