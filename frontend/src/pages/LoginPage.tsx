import { Link } from 'react-router-dom';

function LoginPage() {
  return (
    <section className="auth-page section">
      <div className="container auth-page__container">
        <form
          className="auth-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <h1>Вход</h1>

          <label htmlFor="login-email">Почта</label>
          <input
            id="login-email"
            type="email"
            placeholder="ivanov@mail.com"
          />

          <label htmlFor="login-password">Пароль</label>
          <input
            id="login-password"
            type="password"
            placeholder="Введите пароль"
          />

          <button className="button button--primary" type="submit">
            Войти
          </button>

          <p>
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;