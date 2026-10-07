import * as authApi from '@/features/auth/api/auth-api';
import type { AuthTokenHandlers } from '@/lib/api-client';
import { queryClient } from '@/lib/react-query';
import { deleteSecureItem, getSecureItem, setSecureItem } from '@/lib/secure-storage';

export const REFRESH_TOKEN_KEY = 'auth.refreshToken';

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

export type SessionSnapshot = {
  status: SessionStatus;
  user: authApi.AuthUser | null;
};

const ANONYMOUS: SessionSnapshot = { status: 'anonymous', user: null };

function isRejectedToken(error: unknown) {
  return error instanceof authApi.AuthApiError && (error.status === 400 || error.status === 401);
}

export function createSessionStore() {
  let snapshot: SessionSnapshot = { status: 'loading', user: null };
  let accessToken: string | null = null;
  let restoring: Promise<void> | null = null;
  const listeners = new Set<() => void>();

  const setSnapshot = (next: SessionSnapshot) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  const startSession = async (session: authApi.AuthSession) => {
    await setSecureItem(REFRESH_TOKEN_KEY, session.refreshToken);
    accessToken = session.accessToken;
    setSnapshot({ status: 'authenticated', user: session.user });
  };

  const clearSession = async () => {
    accessToken = null;
    setSnapshot(ANONYMOUS);
    queryClient.clear();
    await deleteSecureItem(REFRESH_TOKEN_KEY);
  };

  const refreshSession = async () => {
    const refreshToken = await getSecureItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;
    const session = await authApi.refresh(refreshToken);
    await startSession(session);
    return session;
  };

  const restore = async () => {
    try {
      const session = await refreshSession();
      if (!session) setSnapshot(ANONYMOUS);
    } catch (error) {
      if (isRejectedToken(error)) await deleteSecureItem(REFRESH_TOKEN_KEY).catch(() => undefined);
      accessToken = null;
      setSnapshot(ANONYMOUS);
    }
  };

  const restoreSession = () => {
    restoring ??= restore();
    return restoring;
  };

  const endSession = async () => {
    const refreshToken = await getSecureItem(REFRESH_TOKEN_KEY);
    if (refreshToken) await authApi.logout(refreshToken).catch(() => undefined);
    await clearSession();
  };

  const tokenHandlers: AuthTokenHandlers = {
    getAccessToken: () => accessToken,
    refreshAccessToken: async () => {
      try {
        const session = await refreshSession();
        return session?.accessToken ?? null;
      } catch {
        return null;
      }
    },
    onUnauthorized: () => {
      void clearSession();
    },
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    startSession,
    endSession,
    restoreSession,
    tokenHandlers,
  };
}

export type SessionStore = ReturnType<typeof createSessionStore>;
