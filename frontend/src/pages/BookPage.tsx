import { Link, useParams } from 'react-router-dom';
import { books } from '../data/books';
import NotFoundPage from './NotFoundPage';

function BookPage() {
  const { id } = useParams();

  const book = books.find((item) => item.id === Number(id));

  if (!book) {
    return <NotFoundPage />;
  }

  return (
    <section className="book-details section">
      <div className="container book-details__container">
        <img
          className="book-details__cover"
          src={book.coverImage}
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

          <p>
            <strong>Год издания:</strong> {book.year}
          </p>

          <p>
            <strong>Доступна в библиотеках:</strong> {book.availableIn}
          </p>

          <p className="book-details__description">{book.description}</p>

          <button className="button button--primary" type="button">
            Забронировать
          </button>
        </div>
      </div>
    </section>
  );
}

export default BookPage;