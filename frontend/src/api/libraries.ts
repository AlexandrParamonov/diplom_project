import type { Library } from '../types/library';
import { API_URL } from './config';

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

export async function getLibraries(): Promise<Library[]> {
  const response = await fetch(
    `${API_URL}/common/libraries`,
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<Library[]>;
}