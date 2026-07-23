import type {
  Book,
  BookSearchParams,
} from '../types/book';
import {
  API_URL,
  BACKEND_URL,
} from './config';

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
}

async function getErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const data =
      (await response.json()) as ApiErrorResponse;

    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }

    if (data.message) {
      return data.message;
    }

    if (data.error) {
      return data.error;
    }
  } catch {
    // Сервер вернул ответ не в формате JSON.
  }

  return `Ошибка запроса: ${response.status}`;
}

function createSearchQuery(
  params: BookSearchParams,
): string {
  const searchParams = new URLSearchParams();

  if (params.library !== undefined) {
    searchParams.set(
      'library',
      String(params.library),
    );
  }

  if (params.author) {
    searchParams.set('author', params.author);
  }

  if (params.title) {
    searchParams.set('title', params.title);
  }

  if (params.availableOnly !== undefined) {
    searchParams.set(
      'availableOnly',
      String(params.availableOnly),
    );
  }

  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit));
  }

  if (params.offset !== undefined) {
    searchParams.set('offset', String(params.offset));
  }

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

export async function getBooks(
  params: BookSearchParams = {},
): Promise<Book[]> {
  const query = createSearchQuery(params);

  const response = await fetch(
    `${API_URL}/common/books${query}`,
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<Book[]>;
}

export async function getBookById(
  id: number,
): Promise<Book> {
  const response = await fetch(
    `${API_URL}/common/books/${id}`,
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<Book>;
}

export function getBookCoverUrl(
  coverImage: string | null,
): string | null {
  if (!coverImage) {
    return null;
  }

  if (
    coverImage.startsWith('http://')
    || coverImage.startsWith('https://')
  ) {
    return coverImage;
  }

  return `${BACKEND_URL}${coverImage}`;
}