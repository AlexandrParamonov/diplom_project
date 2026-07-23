import { useEffect, useMemo, useState } from 'react';
import { getBooks } from '../api/books';
import { getLibraries } from '../api/libraries';
import BookSection from '../components/BookSection';
import SearchForm from '../components/SearchForm';
import type { SearchValues } from '../components/SearchForm';
import type { Book } from '../types/book';
import type { Library } from '../types/library';


const emptySearch: SearchValues = {
  title: '',
  author: '',
  dateStart: '',
  dateEnd: '',
};

function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [search, setSearch] = useState<SearchValues>(emptySearch);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [
          loadedBooks,
          loadedLibraries,
        ] = await Promise.all([
          getBooks({
            limit: 100,
          }),
          getLibraries(),
        ]);

        setBooks(loadedBooks);
        setLibraries(loadedLibraries);
      } catch (error: unknown) {
        setLoadError(
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить каталог',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadCatalog();
  }, []);

  const featuredBooks = useMemo(() => books.slice(0, 3), [books]);
  const newBooks = useMemo(() => books.slice(3, 6), [books]);
  const librariesWithStats = useMemo(
    () =>
      libraries.map((library) => {
        const libraryBooks = books.filter(
          (book) => book.libraryId === library.id,
        );

        const availableCopies = libraryBooks.reduce(
          (total, book) =>
            total + book.availableCopies,
          0,
        );

        return {
          ...library,
          booksCount: libraryBooks.length,
          availableCopies,
        };
      }),
    [books, libraries],
  );
  const normalizedTitle = search.title.trim().toLowerCase();
  const normalizedAuthor = search.author.trim().toLowerCase();

  const hasSearch = Boolean(normalizedTitle || normalizedAuthor);

  const filteredBooks = useMemo(() => books.filter((book) => {
    const matchesTitle = book.title.toLowerCase().includes(normalizedTitle);
    const matchesAuthor = book.author.toLowerCase().includes(normalizedAuthor);

    return matchesTitle && matchesAuthor;
  }),
    [books, normalizedAuthor, normalizedTitle],
  );

  return (
    <>
      <section className="hero">
        <div className="container hero__container">
          <div className="hero__content">
            <p className="hero__eyebrow">Библиотеки Москвы в одном сервисе</p>

            <h1 className="hero__title">
              Найдите и забронируйте нужную книгу
            </h1>

            <p className="hero__description">
              Выполните поиск по названию или автору, выберите библиотеку и
              забронируйте книгу на удобные даты.
            </p>

            <SearchForm onSearch={setSearch} />
          </div>

          <div className="hero__illustration">
            <img src="/assets/books.svg" alt="Стопка книг" />
          </div>
        </div>
      </section>
      {isLoading && (
        <section className="section">
          <div className="container">
            <p>Загрузка книг...</p>
          </div>
        </section>
      )}

      {loadError && (
        <section className="section">
          <div className="container">
            <p className="auth-form__message auth-form__message--error">
              {loadError}
            </p>
          </div>
        </section>
      )}

      {!isLoading && !loadError && (
        <>
          {hasSearch ? (
            filteredBooks.length > 0 ? (
              <BookSection
                id="books"
                title={`Найдено книг: ${filteredBooks.length}`}
                books={filteredBooks}
              />
            ) : (
              <section className="empty-result section" id="books">
                <div className="container empty-result__container">
                  <h2>По вашему запросу ничего не найдено</h2>

                  <p>
                    Проверьте правильность названия или попробуйте изменить параметры поиска.
                  </p>
                </div>
              </section>
            )
          ) : featuredBooks.length > 0 ? (
            <BookSection
              id="books"
              title="Выбор редакции"
              books={featuredBooks}
            />
          ) : (
            <section
              className="empty-result section"
              id="books"
            >
              <div className="container empty-result__container">
                <h2>В каталоге пока нет книг</h2>

                <p>
                  Книги появятся после добавления
                  администратором.
                </p>
              </div>
            </section>
          )}
        </>
      )}

      <section className="about section" id="about">
        <div className="container about__container">
          <div className="about__content">
            <p className="section__eyebrow">О сервисе</p>

            <h2 className="section__title">
              Все городские библиотеки в одном каталоге
            </h2>

            <p>
              КнигоПоиск помогает находить книги в библиотеках города без
              необходимости просматривать сайты каждого учреждения отдельно.
            </p>

            <p>
              Вы сможете узнать, где находится нужное издание, проверить
              доступность экземпляров и оформить бронирование.
            </p>
          </div>

          <img
            className="about__image"
            src="/assets/stack-of-books-2.svg"
            alt="Книги и листья"
          />
        </div>
      </section>

      {isLoading
        && !loadError
        && !hasSearch
        && newBooks.length > 0 && (
          <BookSection title="Новые поступления" books={newBooks} />
        )}

      <section className="libraries section" id="libraries">
        <div className="container">
          <p className="section__eyebrow">
            Библиотеки каталога
          </p>

          <h2 className="section__title">
            Доступные библиотеки
          </h2>

          {!isLoading
            && !loadError
            && librariesWithStats.length > 0 && (
              <div className="library-grid">
                {librariesWithStats.map((library) => (
                  <article
                    className="library-card"
                    key={library.id}
                  >
                    <h3>{library.name}</h3>

                    <p>{library.address}</p>

                    {library.description && (
                      <p>{library.description}</p>
                    )}

                    <span>
                      Книг в каталоге: {library.booksCount}.
                      Доступно экземпляров:{' '}
                      {library.availableCopies}
                    </span>
                  </article>
                ))}
              </div>
            )}

          {!isLoading
            && !loadError
            && librariesWithStats.length === 0 && (
              <div className="empty-result__container">
                <p>
                  Библиотеки пока не добавлены.
                </p>
              </div>
            )}
        </div>
      </section>
    </>
  );
}

export default HomePage;