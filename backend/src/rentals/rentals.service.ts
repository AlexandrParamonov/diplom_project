import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Book } from '../libraries/entities/book.entity';
import { CreateRentalDto } from './dto/create-rental.dto';
import { SearchRentalsDto } from './dto/search-rentals.dto';
import { BookRental, RentalStatus } from './entities/book-rental.entity';

@Injectable()
export class RentalsService {
  constructor(
    @InjectRepository(BookRental)
    private readonly rentalsRepository: Repository<BookRental>,
    private readonly dataSource: DataSource,
  ) {}

  async createRental(
    userId: number,
    data: CreateRentalDto,
  ): Promise<BookRental> {
    this.validateRentalDates(data.dateStart, data.dateEnd);

    const rentalId = await this.dataSource.transaction(async (manager) => {
      const booksRepository = manager.getRepository(Book);
      const rentalsRepository = manager.getRepository(BookRental);

      const book = await booksRepository.findOne({
        where: { id: data.bookId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!book) {
        throw new NotFoundException('Книга не найдена');
      }

      if (!book.isAvailable || book.availableCopies < 1) {
        throw new ConflictException('Нет доступных экземпляров книги');
      }

      const existingRental = await rentalsRepository
        .createQueryBuilder('rental')
        .where('rental.userId = :userId', { userId })
        .andWhere('rental.bookId = :bookId', { bookId: book.id })
        .andWhere('rental.status IN (:...statuses)', {
          statuses: [RentalStatus.Reserved, RentalStatus.Active],
        })
        .getOne();

      if (existingRental) {
        throw new ConflictException(
          'У пользователя уже есть активное бронирование этой книги',
        );
      }

      book.availableCopies -= 1;
      book.isAvailable = book.availableCopies > 0;
      await booksRepository.save(book);

      const rental = rentalsRepository.create({
        userId,
        bookId: book.id,
        libraryId: book.libraryId,
        dateStart: data.dateStart,
        dateEnd: data.dateEnd,
        status: RentalStatus.Reserved,
      });

      const savedRental = await rentalsRepository.save(rental);
      return savedRental.id;
    });

    return this.findOneForUser(userId, rentalId);
  }

  async findAllForUser(
    userId: number,
    params: SearchRentalsDto,
  ): Promise<BookRental[]> {
    const query = this.createRentalsQuery()
      .where('rental.userId = :userId', { userId })
      .orderBy('rental.createdAt', 'DESC')
      .take(params.limit ?? 50)
      .skip(params.offset ?? 0);

    if (params.status) {
      query.andWhere('rental.status = :status', { status: params.status });
    }

    if (params.bookId !== undefined) {
      query.andWhere('rental.bookId = :bookId', { bookId: params.bookId });
    }

    if (params.libraryId !== undefined) {
      query.andWhere('rental.libraryId = :libraryId', {
        libraryId: params.libraryId,
      });
    }

    return query.getMany();
  }

  async findOneForUser(userId: number, id: number): Promise<BookRental> {
    const rental = await this.rentalsRepository.findOne({
      where: { id, userId },
      relations: {
        user: true,
        book: { library: true },
        library: true,
      },
    });

    if (!rental) {
      throw new NotFoundException('Бронирование не найдено');
    }

    return rental;
  }

  async cancelForUser(userId: number, id: number): Promise<BookRental> {
    await this.dataSource.transaction(async (manager) => {
      const rentalsRepository = manager.getRepository(BookRental);
      const booksRepository = manager.getRepository(Book);

      const rental = await rentalsRepository.findOne({
        where: { id, userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!rental) {
        throw new NotFoundException('Бронирование не найдено');
      }

      if (rental.status !== RentalStatus.Reserved) {
        throw new ConflictException(
          'Отменить можно только бронирование со статусом reserved',
        );
      }

      const book = await booksRepository.findOne({
        where: { id: rental.bookId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!book) {
        throw new NotFoundException('Книга не найдена');
      }

      rental.status = RentalStatus.Cancelled;
      this.restoreBookCopy(book);

      await booksRepository.save(book);
      await rentalsRepository.save(rental);
    });

    return this.findOneForUser(userId, id);
  }

  async findAllForAdmin(params: SearchRentalsDto): Promise<BookRental[]> {
    const query = this.createRentalsQuery()
      .orderBy('rental.createdAt', 'DESC')
      .take(params.limit ?? 50)
      .skip(params.offset ?? 0);

    if (params.status) {
      query.andWhere('rental.status = :status', { status: params.status });
    }

    if (params.userId !== undefined) {
      query.andWhere('rental.userId = :userId', { userId: params.userId });
    }

    if (params.bookId !== undefined) {
      query.andWhere('rental.bookId = :bookId', { bookId: params.bookId });
    }

    if (params.libraryId !== undefined) {
      query.andWhere('rental.libraryId = :libraryId', {
        libraryId: params.libraryId,
      });
    }

    return query.getMany();
  }

  async findOneForAdmin(id: number): Promise<BookRental> {
    const rental = await this.rentalsRepository.findOne({
      where: { id },
      relations: {
        user: true,
        book: { library: true },
        library: true,
      },
    });

    if (!rental) {
      throw new NotFoundException('Бронирование не найдено');
    }

    return rental;
  }

  async updateStatus(
    id: number,
    nextStatus: RentalStatus,
  ): Promise<BookRental> {
    await this.dataSource.transaction(async (manager) => {
      const rentalsRepository = manager.getRepository(BookRental);
      const booksRepository = manager.getRepository(Book);

      const rental = await rentalsRepository.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!rental) {
        throw new NotFoundException('Бронирование не найдено');
      }

      if (rental.status === nextStatus) {
        return;
      }

      if (!this.isAllowedTransition(rental.status, nextStatus)) {
        throw new ConflictException(
          `Нельзя изменить статус с ${rental.status} на ${nextStatus}`,
        );
      }

      const shouldRestoreCopy =
        nextStatus === RentalStatus.Completed ||
        nextStatus === RentalStatus.Cancelled;

      if (shouldRestoreCopy) {
        const book = await booksRepository.findOne({
          where: { id: rental.bookId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!book) {
          throw new NotFoundException('Книга не найдена');
        }

        this.restoreBookCopy(book);
        await booksRepository.save(book);
      }

      rental.status = nextStatus;
      await rentalsRepository.save(rental);
    });

    return this.findOneForAdmin(id);
  }

  private createRentalsQuery() {
    return this.rentalsRepository
      .createQueryBuilder('rental')
      .leftJoinAndSelect('rental.user', 'user')
      .leftJoinAndSelect('rental.book', 'book')
      .leftJoinAndSelect('book.library', 'bookLibrary')
      .leftJoinAndSelect('rental.library', 'library');
  }

  private isAllowedTransition(
    currentStatus: RentalStatus,
    nextStatus: RentalStatus,
  ): boolean {
    const transitions: Record<RentalStatus, RentalStatus[]> = {
      [RentalStatus.Reserved]: [RentalStatus.Active, RentalStatus.Cancelled],
      [RentalStatus.Active]: [RentalStatus.Completed, RentalStatus.Cancelled],
      [RentalStatus.Completed]: [],
      [RentalStatus.Cancelled]: [],
    };

    return transitions[currentStatus].includes(nextStatus);
  }

  private restoreBookCopy(book: Book): void {
    book.availableCopies = Math.min(book.availableCopies + 1, book.totalCopies);
    book.isAvailable = book.availableCopies > 0;
  }

  private validateRentalDates(dateStart: string, dateEnd: string): void {
    if (!this.isValidDateOnly(dateStart) || !this.isValidDateOnly(dateEnd)) {
      throw new BadRequestException(
        'Даты должны существовать и быть указаны в формате YYYY-MM-DD',
      );
    }

    const today = this.getTodayDate();

    if (dateStart < today) {
      throw new BadRequestException(
        'Дата начала бронирования не может быть в прошлом',
      );
    }

    if (dateEnd <= dateStart) {
      throw new BadRequestException(
        'Дата окончания должна быть позже даты начала',
      );
    }
  }

  private isValidDateOnly(value: string): boolean {
    const parsedDate = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(parsedDate.getTime()) &&
      parsedDate.toISOString().slice(0, 10) === value
    );
  }

  private getTodayDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
