import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

import { User, UserRole } from '../users/entities/user.entity';
import { CreateSupportChatDto } from './dto/create-support-chat.dto';
import { SearchSupportChatsDto } from './dto/search-support-chats.dto';
import { SupportChat, SupportChatStatus } from './entities/support-chat.entity';
import { SupportMessage } from './entities/support-message.entity';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportChat)
    private readonly chatsRepository: Repository<SupportChat>,

    private readonly dataSource: DataSource,
  ) {}

  async createChat(
    clientId: number,
    data: CreateSupportChatDto,
  ): Promise<SupportChat> {
    const subject = this.normalizeText(data.subject, 'Тема обращения');

    const initialMessage = this.normalizeText(data.message, 'Сообщение');

    const chatId = await this.dataSource.transaction(async (manager) => {
      const chatsRepository = manager.getRepository(SupportChat);

      const messagesRepository = manager.getRepository(SupportMessage);

      const chat = chatsRepository.create({
        clientId,
        subject,
        status: SupportChatStatus.Open,
        assignedToId: null,
        lastMessageAt: null,
      });

      const savedChat = await chatsRepository.save(chat);

      const message = messagesRepository.create({
        chatId: savedChat.id,
        senderId: clientId,
        message: initialMessage,
      });

      const savedMessage = await messagesRepository.save(message);

      savedChat.lastMessageAt = savedMessage.createdAt;

      await chatsRepository.save(savedChat);

      return savedChat.id;
    });

    return this.findOneForClient(clientId, chatId);
  }

  async findAllForClient(
    clientId: number,
    params: SearchSupportChatsDto,
  ): Promise<SupportChat[]> {
    const query = this.createSummaryQuery()
      .where('chat.clientId = :clientId', {
        clientId,
      })
      .take(params.limit ?? 50)
      .skip(params.offset ?? 0);

    if (params.status) {
      query.andWhere('chat.status = :status', {
        status: params.status,
      });
    }

    return query.getMany();
  }

  async findOneForClient(clientId: number, id: number): Promise<SupportChat> {
    const chat = await this.createDetailsQuery()
      .where('chat.id = :id', {
        id,
      })
      .andWhere('chat.clientId = :clientId', {
        clientId,
      })
      .getOne();

    if (!chat) {
      throw new NotFoundException('Обращение не найдено');
    }

    return chat;
  }

  async addClientMessage(
    clientId: number,
    chatId: number,
    message: string,
  ): Promise<SupportChat> {
    return this.addMessage(
      {
        id: clientId,
        role: UserRole.Client,
      } as User,
      chatId,
      message,
    );
  }

  async closeForClient(clientId: number, id: number): Promise<SupportChat> {
    await this.dataSource.transaction(async (manager) => {
      const chatsRepository = manager.getRepository(SupportChat);

      const chat = await chatsRepository.findOne({
        where: {
          id,
          clientId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!chat) {
        throw new NotFoundException('Обращение не найдено');
      }

      if (chat.status === SupportChatStatus.Closed) {
        return;
      }

      chat.status = SupportChatStatus.Closed;

      await chatsRepository.save(chat);
    });

    return this.findOneForClient(clientId, id);
  }

  async findAllForStaff(params: SearchSupportChatsDto): Promise<SupportChat[]> {
    const query = this.createSummaryQuery()
      .take(params.limit ?? 50)
      .skip(params.offset ?? 0);

    if (params.status) {
      query.andWhere('chat.status = :status', {
        status: params.status,
      });
    }

    if (params.clientId !== undefined) {
      query.andWhere('chat.clientId = :clientId', {
        clientId: params.clientId,
      });
    }

    if (params.assignedToId !== undefined) {
      query.andWhere('chat.assignedToId = :assignedToId', {
        assignedToId: params.assignedToId,
      });
    }

    return query.getMany();
  }

  async findOneForStaff(id: number): Promise<SupportChat> {
    const chat = await this.createDetailsQuery()
      .where('chat.id = :id', {
        id,
      })
      .getOne();

    if (!chat) {
      throw new NotFoundException('Обращение не найдено');
    }

    return chat;
  }

  async addStaffMessage(
    staff: User,
    chatId: number,
    message: string,
  ): Promise<SupportChat> {
    this.ensureStaffRole(staff);

    return this.addMessage(staff, chatId, message);
  }

  async updateStatus(
    staff: User,
    chatId: number,
    status: SupportChatStatus,
  ): Promise<SupportChat> {
    this.ensureStaffRole(staff);

    await this.dataSource.transaction(async (manager) => {
      const chatsRepository = manager.getRepository(SupportChat);

      const chat = await chatsRepository.findOne({
        where: {
          id: chatId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!chat) {
        throw new NotFoundException('Обращение не найдено');
      }

      chat.status = status;

      if (
        status === SupportChatStatus.InProgress &&
        chat.assignedToId === null
      ) {
        chat.assignedToId = staff.id;
      }

      await chatsRepository.save(chat);
    });

    return this.findOneForStaff(chatId);
  }

  async ensureCanAccessChat(user: User, chatId: number): Promise<void> {
    if (user.role === UserRole.Client) {
      await this.findOneForClient(user.id, chatId);

      return;
    }

    if (user.role === UserRole.Admin || user.role === UserRole.Manager) {
      await this.findOneForStaff(chatId);
      return;
    }

    throw new ForbiddenException('Недостаточно прав для доступа к обращению');
  }

  private async addMessage(
    sender: User,
    chatId: number,
    value: string,
  ): Promise<SupportChat> {
    const messageText = this.normalizeText(value, 'Сообщение');

    await this.dataSource.transaction(async (manager) => {
      const chatsRepository = manager.getRepository(SupportChat);

      const messagesRepository = manager.getRepository(SupportMessage);

      const chat = await chatsRepository.findOne({
        where: {
          id: chatId,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!chat) {
        throw new NotFoundException('Обращение не найдено');
      }

      if (sender.role === UserRole.Client && chat.clientId !== sender.id) {
        throw new NotFoundException('Обращение не найдено');
      }

      if (chat.status === SupportChatStatus.Closed) {
        throw new ConflictException(
          'Нельзя отправить сообщение в закрытое обращение',
        );
      }

      const isStaff =
        sender.role === UserRole.Admin || sender.role === UserRole.Manager;

      if (sender.role !== UserRole.Client && !isStaff) {
        throw new ForbiddenException(
          'Недостаточно прав для отправки сообщения',
        );
      }

      if (isStaff) {
        if (chat.assignedToId === null) {
          chat.assignedToId = sender.id;
        }

        if (chat.status === SupportChatStatus.Open) {
          chat.status = SupportChatStatus.InProgress;
        }
      }

      const message = messagesRepository.create({
        chatId,
        senderId: sender.id,
        message: messageText,
      });

      const savedMessage = await messagesRepository.save(message);

      chat.lastMessageAt = savedMessage.createdAt;

      await chatsRepository.save(chat);
    });

    if (sender.role === UserRole.Client) {
      return this.findOneForClient(sender.id, chatId);
    }

    return this.findOneForStaff(chatId);
  }

  private createSummaryQuery(): SelectQueryBuilder<SupportChat> {
    return this.chatsRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.client', 'client')
      .leftJoinAndSelect('chat.assignedTo', 'assignedTo')
      .orderBy('chat.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('chat.createdAt', 'DESC');
  }

  private createDetailsQuery(): SelectQueryBuilder<SupportChat> {
    return this.chatsRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.client', 'client')
      .leftJoinAndSelect('chat.assignedTo', 'assignedTo')
      .leftJoinAndSelect('chat.messages', 'message')
      .leftJoinAndSelect('message.sender', 'sender')
      .orderBy('message.createdAt', 'ASC')
      .addOrderBy('message.id', 'ASC');
  }

  private ensureStaffRole(user: User): void {
    if (user.role !== UserRole.Admin && user.role !== UserRole.Manager) {
      throw new ForbiddenException(
        'Недостаточно прав для работы с обращениями',
      );
    }
  }

  private normalizeText(value: string, fieldName: string): string {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new BadRequestException(`${fieldName} не может быть пустым`);
    }

    return normalizedValue;
  }
}
