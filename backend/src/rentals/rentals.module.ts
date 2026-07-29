import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesGuard } from '../auth/guards/roles.guard';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { Book } from '../libraries/entities/book.entity';
import { Library } from '../libraries/entities/library.entity';
import { User } from '../users/entities/user.entity';
import { AdminRentalsController } from './controllers/admin-rentals.controller';
import { ClientRentalsController } from './controllers/client-rentals.controller';
import { BookRental } from './entities/book-rental.entity';
import { RentalsService } from './rentals.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookRental, User, Book, Library])],
  controllers: [ClientRentalsController, AdminRentalsController],
  providers: [RentalsService, SessionAuthGuard, RolesGuard],
  exports: [RentalsService],
})
export class RentalsModule {}
