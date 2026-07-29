import { NavLink, Outlet } from 'react-router-dom';

function AdminLayout() {
  const getLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    isActive
      ? 'admin-nav__link admin-nav__link--active'
      : 'admin-nav__link';

  return (
    <section className="admin-page section">
      <div className="container">
        <div className="admin-layout__header">
          <div>
            <p className="section__eyebrow">
              Управление каталогом
            </p>
            <h1 className="section__title">
              Административная панель
            </h1>
          </div>

          <nav
            className="admin-nav"
            aria-label="Административная навигация"
          >
            <NavLink className={getLinkClass} to="/admin" end>
              Обзор
            </NavLink>
            <NavLink
              className={getLinkClass}
              to="/admin/libraries"
            >
              Библиотеки
            </NavLink>
            <NavLink
              className={getLinkClass}
              to="/admin/books"
            >
              Книги
            </NavLink>
          </nav>
        </div>

        <Outlet />
      </div>
    </section>
  );
}

export default AdminLayout;
