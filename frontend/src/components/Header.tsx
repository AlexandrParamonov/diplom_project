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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header__container">
        <Link className="logo" to="/">
          КнигоПоиск
        </Link>

        <nav className="header__navigation" aria-label="Основная навигация">
          <NavLink className={getLinkClass} to="/" end>
            Главная
          </NavLink>

          <Link className="header__link" to="/#books">
            Книги
          </Link>
          <Link className="header__link" to="/#libraries"
          >
              Библиотеки
          </Link>
          
          <Link className="header__link" to="/#about">
            О нас
          </Link>

          <Link className="header__link" to="/#contacts">
            Контакты
          </Link>
        </nav>

        <div className="header__auth">
          {isLoading ? (
            <span className="header__loading">
              Загрузка...
            </span>
          ) : user ? (
            <>
              <span className="header__user">
                {user.name}
              </span>

              <button
                className="button button--secondary"
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