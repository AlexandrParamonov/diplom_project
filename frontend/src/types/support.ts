import type { User } from './user';

export type SupportChatStatus =
  | 'open'
  | 'in_progress'
  | 'closed';

export const SUPPORT_STATUSES: SupportChatStatus[] = [
  'open',
  'in_progress',
  'closed',
];

export const SUPPORT_STATUS_LABELS: Record<
  SupportChatStatus,
  string
> = {
  open: 'Открыто',
  in_progress: 'В работе',
  closed: 'Закрыто',
};

export interface SupportMessage {
  id: number;
  chatId: number;
  senderId: number;
  message: string;
  createdAt: string;
  sender: User;
}

export interface SupportChatSummary {
  id: number;
  clientId: number;
  assignedToId: number | null;
  subject: string;
  status: SupportChatStatus;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  client: User;
  assignedTo: User | null;
}

export interface SupportChat
  extends SupportChatSummary {
  messages: SupportMessage[];
}

export interface CreateSupportChatPayload {
  subject: string;
  message: string;
}

export interface CreateSupportMessagePayload {
  message: string;
}

export interface SupportChatSearchParams {
  status?: SupportChatStatus;
  clientId?: number;
  assignedToId?: number;
  limit?: number;
  offset?: number;
}

export interface SupportSocketEvent {
  chatId: number;
  clientId: number;
  status: SupportChatStatus;
  assignedToId: number | null;
  lastMessageAt: string | null;
  updatedAt: string;
}
