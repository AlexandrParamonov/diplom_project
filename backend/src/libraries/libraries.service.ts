import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateBookDto } from './dto/create-book.dto';
import { CreateLibraryDto } from './dto/create-library.dto';
import { SearchBooksDto } from './dto/search-books.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { Book } from './entities/book.entity';
import { Library } from './entities/library.entity';
import { removeCoverFile } from './utils/remove-cover-file';

@Injectable()
export class LibrariesService {
  constructor(
    @InjectRepository(Library)
    private readonly librariesRepository: Repository<Library>,

    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async createLibrary(data: CreateLibraryDto): Promise<Library> {
    const name = this.normalizeRequiredText(data.name, 'Название библиотеки');

    const address = this.normalizeRequiredText(
      data.address,
      'Адрес библиотеки',
    );

    await this.ensureLibraryIsUnique(name, address);

    const library = this.librariesRepository.create({
      name,
      address,
      description: this.normalizeOptionalText(data.description),
    });

    return this.librariesRepository.save(library);
  }

  async updateLibrary(id: number, data: UpdateLibraryDto): Promise<Library> {
    const library = await this.findLibraryById(id);

    const name =
      data.name !== undefined
        ? this.normalizeRequiredText(data.name, 'Название библиотеки')
        : library.name;

    const address =
      data.address !== undefined
        ? this.normalizeRequiredText(data.address, 'Адрес библиотеки')
        : library.address;

    await this.ensureLibraryIsUnique(name, address, id);

    library.name = name;
    library.address = address;

    if (data.description !== undefined) {
      library.description = this.normalizeOptionalText(data.description);
    }

    return this.librariesRepository.save(library);
  }

  async deleteLibrary(id: number): Promise<void> {
    const library = await this.librariesRepository.findOne({
      where: { id },
      relations: {
        books: true,
      },
    });

    if (!library) {
      throw new NotFoundException('Библиотека не найдена');
    }

    const coverImages = library.books
      .map((book) => book.coverImage)
      .filter((coverImage): coverImage is string => coverImage !== null);

    await this.librariesRepository.remove(library);

    await Promise.all(
      coverImages.map((coverImage) => removeCoverFile(coverImage)),
    );
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

    const title = this.normalizeRequiredText(data.title, 'Название книги');

    const author = this.normalizeRequiredText(data.author, 'Автор книги');

    await this.ensureBookIsUnique(title, author, library.id);

    const totalCopies = data.totalCopies ?? 1;

    const book = this.booksRepository.create({
      library,
      libraryId: library.id,
      title,
      author,
      year: data.year ?? null,
      description: this.normalizeOptionalText(data.description),
      coverImage,
      totalCopies,
      availableCopies: totalCopies,
      isAvailable: totalCopies > 0,
    });

    const savedBook = await this.booksRepository.save(book);

    return this.findBookById(savedBook.id);
  }

  async updateBook(
    id: number,
    data: UpdateBookDto,
    uploadedCoverImage: string | null,
  ): Promise<Book> {
    const book = await this.findBookById(id);

    const previousCoverImage = book.coverImage;

    const libraryId = data.libraryId ?? book.libraryId;

    const library =
      libraryId === book.libraryId
        ? book.library
        : await this.findLibraryById(libraryId);

    const title =
      data.title !== undefined
        ? this.normalizeRequiredText(data.title, 'Название книги')
        : book.title;

    const author =
      data.author !== undefined
        ? this.normalizeRequiredText(data.author, 'Автор книги')
        : book.author;

    await this.ensureBookIsUnique(title, author, library.id, id);

    const totalCopies = data.totalCopies ?? book.totalCopies;

    const availableCopies = this.calculateAvailableCopies(
      book,
      totalCopies,
      data.availableCopies,
    );

    let coverImage = book.coverImage;

    if (uploadedCoverImage) {
      coverImage = uploadedCoverImage;
    } else if (data.removeCoverImage) {
      coverImage = null;
    }

    book.library = library;
    book.libraryId = library.id;
    book.title = title;
    book.author = author;
    book.totalCopies = totalCopies;
    book.availableCopies = availableCopies;
    book.isAvailable = availableCopies > 0;
    book.coverImage = coverImage;

    if (data.year !== undefined) {
      book.year = data.year;
    }

    if (data.description !== undefined) {
      book.description = this.normalizeOptionalText(data.description);
    }

    const savedBook = await this.booksRepository.save(book);

    if (previousCoverImage && previousCoverImage !== savedBook.coverImage) {
      await removeCoverFile(previousCoverImage);
    }

    return this.findBookById(savedBook.id);
  }

  async deleteBook(id: number): Promise<void> {
    const book = await this.findBookById(id);
    const coverImage = book.coverImage;

    await this.booksRepository.remove(book);
    await removeCoverFile(coverImage);
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

  private calculateAvailableCopies(
    book: Book,
    totalCopies: number,
    requestedAvailableCopies?: number,
  ): number {
    if (requestedAvailableCopies !== undefined) {
      if (requestedAvailableCopies > totalCopies) {
        throw new BadRequestException(
          'Количество доступных экземпляров не может быть больше общего количества',
        );
      }

      return requestedAvailableCopies;
    }

    if (totalCopies === book.totalCopies) {
      return book.availableCopies;
    }

    const unavailableCopies = book.totalCopies - book.availableCopies;

    if (totalCopies < unavailableCopies) {
      throw new BadRequestException(
        'Общее количество нельзя установить меньше количества выданных или забронированных экземпляров',
      );
    }

    return totalCopies - unavailableCopies;
  }

  private async ensureLibraryIsUnique(
    name: string,
    address: string,
    excludedId?: number,
  ): Promise<void> {
    const query = this.librariesRepository
      .createQueryBuilder('library')
      .where('LOWER(library.name) = LOWER(:name)', { name })
      .andWhere('LOWER(library.address) = LOWER(:address)', { address });

    if (excludedId !== undefined) {
      query.andWhere('library.id != :excludedId', {
        excludedId,
      });
    }

    const existingLibrary = await query.getOne();

    if (existingLibrary) {
      throw new ConflictException(
        'Библиотека с таким названием и адресом уже существует',
      );
    }
  }

  private async ensureBookIsUnique(
    title: string,
    author: string,
    libraryId: number,
    excludedId?: number,
  ): Promise<void> {
    const query = this.booksRepository
      .createQueryBuilder('book')
      .where('LOWER(book.title) = LOWER(:title)', { title })
      .andWhere('LOWER(book.author) = LOWER(:author)', { author })
      .andWhere('book.libraryId = :libraryId', { libraryId });

    if (excludedId !== undefined) {
      query.andWhere('book.id != :excludedId', {
        excludedId,
      });
    }

    const existingBook = await query.getOne();

    if (existingBook) {
      throw new ConflictException(
        'Такая книга уже существует в выбранной библиотеке',
      );
    }
  }

  private normalizeRequiredText(value: string, fieldName: string): string {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      throw new BadRequestException(`${fieldName} не может быть пустым`);
    }

    return normalizedValue;
  }

  private normalizeOptionalText(value: string | undefined): string | null {
    if (value === undefined) {
      return null;
    }

    const normalizedValue = value.trim();

    return normalizedValue || null;
  }
}
