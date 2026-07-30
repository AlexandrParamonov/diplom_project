import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { SupportChat } from './support-chat.entity';

@Entity('support_messages')
@Index('IDX_support_messages_chat_created', ['chatId', 'createdAt'])
export class SupportMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  chatId!: number;

  @ManyToOne(() => SupportChat, (chat) => chat.messages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chatId' })
  chat!: SupportChat;

  @Column()
  senderId!: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'senderId' })
  sender!: User;

  @Column({ type: 'text' })
  message!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
