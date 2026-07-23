import { Expose } from 'class-transformer';

export class LibraryResponseDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  address!: string;

  @Expose()
  description!: string | null;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
