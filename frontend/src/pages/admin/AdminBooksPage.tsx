import {
  useEffect,
  useState,
} from 'react';
import type { FormEvent } from 'react';

import {
  createBook,
  deleteBook,
  updateBook,
} from '../../api/admin';
import {
  getBookCoverUrl,
  getBooks,
} from '../../api/books';
import { getLibraries } from '../../api/libraries';
import type { Book } from '../../types/book';
import type { Library } from '../../types/library';

interface BookForm {
  title: string;
  author: string;
  year: string;
  description: string;
  libraryId: string;
  totalCopies: string;
  availableCopies: string;
  removeCoverImage: boolean;
}

const initialForm: BookForm = {
  title: '',
  author: '',
  year: '',
  description: '',
  libraryId: '',
  totalCopies: '1',
  availableCopies: '1',
  removeCoverImage: false,
};

function AdminBooksPage() {
  const [books, setBooks] =
    useState<Book[]>([]);
  const [libraries, setLibraries] =
    useState<Library[]>([]);
  const [form, setForm] =
    useState<BookForm>(initialForm);
  const [editingId, setEditingId] =
    useState<number | null>(null);
  const [coverFile, setCoverFile] =
    useState<File | null>(null);
  const [fileInputKey, setFileInputKey] =
    useState(0);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [
          loadedBooks,
          loadedLibraries,
        ] = await Promise.all([
          getBooks({
            limit: 1000,
          }),
          getLibraries(),
        ]);

        setBooks(loadedBooks);
        setLibraries(loadedLibraries);

        setForm((current) => ({
          ...current,
          libraryId:
            current.libraryId
            || String(
              loadedLibraries[0]?.id ?? '',
            ),
        }));
      } catch (loadError: unknown) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить каталог',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadCatalog();
  }, []);

  const resetForm = () => {
    setForm({
      ...initialForm,
      libraryId: String(
        libraries[0]?.id ?? '',
      ),
    });
    setEditingId(null);
    setCoverFile(null);
    setFileInputKey((current) => current + 1);
  };

  const startEditing = (book: Book) => {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      year:
        book.year === null
          ? ''
          : String(book.year),
      description: book.description ?? '',
      libraryId: String(book.libraryId),
      totalCopies: String(book.totalCopies),
      availableCopies:
        String(book.availableCopies),
      removeCoverImage: false,
    });

    setCoverFile(null);
    setFileInputKey((current) => current + 1);
    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const submit = async () => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append(
        'title',
        form.title.trim(),
      );
      formData.append(
        'author',
        form.author.trim(),
      );
      formData.append(
        'libraryId',
        form.libraryId,
      );
      formData.append(
        'totalCopies',
        form.totalCopies,
      );
      formData.append(
        'description',
        form.description,
      );

      if (form.year.trim()) {
        formData.append(
          'year',
          form.year.trim(),
        );
      }

      if (editingId !== null) {
        formData.append(
          'availableCopies',
          form.availableCopies,
        );
      }

      if (coverFile) {
        formData.append(
          'coverImage',
          coverFile,
        );
      }

      if (
        form.removeCoverImage
        && !coverFile
      ) {
        formData.append(
          'removeCoverImage',
          'true',
        );
      }

      if (editingId === null) {
        const createdBook =
          await createBook(formData);

        setBooks((current) => [
          createdBook,
          ...current,
        ]);

        setSuccess(
          'Книга успешно добавлена',
        );
      } else {
        const updatedBook =
          await updateBook(
            editingId,
            formData,
          );

        setBooks((current) =>
          current.map((book) =>
            book.id === editingId
              ? updatedBook
              : book,
          ),
        );

        setSuccess(
          'Книга успешно обновлена',
        );
      }

      resetForm();
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось сохранить книгу',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    void submit();
  };

  const handleDelete = async (
    book: Book,
  ) => {
    const confirmed = window.confirm(
      `Удалить книгу «${book.title}»?`,
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccess('');
    setDeletingId(book.id);

    try {
      await deleteBook(book.id);

      setBooks((current) =>
        current.filter(
          (item) => item.id !== book.id,
        ),
      );

      if (editingId === book.id) {
        resetForm();
      }

      setSuccess(
        'Книга успешно удалена',
      );
    } catch (deleteError: unknown) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Не удалось удалить книгу',
      );
    } finally {
      setDeletingId(null);
    }
  };

  const editingBook =
    editingId === null
      ? null
      : books.find(
          (book) => book.id === editingId,
        ) ?? null;

  const currentCoverUrl =
    editingBook
      ? getBookCoverUrl(
          editingBook.coverImage,
        )
      : null;

  return (
    <div className="admin-workspace">
      <form
        className="admin-panel admin-form"
        onSubmit={handleSubmit}
      >
        <div className="admin-panel__header">
          <div>
            <h2>
              {editingId === null
                ? 'Новая книга'
                : 'Редактирование книги'}
            </h2>
            <p>
              Доступность рассчитывается по
              количеству доступных экземпляров.
            </p>
          </div>
        </div>

        {error && (
          <p
            className="admin-message admin-message--error"
            role="alert"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            className="admin-message admin-message--success"
            role="status"
          >
            {success}
          </p>
        )}

        {libraries.length === 0
          && !isLoading && (
            <p className="admin-message admin-message--error">
              Сначала добавьте хотя бы одну
              библиотеку.
            </p>
          )}

        <div className="admin-form__grid">
          <label className="admin-form__field">
            <span>Название</span>
            <input
              type="text"
              minLength={1}
              required
              value={form.title}
              onChange={(event) =>
                setForm({
                  ...form,
                  title: event.target.value,
                })
              }
            />
          </label>

          <label className="admin-form__field">
            <span>Автор</span>
            <input
              type="text"
              minLength={2}
              required
              value={form.author}
              onChange={(event) =>
                setForm({
                  ...form,
                  author: event.target.value,
                })
              }
            />
          </label>

          <label className="admin-form__field">
            <span>Библиотека</span>
            <select
              required
              value={form.libraryId}
              onChange={(event) =>
                setForm({
                  ...form,
                  libraryId:
                    event.target.value,
                })
              }
            >
              <option value="">
                Выберите библиотеку
              </option>
              {libraries.map((library) => (
                <option
                  value={library.id}
                  key={library.id}
                >
                  {library.name}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-form__field">
            <span>Год издания</span>
            <input
              type="number"
              min={0}
              step={1}
              value={form.year}
              onChange={(event) =>
                setForm({
                  ...form,
                  year: event.target.value,
                })
              }
            />
          </label>

          <label className="admin-form__field">
            <span>Всего экземпляров</span>
            <input
              type="number"
              min={1}
              step={1}
              required
              value={form.totalCopies}
              onChange={(event) =>
                setForm({
                  ...form,
                  totalCopies:
                    event.target.value,
                })
              }
            />
          </label>

          {editingId !== null && (
            <label className="admin-form__field">
              <span>
                Доступно экземпляров
              </span>
              <input
                type="number"
                min={0}
                max={form.totalCopies}
                step={1}
                required
                value={form.availableCopies}
                onChange={(event) =>
                  setForm({
                    ...form,
                    availableCopies:
                      event.target.value,
                  })
                }
              />
            </label>
          )}

          <label className="admin-form__field admin-form__field--wide">
            <span>Описание</span>
            <textarea
              rows={5}
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target.value,
                })
              }
            />
          </label>

          <label className="admin-form__field admin-form__field--wide">
            <span>Обложка</span>
            <input
              key={fileInputKey}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={(event) => {
                setCoverFile(
                  event.target.files?.[0]
                  ?? null,
                );
                setForm({
                  ...form,
                  removeCoverImage: false,
                });
              }}
            />
          </label>

          {currentCoverUrl && (
            <div className="admin-current-cover">
              <img
                src={currentCoverUrl}
                alt={`Текущая обложка книги «${editingBook?.title ?? ''}»`}
              />

              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={
                    form.removeCoverImage
                  }
                  disabled={coverFile !== null}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      removeCoverImage:
                        event.target.checked,
                    })
                  }
                />
                <span>
                  Удалить текущую обложку
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="admin-actions">
          <button
            className="button button--primary"
            type="submit"
            disabled={
              isSubmitting
              || libraries.length === 0
            }
          >
            {isSubmitting
              ? 'Сохранение...'
              : editingId === null
                ? 'Добавить книгу'
                : 'Сохранить изменения'}
          </button>

          {editingId !== null && (
            <button
              className="button button--secondary"
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Отменить редактирование
            </button>
          )}
        </div>
      </form>

      <section className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <h2>Список книг</h2>
            <p>
              Всего записей: {books.length}
            </p>
          </div>
        </div>

        {isLoading ? (
          <p>Загрузка книг...</p>
        ) : books.length === 0 ? (
          <p className="admin-empty">
            Книги пока не добавлены.
          </p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Обложка</th>
                  <th>Книга</th>
                  <th>Библиотека</th>
                  <th>Экземпляры</th>
                  <th>Действия</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => {
                  const coverUrl =
                    getBookCoverUrl(
                      book.coverImage,
                    )
                    ?? '/assets/books.svg';

                  return (
                    <tr key={book.id}>
                      <td>
                        <img
                          className="admin-table__cover"
                          src={coverUrl}
                          alt=""
                        />
                      </td>

                      <td>
                        <strong>
                          {book.title}
                        </strong>
                        <span className="admin-table__secondary">
                          {book.author}
                          {book.year !== null
                            ? `, ${book.year}`
                            : ''}
                        </span>
                      </td>

                      <td>
                        {book.library.name}
                      </td>

                      <td>
                        {book.availableCopies}
                        {' / '}
                        {book.totalCopies}
                      </td>

                      <td>
                        <div className="admin-table__actions">
                          <button
                            className="button button--secondary button--small"
                            type="button"
                            onClick={() =>
                              startEditing(book)
                            }
                            disabled={
                              deletingId !== null
                            }
                          >
                            Изменить
                          </button>

                          <button
                            className="button button--danger button--small"
                            type="button"
                            onClick={() => {
                              void handleDelete(
                                book,
                              );
                            }}
                            disabled={
                              deletingId !== null
                            }
                          >
                            {deletingId ===
                            book.id
                              ? 'Удаление...'
                              : 'Удалить'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminBooksPage;
