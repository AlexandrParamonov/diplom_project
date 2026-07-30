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
- просматривать и отменять свои бронирования;
- создавать обращения в службу поддержки;
- общаться со службой поддержки в режиме реального времени;
- просматривать историю переписки.

Администратор может:
- управлять библиотеками и книгами;
- загружать, заменять и удалять обложки;
- управлять количеством экземпляров;
- просматривать все бронирования;
- менять статусы бронирований;
- просматривать обращения пользователей;
- отвечать на обращения и менять их статус.

---

# Технологии

## Frontend

- React
- TypeScript
- Vite
- React Router
- Context API
- CSS
- Socket.IO Client;

## Backend

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- Docker Compose
- Passport.js
- express-session
- class-validator
- class-transformer
- bcrypt
- Multer для загрузки обложек
- Socket.IO;
- WebSocket Gateway.

---

# Структура проекта

``` text
library-aggregator
│
├── frontend
│   ├── public
│   └── src
│   ├── api
│       ├── components
│       ├── context
│       ├── hooks
│       ├── layouts
│       ├── pages
│       │   └── admin
│       └── types
│
├── backend
│   └── src
│       ├── auth
│       │   ├── decorators
│       │   ├── guards
│       │   ├── interfaces
│       │   ├── strategies
│       │   ├── auth.controller.ts
│       │   ├── auth.module.ts
│       │   └── auth.service.ts
│       ├── libraries
│       │   ├── controllers
│       │   ├── dto
│       │   ├── entities
│       │   └── utils
│       ├── rentals
│       │   ├── controllers
│       │   ├── dto
│       │   └── entities
│       ├── users
│       │   ├── dto
│       │   ├── entities
│       │   ├── users.controller.ts
│       │   ├── users.module.ts
│       │   └── users.service.ts
│       ├── support
│       │   ├── controllers
│       │   ├── dto
│       │   ├── entities
│       │   ├── support.gateway.ts
│       │   ├── support.module.ts
│       │   └── support.service.ts
│       ├── websocket
│       │   └── session-io.adapter.ts
│       ├── app.module.ts
│       └── main.ts
│
├── uploads/
│   └── covers/
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

✔ Реализован адаптивный интерфейс каталога

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

✔ Добавлен DTO ответа пользователя

✔ Поле `passwordHash` скрыто с помощью `class-transformer`

✔ `passwordHash` не возвращается в API-ответах

---

## Этап 3. Авторизация и регистрация

✔ Создан модуль авторизации `AuthModule`

✔ Подключен Passport.js

✔ Подключена локальная стратегия авторизации

✔ Добавлены серверные сессии через `express-session`

✔ Сессия пользователя сохраняется в cookie

✔ Реализована регистрация пользователя с ролью `client`

✔ Реализован вход пользователя

✔ Реализован выход пользователя

✔ Реализовано получение текущего пользователя

✔ Добавлена защита маршрутов с помощью guard

✔ Созданы `LocalAuthGuard` и `SessionAuthGuard`

✔ Добавлена сериализация и десериализация пользователя

✔ Frontend подключен к API авторизации

✔ Формы входа и регистрации отправляют данные на backend

✔ После регистрации пользователь автоматически входит в систему

✔ Состояние авторизации сохраняется после обновления страницы

✔ В шапке отображается имя авторизованного пользователя

✔ Реализована кнопка выхода

✔ API-запросы отправляются с параметром `credentials: 'include'`

## Этап 4. Библиотеки и каталог книг

✔ Создан модуль библиотек и книг;

✔ Добавлены сущности `Library` и `Book`;

✔ Реализовано хранение библиотек и книг в PostgreSQL;

✔ Добавлены публичные маршруты для получения библиотек и книг;

✔ Добавлены административные маршруты для создания библиотек и книг;

✔ Административные маршруты защищены сессионной авторизацией и проверкой роли;

✔ Реализована загрузка обложек книг;

✔ Загруженные файлы доступны по маршруту `/uploads`;

✔ Frontend получает каталог через backend API;

✔ Удалён локальный массив книг `frontend/src/data/books.ts`;

✔ Главная страница динамически загружает книги и библиотеки;

✔ Страница книги загружает данные по идентификатору;

✔ Отображаются общее и доступное количество экземпляров;

✔ Реализован поиск по загруженному каталогу;

✔ Для демонстрации используются тестовые библиотеки города Тулы и тестовый набор книг.

## Этап 5. Бронирование книг

✔ Создана сущность BookRental;

✔ Добавлены статусы reserved, active, completed, cancelled;

✔ Создание бронирования выполняется в транзакции;

✔ При бронировании доступное количество уменьшается;

✔ При отмене или завершении экземпляр возвращается;

✔ Нельзя забронировать книгу без доступных экземпляров;

✔ Нельзя создать второе активное бронирование той же книги;

✔ Клиент видит только свои бронирования;

✔ Администратор видит все бронирования;

✔ Реализованы страницы /rentals и /admin/rentals.

## Этап 6. Чат технической поддержки

✔ Созданы сущности:

- `SupportChat`;
- `SupportMessage`.

✔ Добавлены статусы обращения:

- `open`;
- `in_progress`;
- `closed`.

✔ История сообщений хранится в PostgreSQL.

✔ Клиент может создать обращение.

✔ Первое сообщение сохраняется вместе с обращением в транзакции.

✔ Клиент видит только собственные обращения.

✔ Клиент может отправлять сообщения и закрывать обращение.

✔ Администратор и менеджер видят все обращения.

✔ Администратор и менеджер могут отвечать клиентам.

✔ При первом ответе сотрудника обращение получает статус `in_progress`.

✔ Сотрудник автоматически назначается ответственным.

✔ В закрытое обращение нельзя отправлять сообщения.

✔ Подключен Socket.IO.

✔ WebSocket использует ту же сессию, что и HTTP API.

✔ Переписка обновляется без перезагрузки страницы.

✔ Реализованы страницы:

- `/support`;
- `/admin/support`.

---

# Frontend-маршруты

## Общие страницы

```text
/
```

Главная страница и каталог книг.

```text
/books/:id
```

Страница книги.

```text
/login
```

Страница входа.

```text
/register
```

Страница регистрации.

## Маршруты клиента

```text
/rentals
```

Страница «Мои бронирования».

## Административные маршруты

```text
/admin
```

Главная страница административной панели.

```text
/admin/libraries
```

Управление библиотеками.

```text
/admin/books
```

Управление книгами.

```text
/admin/rentals
```

Управление бронированиями.

---
# API пользователей

Административные маршруты пользователей защищены авторизацией и проверкой роли.

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
# API библиотек и книг

## Получение библиотек

```http
GET /api/common/libraries
```

## Получение каталога книг

```http
GET /api/common/books
```

## Получение одной книги

```http
GET /api/common/books/:id
```

## Создание библиотеки

```http
POST /api/admin/libraries
```

Пример тела запроса:

```json
{
  "name": "Центральная городская библиотека",
  "address": "г. Тула, ул. Болдина, д. 149/10",
  "description": "Главная муниципальная библиотека города"
}
```

## Создание книги

```http
POST /api/admin/books
```

При создании книги передаются сведения о произведении, идентификатор библиотеки, количество экземпляров и, при необходимости, файл обложки.

Основные поля книги:

```text
libraryId
title
author
year
description
totalCopies
availableCopies
isAvailable
coverImage
```

---
# API бронирований

## Создание бронирования

```http
POST /api/client/rentals
```

Пример тела запроса:

```json
{
  "bookId": 1,
  "dateStart": "2026-08-01",
  "dateEnd": "2026-08-15"
}
```

## Получение бронирований клиента

```http
GET /api/client/rentals
```

## Получение одного бронирования клиента

```http
GET /api/client/rentals/:id
```

## Отмена бронирования клиентом

```http
PATCH /api/client/rentals/:id/cancel
```

Отменить можно только бронирование со статусом `reserved`.

## Получение всех бронирований

```http
GET /api/admin/rentals
```

Доступные query-параметры:

- status;
- userId;
- bookId;
- libraryId;
- limit;
- offset.

## Получение одного бронирования

```http
GET /api/admin/rentals/:id
```

## Изменение статуса бронирования

```http
PATCH /api/admin/rentals/:id/status
```

Пример тела запроса:

```json
{
  "status": "active"
}
```

---

# API технической поддержки

## Клиент

```http
POST  /api/client/support/chats
GET   /api/client/support/chats
GET   /api/client/support/chats/:id
POST  /api/client/support/chats/:id/messages
PATCH /api/client/support/chats/:id/close
```

Пример создания обращения:

```json
{
  "subject": "Проблема с бронированием",
  "message": "Не получается забронировать выбранную книгу."
}
```

## Администратор и менеджер

```http
GET   /api/admin/support/chats
GET   /api/admin/support/chats/:id
POST  /api/admin/support/chats/:id/messages
PATCH /api/admin/support/chats/:id/status
```

Пример изменения статуса:

```json
{
  "status": "in_progress"
}
```

---

# WebSocket технической поддержки

Namespace:

```text
http://localhost:3000/support
```

Клиент подключается с параметром:

```text
withCredentials: true
```

Событие подключения к обращению:

```text
support:join
```

Пример данных:

```json
{
  "chatId": 1
}
```

События сервера:

```text
support:joined
support:chat-created
support:chat-updated
```

---

# Переменные окружения

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

SESSION_SECRET=длинная-случайная-строка
```

Сгенерировать значение `SESSION_SECRET` можно командой:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Файл `.env` не должен попадать в Git.

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

Файл `.env` нужно добавить в gitignore.

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
Публичный каталог книг:

```text
http://localhost:3000/api/common/books
```

Публичный список библиотек:

```text
http://localhost:3000/api/common/libraries
```

Загруженные обложки:

```text
http://localhost:3000/uploads/<имя-файла>
```
---

# Проверка проекта

Из корня проекта:

```bash
npm run build
npm run lint
npm run test
```
На текущем этапе:

✔ Frontend успешно собирается через TypeScript и Vite.

✔ Backend успешно собирается через Nest CLI.

✔ ESLint проверяет frontend и backend.

✔ Backend-тесты запускаются через Jest.
---
# Работа с PostgreSQL вручную

Подключиться к базе:

```bash
docker exec -it library-postgres psql -U postgres -d library
```

##  Пользователи:

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
## Библиотеки

```sql
SELECT id, name, address FROM libraries ORDER BY id;
```

Удаление библиотеки:

```sql
DELETE FROM libraries WHERE id = 1;
```
## Книги

```sql
SELECT id, title, author, "libraryId", "totalCopies", "availableCopies", "isAvailable" FROM books ORDER BY id;
```

Изменение количества экземпляров:

```sql
UPDATE books SET "totalCopies" = 7, "availableCopies" = 7, "isAvailable" = true WHERE id = 1;
```

## Бронирования

```sql
SELECT
  id,
  "userId",
  "bookId",
  "libraryId",
  "dateStart",
  "dateEnd",
  status
FROM book_rentals
ORDER BY id;
```
Выйти из psql:

```sql
\q
```

---

# Текущий этап этап

В текущей версии проекта реализованы все основные функциональные этапы, предусмотренные техническим заданием.
Сейчас выполняю итоговую проверку и тестирование.

---

# Автор

Александр Парамонов

Дипломный проект Нетологии.