import { useMemo, useState } from 'react';
import BookSection from '../components/BookSection';
import SearchForm from '../components/SearchForm';
import type { SearchValues } from '../components/SearchForm';
import { books } from '../data/books';

const emptySearch: SearchValues = {
  title: '',
  author: '',
  dateStart: '',
  dateEnd: '',
};

function HomePage() {
  const [search, setSearch] = useState<SearchValues>(emptySearch);

  const featuredBooks = useMemo(() => books.filter((book) => book.category === 'featured'), []);
  const newBooks = useMemo(() => books.filter((book) => book.category === 'new'), []);

  const normalizedTitle = search.title.trim().toLowerCase();
  const normalizedAuthor = search.author.trim().toLowerCase();

  const hasSearch = Boolean(normalizedTitle || normalizedAuthor);

  const filteredBooks = useMemo(() => books.filter((book) => {
    const matchesTitle = book.title.toLowerCase().includes(normalizedTitle);
    const matchesAuthor = book.author.toLowerCase().includes(normalizedAuthor);

    return matchesTitle && matchesAuthor;
  }),
    [normalizedAuthor, normalizedTitle],
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
      ) : (
        <BookSection
          id="books"
          title="Выбор редакции"
          books={featuredBooks}
        />
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

      {!hasSearch && (
        <BookSection title="Новые поступления" books={newBooks} />
      )}

      <section className="libraries section">
        <div className="container">
          <p className="section__eyebrow">Рядом с вами</p>
          <h2 className="section__title">Популярные библиотеки</h2>

          <div className="library-grid">
            <article className="library-card">
              <h3>Библиотека им. Н. А. Некрасова</h3>
              <p>ул. Бауманская, д. 58/25</p>
              <span>Доступно более 15 000 книг</span>
            </article>

            <article className="library-card">
              <h3>Библиотека-читальня им. И. С. Тургенева</h3>
              <p>Бобров переулок, д. 6</p>
              <span>Доступно более 10 000 книг</span>
            </article>

            <article className="library-card">
              <h3>Центральная детская библиотека</h3>
              <p>Большая Черкизовская ул., д. 4</p>
              <span>Доступно более 8 000 книг</span>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;