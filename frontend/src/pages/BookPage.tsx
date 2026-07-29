import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getBookById, getBookCoverUrl } from '../api/books';
import { createRental } from '../api/rentals';
import { useAuth } from '../hooks/useAuth';
import type { Book } from '../types/book';

interface RentalDates {
  dateStart: string;
  dateEnd: string;
}
function formatInputDate(
  date: Date,
): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0');
  const day = String(
    date.getDate(),
  ).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function addDays(
  dateValue: string,
  days: number,
): string {
  const [
    year,
    month,
    day,
  ] = dateValue
    .split('-')
    .map(Number);
  const date = new Date(
    year,
    month - 1,
    day,
  );
  date.setDate(
    date.getDate() + days,
  );
  return formatInputDate(date);
}
function createInitialDates(): RentalDates {
  const today = formatInputDate(
    new Date(),
  );
  return {
    dateStart: today,
    dateEnd: addDays(today, 14),
  };
}

function BookPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [dates, setDates] = useState<RentalDates>( createInitialDates );
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');
   const [rentalError, setRentalError] = useState('');


  useEffect(() => {
    const loadBook = async () => {
      const bookId = Number(id);

      if (
        !Number.isInteger(bookId)
        || bookId < 1
      ) {
        setError(
          'Некорректный идентификатор книги',
        );
        setIsLoading(false);
        return;
      }

      try {
        const loadedBook =
          await getBookById(bookId);

        setBook(loadedBook);
      } catch (loadError: unknown) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить книгу',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadBook();
  }, [id]);
   const handleDateStartChange = (
    dateStart: string,
  ) => {
    setDates((current) => ({
      dateStart,
      dateEnd:
        current.dateEnd <= dateStart
          ? addDays(dateStart, 14)
          : current.dateEnd,
    }));
  };
  const submitRental = async () => {
    if (!book) {
      return;
    }
    if (!user) {
      navigate('/login', {
        state: {
          from: location.pathname,
        },
      });
      return;
    }
    if (user.role !== 'client') {
      setRentalError(
        'Бронирование доступно только пользователям с ролью client',
      );
      return;
    }
    setRentalError('');
    setIsBooking(true);
    try {
      await createRental({
        bookId: book.id,
        dateStart: dates.dateStart,
        dateEnd: dates.dateEnd,
      });
      navigate('/rentals', {
        state: {
          message:
            `Книга «${book.title}» успешно забронирована`,
        },
      });
    } catch (bookingError: unknown) {
      setRentalError(
        bookingError instanceof Error
          ? bookingError.message
          : 'Не удалось забронировать книгу',
      );
    } finally {
      setIsBooking(false);
    }
  };
  const handleRentalSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    void submitRental();
  };

  if (isLoading) {
    return (
      <section className="book-details section">
        <div className="container">
          <p>Загрузка книги...</p>
        </div>
      </section>
    );
  }

  if (error || !book) {
    return (
      <section className="book-details section">
        <div className="container">
          <Link className="back-link" to="/">
            ← Вернуться к каталогу
          </Link>

          <h1>Книга не найдена</h1>

          <p>
            {error || 'Запрашиваемая книга отсутствует'}
          </p>
        </div>
      </section>
    );
  }

  const coverUrl = getBookCoverUrl(book.coverImage) ?? '/assets/books.svg';
  const isBookAvailable = book.isAvailable && book.availableCopies > 0;
  const today = formatInputDate(new Date());
  const minimumEndDate = addDays(dates.dateStart, 1);

  return (
    <section className="book-details section">
      <div className="container book-details__container">
        <img
          className="book-details__cover"
          src={coverUrl}
          alt={`Обложка книги «${book.title}»`}
        />

        <div className="book-details__content">
          <Link className="back-link" to="/">
            ← Вернуться к каталогу
          </Link>

          <h1>{book.title}</h1>

          <p>
            <strong>Автор:</strong> {book.author}
          </p>
          {book.year !== null && (
            <p>
              <strong>Год издания:</strong> {book.year}
            </p>
          )}
          <p>
            <strong>Библиотека:</strong>{' '}
            {book.library.name}
          </p>

          <p>
            <strong>Адрес:</strong>{' '}
            {book.library.address}
          </p>

          <p>
            <strong>Всего экземпляров:</strong>{' '}
            {book.totalCopies}
          </p>
          <p>
            <strong>Доступно экземпляров:</strong> {book.availableCopies}
          </p>

          <p className="book-details__description">{book.description ?? 'Описание отсутствует'}</p>

          {!isBookAvailable ? (
            <p className="admin-message admin-message--error">
              Сейчас нет доступных
              экземпляров этой книги.
            </p>
          ) : user
            && user.role !== 'client' ? (
            <p className="admin-message">
              Бронирование доступно только
              читателям с ролью client.
            </p>
          ) : (
            <form
              className="rental-booking"
              onSubmit={handleRentalSubmit}
            >
              <h2>
                Забронировать книгу
              </h2>
              <p>
                Выберите предполагаемые даты
                получения и возврата.
              </p>
              {rentalError && (
                <p
                  className="admin-message admin-message--error"
                  role="alert"
                >
                  {rentalError}
                </p>
              )}
              <div className="rental-booking__dates">
                <label>
                  <span>Дата получения</span>
                  <input
                    type="date"
                    min={today}
                    required
                    value={
                      dates.dateStart
                    }
                    onChange={(event) =>
                      handleDateStartChange(
                        event.target.value,
                      )
                    }
                  />
                </label>
                <label>
                  <span>Дата возврата</span>
                  <input
                    type="date"
                    min={minimumEndDate}
                    required
                    value={dates.dateEnd}
                    onChange={(event) =>
                      setDates({
                        ...dates,
                        dateEnd:
                          event.target.value,
                      })
                    }
                  />
                </label>
              </div>
              
              <button
                className="button button--primary"
                type="submit"
                disabled={isBooking}
              >
                {isBooking
                  ? 'Бронирование...'
                  : user
                    ? 'Подтвердить бронирование'
                    : 'Войти и забронировать'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default BookPage;