import { Link } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

function AdminPage() {
  const { user } = useAuth();

  return (
    <div className="admin-dashboard">
      <article className="admin-card">
        <h2>Библиотеки</h2>

        <p>
          Добавление, редактирование и
          удаление библиотек каталога.
        </p>

        <Link
          className="button button--primary"
          to="/admin/libraries"
        >
          Управлять библиотеками
        </Link>
      </article>

      <article className="admin-card">
        <h2>Книги</h2>

        <p>
          Управление книгами,
          экземплярами и обложками.
        </p>

        <Link
          className="button button--primary"
          to="/admin/books"
        >
          Управлять книгами
        </Link>
      </article>

      <article className="admin-card">
        <h2>Бронирования</h2>

        <p>
          Подтверждение выдачи,
          завершение и отмена броней.
        </p>

        <Link
          className="button button--primary"
          to="/admin/rentals"
        >
          Управлять бронированиями
        </Link>
      </article>

      <article className="admin-card">
        <h2>Текущий администратор</h2>

        <p>{user?.name}</p>

        <span>{user?.email}</span>
      </article>
    </div>
  );
}

export default AdminPage;
