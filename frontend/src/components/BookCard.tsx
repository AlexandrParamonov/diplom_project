import { Link } from 'react-router-dom';
import { getBookCoverUrl } from '../api/books';
import type { Book } from '../types/book';

interface BookCardProps {
  book: Book;
}

function BookCard({ book }: BookCardProps) {
  const coverUrl = getBookCoverUrl(book.coverImage) ?? '/assets/books.svg';
  return (
    <article className="book-card">
      <img
        className="book-card__cover"
        src={coverUrl}
        alt={`Обложка книги «${book.title}»`}
      />

      <div className="book-card__content">
        <h3 className="book-card__title">{book.title}</h3>

        <p className="book-card__meta">
          <strong>Автор:</strong> {book.author}
        </p>
        {book.year !== null && (
        <p className="book-card__meta">
          <strong>Год:</strong> {book.year}
        </p>
        )}
         <p className="book-card__meta">
          <strong>Библиотека:</strong>{' '}
          {book.library.name}
        </p>

        <p className="book-card__description">{book.description ?? 'Описание отсутствует'}</p>

        <p className="book-card__availability">
          Доступно экземпляров: {book.availableCopies}
        </p>

        <Link className="button button--primary book-card__button" to={`/books/${book.id}`}>
          Подробнее
        </Link>
      </div>
    </article>
  );
}

export default BookCard;