import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import type { Request } from 'express';
import { Server, Socket } from 'socket.io';

import { User, UserRole } from '../users/entities/user.entity';
import { JoinSupportChatDto } from './dto/join-support-chat.dto';
import { SupportChat } from './entities/support-chat.entity';
import { SupportService } from './support.service';

interface AuthenticatedSocketRequest extends Request {
  user?: User;
}

interface SupportSocketData {
  user?: User;
}

@WebSocketGateway({
  namespace: '/support',
})
export class SupportGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server!: Server;

  constructor(private readonly supportService: SupportService) {}

  handleConnection(
    client: Socket<
      Record<string, never>,
      Record<string, never>,
      Record<string, never>,
      SupportSocketData
    >,
  ): void {
    const request = client.request as AuthenticatedSocketRequest;

    const user = request.user;

    if (!user) {
      client.disconnect(true);
      return;
    }

    client.data.user = user;

    void client.join(this.getUserRoom(user.id));

    if (user.role === UserRole.Admin || user.role === UserRole.Manager) {
      void client.join(this.getStaffRoom());
    }
  }

  @SubscribeMessage('support:join')
  async joinChat(
    @ConnectedSocket()
    client: Socket<
      Record<string, never>,
      Record<string, never>,
      Record<string, never>,
      SupportSocketData
    >,
    @MessageBody()
    data: JoinSupportChatDto,
  ): Promise<{
    event: string;
    data: {
      chatId: number;
    };
  }> {
    const user = client.data.user;

    if (!user) {
      throw new WsException('Пользователь не авторизован');
    }

    try {
      await this.supportService.ensureCanAccessChat(user, data.chatId);

      await client.join(this.getChatRoom(data.chatId));

      return {
        event: 'support:joined',
        data: {
          chatId: data.chatId,
        },
      };
    } catch (error: unknown) {
      throw this.toWsException(error);
    }
  }

  notifyChatCreated(chat: SupportChat): void {
    const payload = this.createEventPayload(chat);

    this.server
      .to(this.getUserRoom(chat.clientId))
      .emit('support:chat-created', payload);

    this.server.to(this.getStaffRoom()).emit('support:chat-created', payload);
  }

  notifyChatUpdated(chat: SupportChat): void {
    const payload = this.createEventPayload(chat);

    this.server
      .to(this.getChatRoom(chat.id))
      .emit('support:chat-updated', payload);

    this.server
      .to(this.getUserRoom(chat.clientId))
      .emit('support:chat-updated', payload);

    this.server.to(this.getStaffRoom()).emit('support:chat-updated', payload);
  }

  private createEventPayload(chat: SupportChat) {
    return {
      chatId: chat.id,
      clientId: chat.clientId,
      status: chat.status,
      assignedToId: chat.assignedToId,
      lastMessageAt: chat.lastMessageAt,
      updatedAt: chat.updatedAt,
    };
  }

  private getUserRoom(userId: number): string {
    return `support:user:${userId}`;
  }

  private getChatRoom(chatId: number): string {
    return `support:chat:${chatId}`;
  }

  private getStaffRoom(): string {
    return 'support:staff';
  }

  private toWsException(error: unknown): WsException {
    if (error instanceof Error) {
      return new WsException(error.message);
    }

    return new WsException('Не удалось подключиться к обращению');
  }
}
