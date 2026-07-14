import { Expose } from 'class-transformer';

import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  @Expose()
  id!: number;

  @Expose()
  email!: string;

  @Expose()
  name!: string;

  @Expose()
  contactPhone!: string | null;

  @Expose()
  role!: UserRole;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
