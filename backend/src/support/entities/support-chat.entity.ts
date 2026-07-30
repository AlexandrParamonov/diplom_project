import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { SupportMessage } from './support-message.entity';

export enum SupportChatStatus {
  Open = 'open',
  InProgress = 'in_progress',
  Closed = 'closed',
}

@Entity('support_chats')
@Index('IDX_support_chats_client_status', ['clientId', 'status'])
@Index('IDX_support_chats_status_last_message', ['status', 'lastMessageAt'])
export class SupportChat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  clientId!: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'clientId' })
  client!: User;

  @Column({
    type: 'int',
    nullable: true,
  })
  assignedToId!: number | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assignedToId' })
  assignedTo!: User | null;

  @Column({ length: 150 })
  subject!: string;

  @Column({
    type: 'enum',
    enum: SupportChatStatus,
    default: SupportChatStatus.Open,
  })
  status!: SupportChatStatus;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  lastMessageAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => SupportMessage, (message) => message.chat)
  messages!: SupportMessage[];
}
