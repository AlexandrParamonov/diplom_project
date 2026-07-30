import {
  io,
  type Socket,
} from 'socket.io-client';

import { BACKEND_URL } from '../api/config';
import type {
  SupportSocketEvent,
} from '../types/support';

interface ServerToClientEvents {
  'support:joined': (
    data: { chatId: number },
  ) => void;

  'support:chat-created': (
    data: SupportSocketEvent,
  ) => void;

  'support:chat-updated': (
    data: SupportSocketEvent,
  ) => void;
}

interface ClientToServerEvents {
  'support:join': (
    data: { chatId: number },
  ) => void;
}

export type SupportSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

export function createSupportSocket():
  SupportSocket {
  return io(
    `${BACKEND_URL}/support`,
    {
      withCredentials: true,
    },
  );
}
