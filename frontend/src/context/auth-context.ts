import { createContext } from 'react';

import type { LoginPayload } from '../api/auth';
import type { User } from '../types/user';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(
  null,
);