import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LoginForm {
  email: string;
  password: string;
}

const initialForm: LoginForm = {
  email: '',
  password: '',
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState<LoginForm>(initialForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await login(form);
      navigate('/');
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось выполнить вход',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    void submit();
  };

  return (
    <section className="auth-page section">
      <div className="container auth-page__container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Вход</h1>
          {error && (
            <p className="auth-form__message auth-form__message--error">
              {error}
            </p>
          )}

          <label htmlFor="login-email">Почта</label>
          <input
            id="login-email"
            type="email"
            placeholder="ivanov@mail.com"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) =>
              setForm({
                ...form,
                email: event.target.value,
              })
            }
          />

          <label htmlFor="login-password">Пароль</label>
          <input
            id="login-password"
            type="password"
            placeholder="Введите пароль"
            autoComplete="current-password"
            minLength={6}
            required
            value={form.password}
            onChange={(event) =>
              setForm({
                ...form,
                password: event.target.value,
              })
            }
          />

          <button className="button button--primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Выполняется вход...' : 'Войти'}
          </button>

          <p>
            Нет аккаунта? {' '}
            <Link to="/register">Зарегистрироваться</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default LoginPage;