import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { BookResponseDto } from '../dto/book-response.dto';
import { SearchBooksDto } from '../dto/search-books.dto';
import { LibrariesService } from '../libraries.service';

@Controller('common/books')
export class CommonBooksController {
  constructor(private readonly librariesService: LibrariesService) {}

  @Get()
  async findAll(@Query() query: SearchBooksDto): Promise<BookResponseDto[]> {
    const books = await this.librariesService.findAllBooks(query);

    return plainToInstance(BookResponseDto, books, {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BookResponseDto> {
    const book = await this.librariesService.findBookById(id);

    return plainToInstance(BookResponseDto, book, {
      excludeExtraneousValues: true,
    });
  }
}
