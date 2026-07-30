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
import { CreateSupportMessageDto } from '../dto/create-support-message.dto';
import { SearchSupportChatsDto } from '../dto/search-support-chats.dto';
import { SupportChatResponseDto } from '../dto/support-chat-response.dto';
import { SupportChatSummaryResponseDto } from '../dto/support-chat-summary-response.dto';
import { UpdateSupportStatusDto } from '../dto/update-support-status.dto';
import { SupportChat } from '../entities/support-chat.entity';
import { SupportGateway } from '../support.gateway';
import { SupportService } from '../support.service';

@Controller('admin/support/chats')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.Admin, UserRole.Manager)
export class AdminSupportController {
  constructor(
    private readonly supportService: SupportService,
    private readonly supportGateway: SupportGateway,
  ) {}

  @Get()
  async findAll(
    @Query()
    query: SearchSupportChatsDto,
  ): Promise<SupportChatSummaryResponseDto[]> {
    const chats = await this.supportService.findAllForStaff(query);

    return chats.map((chat) => this.toSummaryResponse(chat));
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<SupportChatResponseDto> {
    const chat = await this.supportService.findOneForStaff(id);

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
    const chat = await this.supportService.addStaffMessage(
      request.user,
      id,
      data.message,
    );

    this.supportGateway.notifyChatUpdated(chat);

    return this.toDetailsResponse(chat);
  }

  @Patch(':id/status')
  async updateStatus(
    @Req()
    request: AuthenticatedRequest,
    @Param('id', ParseIntPipe)
    id: number,
    @Body()
    data: UpdateSupportStatusDto,
  ): Promise<SupportChatResponseDto> {
    const chat = await this.supportService.updateStatus(
      request.user,
      id,
      data.status,
    );

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
