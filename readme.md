# Library Aggregator

Дипломный проект по курсу **«Fullstack-разработчик на JavaScript»** (Нетология).

---

## Описание проекта

Library Aggregator — веб-приложение для поиска и бронирования книг в городских библиотеках.

Пользователь сможет:

- искать книги;
- просматривать информацию о книге;
- выбирать библиотеку;
- бронировать книги;
- просматривать свои бронирования;
- общаться со службой поддержки.

Проект разрабатывается поэтапно.

---

# Технологии

## Frontend

- React
- TypeScript
- Vite
- React Router
- CSS

## Backend

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Docker Compose
- class-validator
- bcrypt

---

# Структура проекта

``` text
library-aggregator
│
├── frontend
│   ├── public
│   └── src
│       ├── components
│       ├── data
│       ├── pages
│       └── types
│
├── backend
│   └── src
│       ├── users
│       │   ├── dto
│       │   ├── entities
│       │   ├── users.controller.ts
│       │   ├── users.module.ts
│       │   └── users.service.ts
│       ├── app.module.ts
│       └── main.ts
│
├── docker-compose.yaml
├── .env-example
├── .gitignore
├── package.json
└── README.md
```

---

# Что реализовано

## Этап 1. Каркас проекта и базовый frontend

✔ Создан монорепозиторий

✔ Настроен React + Vite + TypeScript

✔ Настроен NestJS

✔ Подключен React Router

✔ Создана базовая структура проекта

✔ Реализована главная страница

✔ Реализованы страницы:

- Главная
- Книга
- Авторизация
- Регистрация
- 404

✔ Созданы переиспользуемые компоненты:

- Header
- Footer
- SearchForm
- BookCard
- BookSection

✔ Добавлены временные данные книг

✔ Реализован поиск по локальному массиву

---

## Этап 2. PostgreSQL и модуль пользователей

✔ Установлен и настроен Docker

✔ Добавлен `docker-compose.yaml` для запуска PostgreSQL

✔ Backend подключен к PostgreSQL через TypeORM

✔ Добавлен глобальный префикс API `/api`

✔ Подключен `ValidationPipe`

✔ Создан модуль пользователей `UsersModule`

✔ Создана сущность `User`

✔ Реализовано создание пользователя

✔ Реализован поиск пользователей

✔ Реализовано получение пользователя по id

✔ Пароль сохраняется в базе в виде хеша

✔ `passwordHash` не возвращается в API-ответах

---

# API пользователей

Пока API пользователей не защищён авторизацией. Защита будет добавлена на следующих этапах.

## Создание пользователя

```http
POST /api/admin/users
```

Пример тела запроса:

```json
{
  "email": "admin@example.com",
  "password": "123456",
  "name": "Константин Пахомов",
  "contactPhone": "+79000000000",
  "role": "admin"
}
```

## Получение списка пользователей

```http
GET /api/admin/users
```

Доступные query-параметры:

- limit
- offset
- email
- name
- contactPhone

Пример:

```bash
curl "http://localhost:3000/api/admin/users?email=admin"
```

## Получение пользователя по id

```http
GET /api/admin/users/:id
```

Пример:

```bash
curl http://localhost:3000/api/admin/users/1
```

---

# Запуск

## Установка зависимостей

Из корня проекта:

```bash
npm install
```

Если нужно установить зависимости отдельно:

```bash
npm install --prefix frontend
npm install --prefix backend
```

---

## Переменные окружения

В корне проекта нужно создать файл `.env` на основе `.env-example`.

Пример локального `.env`:

```env
HTTP_HOST=localhost
HTTP_PORT=3000

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=library

FRONTEND_URL=http://localhost:5173
```

Файл `.env` не должен попадать в Git.

---

## Запуск PostgreSQL

Из корня проекта:

```bash
docker compose up -d
```

Проверить состояние контейнера:

```bash
docker compose ps
```

Остановить контейнер:

```bash
docker compose down
```

---

## Запуск frontend

```bash
cd frontend
npm install
npm run dev
```

## Запуск Backend

```bash
cd backend
npm install
npm run start:dev
```
## Запуск frontend и backend одновременно

Из корня проекта:

```bash
npm run dev
```

---

# Адреса приложения

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:3000/api
```

---

# Проверка проекта

Из корня проекта:

```bash
npm run build
npm run lint
npm run test
```

---
# Работа с PostgreSQL вручную

Подключиться к базе:

```bash
docker exec -it library-postgres psql -U postgres -d library
```

Посмотреть пользователей:

```sql
select id, email, name, role from users;
```

Удалить пользователя по id:

```sql
delete from users where id = 1;
```

Очистить таблицу пользователей и сбросить id:

```sql
truncate table users restart identity cascade;
```

Выйти из psql:

```sql
\q
```

---

# Следующий этап

Авторизация и регистрация.

Нужно реализовать:

- регистрацию клиента;
- вход пользователя;
- выход пользователя;
- получение текущего пользователя;
- работу с cookies и sessions;
- защиту API по ролям;
- подключение frontend-форм входа и регистрации к backend.

После этого будет реализован модуль библиотек и книг. На этом этапе локальный массив книг во frontend будет заменён на API.

---

# Автор

Александр Парамонов

Дипломный проект Нетологии.