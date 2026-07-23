import { Controller, Get } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { LibraryResponseDto } from '../dto/library-response.dto';
import { LibrariesService } from '../libraries.service';

@Controller('common/libraries')
export class CommonLibrariesController {
  constructor(private readonly librariesService: LibrariesService) {}

  @Get()
  async findAll(): Promise<LibraryResponseDto[]> {
    const libraries = await this.librariesService.findAllLibraries();

    return plainToInstance(LibraryResponseDto, libraries, {
      excludeExtraneousValues: true,
    });
  }
}
