import {
  useEffect,
  useState,
} from 'react';
import type { FormEvent } from 'react';

import {
  createLibrary,
  deleteLibrary,
  updateLibrary,
} from '../../api/admin';
import { getLibraries } from '../../api/libraries';
import type { Library } from '../../types/library';

interface LibraryForm {
  name: string;
  address: string;
  description: string;
}

const initialForm: LibraryForm = {
  name: '',
  address: '',
  description: '',
};

function sortLibraries(
  libraries: Library[],
): Library[] {
  return [...libraries].sort((first, second) =>
    first.name.localeCompare(second.name, 'ru'),
  );
}

function AdminLibrariesPage() {
  const [libraries, setLibraries] =
    useState<Library[]>([]);
  const [form, setForm] =
    useState<LibraryForm>(initialForm);
  const [editingId, setEditingId] =
    useState<number | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadLibraries = async () => {
      try {
        const loadedLibraries =
          await getLibraries();

        setLibraries(
          sortLibraries(loadedLibraries),
        );
      } catch (loadError: unknown) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Не удалось загрузить библиотеки',
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadLibraries();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const startEditing = (
    library: Library,
  ) => {
    setEditingId(library.id);
    setForm({
      name: library.name,
      address: library.address,
      description: library.description ?? '',
    });
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
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        description: form.description,
      };

      if (editingId === null) {
        const createdLibrary =
          await createLibrary(payload);

        setLibraries((current) =>
          sortLibraries([
            ...current,
            createdLibrary,
          ]),
        );

        setSuccess(
          'Библиотека успешно добавлена',
        );
      } else {
        const updatedLibrary =
          await updateLibrary(
            editingId,
            payload,
          );

        setLibraries((current) =>
          sortLibraries(
            current.map((library) =>
              library.id === editingId
                ? updatedLibrary
                : library,
            ),
          ),
        );

        setSuccess(
          'Библиотека успешно обновлена',
        );
      }

      resetForm();
    } catch (submitError: unknown) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Не удалось сохранить библиотеку',
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
    library: Library,
  ) => {
    const confirmed = window.confirm(
      `Удалить библиотеку «${library.name}»?\n\n`
      + 'Связанные с ней книги также будут удалены.',
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setSuccess('');
    setDeletingId(library.id);

    try {
      await deleteLibrary(library.id);

      setLibraries((current) =>
        current.filter(
          (item) => item.id !== library.id,
        ),
      );

      if (editingId === library.id) {
        resetForm();
      }

      setSuccess(
        'Библиотека успешно удалена',
      );
    } catch (deleteError: unknown) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Не удалось удалить библиотеку',
      );
    } finally {
      setDeletingId(null);
    }
  };

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
                ? 'Новая библиотека'
                : 'Редактирование библиотеки'}
            </h2>
            <p>
              Заполните название, адрес и описание.
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

        <div className="admin-form__grid">
          <label className="admin-form__field">
            <span>Название</span>
            <input
              type="text"
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
          </label>

          <label className="admin-form__field">
            <span>Адрес</span>
            <input
              type="text"
              minLength={5}
              required
              value={form.address}
              onChange={(event) =>
                setForm({
                  ...form,
                  address: event.target.value,
                })
              }
            />
          </label>

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
        </div>

        <div className="admin-actions">
          <button
            className="button button--primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Сохранение...'
              : editingId === null
                ? 'Добавить библиотеку'
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
            <h2>Список библиотек</h2>
            <p>
              Всего записей: {libraries.length}
            </p>
          </div>
        </div>

        {isLoading ? (
          <p>Загрузка библиотек...</p>
        ) : libraries.length === 0 ? (
          <p className="admin-empty">
            Библиотеки пока не добавлены.
          </p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Адрес</th>
                  <th>Описание</th>
                  <th>Действия</th>
                </tr>
              </thead>

              <tbody>
                {libraries.map((library) => (
                  <tr key={library.id}>
                    <td>{library.id}</td>
                    <td>{library.name}</td>
                    <td>{library.address}</td>
                    <td>
                      {library.description || '—'}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          className="button button--secondary button--small"
                          type="button"
                          onClick={() =>
                            startEditing(library)
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
                              library,
                            );
                          }}
                          disabled={
                            deletingId !== null
                          }
                        >
                          {deletingId ===
                          library.id
                            ? 'Удаление...'
                            : 'Удалить'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminLibrariesPage;
