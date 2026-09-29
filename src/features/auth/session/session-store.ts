import * as authApi from '@/features/auth/api/auth-api';
import type { AuthTokenHandlers } from '@/lib/api-client';
import { queryClient } from '@/lib/react-query';
import { deleteSecureItem, getSecureItem, setSecureItem } from '@/lib/secure-storage';

export const REFRESH_TOKEN_KEY = 'auth.refreshToken';
export const RESTORE_ATTEMPTS = 3;
export const RESTORE_BACKOFF_MS = 1000;
export const REFRESH_TIMEOUT_MS = 15000;

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'offline';

export type SessionSnapshot = {
  status: SessionStatus;
  user: authApi.AuthUser | null;
};

const ANONYMOUS: SessionSnapshot = { status: 'anonymous', user: null };
const OFFLINE: SessionSnapshot = { status: 'offline', user: null };

export function isRejectedToken(error: unknown) {
  return error instanceof authApi.AuthApiError && (error.status === 400 || error.status === 401);
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function refreshWithTimeout(refreshToken: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);
  try {
    return await authApi.refresh(refreshToken, controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

async function revokeStoredRefreshToken() {
  const refreshToken = await getSecureItem(REFRESH_TOKEN_KEY);
  if (refreshToken) await authApi.logout(refreshToken).catch(() => undefined);
}

export async function discardStoredSession() {
  await revokeStoredRefreshToken().catch(() => undefined);
  queryClient.clear();
  await deleteSecureItem(REFRESH_TOKEN_KEY);
}

export function createSessionStore() {
  let snapshot: SessionSnapshot = { status: 'loading', user: null };
  let accessToken: string | null = null;
  let generation = 0;
  let restoring: Promise<void> | null = null;
  let refreshing: Promise<string | null> | null = null;
  const listeners = new Set<() => void>();

  const setSnapshot = (next: SessionSnapshot) => {
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  const adoptSession = async (session: authApi.AuthSession) => {
    await setSecureItem(REFRESH_TOKEN_KEY, session.refreshToken);
    accessToken = session.accessToken;
    setSnapshot({ status: 'authenticated', user: session.user });
  };

  const startSession = async (session: authApi.AuthSession) => {
    generation += 1;
    await adoptSession(session);
  };

  const clearSession = async () => {
    generation += 1;
    accessToken = null;
    setSnapshot(ANONYMOUS);
    queryClient.clear();
    await deleteSecureItem(REFRESH_TOKEN_KEY);
  };

  const performRefresh = async () => {
    const startedAt = generation;
    const refreshToken = await getSecureItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    let session: authApi.AuthSession;
    try {
      session = await refreshWithTimeout(refreshToken);
    } catch (error) {
      if (startedAt !== generation) return accessToken;
      if (!isRejectedToken(error)) throw error;
      await clearSession();
      return null;
    }

    if (startedAt !== generation) return accessToken;
    await adoptSession(session);
    return session.accessToken;
  };

  const refreshSession = () => {
    refreshing ??= performRefresh().finally(() => {
      refreshing = null;
    });
    return refreshing;
  };

  const restore = async () => {
    const startedAt = generation;
    for (let attempt = 1; ; attempt += 1) {
      try {
        const token = await refreshSession();
        if (!token && startedAt === generation) setSnapshot(ANONYMOUS);
        return;
      } catch {
        if (startedAt !== generation) return;
        if (attempt >= RESTORE_ATTEMPTS) {
          accessToken = null;
          setSnapshot(OFFLINE);
          return;
        }
        await wait(RESTORE_BACKOFF_MS * 2 ** (attempt - 1));
      }
    }
  };

  const restoreSession = () => {
    restoring ??= restore();
    return restoring;
  };

  const retryRestore = () => {
    if (snapshot.status === 'offline') restoring = restore();
    return restoreSession();
  };

  const endSession = async () => {
    await revokeStoredRefreshToken();
    await clearSession();
  };

  const tokenHandlers: AuthTokenHandlers = {
    getAccessToken: async () => {
      if (snapshot.status === 'loading') await restoreSession();
      return accessToken;
    },
    refreshAccessToken: refreshSession,
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
    retryRestore,
    tokenHandlers,
  };
}

export type SessionStore = ReturnType<typeof createSessionStore>;
