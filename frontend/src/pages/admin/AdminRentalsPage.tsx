import { useEffect, useState } from 'react';
import { getAdminRentals, updateRentalStatus } from '../../api/rentals';
import type { Rental, RentalStatus } from '../../types/rental';

const statusLabels: Record<RentalStatus, string> = {
  reserved: 'Забронировано',
  active: 'Выдано',
  completed: 'Завершено',
  cancelled: 'Отменено',
};

const nextStatuses: Record<RentalStatus, RentalStatus[]> = {
  reserved: [
    'active',
    'cancelled',
  ],
  active: [
    'completed',
    'cancelled',
  ],
  completed: [],
  cancelled: [],
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(
    'ru-RU',
  ).format(
    new Date(`${value}T00:00:00`),
  );
}

function AdminRentalsPage() {
  const [rentals, setRentals] =
    useState<Rental[]>([]);

  const [statusFilter, setStatusFilter] =
    useState<RentalStatus | ''>('');

  const [isLoading, setIsLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] =
    useState('');

  useEffect(() => {
    let isCancelled = false;

    const loadRentals = async () => {
      try {
        const loadedRentals =
          await getAdminRentals({
            status:
              statusFilter || undefined,
            limit: 200,
          });

        if (!isCancelled) {
          setRentals(loadedRentals);
        }
      } catch (loadError: unknown) {
        if (!isCancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'Не удалось загрузить бронирования',
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadRentals();

    return () => {
      isCancelled = true;
    };
  }, [statusFilter]);

  const handleStatusChange = async (
    rental: Rental,
    status: RentalStatus,
  ) => {
    const confirmed = window.confirm(
      `Изменить статус бронирования №${rental.id} на «${statusLabels[status]}»?`,
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccess('');
    setUpdatingId(rental.id);

    try {
      const updatedRental =
        await updateRentalStatus(
          rental.id,
          status,
        );

      setRentals((current) =>
        current.map((item) =>
          item.id === updatedRental.id
            ? updatedRental
            : item,
        ),
      );

      setSuccess(
        `Статус бронирования №${rental.id} обновлён`,
      );
    } catch (updateError: unknown) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Не удалось изменить статус',
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <h2>Бронирования</h2>

          <p>
            Управление выдачей, возвратом и
            отменой бронирований.
          </p>
        </div>

        <label className="rental-filter">
          <span>Статус</span>

          <select
            value={statusFilter}
            onChange={(event) => {
              setError('');
              setSuccess('');
              setIsLoading(true);

              setStatusFilter(
                event.target.value as
                | RentalStatus
                | '',
              );
            }}
          >
            <option value="">
              Все статусы
            </option>

            <option value="reserved">
              Забронировано
            </option>

            <option value="active">
              Выдано
            </option>

            <option value="completed">
              Завершено
            </option>

            <option value="cancelled">
              Отменено
            </option>
          </select>
        </label>
      </div>

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
        <p className="admin-empty">
          Бронирования не найдены.
        </p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Пользователь</th>
                <th>Книга</th>
                <th>Библиотека</th>
                <th>Период</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id}>
                  <td>{rental.id}</td>

                  <td>
                    <strong>
                      {rental.user.name}
                    </strong>

                    <span className="admin-table__secondary">
                      {rental.user.email}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {rental.book.title}
                    </strong>

                    <span className="admin-table__secondary">
                      {rental.book.author}
                    </span>
                  </td>

                  <td>
                    {rental.library.name}
                  </td>

                  <td>
                    {formatDate(
                      rental.dateStart,
                    )}

                    <span className="admin-table__secondary">
                      до{' '}
                      {formatDate(
                        rental.dateEnd,
                      )}
                    </span>
                  </td>

                  <td>
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
                  </td>

                  <td>
                    <div className="admin-table__actions">
                      {nextStatuses[
                        rental.status
                      ].map((status) => (
                        <button
                          className={
                            status
                              === 'cancelled'
                              ? 'button button--danger button--small'
                              : 'button button--secondary button--small'
                          }
                          type="button"
                          key={status}
                          disabled={
                            updatingId
                            !== null
                          }
                          onClick={() => {
                            void handleStatusChange(
                              rental,
                              status,
                            );
                          }}
                        >
                          {updatingId
                            === rental.id
                            ? 'Сохранение...'
                            : statusLabels[
                            status
                            ]}
                        </button>
                      ))}

                      {nextStatuses[
                        rental.status
                      ].length === 0 && (
                          <span className="admin-table__secondary">
                            Изменение недоступно
                          </span>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminRentalsPage;
