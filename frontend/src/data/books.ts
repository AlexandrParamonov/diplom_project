import type { Book } from '../types/book';

export const books: Book[] = [
  {
    id: 1,
    title: 'JavaScript для детей',
    author: 'Ник Морган',
    year: 2014,
    description:
      'Книга поможет познакомиться с программированием и создать первые игры на JavaScript.',
    coverImage: '/assets/book-1.svg',
    availableIn: 3,
    category: 'featured',
  },
  {
    id: 2,
    title: 'Рефакторинг кода на JavaScript',
    author: 'Мартин Фаулер',
    year: 2019,
    description:
      'Практическое руководство по улучшению структуры существующего программного кода.',
    coverImage: '/assets/book-2.svg',
    availableIn: 7,
    category: 'featured',
  },
  {
    id: 3,
    title: 'Выразительный JavaScript',
    author: 'Марейн Хавербеке',
    year: 2024,
    description:
      'Современное введение в язык JavaScript, его возможности и основные принципы.',
    coverImage: '/assets/book-3.svg',
    availableIn: 5,
    category: 'featured',
  },
  {
    id: 4,
    title: 'Грокаем алгоритмы',
    author: 'Адитья Бхаргава',
    year: 2022,
    description:
      'Иллюстрированное объяснение алгоритмов, структур данных и способов решения задач.',
    coverImage: '/assets/book-4.svg',
    availableIn: 4,
    category: 'new',
  },
  {
    id: 5,
    title: 'Чистый код',
    author: 'Роберт Мартин',
    year: 2021,
    description:
      'Рекомендации по написанию понятного, поддерживаемого и качественного кода.',
    coverImage: '/assets/book-5.svg',
    availableIn: 2,
    category: 'new',
  },
  {
    id: 6,
    title: 'JavaScript. Полное руководство',
    author: 'Дэвид Флэнаган',
    year: 2021,
    description:
      'Подробный справочник по языку JavaScript и его применению в веб-разработке.',
    coverImage: '/assets/book-6.svg',
    availableIn: 6,
    category: 'new',
  },
];