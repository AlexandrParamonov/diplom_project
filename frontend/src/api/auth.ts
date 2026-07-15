import type { User } from '../types/user';

const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  contactPhone?: string;
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
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    await throwApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function registerUser(
  payload: RegisterPayload,
): Promise<User> {
  return request<User>('/client/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload): Promise<User> {
  return request<User>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    await throwApiError(response);
  }

  return response.json() as Promise<User>;
}

export function logoutUser(): Promise<void> {
  return request<void>('/auth/logout', {
    method: 'POST',
  });
}