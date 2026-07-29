import type { CreateRentalPayload, Rental, RentalSearchParams, RentalStatus } from '../types/rental';
import { API_URL } from './config';

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
}

async function throwApiError(
  response: Response,
): Promise<never> {
  let message =
    `Ошибка запроса: ${response.status}`;

  try {
    const data =
      (await response.json()) as ApiErrorResponse;

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

function createSearchQuery(
  params: RentalSearchParams,
): string {
  const searchParams =
    new URLSearchParams();

  if (params.status) {
    searchParams.set(
      'status',
      params.status,
    );
  }

  if (params.userId !== undefined) {
    searchParams.set(
      'userId',
      String(params.userId),
    );
  }

  if (params.bookId !== undefined) {
    searchParams.set(
      'bookId',
      String(params.bookId),
    );
  }

  if (params.libraryId !== undefined) {
    searchParams.set(
      'libraryId',
      String(params.libraryId),
    );
  }

  if (params.limit !== undefined) {
    searchParams.set(
      'limit',
      String(params.limit),
    );
  }

  if (params.offset !== undefined) {
    searchParams.set(
      'offset',
      String(params.offset),
    );
  }

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      credentials: 'include',
    },
  );

  if (!response.ok) {
    await throwApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function createRental(
  payload: CreateRentalPayload,
): Promise<Rental> {
  return request<Rental>(
    '/client/rentals',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
}

export function getMyRentals(
  params: RentalSearchParams = {},
): Promise<Rental[]> {
  const query = createSearchQuery(params);

  return request<Rental[]>(
    `/client/rentals${query}`,
  );
}

export function cancelMyRental(
  id: number,
): Promise<Rental> {
  return request<Rental>(
    `/client/rentals/${id}/cancel`,
    {
      method: 'PATCH',
    },
  );
}

export function getAdminRentals(
  params: RentalSearchParams = {},
): Promise<Rental[]> {
  const query = createSearchQuery(params);

  return request<Rental[]>(
    `/admin/rentals${query}`,
  );
}

export function updateRentalStatus(
  id: number,
  status: RentalStatus,
): Promise<Rental> {
  return request<Rental>(
    `/admin/rentals/${id}/status`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
      }),
    },
  );
}
