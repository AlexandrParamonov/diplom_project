import type { Book } from '../types/book';
import type { Library } from '../types/library';
import { API_URL } from './config';

export interface LibraryMutationPayload {
  name: string;
  address: string;
  description: string;
}

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
}

async function throwApiError(response: Response): Promise<never> {
  let message = `Ошибка запроса: ${response.status}`;

  try {
    const data = (await response.json()) as ApiErrorResponse;

    if (Array.isArray(data.message)) {
      message = data.message.join(', ');
    } else if (data.message) {
      message = data.message;
    } else if (data.error) {
      message = data.error;
    }
  } catch {
    // Ответ сервера не содержит JSON.
  }

  throw new Error(message);
}

async function request<T>(
  path: string,
  options: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function createLibrary(
  payload: LibraryMutationPayload,
): Promise<Library> {
  return request<Library>('/admin/libraries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function updateLibrary(
  id: number,
  payload: LibraryMutationPayload,
): Promise<Library> {
  return request<Library>(`/admin/libraries/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function deleteLibrary(id: number): Promise<void> {
  return request<void>(`/admin/libraries/${id}`, {
    method: 'DELETE',
  });
}

export function createBook(formData: FormData): Promise<Book> {
  return request<Book>('/admin/books', {
    method: 'POST',
    body: formData,
  });
}

export function updateBook(
  id: number,
  formData: FormData,
): Promise<Book> {
  return request<Book>(`/admin/books/${id}`, {
    method: 'PATCH',
    body: formData,
  });
}

export function deleteBook(id: number): Promise<void> {
  return request<void>(`/admin/books/${id}`, {
    method: 'DELETE',
  });
}
