import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBookById, getBookCoverUrl } from '../api/books';
import type { Book } from '../types/book';

function BookPage() {
  const { id } = useParams<{ id: string }>();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

          <button className="button button--primary" type="button"  disabled={!isBookAvailable}>
             {isBookAvailable ? 'Забронировать' : 'Нет доступных экземпляров'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default BookPage;