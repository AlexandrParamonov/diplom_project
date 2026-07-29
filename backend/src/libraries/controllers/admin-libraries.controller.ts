import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { UserRole } from '../../users/entities/user.entity';
import { CreateLibraryDto } from '../dto/create-library.dto';
import { LibraryResponseDto } from '../dto/library-response.dto';
import { UpdateLibraryDto } from '../dto/update-library.dto';
import { LibrariesService } from '../libraries.service';

@Controller('admin/libraries')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class AdminLibrariesController {
  constructor(private readonly librariesService: LibrariesService) {}

  @Post()
  async create(
    @Body() createLibraryDto: CreateLibraryDto,
  ): Promise<LibraryResponseDto> {
    const library = await this.librariesService.createLibrary(createLibraryDto);

    return this.toResponse(library);
  }
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLibraryDto: UpdateLibraryDto,
  ): Promise<LibraryResponseDto> {
    const library = await this.librariesService.updateLibrary(
      id,
      updateLibraryDto,
    );

    return this.toResponse(library);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.librariesService.deleteLibrary(id);
  }

  private toResponse(library: LibraryResponseDto): LibraryResponseDto {
    return plainToInstance(LibraryResponseDto, library, {
      excludeExtraneousValues: true,
    });
  }
}
