import { Link } from 'react-router-dom';
import type { Book } from '../types/book';

interface BookCardProps {
  book: Book;
}

function BookCard({ book }: BookCardProps) {
  return (
    <article className="book-card">
      <img
        className="book-card__cover"
        src={book.coverImage}
        alt={`Обложка книги «${book.title}»`}
      />

      <div className="book-card__content">
        <h3 className="book-card__title">{book.title}</h3>

        <p className="book-card__meta">
          <strong>Автор:</strong> {book.author}
        </p>

        <p className="book-card__meta">
          <strong>Год:</strong> {book.year}
        </p>

        <p className="book-card__description">{book.description}</p>

        <p className="book-card__availability">
          Доступна в библиотеках: {book.availableIn}
        </p>

        <Link className="button button--primary book-card__button" to={`/books/${book.id}`}>
          Подробнее
        </Link>
      </div>
    </article>
  );
}

export default BookCard;