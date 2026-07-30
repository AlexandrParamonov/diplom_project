import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import type { AuthenticatedRequest } from '../../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../../users/entities/user.entity';
import { CreateSupportChatDto } from '../dto/create-support-chat.dto';
import { CreateSupportMessageDto } from '../dto/create-support-message.dto';
import { SearchSupportChatsDto } from '../dto/search-support-chats.dto';
import { SupportChatResponseDto } from '../dto/support-chat-response.dto';
import { SupportChatSummaryResponseDto } from '../dto/support-chat-summary-response.dto';
import { SupportChat } from '../entities/support-chat.entity';
import { SupportGateway } from '../support.gateway';
import { SupportService } from '../support.service';

@Controller('client/support/chats')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.Client)
export class ClientSupportController {
  constructor(
    private readonly supportService: SupportService,
    private readonly supportGateway: SupportGateway,
  ) {}

  @Post()
  async create(
    @Req()
    request: AuthenticatedRequest,
    @Body()
    data: CreateSupportChatDto,
  ): Promise<SupportChatResponseDto> {
    const chat = await this.supportService.createChat(request.user.id, data);

    this.supportGateway.notifyChatCreated(chat);

    return this.toDetailsResponse(chat);
  }

  @Get()
  async findAll(
    @Req()
    request: AuthenticatedRequest,
    @Query()
    query: SearchSupportChatsDto,
  ): Promise<SupportChatSummaryResponseDto[]> {
    const chats = await this.supportService.findAllForClient(
      request.user.id,
      query,
    );

    return chats.map((chat) => this.toSummaryResponse(chat));
  }

  @Get(':id')
  async findById(
    @Req()
    request: AuthenticatedRequest,
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<SupportChatResponseDto> {
    const chat = await this.supportService.findOneForClient(
      request.user.id,
      id,
    );

    return this.toDetailsResponse(chat);
  }

  @Post(':id/messages')
  async createMessage(
    @Req()
    request: AuthenticatedRequest,
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    data: CreateSupportMessageDto,
  ): Promise<SupportChatResponseDto> {
    const chat = await this.supportService.addClientMessage(
      request.user.id,
      id,
      data.message,
    );

    this.supportGateway.notifyChatUpdated(chat);

    return this.toDetailsResponse(chat);
  }

  @Patch(':id/close')
  async close(
    @Req()
    request: AuthenticatedRequest,
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<SupportChatResponseDto> {
    const chat = await this.supportService.closeForClient(request.user.id, id);

    this.supportGateway.notifyChatUpdated(chat);

    return this.toDetailsResponse(chat);
  }

  private toSummaryResponse(chat: SupportChat): SupportChatSummaryResponseDto {
    return plainToInstance(SupportChatSummaryResponseDto, chat, {
      excludeExtraneousValues: true,
    });
  }

  private toDetailsResponse(chat: SupportChat): SupportChatResponseDto {
    return plainToInstance(SupportChatResponseDto, chat, {
      excludeExtraneousValues: true,
    });
  }
}
