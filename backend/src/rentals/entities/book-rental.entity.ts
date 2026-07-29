import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Book } from '../../libraries/entities/book.entity';
import { Library } from '../../libraries/entities/library.entity';
import { User } from '../../users/entities/user.entity';

export enum RentalStatus {
  Reserved = 'reserved',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

@Entity('book_rentals')
@Index('IDX_book_rentals_user_status', ['userId', 'status'])
@Index('IDX_book_rentals_book_status', ['bookId', 'status'])
export class BookRental {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  bookId!: number;

  @ManyToOne(() => Book, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'bookId' })
  book!: Book;

  @Column()
  libraryId!: number;

  @ManyToOne(() => Library, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'libraryId' })
  library!: Library;

  @Column({ type: 'date' })
  dateStart!: string;

  @Column({ type: 'date' })
  dateEnd!: string;

  @Column({
    type: 'enum',
    enum: RentalStatus,
    default: RentalStatus.Reserved,
  })
  status!: RentalStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
