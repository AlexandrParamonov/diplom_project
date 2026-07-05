import { Link, NavLink } from 'react-router-dom';

function Header() {
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'header__link header__link--active' : 'header__link';

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

          <a className="header__link" href="/#books">
            Книги
          </a>

          <a className="header__link" href="/#about">
            О нас
          </a>

          <a className="header__link" href="/#contacts">
            Контакты
          </a>
        </nav>

        <NavLink className="button button--secondary" to="/login">
          Войти
        </NavLink>
      </div>
    </header>
  );
}

export default Header;