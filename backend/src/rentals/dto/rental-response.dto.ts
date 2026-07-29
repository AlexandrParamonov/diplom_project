import { Expose, Type } from 'class-transformer';

import { BookResponseDto } from '../../libraries/dto/book-response.dto';
import { LibraryResponseDto } from '../../libraries/dto/library-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { RentalStatus } from '../entities/book-rental.entity';

export class RentalResponseDto {
  @Expose()
  id!: number;

  @Expose()
  userId!: number;

  @Expose()
  bookId!: number;

  @Expose()
  libraryId!: number;

  @Expose()
  dateStart!: string;

  @Expose()
  dateEnd!: string;

  @Expose()
  status!: RentalStatus;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;

  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;

  @Expose()
  @Type(() => BookResponseDto)
  book!: BookResponseDto;

  @Expose()
  @Type(() => LibraryResponseDto)
  library!: LibraryResponseDto;
}
