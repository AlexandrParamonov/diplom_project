import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';

import {
  BadRequestException,
  Body,
  Controller,
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
import { LibrariesService } from '../libraries.service';

const allowedImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);

@Controller('admin/books')
@UseGuards(SessionAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class AdminBooksController {
  constructor(private readonly librariesService: LibrariesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('coverImage', {
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
    }),
  )
  async create(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BookResponseDto> {
    const coverImage = file ? `/uploads/covers/${file.filename}` : null;

    const book = await this.librariesService.createBook(
      createBookDto,
      coverImage,
    );

    return plainToInstance(BookResponseDto, book, {
      excludeExtraneousValues: true,
    });
  }
}
