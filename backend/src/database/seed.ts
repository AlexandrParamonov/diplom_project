import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '../app.module';
import { Book } from '../libraries/entities/book.entity';
import { Library } from '../libraries/entities/library.entity';

type LibraryKey = 'tolstoy' | 'information' | 'modelOne';

interface LibrarySeed {
  key: LibraryKey;
  name: string;
  address: string;
  description: string;
}

interface BookSeed {
  libraryKey: LibraryKey;
  title: string;
  author: string;
  year: number;
  description: string;
  totalCopies: number;
}

const librarySeeds: LibrarySeed[] = [
  {
    key: 'tolstoy',
    name: 'Центральная городская библиотека ' + 'им. Л. Н. Толстого',
    address: 'г. Тула, ул. Болдина, д. 149/10',
    description:
      'Главная муниципальная библиотека ' + 'Тульской библиотечной системы.',
  },
  {
    key: 'information',
    name: 'Библиотечно-информационный комплекс',
    address: 'г. Тула, Красноармейский проспект, д. 1',
    description:
      'Современное пространство для чтения, ' +
      'обучения и интеллектуального досуга.',
  },
  {
    key: 'modelOne',
    name: 'Модельная библиотека № 1',
    address: 'г. Тула, ул. Новомосковская, д. 9',
    description:
      'Модельная библиотека с художественной, ' +
      'образовательной и справочной литературой.',
  },
];

const bookSeeds: BookSeed[] = [
  {
    libraryKey: 'tolstoy',
    title: 'Война и мир',
    author: 'Лев Толстой',
    year: 1869,
    description:
      'Роман-эпопея о судьбах русского общества ' +
      'в эпоху Наполеоновских войн.',
    totalCopies: 4,
  },
  {
    libraryKey: 'tolstoy',
    title: 'Евгений Онегин',
    author: 'Александр Пушкин',
    year: 1833,
    description:
      'Роман в стихах о любви, выборе и жизни ' +
      'русского дворянства XIX века.',
    totalCopies: 3,
  },
  {
    libraryKey: 'information',
    title: 'Мастер и Маргарита',
    author: 'Михаил Булгаков',
    year: 1967,
    description:
      'Роман, объединяющий сатиру, мистику, ' + 'философию и историю любви.',
    totalCopies: 5,
  },
  {
    libraryKey: 'information',
    title: 'Двенадцать стульев',
    author: 'Илья Ильф, Евгений Петров',
    year: 1928,
    description:
      'Сатирический роман о поисках драгоценностей, ' +
      'спрятанных в одном из двенадцати стульев.',
    totalCopies: 2,
  },
  {
    libraryKey: 'modelOne',
    title: 'Приключения Тома Сойера',
    author: 'Марк Твен',
    year: 1876,
    description:
      'Приключенческая повесть о детстве, дружбе ' +
      'и жизни небольшого американского города.',
    totalCopies: 4,
  },
  {
    libraryKey: 'modelOne',
    title: 'Алиса в Стране чудес',
    author: 'Льюис Кэрролл',
    year: 1865,
    description:
      'Сказочная история о путешествии Алисы ' + 'по удивительному миру.',
    totalCopies: 5,
  },
];

async function seed(): Promise<void> {
  const logger = new Logger('CatalogSeed');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const dataSource = app.get(DataSource);

    await dataSource.transaction(async (manager) => {
      const librariesRepository = manager.getRepository(Library);

      const booksRepository = manager.getRepository(Book);

      const savedLibraries = new Map<LibraryKey, Library>();

      for (const seedLibrary of librarySeeds) {
        let library = await librariesRepository.findOne({
          where: {
            name: seedLibrary.name,
            address: seedLibrary.address,
          },
        });

        if (!library) {
          library = librariesRepository.create({
            name: seedLibrary.name,
            address: seedLibrary.address,
            description: seedLibrary.description,
          });

          library = await librariesRepository.save(library);
        }

        savedLibraries.set(seedLibrary.key, library);
      }

      for (const seedBook of bookSeeds) {
        const library = savedLibraries.get(seedBook.libraryKey);

        if (!library) {
          throw new Error(`Не найдена библиотека ${seedBook.libraryKey}`);
        }

        const existingBook = await booksRepository.findOne({
          where: {
            title: seedBook.title,
            author: seedBook.author,
            libraryId: library.id,
          },
        });

        if (existingBook) {
          continue;
        }

        const book = booksRepository.create({
          library,
          libraryId: library.id,
          title: seedBook.title,
          author: seedBook.author,
          year: seedBook.year,
          description: seedBook.description,
          coverImage: null,
          isAvailable: true,
          totalCopies: seedBook.totalCopies,
          availableCopies: seedBook.totalCopies,
        });

        await booksRepository.save(book);
      }
    });

    logger.log('Добавлены 3 библиотеки и 6 книг');
  } finally {
    await app.close();
  }
}

void seed().catch((error: unknown) => {
  const logger = new Logger('CatalogSeed');

  if (error instanceof Error) {
    logger.error(error.message, error.stack);
  } else {
    logger.error('Неизвестная ошибка при заполнении базы');
  }

  process.exitCode = 1;
});
