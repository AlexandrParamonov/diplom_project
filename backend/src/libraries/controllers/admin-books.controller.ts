import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { diskStorage } from 'multer';

import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { SessionAuthGuard } from '../../auth/guards/session-auth.guard';
import { UserRole } from '../../users/entities/user.entity';
import { BookResponseDto } from '../dto/book-response.dto';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { LibrariesService } from '../libraries.service';
import { removeCoverFile } from '../utils/remove-cover-file';

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);

function createCoverImageInterceptor() {
  return FileInterceptor('coverImage', {
    storage: diskStorage({
      destination: './uploads/covers',
      filename: (_request, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        callback(null, `${randomUUID()}${extension}`);
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_request, file, callback) => {
      if (!allowedImageTypes.has(file.mimetype)) {
        callback(
          new BadRequestException('Допустимы только JPEG, PNG, WEBP и SVG'),
          false,
        );
        return;
      }
      callback(null, true);
    },
  });
}

@Controller('admin/books')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class AdminBooksController {
  constructor(private readonly librariesService: LibrariesService) {}

  @Post()
  @UseInterceptors(createCoverImageInterceptor())
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<BookResponseDto> {
    const coverImage = file ? `/uploads/covers/${file.filename}` : null;

    try {
      const book = await this.librariesService.createBook(
        createBookDto,
        coverImage,
      );

      return this.toResponse(book);
    } catch (error: unknown) {
      await removeCoverFile(coverImage);
      throw error;
    }
  }

  @Patch(':id')
  @UseInterceptors(createCoverImageInterceptor())
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
    @UploadedFile()
    file?: Express.Multer.File,
  ): Promise<BookResponseDto> {
    const coverImage = file ? `/uploads/covers/${file.filename}` : null;

    try {
      const book = await this.librariesService.updateBook(
        id,
        updateBookDto,
        coverImage,
      );

      return this.toResponse(book);
    } catch (error: unknown) {
      await removeCoverFile(coverImage);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.librariesService.deleteBook(id);
  }

  private toResponse(book: BookResponseDto): BookResponseDto {
    return plainToInstance(BookResponseDto, book, {
      excludeExtraneousValues: true,
    });
  }
}
