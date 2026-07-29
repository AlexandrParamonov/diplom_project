import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { cancelMyRental, getMyRentals} from '../api/rentals';
import { getBookCoverUrl } from '../api/books';
import type { Rental, RentalStatus} from '../types/rental';

interface RentalsLocationState {
  message?: string;
}

const statusLabels: Record< RentalStatus, string > = {
  reserved: 'Забронировано',
  active: 'Книга выдана',
  completed: 'Завершено',
  cancelled: 'Отменено',
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(
    'ru-RU',
  ).format(
    new Date(`${value}T00:00:00`),
  );
}

function MyRentalsPage() {
  const location = useLocation();

  const locationState =
    location.state as
      | RentalsLocationState
      | null;

  const [rentals, setRentals] =
    useState<Rental[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState( locationState?.message ?? '');

  useEffect(() => {
    const loadRentals = async () => {
      try {
        const loadedRentals =
          await getMyRentals({
            limit: 100,
          });

        setRentals(loadedRentals);
      } catch (loadError: unknown) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить бронирования',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadRentals();
  }, []);

  const handleCancel = async (
    rental: Rental,
  ) => {
    const confirmed = window.confirm(
      `Отменить бронирование книги «${rental.book.title}»?`,
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccess('');
    setCancellingId(rental.id);

    try {
      const updatedRental =
        await cancelMyRental(rental.id);

      setRentals((current) =>
        current.map((item) =>
          item.id === updatedRental.id
            ? updatedRental
            : item,
        ),
      );

      setSuccess(
        'Бронирование успешно отменено',
      );
    } catch (cancelError: unknown) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : 'Не удалось отменить бронирование',
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <section className="rentals-page section">
      <div className="container">
        <p className="section__eyebrow">
          Личный кабинет
        </p>

        <h1 className="section__title">
          Мои бронирования
        </h1>

        {error && (
          <p
            className="admin-message admin-message--error"
            role="alert"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            className="admin-message admin-message--success"
            role="status"
          >
            {success}
          </p>
        )}

        {isLoading ? (
          <p>Загрузка бронирований...</p>
        ) : rentals.length === 0 ? (
          <div className="rental-empty">
            <h2>
              У вас пока нет бронирований
            </h2>

            <p>
              Выберите книгу в каталоге и
              укажите даты получения и возврата.
            </p>

            <Link
              className="button button--primary"
              to="/#books"
            >
              Перейти к книгам
            </Link>
          </div>
        ) : (
          <div className="rental-list">
            {rentals.map((rental) => {
              const coverUrl =
                getBookCoverUrl(
                  rental.book.coverImage,
                )
                ?? '/assets/books.svg';

              return (
                <article
                  className="rental-card"
                  key={rental.id}
                >
                  <img
                    className="rental-card__cover"
                    src={coverUrl}
                    alt={`Обложка книги «${rental.book.title}»`}
                  />

                  <div className="rental-card__content">
                    <div className="rental-card__heading">
                      <div>
                        <span className="rental-card__number">
                          Бронирование №
                          {rental.id}
                        </span>

                        <h2>
                          {rental.book.title}
                        </h2>
                      </div>

                      <span
                        className={
                          `rental-status rental-status--${rental.status}`
                        }
                      >
                        {
                          statusLabels[
                            rental.status
                          ]
                        }
                      </span>
                    </div>

                    <p>
                      <strong>Автор:</strong>{' '}
                      {rental.book.author}
                    </p>

                    <p>
                      <strong>
                        Библиотека:
                      </strong>{' '}
                      {rental.library.name}
                    </p>

                    <p>
                      <strong>Адрес:</strong>{' '}
                      {rental.library.address}
                    </p>

                    <p>
                      <strong>Период:</strong>{' '}
                      {formatDate(
                        rental.dateStart,
                      )}
                      {' — '}
                      {formatDate(
                        rental.dateEnd,
                      )}
                    </p>

                    <div className="rental-card__actions">
                      <Link
                        className="button button--secondary button--small"
                        to={`/books/${rental.bookId}`}
                      >
                        Открыть книгу
                      </Link>

                      {rental.status
                        === 'reserved' && (
                        <button
                          className="button button--danger button--small"
                          type="button"
                          disabled={
                            cancellingId
                            !== null
                          }
                          onClick={() => {
                            void handleCancel(
                              rental,
                            );
                          }}
                        >
                          {cancellingId
                          === rental.id
                            ? 'Отмена...'
                            : 'Отменить бронь'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default MyRentalsPage;
