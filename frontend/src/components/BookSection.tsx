import BookCard from './BookCard';
import type { Book } from '../types/book';

interface BookSectionProps {
  title: string;
  books: Book[];
  id?: string;
}

function BookSection({ title, books, id }: BookSectionProps) {
  return (
    <section className="book-section section" id={id}>
      <div className="container">
        <h2 className="section__title">{title}</h2>

        <div className="book-grid">
          {books.map((book) => (
            <BookCard book={book} key={book.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default BookSection;