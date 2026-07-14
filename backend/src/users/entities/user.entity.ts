import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  Client = 'client',
  Admin = 'admin',
  Manager = 'manager',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Exclude()
  @Column()
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  contactPhone!: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Client,
  })
  role!: UserRole;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
