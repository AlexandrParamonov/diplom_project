import { useState } from 'react';
import type { FormEvent } from 'react';

export interface SearchValues {
  title: string;
  author: string;
  dateStart: string;
  dateEnd: string;
}

interface SearchFormProps {
  onSearch: (values: SearchValues) => void;
}

const initialValues: SearchValues = {
  title: '',
  author: '',
  dateStart: '',
  dateEnd: '',
};

function SearchForm({ onSearch }: SearchFormProps) {
  const [values, setValues] = useState<SearchValues>(initialValues);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(values);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-form__field search-form__field--wide">
        <label htmlFor="book-title">Название</label>

        <input
          id="book-title"
          type="text"
          placeholder="Например, Евгений Онегин"
          value={values.title}
          onChange={(event) =>
            setValues({
              ...values,
              title: event.target.value,
            })
          }
        />
      </div>

      <div className="search-form__field search-form__field--wide">
        <label htmlFor="book-author">Автор</label>

        <input
          id="book-author"
          type="text"
          placeholder="Например, Пушкин А. С."
          value={values.author}
          onChange={(event) =>
            setValues({
              ...values,
              author: event.target.value,
            })
          }
        />
      </div>

      <div className="search-form__field">
        <label htmlFor="date-start">Выдача книги</label>

        <input
          id="date-start"
          type="date"
          value={values.dateStart}
          onChange={(event) =>
            setValues({
              ...values,
              dateStart: event.target.value,
            })
          }
        />
      </div>

      <div className="search-form__field">
        <label htmlFor="date-end">Возврат книги</label>

        <input
          id="date-end"
          type="date"
          value={values.dateEnd}
          onChange={(event) =>
            setValues({
              ...values,
              dateEnd: event.target.value,
            })
          }
        />
      </div>

      <button className="button button--primary search-form__button" type="submit">
        Найти книгу
      </button>
    </form>
  );
}

export default SearchForm;