import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';

import {
  getCurrentUser,
  loginUser,
  logoutUser,
} from '../api/auth';
import type { LoginPayload } from '../api/auth';
import type { User } from '../types/user';
import { AuthContext } from './auth-context';

function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser();

    setUser(currentUser);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const authenticatedUser = await loginUser(payload);

    setUser(authenticatedUser);
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();

    setUser(null);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, [refreshUser]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;