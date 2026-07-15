import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

interface RegisterForm {
  name: string;
  email: string;
  contactPhone: string;
  password: string;
}

const initialForm: RegisterForm = {
  name: '',
  email: '',
  contactPhone: '',
  password: '',
};

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] =
    useState<RegisterForm>(initialForm);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        contactPhone:
          form.contactPhone.trim() || undefined,
      });

      await login({
        email: form.email,
        password: form.password,
      });

      navigate('/');
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось выполнить регистрацию',
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
        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <h1>Регистрация</h1>

          {error && (
            <p className="auth-form__message auth-form__message--error">
              {error}
            </p>
          )}

          <label htmlFor="register-name">ФИО</label>
          <input
            id="register-name"
            type="text"
            placeholder="Иванов Иван Иванович"
            autoComplete="name"
            minLength={2}
            required
            value={form.name}
            onChange={(event) =>
              setForm({
                ...form,
                name: event.target.value,
              })
            }
          />

          <label htmlFor="register-email">Почта</label>
          <input
            id="register-email"
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

          <label htmlFor="register-phone">Телефон</label>
          <input
            id="register-phone"
            type="tel"
            placeholder="+7 900 000-00-00"
            autoComplete="tel"
            value={form.contactPhone}
            onChange={(event) =>
              setForm({
                ...form,
                contactPhone: event.target.value,
              })
            }
          />

          <label htmlFor="register-password">Пароль</label>
          <input
            id="register-password"
            type="password"
            placeholder="Минимум 6 символов"
            autoComplete="new-password"
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
            disabled={isSubmitting}>

            {isSubmitting
              ? 'Регистрация...'
              : 'Зарегистрироваться'}
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