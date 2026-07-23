import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateBookDto } from './dto/create-book.dto';
import { CreateLibraryDto } from './dto/create-library.dto';
import { SearchBooksDto } from './dto/search-books.dto';
import { Book } from './entities/book.entity';
import { Library } from './entities/library.entity';

@Injectable()
export class LibrariesService {
  constructor(
    @InjectRepository(Library)
    private readonly librariesRepository: Repository<Library>,

    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async createLibrary(data: CreateLibraryDto): Promise<Library> {
    const library = this.librariesRepository.create({
      name: data.name,
      address: data.address,
      description: data.description ?? null,
    });

    return this.librariesRepository.save(library);
  }

  async findAllLibraries(): Promise<Library[]> {
    return this.librariesRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  async findLibraryById(id: number): Promise<Library> {
    const library = await this.librariesRepository.findOne({
      where: { id },
    });

    if (!library) {
      throw new NotFoundException('Библиотека не найдена');
    }

    return library;
  }

  async createBook(
    data: CreateBookDto,
    coverImage: string | null,
  ): Promise<Book> {
    const library = await this.findLibraryById(data.libraryId);
    const totalCopies = data.totalCopies ?? 1;

    const book = this.booksRepository.create({
      library,
      libraryId: library.id,
      title: data.title,
      author: data.author,
      year: data.year ?? null,
      description: data.description ?? null,
      coverImage,
      totalCopies,
      availableCopies: totalCopies,
      isAvailable: totalCopies > 0,
    });

    return this.booksRepository.save(book);
  }

  async findAllBooks(params: SearchBooksDto): Promise<Book[]> {
    const query = this.booksRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.library', 'library')
      .orderBy('book.id', 'DESC')
      .take(params.limit ?? 20)
      .skip(params.offset ?? 0);

    if (params.library !== undefined) {
      query.andWhere('book.libraryId = :libraryId', {
        libraryId: params.library,
      });
    }

    if (params.title) {
      query.andWhere('LOWER(book.title) LIKE :title', {
        title: `%${params.title.toLowerCase()}%`,
      });
    }

    if (params.author) {
      query.andWhere('LOWER(book.author) LIKE :author', {
        author: `%${params.author.toLowerCase()}%`,
      });
    }

    if (params.availableOnly) {
      query.andWhere('book.availableCopies > 0');
      query.andWhere('book.isAvailable = true');
    }

    return query.getMany();
  }

  async findBookById(id: number): Promise<Book> {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: {
        library: true,
      },
    });

    if (!book) {
      throw new NotFoundException('Книга не найдена');
    }

    return book;
  }
}
