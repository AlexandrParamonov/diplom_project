import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { UserRole } from '../../users/entities/user.entity';
import { RentalResponseDto } from '../dto/rental-response.dto';
import { SearchRentalsDto } from '../dto/search-rentals.dto';
import { UpdateRentalStatusDto } from '../dto/update-rental-status.dto';
import { BookRental } from '../entities/book-rental.entity';
import { RentalsService } from '../rentals.service';

@Controller('admin/rentals')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.Admin, UserRole.Manager)
export class AdminRentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Get()
  async findAll(
    @Query() query: SearchRentalsDto,
  ): Promise<RentalResponseDto[]> {
    const rentals = await this.rentalsService.findAllForAdmin(query);

    return rentals.map((rental) => this.toResponse(rental));
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RentalResponseDto> {
    const rental = await this.rentalsService.findOneForAdmin(id);

    return this.toResponse(rental);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateRentalStatusDto,
  ): Promise<RentalResponseDto> {
    const rental = await this.rentalsService.updateStatus(
      id,
      updateStatusDto.status,
    );

    return this.toResponse(rental);
  }

  private toResponse(rental: BookRental): RentalResponseDto {
    return plainToInstance(RentalResponseDto, rental, {
      excludeExtraneousValues: true,
    });
  }
}
