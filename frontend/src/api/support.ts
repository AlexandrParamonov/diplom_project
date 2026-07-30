import type {
  CreateSupportChatPayload,
  CreateSupportMessagePayload,
  SupportChat,
  SupportChatSearchParams,
  SupportChatStatus,
  SupportChatSummary,
} from '../types/support';
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
  params: SupportChatSearchParams,
): string {
  const searchParams =
    new URLSearchParams();

  if (params.status) {
    searchParams.set(
      'status',
      params.status,
    );
  }

  if (params.clientId !== undefined) {
    searchParams.set(
      'clientId',
      String(params.clientId),
    );
  }

  if (
    params.assignedToId !== undefined
  ) {
    searchParams.set(
      'assignedToId',
      String(params.assignedToId),
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
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
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

export function createSupportChat(
  payload: CreateSupportChatPayload,
): Promise<SupportChat> {
  return request<SupportChat>(
    '/client/support/chats',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function getClientSupportChats(
  params: SupportChatSearchParams = {},
): Promise<SupportChatSummary[]> {
  const query = createSearchQuery(params);

  return request<SupportChatSummary[]>(
    `/client/support/chats${query}`,
  );
}

export function getClientSupportChat(
  id: number,
): Promise<SupportChat> {
  return request<SupportChat>(
    `/client/support/chats/${id}`,
  );
}

export function sendClientSupportMessage(
  id: number,
  payload: CreateSupportMessagePayload,
): Promise<SupportChat> {
  return request<SupportChat>(
    `/client/support/chats/${id}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function closeClientSupportChat(
  id: number,
): Promise<SupportChat> {
  return request<SupportChat>(
    `/client/support/chats/${id}/close`,
    {
      method: 'PATCH',
    },
  );
}

export function getAdminSupportChats(
  params: SupportChatSearchParams = {},
): Promise<SupportChatSummary[]> {
  const query = createSearchQuery(params);

  return request<SupportChatSummary[]>(
    `/admin/support/chats${query}`,
  );
}

export function getAdminSupportChat(
  id: number,
): Promise<SupportChat> {
  return request<SupportChat>(
    `/admin/support/chats/${id}`,
  );
}

export function sendAdminSupportMessage(
  id: number,
  payload: CreateSupportMessagePayload,
): Promise<SupportChat> {
  return request<SupportChat>(
    `/admin/support/chats/${id}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function updateSupportChatStatus(
  id: number,
  status: SupportChatStatus,
): Promise<SupportChat> {
  return request<SupportChat>(
    `/admin/support/chats/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );
}
