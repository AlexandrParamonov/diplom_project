import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="not-found section">
      <div className="container not-found__container">
        <span className="not-found__code">404</span>
        <h1>Страница не найдена</h1>
        <p>Возможно, страница была удалена или её адрес указан неверно.</p>

        <Link className="button button--primary" to="/">
          На главную
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;