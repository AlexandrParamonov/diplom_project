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
import { CreateRentalDto } from '../dto/create-rental.dto';
import { RentalResponseDto } from '../dto/rental-response.dto';
import { SearchRentalsDto } from '../dto/search-rentals.dto';
import { BookRental } from '../entities/book-rental.entity';
import { RentalsService } from '../rentals.service';

@Controller('client/rentals')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.Client)
export class ClientRentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() createRentalDto: CreateRentalDto,
  ): Promise<RentalResponseDto> {
    const rental = await this.rentalsService.createRental(
      request.user.id,
      createRentalDto,
    );

    return this.toResponse(rental);
  }

  @Get()
  async findAll(
    @Req() request: AuthenticatedRequest,
    @Query() query: SearchRentalsDto,
  ): Promise<RentalResponseDto[]> {
    const rentals = await this.rentalsService.findAllForUser(
      request.user.id,
      query,
    );

    return rentals.map((rental) => this.toResponse(rental));
  }

  @Get(':id')
  async findById(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RentalResponseDto> {
    const rental = await this.rentalsService.findOneForUser(
      request.user.id,
      id,
    );

    return this.toResponse(rental);
  }

  @Patch(':id/cancel')
  async cancel(
    @Req() request: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RentalResponseDto> {
    const rental = await this.rentalsService.cancelForUser(request.user.id, id);

    return this.toResponse(rental);
  }

  private toResponse(rental: BookRental): RentalResponseDto {
    return plainToInstance(RentalResponseDto, rental, {
      excludeExtraneousValues: true,
    });
  }
}
