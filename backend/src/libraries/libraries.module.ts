import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesGuard } from '../auth/guards/roles.guard';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { AdminBooksController } from './controllers/admin-books.controller';
import { AdminLibrariesController } from './controllers/admin-libraries.controller';
import { CommonBooksController } from './controllers/common-books.controller';
import { CommonLibrariesController } from './controllers/common-libraries.controller';
import { Book } from './entities/book.entity';
import { Library } from './entities/library.entity';
import { LibrariesService } from './libraries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Library, Book])],
  controllers: [
    CommonBooksController,
    CommonLibrariesController,
    AdminLibrariesController,
    AdminBooksController,
  ],
  providers: [LibrariesService, SessionAuthGuard, RolesGuard],
  exports: [LibrariesService],
})
export class LibrariesModule {}
