import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Header() {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth();

  const getLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    isActive
      ? 'header__link header__link--active'
      : 'header__link';
  const getAdminLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    isActive
      ? 'header__admin-link header__admin-link--active'
      : 'header__admin-link';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header__container">
        <Link className="logo header__logo" to="/">
          КнигоПоиск
        </Link>

        <nav className="header__navigation" aria-label="Основная навигация">
          <NavLink className={getLinkClass} to="/" end
            onClick={() => {
              requestAnimationFrame(() => {
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
              });
            }}>
            Главная
          </NavLink>

          <Link className="header__link" to="/#books">
            Книги
          </Link>
          <Link className="header__link" to="/#libraries">
            Библиотеки
          </Link>

          <Link className="header__link" to="/#about">
            О нас
          </Link>

          <Link className="header__link" to="/#contacts">
            Контакты
          </Link>
          {user?.role === 'client' && (
            <>
              <NavLink
                className={getLinkClass}
                to="/rentals"
              >
                Мои бронирования
              </NavLink>
              <NavLink
                className={getLinkClass}
                to="/support"
              >
                Поддержка
              </NavLink>
            </>
          )}

          {user?.role === 'admin' && (
            <NavLink
              className={getAdminLinkClass}
              to="/admin"
            >
              Панель администрирования
            </NavLink>
          )}
        </nav>

        <div className="header__auth">
          {isLoading ? (
            <span className="header__loading">
              Загрузка...
            </span>
          ) : user ? (
            <>
              <div className="header__profile">
                <span className="header__user">
                  {user.name}
                </span>

                <span className="header__role">
                  {user.role === 'admin'
                    ? 'Администратор'
                    : user.role === 'manager'
                      ? 'Менеджер'
                      : 'Читатель'}
                </span>
              </div>

              <button
                className="button button--secondary header__logout"
                type="button"
                onClick={() => {
                  void handleLogout();
                }}
              >
                Выйти
              </button>
            </>
          ) : (
            <NavLink className="button button--secondary" to="/login">
              Войти
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;