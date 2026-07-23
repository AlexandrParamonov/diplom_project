import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Library } from './library.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  libraryId!: number;

  @ManyToOne(() => Library, (library) => library.books, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'libraryId' })
  library!: Library;

  @Column()
  title!: string;

  @Column()
  author!: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  year!: number | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  coverImage!: string | null;

  @Column({
    default: true,
  })
  isAvailable!: boolean;

  @Column({
    type: 'int',
    default: 1,
  })
  totalCopies!: number;

  @Column({
    type: 'int',
    default: 1,
  })
  availableCopies!: number;
}
