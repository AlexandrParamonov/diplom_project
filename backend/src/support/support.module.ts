import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesGuard } from '../auth/guards/roles.guard';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { AdminSupportController } from './controllers/admin-support.controller';
import { ClientSupportController } from './controllers/client-support.controller';
import { SupportChat } from './entities/support-chat.entity';
import { SupportMessage } from './entities/support-message.entity';
import { SupportGateway } from './support.gateway';
import { SupportService } from './support.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupportChat, SupportMessage])],
  controllers: [ClientSupportController, AdminSupportController],
  providers: [SupportService, SupportGateway, SessionAuthGuard, RolesGuard],
  exports: [SupportService],
})
export class SupportModule {}
