import { IsEnum } from 'class-validator';

import { RentalStatus } from '../entities/book-rental.entity';

export class UpdateRentalStatusDto {
  @IsEnum(RentalStatus)
  status!: RentalStatus;
}
