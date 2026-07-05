import { Link } from 'react-router-dom';

function RegisterPage() {
  return (
    <section className="auth-page section">
      <div className="container auth-page__container">
        <form
          className="auth-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <h1>Регистрация</h1>

          <label htmlFor="register-name">ФИО</label>
          <input
            id="register-name"
            type="text"
            placeholder="Иванов Иван Иванович"
          />

          <label htmlFor="register-email">Почта</label>
          <input
            id="register-email"
            type="email"
            placeholder="ivanov@mail.com"
          />

          <label htmlFor="register-phone">Телефон</label>
          <input
            id="register-phone"
            type="tel"
            placeholder="+7 900 000-00-00"
          />

          <label htmlFor="register-password">Пароль</label>
          <input
            id="register-password"
            type="password"
            placeholder="Введите пароль"
          />

          <button className="button button--primary" type="submit">
            Зарегистрироваться
          </button>

          <p>
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default RegisterPage;